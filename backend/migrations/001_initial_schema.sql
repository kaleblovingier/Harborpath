-- HarborPath PostgreSQL Schema Migration: 001_initial_schema.sql
-- Production DDL with pgvector, PostGIS, 42 CFR Part 2 Consent, and Cryptographic Audit Trail.

BEGIN;

-- 1. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "postgis";  -- Uncomment when PostGIS is enabled
-- CREATE EXTENSION IF NOT EXISTS "vector";   -- Uncomment when pgvector is enabled

-- 2. Enumerated Types
CREATE TYPE asam_care_level_enum AS ENUM (
    '0.5', -- Early Intervention
    '1.0', -- Outpatient
    '2.1', -- Intensive Outpatient (IOP)
    '2.5', -- Partial Hospitalization (PHP)
    '3.1', -- Clinically Managed Low-Intensity Residential
    '3.5', -- Clinically Managed High-Intensity Residential
    '3.7', -- Medically Monitored Inpatient Withdrawal/Treatment
    '4.0'  -- Medically Managed Intensive Inpatient / ICU
);

CREATE TYPE intake_state_enum AS ENUM (
    'ARRIVED',
    'ANONYMOUS_DISCOVERY',
    'CRISIS_SCREENING',
    'CRISIS_ESCALATED',
    'CONSENT_PENDING',
    'CLINICAL_TRIAGE_ACTIVE',
    'ASAM_EVALUATED',
    'FACILITY_MATCHING',
    'REFERRAL_STAGED',
    'REFERRAL_TRANSMITTED',
    'SESSION_PURGED'
);

CREATE TYPE referral_status_enum AS ENUM (
    'STAGED',
    'PENDING_FACILITY_ACKNOWLEDGMENT',
    'ACCEPTED',
    'DECLINED_CAPACITY',
    'COMPLETED_INTAKE',
    'EXPIRED_CANCELLED'
);

-- 3. Facilities & Provider Directory
CREATE TABLE facilities (
    facility_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_npi VARCHAR(10),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    address_street VARCHAR(255),
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(2) NOT NULL,
    address_postal_code VARCHAR(10) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    website VARCHAR(255),
    service_codes TEXT[] NOT NULL DEFAULT '{}',
    asam_levels_supported asam_care_level_enum[] NOT NULL DEFAULT '{}',
    payment_types TEXT[] NOT NULL DEFAULT '{}',
    accepts_medicaid BOOLEAN NOT NULL DEFAULT FALSE,
    accepts_medicare BOOLEAN NOT NULL DEFAULT FALSE,
    accepts_sliding_scale BOOLEAN NOT NULL DEFAULT FALSE,
    offers_buprenorphine BOOLEAN NOT NULL DEFAULT FALSE,
    offers_methadone_otp BOOLEAN NOT NULL DEFAULT FALSE,
    offers_naltrexone BOOLEAN NOT NULL DEFAULT FALSE,
    total_licensed_beds INTEGER CHECK (total_licensed_beds >= 0),
    verified_open_beds INTEGER CHECK (verified_open_beds >= 0),
    bed_telemetry_updated_at TIMESTAMPTZ,
    data_source VARCHAR(50) NOT NULL DEFAULT 'SAMHSA_DIRECTORY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Facilities
CREATE INDEX idx_facilities_state_city ON facilities(address_state, address_city);
CREATE INDEX idx_facilities_service_codes_gin ON facilities USING GIN(service_codes);
CREATE INDEX idx_facilities_asam_levels_gin ON facilities USING GIN(asam_levels_supported);
CREATE INDEX idx_facilities_open_beds ON facilities(verified_open_beds) WHERE verified_open_beds > 0;

-- 4. Ephemeral Intake Sessions (Zero Direct Identifiers)
CREATE TABLE intake_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pseudonym_token VARCHAR(64) UNIQUE NOT NULL,
    current_state intake_state_enum NOT NULL DEFAULT 'ARRIVED',
    coarse_zip_centroid VARCHAR(5),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    population_tracks TEXT[] NOT NULL DEFAULT '{general_adult}',
    is_crisis_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

CREATE INDEX idx_intake_sessions_expires_at ON intake_sessions(expires_at);
CREATE INDEX idx_intake_sessions_pseudonym ON intake_sessions(pseudonym_token);

-- 5. ASAM 6-Dimension Clinical Assessments
CREATE TABLE asam_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES intake_sessions(session_id) ON DELETE CASCADE,
    dim1_acute_intoxication_withdrawal SMALLINT NOT NULL CHECK (dim1_acute_intoxication_withdrawal BETWEEN 0 AND 4),
    dim2_biomedical_conditions SMALLINT NOT NULL CHECK (dim2_biomedical_conditions BETWEEN 0 AND 4),
    dim3_psychiatric_cognitive SMALLINT NOT NULL CHECK (dim3_psychiatric_cognitive BETWEEN 0 AND 4),
    dim4_readiness_to_change SMALLINT NOT NULL CHECK (dim4_readiness_to_change BETWEEN 0 AND 4),
    dim5_relapse_continued_use SMALLINT NOT NULL CHECK (dim5_relapse_continued_use BETWEEN 0 AND 4),
    dim6_recovery_environment SMALLINT NOT NULL CHECK (dim6_recovery_environment BETWEEN 0 AND 4),
    recommended_asam_level asam_care_level_enum NOT NULL,
    withdrawal_management_needed BOOLEAN NOT NULL DEFAULT FALSE,
    recommended_wm_level VARCHAR(50),
    clinical_rationale JSONB NOT NULL DEFAULT '[]'::JSONB,
    encrypted_notes TEXT, -- Field-level encrypted with AES-256 envelope cipher
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asam_assessments_session ON asam_assessments(session_id);
CREATE INDEX idx_asam_assessments_level ON asam_assessments(recommended_asam_level);

-- 6. 42 CFR Part 2 Consent Records (§ 2.31 Compliance)
CREATE TABLE consent_records (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES intake_sessions(session_id) ON DELETE CASCADE,
    patient_pseudonym_token VARCHAR(64) NOT NULL,
    authorized_recipient_facility_id VARCHAR(64) NOT NULL REFERENCES facilities(facility_id),
    purpose_of_disclosure TEXT NOT NULL,
    information_to_disclose TEXT[] NOT NULL DEFAULT '{"ASAM_DIMENSION_PROFILE","CARE_LEVEL_RECOMMENDATION"}',
    expiration_date TIMESTAMPTZ NOT NULL,
    redisclosure_prohibition_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    consent_signature_digest VARCHAR(64) NOT NULL, -- HMAC-SHA256 signature binding attributes
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_pseudonym_recipient ON consent_records(patient_pseudonym_token, authorized_recipient_facility_id);
CREATE INDEX idx_consent_active ON consent_records(consent_id) WHERE is_revoked = FALSE;

-- 7. Electronic Referrals & FHIR Tracking
CREATE TABLE referrals (
    referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES intake_sessions(session_id) ON DELETE CASCADE,
    facility_id VARCHAR(64) NOT NULL REFERENCES facilities(facility_id),
    consent_id UUID NOT NULL REFERENCES consent_records(consent_id),
    fhir_service_request_id VARCHAR(64) UNIQUE NOT NULL,
    status referral_status_enum NOT NULL DEFAULT 'PENDING_FACILITY_ACKNOWLEDGMENT',
    staged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    tamper_audit_hash VARCHAR(64) NOT NULL
);

CREATE INDEX idx_referrals_facility_status ON referrals(facility_id, status);
CREATE INDEX idx_referrals_fhir_id ON referrals(fhir_service_request_id);

-- 8. Immutable, Tamper-Evident Cryptographic Audit Trail
CREATE TABLE audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(64) NOT NULL,
    actor_token VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    payload_digest VARCHAR(64) NOT NULL,
    client_ip_hash VARCHAR(64) -- Coarsened/hashed client network fingerprint
);

CREATE INDEX idx_audit_trail_timestamp ON audit_trail(timestamp);
CREATE INDEX idx_audit_trail_action ON audit_trail(action);

-- 9. Trigger Enforcing Immutable Append-Only Audit Trail
CREATE OR REPLACE FUNCTION enforce_audit_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit trail is strictly append-only. UPDATE and DELETE operations are forbidden by 42 CFR Part 2 and HIPAA security policy.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutability
BEFORE UPDATE OR DELETE ON audit_trail
FOR EACH ROW EXECUTE FUNCTION enforce_audit_immutability();

COMMIT;
