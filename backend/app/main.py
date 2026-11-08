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
