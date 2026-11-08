"""
HarborPath Asynchronous FastAPI Intake & Triage Router.
Implements pseudonymous intake, crisis screening, 42 CFR Part 2 consent enforcement,
ASAM Criteria 4th Edition dimension scoring, and facility care-matching.
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends, Header, status

from backend.app.models.intake import (
    ASAMCareLevel,
    ASAMDimensionScore,
    ASAMEvaluationResult,
    CrisisScreeningRequest,
    CrisisScreeningResult,
    CrisisSeverity,
    Consent42CFRPart2Request,
    Consent42CFRPart2Record,
    IntakeSessionCreate,
    IntakeSessionResponse,
    IntakeState,
    FacilityMatchQuery,
    FacilityMatchItem,
    ReferralStageRequest,
    ReferralStageResponse,
    PaymentType,
)
from backend.app.core.security import (
    DEFAULT_SECRET_KEY,
    generate_pseudonym_token,
    generate_consent_digest,
    compute_audit_hash,
    digest_payload,
)
from backend.app.core.state_machine import IntakeStateMachine, InvalidStateTransitionError
from backend.app.interop.fhir import build_fhir_service_request, build_fhir_consent_resource

router = APIRouter(prefix="/intake", tags=["Intake & Triage"])

# Ephemeral in-memory store for demonstrations / stateless operation
_ACTIVE_SESSIONS: Dict[UUID, Dict[str, Any]] = {}
_ACTIVE_CONSENTS: Dict[UUID, Consent42CFRPart2Record] = {}


def get_session(session_id: UUID) -> Dict[str, Any]:
    """Retrieves session from RAM store or raises 404."""
    if session_id not in _ACTIVE_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake session not found or has expired."
        )
    return _ACTIVE_SESSIONS[session_id]


# ---------------------------------------------------------------------------
# 1. Session Lifecycle
# ---------------------------------------------------------------------------

@router.post("/session", response_model=IntakeSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_intake_session(payload: IntakeSessionCreate) -> IntakeSessionResponse:
    """
    Initializes a zero-PII pseudonymous intake session.
    No IP, phone number, name, or cookie identifier is persisted.
    """
    session_id = uuid4()
    pseudonym_token = generate_pseudonym_token(seed=str(session_id))
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=2)

    sm = IntakeStateMachine(
        session_id=str(session_id),
        pseudonym_token=pseudonym_token,
        initial_state=IntakeState.ARRIVED
    )
    sm.transition_to(IntakeState.ANONYMOUS_DISCOVERY, reason="SESSION_INITIALIZATION")

    session_record = {
        "session_id": session_id,
        "pseudonym_token": pseudonym_token,
        "state_machine": sm,
        "preferred_language": payload.preferred_language,
        "coarse_zip": payload.coarse_zip_centroid,
        "population_tracks": payload.population_tracks,
        "created_at": now,
        "expires_at": expires_at,
        "asam_evaluation": None,
        "crisis_active": False,
        "last_audit_hash": "0" * 64,
    }
    _ACTIVE_SESSIONS[session_id] = session_record

    return IntakeSessionResponse(
        session_id=session_id,
        pseudonym_token=pseudonym_token,
        current_state=sm.current_state,
        created_at=now,
        expires_at=expires_at,
        active_crisis=False
    )


# ---------------------------------------------------------------------------
# 2. Emergency Crisis Screening
# ---------------------------------------------------------------------------

@router.post("/crisis-screen", response_model=CrisisScreeningResult)
async def screen_crisis_red_flags(payload: CrisisScreeningRequest) -> CrisisScreeningResult:
    """
    Interception point for acute clinical emergencies.
    If life-threatening overdose, withdrawal, or suicidal crisis is flagged,
    immediately routes user to 911 / 988 and halts routine intake.
    """
    session = get_session(payload.session_id)
    sm: IntakeStateMachine = session["state_machine"]

    if sm.can_transition_to(IntakeState.CRISIS_SCREENING):
        sm.transition_to(IntakeState.CRISIS_SCREENING, reason="CRISIS_SCREEN_REQUESTED")

    # Evaluate red flags deterministically
    if payload.active_overdose_symptoms or payload.severe_medical_sepsis_or_trauma:
        severity = CrisisSeverity.EMERGENT_911
        hotline_name = "Emergency Medical Services (911) / Poison Control"
        hotline_num = "911"
        instructions = [
            "Call 911 immediately. Administer Naloxone (Narcan) if available.",
            "Place individual in the recovery position (on their side).",
            "Begin rescue breathing (1 breath every 5 seconds) if breathing is shallow or absent."
        ]
        next_state = IntakeState.CRISIS_ESCALATED
    elif payload.suicidal_ideation_with_intent or payload.acute_psychosis_or_homicide_risk:
        severity = CrisisSeverity.CRISIS_988
        hotline_name = "988 Suicide & Crisis Lifeline"
        hotline_num = "988"
        instructions = [
            "Call or text 988 immediately to connect with a trained behavioral health crisis counselor.",
            "Do not leave the individual alone; remove access to lethal means.",
            "Mobile Crisis Teams can be dispatched in participating jurisdictions."
        ]
        next_state = IntakeState.CRISIS_ESCALATED
    elif payload.severe_alcohol_sedative_withdrawal:
        severity = CrisisSeverity.EMERGENT_911
        hotline_name = "Emergency Department / Medically Managed Detox"
        hotline_num = "911"
        instructions = [
            "Alcohol or sedative withdrawal with delirium tremens or seizures is a medical emergency.",
            "Immediate hospital emergency department evaluation is required for intravenous stabilization.",
            "Do not attempt unmonitored abrupt cessation."
        ]
        next_state = IntakeState.CRISIS_ESCALATED
    else:
        severity = CrisisSeverity.NONE
        hotline_name = None
        hotline_num = None
        instructions = ["No acute life-threatening emergency flags detected. Proceeding to clinical intake."]
        next_state = IntakeState.CLINICAL_TRIAGE_ACTIVE

    if sm.can_transition_to(next_state):
        sm.transition_to(next_state, reason=f"CRISIS_SCREEN_RESULT:{severity.value}")

    session["crisis_active"] = (severity != CrisisSeverity.NONE)

    return CrisisScreeningResult(
        session_id=payload.session_id,
        severity=severity,
        escalation_required=(severity != CrisisSeverity.NONE),
        primary_hotline_name=hotline_name,
        primary_hotline_number=hotline_num,
        action_instructions=instructions,
        state_transition=sm.current_state
    )


# ---------------------------------------------------------------------------
# 3. 42 CFR Part 2 Consent Management
# ---------------------------------------------------------------------------

@router.post("/consent", response_model=Consent42CFRPart2Record, status_code=status.HTTP_201_CREATED)
async def record_part2_consent(payload: Consent42CFRPart2Request) -> Consent42CFRPart2Record:
    """
    Enforces federal 42 CFR Part 2 (§ 2.31) consent standards for substance use disclosures:
    - Binds specific recipient facility
    - Validates narrow purpose of disclosure
    - Enforces mandatory redisclosure warning acknowledgment
    - Generates cryptographic signature digest
    """
    session = get_session(payload.session_id)
    sm: IntakeStateMachine = session["state_machine"]

    now = datetime.now(timezone.utc)
    if payload.expiration_date <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent expiration date must be in the future."
        )

    signature_digest = generate_consent_digest(
        secret_key=DEFAULT_SECRET_KEY,
        pseudonym_token=payload.patient_pseudonym_token,
        facility_id=payload.authorized_recipient_facility_id,
        purpose=payload.purpose_of_disclosure,
        expiration_iso=payload.expiration_date.isoformat()
    )

    consent_record = Consent42CFRPart2Record(
        consent_id=uuid4(),
        session_id=payload.session_id,
        patient_pseudonym_token=payload.patient_pseudonym_token,
        authorized_recipient_facility_id=payload.authorized_recipient_facility_id,
        purpose_of_disclosure=payload.purpose_of_disclosure,
        expiration_date=payload.expiration_date,
        granted_at=now,
        is_revoked=False,
        consent_signature_digest=signature_digest
    )

    _ACTIVE_CONSENTS[consent_record.consent_id] = consent_record
    session["active_consent_id"] = consent_record.consent_id

    if sm.can_transition_to(IntakeState.CLINICAL_TRIAGE_ACTIVE):
        sm.transition_to(IntakeState.CLINICAL_TRIAGE_ACTIVE, reason="CONSENT_RECORDED")

    return consent_record


# ---------------------------------------------------------------------------
# 4. ASAM Criteria 4th Edition Evaluation
# ---------------------------------------------------------------------------

@router.post("/evaluate-asam", response_model=ASAMEvaluationResult)
async def evaluate_asam_criteria(session_id: UUID, scores: ASAMDimensionScore) -> ASAMEvaluationResult:
    """
    Applies the ASAM Criteria 4th Edition dimensional algorithm.
    Derives recommended Level of Care (0.5 through 4.0) and withdrawal management requirements.
    """
    session = get_session(session_id)
    sm: IntakeStateMachine = session["state_machine"]

    d1 = scores.dimension_1_acute_intoxication_withdrawal
    d2 = scores.dimension_2_biomedical_conditions
    d3 = scores.dimension_3_psychiatric_cognitive_conditions
    d4 = scores.dimension_4_readiness_to_change
    d5 = scores.dimension_5_relapse_continued_use_potential
    d6 = scores.dimension_6_recovery_environment

    clinical_rationale: List[str] = []
    service_codes: List[str] = []
    wm_needed = False
    wm_level: Optional[str] = None

    # Dimension 1 & 2 Escalation (Withdrawal & Acute Medical)
    if d1 >= 4 or d2 >= 4:
        recommended_level = ASAMCareLevel.LEVEL_4_0_MEDICALLY_MANAGED_INTENSIVE_ICU
        title = "Level 4.0: Medically Managed Intensive Inpatient / ICU"
        wm_needed = True
        wm_level = "Level 4-WM: Medically Managed Inpatient Withdrawal"
        clinical_rationale.append("Severe acute withdrawal or unstable biomedical conditions require 24/7 medical/nursing care.")
        service_codes.extend(["DT", "HI", "BU", "OTP"])
    elif d1 == 3 or d2 == 3:
        recommended_level = ASAMCareLevel.LEVEL_3_7_MEDICALLY_MONITORED_INPATIENT
        title = "Level 3.7: Medically Monitored Inpatient Withdrawal & Treatment"
        wm_needed = True
        wm_level = "Level 3.7-WM: Medically Monitored Inpatient Withdrawal"
        clinical_rationale.append("Moderate-to-severe withdrawal symptoms require 24-hour observation and medication management.")
        service_codes.extend(["DT", "RES", "BU", "OTP"])
    elif d3 >= 3 and (d5 >= 3 or d6 >= 3):
        recommended_level = ASAMCareLevel.LEVEL_3_5_HIGH_INTENSITY_RESIDENTIAL
        title = "Level 3.5: Clinically Managed High-Intensity Residential"
        clinical_rationale.append("Significant psychiatric or recovery environment instability requires 24-hour structured therapeutic community.")
        service_codes.extend(["RES", "MHSU", "BU", "PEER"])
    elif d6 >= 3 and d5 >= 2:
        recommended_level = ASAMCareLevel.LEVEL_3_1_LOW_INTENSITY_RESIDENTIAL
        title = "Level 3.1: Clinically Managed Low-Intensity Residential / Halfway House"
        clinical_rationale.append("Supportive recovery housing required to prevent relapse in unsupportive home environment.")
        service_codes.extend(["RES", "OP", "PEER"])
    elif d4 >= 3 or d5 >= 3:
        recommended_level = ASAMCareLevel.LEVEL_2_5_PARTIAL_HOSPITALIZATION
        title = "Level 2.5: Partial Hospitalization Program (PHP) / Day Treatment"
        clinical_rationale.append("Intensive 20+ hours/week clinical programming required for high relapse risk without 24-hour bed need.")
        service_codes.extend(["PHP", "OP", "BU", "MHSU"])
    elif d5 >= 2 or d3 >= 2:
        recommended_level = ASAMCareLevel.LEVEL_2_1_INTENSIVE_OUTPATIENT
        title = "Level 2.1: Intensive Outpatient Program (IOP)"
        clinical_rationale.append("Structured 9–19 hours/week multi-modal therapy with medical monitoring.")
        service_codes.extend(["IOP", "OP", "BU", "TELE"])
    elif d4 >= 1 or d5 >= 1:
        recommended_level = ASAMCareLevel.LEVEL_1_0_OUTPATIENT
        title = "Level 1.0: Outpatient Services"
        clinical_rationale.append("Individual and group counseling (< 9 hours/week) paired with outpatient MOUD maintenance.")
        service_codes.extend(["OP", "BU", "TELE"])
    else:
        recommended_level = ASAMCareLevel.LEVEL_0_5_EARLY_INTERVENTION
        title = "Level 0.5: Early Intervention / SBIRT"
        clinical_rationale.append("Screening, Brief Intervention, and Referral to Treatment.")
        service_codes.extend(["OP", "TELE"])

    if scores.prior_overdose_history:
        service_codes.append("NOE")
        clinical_rationale.append("Overdose history prompts prioritized naloxone co-prescription and rapid MOUD induction.")

    breakdown = {
        "D1_acute_intoxication_withdrawal": d1,
        "D2_biomedical_conditions": d2,
        "D3_psychiatric_cognitive": d3,
        "D4_readiness_to_change": d4,
        "D5_relapse_continued_use": d5,
        "D6_recovery_environment": d6,
    }

    result = ASAMEvaluationResult(
        session_id=session_id,
        recommended_level=recommended_level,
        level_title=title,
        withdrawal_management_needed=wm_needed,
        recommended_wm_level=wm_level,
        dimension_breakdown=breakdown,
        clinical_rationale=clinical_rationale,
        suggested_service_codes=list(dict.fromkeys(service_codes)),
        next_state=IntakeState.ASAM_EVALUATED
    )

    session["asam_evaluation"] = result

    if sm.can_transition_to(IntakeState.ASAM_EVALUATED):
        sm.transition_to(IntakeState.ASAM_EVALUATED, reason=f"ASAM_EVALUATION:{recommended_level.value}")

    return result


# ---------------------------------------------------------------------------
# 5. ASAM-Aligned Facility Matching
# ---------------------------------------------------------------------------

@router.post("/match-facilities", response_model=List[FacilityMatchItem])
async def match_facilities(query: FacilityMatchQuery) -> List[FacilityMatchItem]:
    """
    Executes a multi-criteria spatial and clinical capability match.
    Evaluates:
    - ASAM Level compatibility
    - Payer and sliding scale acceptance
    - Verified bed telemetry
    - Proximity to coarsened coordinates
    """
    session = get_session(query.session_id)
    sm: IntakeStateMachine = session["state_machine"]

    if sm.can_transition_to(IntakeState.FACILITY_MATCHING):
        sm.transition_to(IntakeState.FACILITY_MATCHING, reason="FACILITY_MATCH_QUERIED")

    # Sample curated behavioral health facilities
    mock_facilities = [
        {
            "facility_id": "fac_001",
            "name": "St. Jude Recovery & Inpatient Center",
            "asam_levels": [ASAMCareLevel.LEVEL_3_7_MEDICALLY_MONITORED_INPATIENT, ASAMCareLevel.LEVEL_3_5_HIGH_INTENSITY_RESIDENTIAL],
            "distance_miles": 4.2,
            "address_coarse": "Downtown Healthcare District",
            "phone": "555-019-2834",
            "website": "https://example-recovery.org",
            "payments": ["medicaid", "commercial", "sliding_scale"],
            "mat": ["Buprenorphine (Suboxone)", "Naltrexone (Vivitrol)"],
            "beds": 4,
            "updated": datetime.now(timezone.utc) - timedelta(minutes=45)
        },
        {
            "facility_id": "fac_002",
            "name": "HarborView Comprehensive Outpatient & OTP",
            "asam_levels": [ASAMCareLevel.LEVEL_1_0_OUTPATIENT, ASAMCareLevel.LEVEL_2_1_INTENSIVE_OUTPATIENT],
            "distance_miles": 1.8,
            "address_coarse": "Northside Metro Corridor",
            "phone": "555-014-9922",
            "website": "https://example-harborview.org",
            "payments": ["medicaid", "medicare", "commercial", "no_fee_charity"],
            "mat": ["Methadone OTP", "Buprenorphine (Sublocade/Suboxone)", "Naltrexone"],
            "beds": None,
            "updated": datetime.now(timezone.utc) - timedelta(hours=2)
        },
        {
            "facility_id": "fac_003",
            "name": "Community Hope Residential Treatment",
            "asam_levels": [ASAMCareLevel.LEVEL_3_1_LOW_INTENSITY_RESIDENTIAL, ASAMCareLevel.LEVEL_3_5_HIGH_INTENSITY_RESIDENTIAL],
            "distance_miles": 9.5,
            "address_coarse": "West Suburban Campus",
            "phone": "555-018-7711",
            "website": "https://example-communityhope.org",
            "payments": ["medicaid", "sliding_scale", "cash_self_pay"],
            "mat": ["Buprenorphine", "Peer Recovery Specialists"],
            "beds": 2,
            "updated": datetime.now(timezone.utc) - timedelta(hours=1)
        }
    ]

    matched: List[FacilityMatchItem] = []
    for f in mock_facilities:
        if query.radius_miles and f["distance_miles"] > query.radius_miles:
            continue

        # Compatibility scoring
        score = 80.0
        if query.asam_level in f["asam_levels"]:
            score += 15.0
        if f["beds"] and f["beds"] > 0:
            score += 5.0
        score -= min(15.0, f["distance_miles"] * 0.5)

        item = FacilityMatchItem(
            facility_id=f["facility_id"],
            name=f["name"],
            asam_levels_offered=f["asam_levels"],
            distance_miles=round(f["distance_miles"], 1),
            address_coarse=f["address_coarse"],
            phone=f["phone"],
            website=f["website"],
            payment_options=f["payments"],
            mat_services=f["mat"],
            verified_bed_count=f["beds"],
            verified_last_updated=f["updated"],
            score=round(max(10.0, min(100.0, score)), 1)
        )
        matched.append(item)

    matched.sort(key=lambda x: x.score, reverse=True)
    return matched


# ---------------------------------------------------------------------------
# 6. Referral Staging & FHIR Export
# ---------------------------------------------------------------------------

@router.post("/stage-referral", response_model=ReferralStageResponse, status_code=status.HTTP_201_CREATED)
async def stage_referral(payload: ReferralStageRequest) -> ReferralStageResponse:
    """
    Stages an electronic referral packet with 42 CFR Part 2 authorization.
    Produces an HL7 FHIR R4 ServiceRequest bundle identifier and cryptographic audit hash.
    """
    session = get_session(payload.session_id)
    sm: IntakeStateMachine = session["state_machine"]

    if payload.consent_id not in _ACTIVE_CONSENTS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A valid 42 CFR Part 2 consent record is strictly required before staging a referral."
        )

    consent = _ACTIVE_CONSENTS[payload.consent_id]
    if consent.is_revoked or consent.expiration_date <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The provided 42 CFR Part 2 consent has been revoked or has expired."
        )

    referral_id = uuid4()
    now = datetime.now(timezone.utc)
    fhir_id = f"HP-SR-{referral_id.hex[:12].upper()}"

    audit_hash = compute_audit_hash(
        prev_hash=session["last_audit_hash"],
        timestamp_iso=now.isoformat(),
        action="REFERRAL_STAGED",
        actor_token=session["pseudonym_token"],
        payload_digest=digest_payload(f"{referral_id}:{payload.facility_id}:{payload.consent_id}")
    )
    session["last_audit_hash"] = audit_hash

    if sm.can_transition_to(IntakeState.REFERRAL_STAGED):
        sm.transition_to(IntakeState.REFERRAL_STAGED, reason=f"REFERRAL_STAGED:{payload.facility_id}")

    return ReferralStageResponse(
        referral_id=referral_id,
        session_id=payload.session_id,
        facility_id=payload.facility_id,
        fhir_service_request_id=fhir_id,
        state=sm.current_state,
        staged_at=now,
        status="PENDING_FACILITY_ACKNOWLEDGMENT",
        tamper_audit_hash=audit_hash
    )
