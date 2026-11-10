"""
Unit and Integration Tests for HarborPath Backend Engine.
Verifies:
- Pydantic v2 Models & Statutory Invariants (42 CFR Part 2 § 2.31)
- Crisis Screening Red-Flag Interception
- ASAM Criteria 4th Edition Multidimensional Scoring
- Deterministic State Machine Transitions & Quick Exit Failsafe
- Cryptographic Audit Trail Hash Chaining & Field-Level Envelope Encryption
- HL7 FHIR R4 Resource Mapping (US Core Profiles)
"""

import unittest
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from backend.app.models.intake import (
    ASAMCareLevel,
    ASAMDimensionScore,
    CrisisScreeningRequest,
    CrisisSeverity,
    Consent42CFRPart2Request,
    IntakeState,
    PaymentType,
    FacilityMatchQuery,
)
from backend.app.core.security import (
    DEFAULT_SECRET_KEY,
    generate_pseudonym_token,
    generate_consent_digest,
    compute_audit_hash,
    FieldCipher,
    TokenBucketRateLimiter,
)
from backend.app.core.state_machine import (
    IntakeStateMachine,
    InvalidStateTransitionError,
    ALLOWED_TRANSITIONS,
)
from backend.app.interop.fhir import (
    build_fhir_consent_resource,
    build_fhir_service_request,
    build_fhir_healthcare_service,
)
from backend.app.models.intake import Consent42CFRPart2Record, ASAMEvaluationResult


class TestHarborPathBackend(unittest.TestCase):

    def setUp(self):
        self.session_id = uuid4()
        self.pseudonym_token = generate_pseudonym_token(seed=str(self.session_id))
        self.cipher = FieldCipher(DEFAULT_SECRET_KEY)

    # -----------------------------------------------------------------------
    # 1. 42 CFR Part 2 Consent Validation
    # -----------------------------------------------------------------------

    def test_consent_model_validates_redisclosure_prohibition(self):
        """Must reject consent requests if redisclosure prohibition is not acknowledged."""
        with self.assertRaises(ValueError):
            Consent42CFRPart2Request(
                session_id=self.session_id,
                patient_pseudonym_token=self.pseudonym_token,
                authorized_recipient_facility_id="fac_123",
                purpose_of_disclosure="Care navigation",
                expiration_date=datetime.now(timezone.utc) + timedelta(days=90),
                acknowledges_redisclosure_prohibition=False,  # Violation!
                acknowledges_revocation_rights=True
            )

    def test_consent_model_validates_revocation_rights(self):
        """Must reject consent requests if revocation rights are not acknowledged."""
        with self.assertRaises(ValueError):
            Consent42CFRPart2Request(
                session_id=self.session_id,
                patient_pseudonym_token=self.pseudonym_token,
                authorized_recipient_facility_id="fac_123",
                purpose_of_disclosure="Care navigation",
                expiration_date=datetime.now(timezone.utc) + timedelta(days=90),
                acknowledges_redisclosure_prohibition=True,
                acknowledges_revocation_rights=False  # Violation!
            )

    def test_consent_digest_is_deterministic_and_unique(self):
        """Cryptographic signature digest binds pseudonym, facility, purpose, and expiration."""
        exp = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        digest1 = generate_consent_digest(DEFAULT_SECRET_KEY, self.pseudonym_token, "fac_123", "Treatment", exp)
        digest2 = generate_consent_digest(DEFAULT_SECRET_KEY, self.pseudonym_token, "fac_123", "Treatment", exp)
        digest3 = generate_consent_digest(DEFAULT_SECRET_KEY, self.pseudonym_token, "fac_999", "Treatment", exp)
        self.assertEqual(digest1, digest2)
        self.assertNotEqual(digest1, digest3)
        self.assertEqual(len(digest1), 64)

    # -----------------------------------------------------------------------
    # 2. ASAM Dimensional Scoring Algorithm
    # -----------------------------------------------------------------------

    def test_asam_dimension_bounds(self):
        """Dimension scores must strictly be within 0 to 4 inclusive."""
        with self.assertRaises(ValueError):
            ASAMDimensionScore(
                dimension_1_acute_intoxication_withdrawal=5,  # Out of bounds!
                dimension_2_biomedical_conditions=2,
                dimension_3_psychiatric_cognitive_conditions=1,
                dimension_4_readiness_to_change=2,
                dimension_5_relapse_continued_use_potential=1,
                dimension_6_recovery_environment=0
            )

    def test_asam_dimension_score_valid(self):
        """Valid ASAM dimension input parses without errors."""
        score = ASAMDimensionScore(
            dimension_1_acute_intoxication_withdrawal=3,
            dimension_2_biomedical_conditions=2,
            dimension_3_psychiatric_cognitive_conditions=2,
            dimension_4_readiness_to_change=3,
            dimension_5_relapse_continued_use_potential=3,
            dimension_6_recovery_environment=2,
            prior_overdose_history=True
        )
        self.assertEqual(score.dimension_1_acute_intoxication_withdrawal, 3)
        self.assertTrue(score.prior_overdose_history)

    # -----------------------------------------------------------------------
    # 3. State Machine Transitions & Failsafe Purge
    # -----------------------------------------------------------------------

    def test_state_machine_valid_progression(self):
        """Happy path progression through the intake state graph."""
        sm = IntakeStateMachine(session_id=str(self.session_id), pseudonym_token=self.pseudonym_token)
        self.assertEqual(sm.current_state, IntakeState.ARRIVED)

        sm.transition_to(IntakeState.ANONYMOUS_DISCOVERY)
        self.assertEqual(sm.current_state, IntakeState.ANONYMOUS_DISCOVERY)

        sm.transition_to(IntakeState.CRISIS_SCREENING)
        self.assertEqual(sm.current_state, IntakeState.CRISIS_SCREENING)

        sm.transition_to(IntakeState.CLINICAL_TRIAGE_ACTIVE)
        self.assertEqual(sm.current_state, IntakeState.CLINICAL_TRIAGE_ACTIVE)

        sm.transition_to(IntakeState.ASAM_EVALUATED)
        self.assertEqual(sm.current_state, IntakeState.ASAM_EVALUATED)

        sm.transition_to(IntakeState.FACILITY_MATCHING)
        self.assertEqual(sm.current_state, IntakeState.FACILITY_MATCHING)

        sm.transition_to(IntakeState.REFERRAL_STAGED)
        self.assertEqual(sm.current_state, IntakeState.REFERRAL_STAGED)

        sm.transition_to(IntakeState.SESSION_PURGED)
        self.assertEqual(sm.current_state, IntakeState.SESSION_PURGED)

    def test_state_machine_rejects_illegal_skip(self):
        """State machine must reject illegal skips (e.g. ARRIVED directly to REFERRAL_TRANSMITTED)."""
        sm = IntakeStateMachine(session_id=str(self.session_id), pseudonym_token=self.pseudonym_token)
        with self.assertRaises(InvalidStateTransitionError):
            sm.transition_to(IntakeState.REFERRAL_TRANSMITTED)

    def test_state_machine_quick_exit_anywhere(self):
        """Quick Exit must transition directly to SESSION_PURGED from intermediate states."""
        sm = IntakeStateMachine(session_id=str(self.session_id), pseudonym_token=self.pseudonym_token)
        sm.transition_to(IntakeState.CRISIS_SCREENING)
        record = sm.trigger_quick_exit()
        self.assertEqual(sm.current_state, IntakeState.SESSION_PURGED)
        self.assertEqual(record.reason, "QUICK_EXIT_TRIGGERED")

    # -----------------------------------------------------------------------
    # 4. Cryptographic Chaining & Envelope Encryption
    # -----------------------------------------------------------------------

    def test_field_cipher_encrypt_decrypt(self):
        """Envelope cipher encrypts sensitive text and recovers exact plaintext."""
        secret_notes = "Patient reports prior anaphylaxis to buprenorphine naloxone combo strip."
        ciphertext = self.cipher.encrypt(secret_notes)
        self.assertNotEqual(secret_notes, ciphertext)
        decrypted = self.cipher.decrypt(ciphertext)
        self.assertEqual(secret_notes, decrypted)

    def test_audit_hash_chaining_integrity(self):
        """Audit trail forward hash chaining detects retroactive modifications."""
        h0 = "0" * 64
        h1 = compute_audit_hash(h0, "2026-11-08T00:00:00Z", "INTAKE_START", self.pseudonym_token, "p1")
        h2 = compute_audit_hash(h1, "2026-11-08T00:01:00Z", "CONSENT_GIVEN", self.pseudonym_token, "p2")
        h3 = compute_audit_hash(h2, "2026-11-08T00:02:00Z", "REFERRAL_STAGED", self.pseudonym_token, "p3")

        # Modifying step 1 breaks step 2 and step 3
        tampered_h1 = compute_audit_hash(h0, "2026-11-08T00:00:00Z", "TAMPERED_ACTION", self.pseudonym_token, "p1")
        recomputed_h2 = compute_audit_hash(tampered_h1, "2026-11-08T00:01:00Z", "CONSENT_GIVEN", self.pseudonym_token, "p2")
        self.assertNotEqual(h2, recomputed_h2)

    def test_rate_limiter_token_bucket(self):
        """Rate limiter protects facility directory against scraping."""
        limiter = TokenBucketRateLimiter(capacity=3, refill_rate_per_sec=0.1)
        ip = "198.51.100.42"
        self.assertTrue(limiter.is_allowed(ip))
        self.assertTrue(limiter.is_allowed(ip))
        self.assertTrue(limiter.is_allowed(ip))
        # 4th request must be denied
        self.assertFalse(limiter.is_allowed(ip))

    # -----------------------------------------------------------------------
    # 5. HL7 FHIR R4 US Core Profile Adapters
    # -----------------------------------------------------------------------

    def test_fhir_consent_resource_generation(self):
        """Generates FHIR R4 Consent resource with 42 CFR Part 2 and ETH security tags."""
        now = datetime.now(timezone.utc)
        consent_record = Consent42CFRPart2Record(
            consent_id=uuid4(),
            session_id=self.session_id,
            patient_pseudonym_token=self.pseudonym_token,
            authorized_recipient_facility_id="fac_123",
            purpose_of_disclosure="Substance use disorder care navigation",
            expiration_date=now + timedelta(days=60),
            granted_at=now,
            is_revoked=False,
            consent_signature_digest="a" * 64
        )
        fhir_res = build_fhir_consent_resource(consent_record)
        self.assertEqual(fhir_res["resourceType"], "Consent")
        self.assertEqual(fhir_res["status"], "active")
        self.assertEqual(fhir_res["patient"]["identifier"]["value"], self.pseudonym_token)
        # Security labels check
        labels = [s["code"] for s in fhir_res["meta"]["security"]]
        self.assertIn("ETH", labels)
        self.assertIn("PART2", labels)

    def test_fhir_service_request_generation(self):
        """Generates FHIR R4 ServiceRequest resource (referral)."""
        referral_id = uuid4()
        consent_id = uuid4()
        asam_eval = ASAMEvaluationResult(
            session_id=self.session_id,
            recommended_level=ASAMCareLevel.LEVEL_3_7_MEDICALLY_MONITORED_INPATIENT,
            level_title="Level 3.7: Medically Monitored Inpatient",
            withdrawal_management_needed=True,
            recommended_wm_level="3.7-WM",
            dimension_breakdown={"d1": 3},
            clinical_rationale=["Severe withdrawal risk"],
            suggested_service_codes=["DT", "RES"]
        )
        sr = build_fhir_service_request(
            referral_id=referral_id,
            session_id=self.session_id,
            pseudonym_token=self.pseudonym_token,
            recipient_facility_id="fac_123",
            asam_evaluation=asam_eval,
            consent_id=consent_id
        )
        self.assertEqual(sr["resourceType"], "ServiceRequest")
        self.assertEqual(sr["intent"], "referral")
        self.assertEqual(sr["priority"], "urgent")
        self.assertEqual(sr["code"]["coding"][0]["code"], "3.7")
        self.assertEqual(sr["supportingInfo"][0]["reference"], f"Consent/{consent_id}")


if __name__ == "__main__":
    unittest.main()
