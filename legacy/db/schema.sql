-- ============================================================================
-- HARBORPATH TWO-ZONE POSTGRESQL SCHEMA (DESIGNED WITH 42 CFR PART 2 & HIPAA CONCEPTS IN MIND; NEVER ASSESSED FOR COMPLIANCE)
-- ============================================================================

-- ZONE 1: PUBLIC PROVIDER DIRECTORY & VERIFICATION SCHEMA (NO PHI / NO PII)
CREATE SCHEMA IF NOT EXISTS public_directory;

CREATE TABLE public_directory.providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi_number VARCHAR(10) UNIQUE NOT NULL,
    legal_entity_name TEXT NOT NULL,
    dba_name TEXT NOT NULL,
    provider_type VARCHAR(32) NOT NULL CHECK (provider_type IN ('FACILITY', 'COUNSELOR', 'OTP', 'CCBHC')),
    samhsa_bhsis_id VARCHAR(64) UNIQUE, -- Verified via SAMHSA FindTreatment.gov / N-SUMHSS
    is_part2_program BOOLEAN NOT NULL DEFAULT TRUE,
    physical_address JSONB NOT NULL,    -- Verified via lease/deed per LegitScript Standard 4
    geo_location GEOGRAPHY(POINT, 4326) NOT NULL,
    asam_levels_offered TEXT[] NOT NULL, -- e.g., {'1.0','2.1','2.5','3.5','3.7'}
    mat_medications TEXT[] NOT NULL,     -- e.g., {'BUPRENORPHINE','METHADONE','NALTREXONE'}
    accepted_payers TEXT[] NOT NULL,     -- e.g., {'WA_APPLE_HEALTH','PREMERA','SLIDING_SCALE'}
    anti_brokering_attestation_signed_at TIMESTAMPTZ NOT NULL, -- EKRA 18 U.S.C. 220 & NAATP Sec V
    verification_status VARCHAR(24) NOT NULL CHECK (verification_status IN ('PENDING', 'VERIFIED', 'SUSPENDED', 'REVOKED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public_directory.provider_verifications (
    verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public_directory.providers(provider_id) ON DELETE CASCADE,
    authority VARCHAR(32) NOT NULL CHECK (authority IN (
        'LEGITSCRIPT', 'CARF', 'JOINT_COMMISSION', 'NAATP_QAI', 'ASAM_LOC_CERT', 'STATE_LICENSE', 'DEA_OTP'
    )),
    license_or_cert_number VARCHAR(128) NOT NULL,
    issuing_state VARCHAR(2),
    verified_asam_levels TEXT[],
    issued_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    last_automated_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_evidence_uri TEXT NOT NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'DISCIPLINARY_ACTION', 'REVOKED'))
);

-- ZONE 2: ISOLATED HIPAA / 42 CFR PART 2 VAULT SCHEMA (ENVELOPE ENCRYPTED)
CREATE SCHEMA IF NOT EXISTS part2_vault;

CREATE TABLE part2_vault.patient_vault_identities (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kms_wrapped_dek BYTEA NOT NULL,        -- AES-256 DEK wrapped by FIPS 140-3 HSM KEK
    encrypted_demographics BYTEA NOT NULL, -- AES-256-GCM ciphertext
    demographics_iv BYTEA NOT NULL,
    fundraising_opt_out BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE part2_vault.part2_consents (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES part2_vault.patient_vault_identities(patient_id),
    consent_category VARCHAR(32) NOT NULL CHECK (consent_category IN (
        'NAMED_PROVIDER_ONLY',
        'SINGLE_TPO_CONSENT',
        'SUD_COUNSELING_NOTES_ONLY'
    )),
    recipient_provider_ids UUID[] NOT NULL,
    permitted_data_scopes TEXT[] NOT NULL,
    purpose_of_disclosure TEXT NOT NULL,
    self_pay_plan_restriction BOOLEAN NOT NULL DEFAULT FALSE,
    redisclosure_notice_attached BOOLEAN NOT NULL DEFAULT TRUE CHECK (redisclosure_notice_attached = TRUE),
    prohibit_legal_proceedings BOOLEAN NOT NULL DEFAULT TRUE CHECK (prohibit_legal_proceedings = TRUE),
    signed_consent_document_json JSONB NOT NULL,
    patient_signature_hash CHAR(64) NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    status VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))
);

CREATE TABLE part2_vault.sud_clinical_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES part2_vault.patient_vault_identities(patient_id),
    record_type VARCHAR(32) NOT NULL CHECK (record_type IN (
        'ASAM_INTAKE_PACKET',
        'INSURANCE_VERIFICATION',
        'SUD_COUNSELING_NOTE'
    )),
    is_part2_protected BOOLEAN NOT NULL DEFAULT TRUE,
    prohibit_legal_proceedings BOOLEAN NOT NULL DEFAULT TRUE CHECK (prohibit_legal_proceedings = TRUE),
    encrypted_payload BYTEA NOT NULL,
    payload_iv BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE part2_vault.disclosure_audit_ledger (
    disclosure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES part2_vault.patient_vault_identities(patient_id),
    record_id UUID NOT NULL REFERENCES part2_vault.sud_clinical_records(record_id),
    consent_id UUID NOT NULL REFERENCES part2_vault.part2_consents(consent_id),
    recipient_provider_id UUID NOT NULL,
    disclosure_purpose TEXT NOT NULL,
    consent_scope_attached_hash CHAR(64) NOT NULL,
    part2_notice_attached BOOLEAN NOT NULL DEFAULT TRUE CHECK (part2_notice_attached = TRUE),
    disclosed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    prev_ledger_hash CHAR(64) NOT NULL,
    entry_hash CHAR(64) NOT NULL
);
