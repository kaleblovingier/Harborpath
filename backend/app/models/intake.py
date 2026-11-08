"""
HarborPath Pydantic v2 Core Models for Intake, ASAM Triage, and 42 CFR Part 2 Compliance.
Conforms strictly to ASAM Criteria (4th Edition), DSM-5-TR, and federal 42 CFR Part 2 § 2.31.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator, model_validator


class ASAMCareLevel(str, Enum):
    """ASAM Criteria Levels of Care."""
    LEVEL_0_5_EARLY_INTERVENTION = "0.5"
    LEVEL_1_0_OUTPATIENT = "1.0"
    LEVEL_2_1_INTENSIVE_OUTPATIENT = "2.1"
    LEVEL_2_5_PARTIAL_HOSPITALIZATION = "2.5"
    LEVEL_3_1_LOW_INTENSITY_RESIDENTIAL = "3.1"
    LEVEL_3_5_HIGH_INTENSITY_RESIDENTIAL = "3.5"
    LEVEL_3_7_MEDICALLY_MONITORED_INPATIENT = "3.7"
    LEVEL_4_0_MEDICALLY_MANAGED_INTENSIVE_ICU = "4.0"


class CrisisSeverity(str, Enum):
    """Triage crisis severity classification."""
    NONE = "none"
    ROUTINE = "routine"
    URGENT = "urgent"
    CRISIS_988 = "crisis_988"
    EMERGENT_911 = "emergent_911"


class IntakeState(str, Enum):
    """Deterministic states of the pseudonymous intake state machine."""
    ARRIVED = "ARRIVED"
    ANONYMOUS_DISCOVERY = "ANONYMOUS_DISCOVERY"
    CRISIS_SCREENING = "CRISIS_SCREENING"
    CRISIS_ESCALATED = "CRISIS_ESCALATED"
    CONSENT_PENDING = "CONSENT_PENDING"
    CLINICAL_TRIAGE_ACTIVE = "CLINICAL_TRIAGE_ACTIVE"
    ASAM_EVALUATED = "ASAM_EVALUATED"
    FACILITY_MATCHING = "FACILITY_MATCHING"
    REFERRAL_STAGED = "REFERRAL_STAGED"
    REFERRAL_TRANSMITTED = "REFERRAL_TRANSMITTED"
    SESSION_PURGED = "SESSION_PURGED"


class PaymentType(str, Enum):
    """Payer and reimbursement types."""
    MEDICAID = "medicaid"
    MEDICARE = "medicare"
    COMMERCIAL = "commercial"
    TRICARE = "tricare"
    VA = "va"
    IHS_TRIBAL = "ihs_tribal"
    SLIDING_SCALE = "sliding_scale"
    NO_FEE_CHARITY = "no_fee_charity"
    CASH_SELF_PAY = "cash_self_pay"


class PopulationTrack(str, Enum):
    """Specialized clinical population tracks."""
    GENERAL_ADULT = "general_adult"
    PERINATAL_PREGNANT = "perinatal_pregnant"
    ADOLESCENT_YOUTH = "adolescent_youth"
    OLDER_ADULT_GERIATRIC = "older_adult_geriatric"
    JUSTICE_INVOLVED_REENTRY = "justice_involved_reentry"
    VETERAN_MILITARY = "veteran_military"
    LGBTQ_PLUS = "lgbtq_plus"
    CO_OCCURRING_SERIOUS_MENTAL_ILLNESS = "co_occurring_smi"


# ---------------------------------------------------------------------------
# 1. Crisis Screening Models
# ---------------------------------------------------------------------------

class CrisisScreeningRequest(BaseModel):
    """Input payload for emergency and crisis red flag triage."""
    session_id: UUID
    active_overdose_symptoms: bool = Field(
        default=False,
        description="Pinpoint pupils, unresponsiveness, cyanosis, agonal respirations"
    )
    suicidal_ideation_with_intent: bool = Field(
        default=False,
        description="Active ideation with intent, plan, or recent lethal attempt"
    )
    severe_alcohol_sedative_withdrawal: bool = Field(
        default=False,
        description="Delirium tremens, hallucinations, seizures, diaphoresis"
    )
    acute_psychosis_or_homicide_risk: bool = Field(
        default=False,
        description="Command hallucinations, severe agitation, imminent harm to others"
    )
    severe_medical_sepsis_or_trauma: bool = Field(
        default=False,
        description="Signs of sepsis, necrotizing fasciitis, severe bleeding, chest pain"
    )


class CrisisScreeningResult(BaseModel):
    """Immediate outcome of crisis evaluation."""
    session_id: UUID
    severity: CrisisSeverity
    escalation_required: bool
    primary_hotline_name: Optional[str] = None
    primary_hotline_number: Optional[str] = None
    action_instructions: List[str] = Field(default_factory=list)
    state_transition: IntakeState


# ---------------------------------------------------------------------------
# 2. ASAM Criteria 6-Dimension Scoring Models
# ---------------------------------------------------------------------------

class ASAMDimensionScore(BaseModel):
    """
    Patient assessment across the 6 dimensions of the ASAM Criteria (4th Edition).
    Scores range from 0 (minimal/no risk) to 4 (severe risk / life-threatening).
    """
    dimension_1_acute_intoxication_withdrawal: int = Field(ge=0, le=4)
    dimension_2_biomedical_conditions: int = Field(ge=0, le=4)
    dimension_3_psychiatric_cognitive_conditions: int = Field(ge=0, le=4)
    dimension_4_readiness_to_change: int = Field(ge=0, le=4)
    dimension_5_relapse_continued_use_potential: int = Field(ge=0, le=4)
    dimension_6_recovery_environment: int = Field(ge=0, le=4)

    # Optional clinical markers for precision matching
    substances_involved: List[str] = Field(default_factory=list)
    pregnancy_trimester: Optional[int] = Field(default=None, ge=1, le=3)
    unhoused_or_couch_surfing: bool = False
    prior_overdose_history: bool = False
    in_withdrawal_now: bool = False


class ASAMEvaluationResult(BaseModel):
    """Computed level of care derived from the 6 ASAM dimensions."""
    session_id: UUID
    recommended_level: ASAMCareLevel
    level_title: str
    withdrawal_management_needed: bool
    recommended_wm_level: Optional[str] = None
    dimension_breakdown: Dict[str, int]
    clinical_rationale: List[str]
    suggested_service_codes: List[str]
    next_state: IntakeState = IntakeState.ASAM_EVALUATED


# ---------------------------------------------------------------------------
# 3. 42 CFR Part 2 Consent Models
# ---------------------------------------------------------------------------

class Consent42CFRPart2Request(BaseModel):
    """
    Statutory 42 CFR Part 2 (§ 2.31) consent specification.
    Strictly forbids redisclosure without explicit written authorization.
    """
    session_id: UUID
    patient_pseudonym_token: str = Field(
        ...,
        description="Cryptographic pseudonym hash representing the patient; zero direct PII."
    )
    authorized_recipient_facility_id: str = Field(
        ...,
        description="Specific facility or provider entity authorized to receive the clinical record."
    )
    purpose_of_disclosure: str = Field(
        default="Substance use disorder evaluation, care matching, and warm handoff navigation",
        description="Narrow, specific purpose required under 42 CFR Part 2 § 2.31(a)(5)."
    )
    expiration_date: datetime = Field(
        ...,
        description="Date or condition upon which consent expires (max 1 year recommended)."
    )
    information_to_disclose: List[str] = Field(
        default_factory=lambda: ["ASAM_DIMENSION_PROFILE", "CARE_LEVEL_RECOMMENDATION", "PAYER_ELIGIBILITY"]
    )
    acknowledges_redisclosure_prohibition: bool = Field(
        ...,
        description="Acknowledges federal warning that information cannot be redisclosed (42 CFR Part 2 § 2.32)."
    )
    acknowledges_revocation_rights: bool = Field(
        ...,
        description="Acknowledges right to revoke consent at any time."
    )

    @field_validator("acknowledges_redisclosure_prohibition")
    @classmethod
    def validate_redisclosure(cls, v: bool) -> bool:
        if not v:
            raise ValueError("42 CFR Part 2 requires explicit acknowledgment of the federal prohibition on redisclosure.")
        return v

    @field_validator("acknowledges_revocation_rights")
    @classmethod
    def validate_revocation(cls, v: bool) -> bool:
        if not v:
            raise ValueError("42 CFR Part 2 requires explicit acknowledgment of revocation rights.")
        return v


class Consent42CFRPart2Record(BaseModel):
    """Persisted consent record with cryptographic provenance."""
    consent_id: UUID = Field(default_factory=uuid4)
    session_id: UUID
    patient_pseudonym_token: str
    authorized_recipient_facility_id: str
    purpose_of_disclosure: str
    expiration_date: datetime
    granted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_revoked: bool = False
    revoked_at: Optional[datetime] = None
    consent_signature_digest: str = Field(
        ...,
        description="HMAC-SHA256 signature binding pseudonym, facility, purpose, and timestamp."
    )


# ---------------------------------------------------------------------------
# 4. Intake Session & Facility Matching Models
# ---------------------------------------------------------------------------

class IntakeSessionCreate(BaseModel):
    """Initial anonymous intake session creation."""
    preferred_language: str = Field(default="en", max_length=10)
    coarse_zip_centroid: Optional[str] = Field(default=None, max_length=5)
    population_tracks: List[PopulationTrack] = Field(default_factory=lambda: [PopulationTrack.GENERAL_ADULT])


class IntakeSessionResponse(BaseModel):
    """Public session status."""
    session_id: UUID
    pseudonym_token: str
    current_state: IntakeState
    created_at: datetime
    expires_at: datetime
    active_crisis: bool = False


class FacilityMatchQuery(BaseModel):
    """Query payload for ASAM and payer-aligned facility matching."""
    session_id: UUID
    asam_level: ASAMCareLevel
    lat: float = Field(ge=-90.0, le=90.0)
    lng: float = Field(ge=-180.0, le=180.0)
    radius_miles: int = Field(default=25, ge=5, le=250)
    accepted_payments: List[PaymentType] = Field(default_factory=list)
    require_medication_assisted_treatment: bool = True
    require_buprenorphine: bool = False
    require_methadone_otp: bool = False
    require_naltrexone: bool = False
    require_sliding_scale: bool = False
    population_tracks: List[PopulationTrack] = Field(default_factory=list)


class FacilityMatchItem(BaseModel):
    """Individual matched facility response item."""
    facility_id: str
    name: str
    asam_levels_offered: List[ASAMCareLevel]
    distance_miles: float
    address_coarse: str
    phone: str
    website: Optional[str] = None
    payment_options: List[str]
    mat_services: List[str]
    verified_bed_count: Optional[int] = None
    verified_last_updated: Optional[datetime] = None
    score: float = Field(description="Deterministic multi-criteria compatibility score (0.0 - 100.0)")


class ReferralStageRequest(BaseModel):
    """Staging an outbound electronic referral packet."""
    session_id: UUID
    facility_id: str
    consent_id: UUID
    preferred_contact_method: str = Field(default="anonymous_app_token")
    client_notes_encrypted: Optional[str] = None


class ReferralStageResponse(BaseModel):
    """Response containing signed referral token and FHIR ServiceRequest identifier."""
    referral_id: UUID
    session_id: UUID
    facility_id: str
    fhir_service_request_id: str
    state: IntakeState = IntakeState.REFERRAL_STAGED
    staged_at: datetime
    status: str = "PENDING_FACILITY_ACKNOWLEDGMENT"
    tamper_audit_hash: str
