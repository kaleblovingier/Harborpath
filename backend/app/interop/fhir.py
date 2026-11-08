"""
HarborPath HL7 FHIR R4 & US Core v6.0.0 Interoperability Adapters.
Maps pseudonymous intake sessions, ASAM clinical evaluations, and 42 CFR Part 2 consents
into compliant FHIR R4 resources:
- ServiceRequest (US Core Referral Request)
- HealthcareService (Provider Facility Telemetry & Capabilities)
- Coverage (Payer Verification / 270-271 Crosswalk)
- Consent (42 CFR Part 2 Authorization with ETH/42CFRPart2 Security Labels)
- Provenance (Cryptographic Source Attestation)
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from uuid import UUID
from backend.app.models.intake import (
    ASAMCareLevel,
    Consent42CFRPart2Record,
    ASAMEvaluationResult,
    FacilityMatchItem
)


FHIR_ETH_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-ActCode"
FHIR_CONSENT_CATEGORY_SYSTEM = "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
FHIR_SNOMED_SYSTEM = "http://snomed.info/sct"
FHIR_ASAM_SYSTEM = "http://asam.org/criteria/levels"


def build_fhir_consent_resource(consent: Consent42CFRPart2Record) -> Dict[str, Any]:
    """
    Constructs an HL7 FHIR R4 Consent resource adhering strictly to 42 CFR Part 2 requirements.
    Carries explicit 'ETH' (Substance abuse information) and Part 2 security labels.
    """
    return {
        "resourceType": "Consent",
        "id": str(consent.consent_id),
        "meta": {
            "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-consent"],
            "security": [
                {
                    "system": FHIR_ETH_SYSTEM,
                    "code": "ETH",
                    "display": "Substance abuse information sensitivity"
                },
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                    "code": "PART2",
                    "display": "42 CFR Part 2 Confidentiality"
                }
            ]
        },
        "status": "rejected" if consent.is_revoked else "active",
        "scope": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                    "code": "patient-privacy",
                    "display": "Privacy Consent"
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": FHIR_CONSENT_CATEGORY_SYSTEM,
                        "code": "idsud",
                        "display": "Disclosure of Substance Use Disorder Information"
                    }
                ]
            }
        ],
        "patient": {
            "identifier": {
                "system": "https://harborpath.org/identifiers/pseudonym",
                "value": consent.patient_pseudonym_token
            },
            "display": "Pseudonymous Individual"
        },
        "dateTime": consent.granted_at.isoformat(),
        "performer": [
            {
                "identifier": {
                    "system": "https://harborpath.org/identifiers/pseudonym",
                    "value": consent.patient_pseudonym_token
                }
            }
        ],
        "recipient": [
            {
                "reference": f"Organization/{consent.authorized_recipient_facility_id}",
                "identifier": {
                    "system": "https://harborpath.org/identifiers/facility",
                    "value": consent.authorized_recipient_facility_id
                }
            }
        ],
        "provision": {
            "type": "permit",
            "period": {
                "start": consent.granted_at.isoformat(),
                "end": consent.expiration_date.isoformat()
            },
            "purpose": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
                    "code": "TREAT",
                    "display": consent.purpose_of_disclosure
                }
            ],
            "security": [
                {
                    "system": FHIR_ETH_SYSTEM,
                    "code": "ETH",
                    "display": "Substance abuse information"
                }
            ]
        }
    }


def build_fhir_service_request(
    referral_id: UUID,
    session_id: UUID,
    pseudonym_token: str,
    recipient_facility_id: str,
    asam_evaluation: ASAMEvaluationResult,
    consent_id: UUID
) -> Dict[str, Any]:
    """
    Constructs an HL7 FHIR R4 ServiceRequest resource (US Core Referral Request profile).
    Encapsulates recommended level of care, clinical urgency, and explicit consent reference.
    """
    return {
        "resourceType": "ServiceRequest",
        "id": str(referral_id),
        "meta": {
            "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-servicerequest"],
            "security": [
                {
                    "system": FHIR_ETH_SYSTEM,
                    "code": "ETH",
                    "display": "Substance abuse information"
                }
            ]
        },
        "identifier": [
            {
                "system": "https://harborpath.org/referrals",
                "value": str(referral_id)
            }
        ],
        "status": "active",
        "intent": "referral",
        "category": [
            {
                "coding": [
                    {
                        "system": FHIR_SNOMED_SYSTEM,
                        "code": "3457005",
                        "display": "Patient referral"
                    }
                ]
            }
        ],
        "priority": "urgent" if asam_evaluation.withdrawal_management_needed else "routine",
        "code": {
            "coding": [
                {
                    "system": FHIR_ASAM_SYSTEM,
                    "code": asam_evaluation.recommended_level.value,
                    "display": asam_evaluation.level_title
                }
            ],
            "text": f"ASAM Level {asam_evaluation.recommended_level.value} Care Referral"
        },
        "subject": {
            "identifier": {
                "system": "https://harborpath.org/identifiers/pseudonym",
                "value": pseudonym_token
            },
            "display": "Pseudonymous Individual"
        },
        "authoredOn": datetime.now(timezone.utc).isoformat(),
        "performer": [
            {
                "reference": f"Organization/{recipient_facility_id}"
            }
        ],
        "supportingInfo": [
            {
                "reference": f"Consent/{consent_id}"
            }
        ],
        "note": [
            {
                "text": f"Withdrawal Management Needed: {asam_evaluation.withdrawal_management_needed}. "
                        f"Rationale: {'; '.join(asam_evaluation.clinical_rationale[:3])}"
            }
        ]
    }


def build_fhir_healthcare_service(facility: Dict[str, Any]) -> Dict[str, Any]:
    """
    Translates internal provider/facility record into FHIR R4 HealthcareService.
    Supports real-time bed telemetry and capability broadcasting.
    """
    return {
        "resourceType": "HealthcareService",
        "id": str(facility.get("facility_id", "unknown")),
        "meta": {
            "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-healthcareservice"]
        },
        "identifier": [
            {
                "system": "https://findtreatment.gov/facility",
                "value": str(facility.get("facility_id", ""))
            }
        ],
        "active": True,
        "name": facility.get("name", "Behavioral Health Facility"),
        "category": [
            {
                "coding": [
                    {
                        "system": FHIR_SNOMED_SYSTEM,
                        "code": "38243003",
                        "display": "Substance abuse rehabilitation service"
                    }
                ]
            }
        ],
        "telecom": [
            {
                "system": "phone",
                "value": facility.get("phone", ""),
                "use": "work"
            }
        ],
        "characteristic": [
            {
                "coding": [
                    {
                        "system": "https://harborpath.org/codes/service",
                        "code": code
                    }
                    for code in facility.get("service_codes", [])
                ]
            }
        ]
    }
