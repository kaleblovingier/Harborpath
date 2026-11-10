"""
HarborPath FastAPI Application Entrypoint.
Configured with strict security headers, 42 CFR Part 2 privacy middleware,
and rate-limiting defenses against facility scraping.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.v1.endpoints.intake import router as intake_router
from backend.app.core.security import TokenBucketRateLimiter

app = FastAPI(
    title="HarborPath Care-Matching & Clinical Navigation API",
    description="Zero-PII, 42 CFR Part 2-compliant substance use disorder intake, ASAM triage, and FHIR interoperability service.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration restricted to authorized frontend origins
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,https://harborpath-platform.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # Zero cookies / zero persistent credentials
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-Session-ID"],
)

# In-memory token bucket rate limiter (60 requests/minute, refill 1/sec)
_rate_limiter = TokenBucketRateLimiter(capacity=60, refill_rate_per_sec=1.0)


@app.middleware("http")
async def security_and_privacy_headers_middleware(request: Request, call_next):
    """
    Enforces HIPAA & 42 CFR Part 2 defense-in-depth HTTP headers on every API response.
    Never caches PHI/intake state; prevents framing, sniffing, and referrer leaks.
    """
    # Rate limit check by client IP
    client_ip = request.client.host if request.client else "unknown"
    if not _rate_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"error": "Rate limit exceeded. Protecting facility data against scraping."},
            headers={"Retry-After": "60"}
        )

    response: Response = await call_next(request)

    # Invariants: Zero caching of clinical responses
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["Content-Security-Policy"] = "default-src 'self'"

    # 42 CFR Part 2 explicit disclaimer header
    response.headers["X-Confidentiality-Rule"] = "42 CFR Part 2 - Federal Law Strictly Prohibits Redisclosure"

    return response


# Include API v1 routers
app.include_router(intake_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": "harborpath-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/v1/meta", tags=["System"])
async def metadata():
    """Service metadata and clinical compliance attestations."""
    return {
        "service": "HarborPath Clinical Triage & Care-Matching Engine",
        "version": "2.0.0",
        "clinical_guidelines": "ASAM Criteria 4th Edition / DSM-5-TR",
        "confidentiality_standard": "42 CFR Part 2 (§ 2.31, § 2.32) & HIPAA 45 CFR § 164.522",
        "interoperability": "HL7 FHIR R4 / US Core v6.0.0",
        "zero_pii_posture": "Client-side pseudonym tokenization; zero persistent patient identifiers."
    }


@app.get("/api/v1/directory/summary", tags=["Directory"])
async def directory_summary():
    """Aggregated verified directory and syndication metrics."""
    return {
        "service": "HarborPath Clinical Triage & Care-Matching Engine",
        "version": "2.0.0",
        "coverage": {
            "jurisdictions_covered": 59,
            "federally_qualified_health_centers": 13255,
            "emergency_departments": 4457,
            "rural_health_clinics": 5626,
            "veterans_facilities": 1784,
            "indian_health_facilities": 1086,
        },
        "privacy": {
            "zero_pii_posture": "Client-side pseudonym tokenization; zero persistent patient identifiers.",
            "confidentiality_standard": "42 CFR Part 2 & HIPAA 45 CFR § 164.522",
            "syndication": "Sandboxed embeddable iframe widgets & SVG partner seals enabled."
        },
        "capabilities": {
            "interoperability": "HL7 FHIR R4 US Core ServiceRequest, 42 CFR Part 2 Consent syndication & offline verifiable MOUD rights directives",
            "field_medicine": "ACS Stop the Bleed hemorrhage control, NHCHC/CDC encampment medicine, SALT mass overdose spike response, and NSTI/LRINEC wound staging",
            "toxicology": "AACT/EAPCCT toxic alcohol osmolal/anion gap calculator and AAP/ACMT pediatric One Pill Can Kill decontamination engine",
            "reentry": "DOJ Title II ADA carceral MOUD continuity, Section 1115 Medicaid enrollment, and 30-day bridge overdose prevention",
            "disaster_resilience": "SAMHSA 42 CFR Part 8 disaster MOUD flexibilities (28-day take-homes), PM2.5 wildfire harm reduction, and post-flood triage",
            "movement_disorders": "Stimulant choreoathetosis (meth dance), acute dystonia, NMS, Hunter serotonin criteria & haloperidol prohibition",
            "opportunistic_infections": "Deep endemic mycoses (Blastomycosis, Valley Fever, Histoplasmosis, Mucorales) and lethal Azole-Methadone CYP3A4/QTc management",
            "inhalant_toxicology": "ACMT consensus for Nitrous Oxide (Galaxy Gas) SCD and folate trap prohibition, volatile hydrocarbon SSDS epinephrine prohibition, and toluene Type 1 distal RTA",
            "adulterant_heavy_metals": "Clinical triage for Medetomidine refractory bradycardia (atipamezole prohibition), Brodifacoum superwarfarin coagulopathy (4F-PCC), and street drug Lead plumbism chelation sequencing",
            "peri_overdose_pulmonary": "Post-Naloxone NCPE (PEEP recruitment vs loop diuretic prohibition), Mendelson chemical pneumonitis (48h antibiotic delay), and Crack Lung DAH (corticosteroids vs beta-blocker prohibition)",
            "cardiogenic_toxin_hiet": "ACMT/EAPCCT consensus for CCB and BB severe toxicity, weight-based HIET dosing (1 U/kg bolus, 1-10 U/kg/hr infusion), D10W/D50W titration, and permissive hypokalemia rules",
            "wooden_chest_rigidity": "ASA/ACEP consensus for fentanyl-induced muscle rigidity (FIMR), failed BVM rescue, rocuronium/vecuronium RSI, and succinylcholine hyperkalemic arrest prohibition",
            "hyperthermic_toxidrome": "ACMT and WMS consensus for synthetic cathinone / methamphetamine severe hyperthermia (>40°C), rapid ice-water immersion, parenteral sedation, and antipyretic futility",
            "syndication": "Zero-cookie iframe widgets & partner seals"
        }
    }
