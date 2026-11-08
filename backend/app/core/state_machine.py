"""
HarborPath Interactive Triage State Machine.
Enforces deterministic, trauma-informed state progression with crisis interception
and automatic session purge hooks.
"""

from __future__ import annotations

from typing import Set, Dict, Optional, List
from datetime import datetime, timezone
from backend.app.models.intake import IntakeState
from backend.app.core.security import compute_audit_hash, digest_payload


class InvalidStateTransitionError(ValueError):
    """Raised when an illegal state progression is attempted."""
    pass


# Deterministic state transition graph
ALLOWED_TRANSITIONS: Dict[IntakeState, Set[IntakeState]] = {
    IntakeState.ARRIVED: {
        IntakeState.ANONYMOUS_DISCOVERY,
        IntakeState.CRISIS_SCREENING,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.ANONYMOUS_DISCOVERY: {
        IntakeState.CRISIS_SCREENING,
        IntakeState.CONSENT_PENDING,
        IntakeState.CLINICAL_TRIAGE_ACTIVE,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.CRISIS_SCREENING: {
        IntakeState.CRISIS_ESCALATED,
        IntakeState.CONSENT_PENDING,
        IntakeState.CLINICAL_TRIAGE_ACTIVE,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.CRISIS_ESCALATED: {
        IntakeState.CLINICAL_TRIAGE_ACTIVE,  # If stabilized / cleared by crisis responder
        IntakeState.SESSION_PURGED,          # Standard safe bailout post-988 handoff
    },
    IntakeState.CONSENT_PENDING: {
        IntakeState.CLINICAL_TRIAGE_ACTIVE,
        IntakeState.ASAM_EVALUATED,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.CLINICAL_TRIAGE_ACTIVE: {
        IntakeState.CRISIS_SCREENING,
        IntakeState.CRISIS_ESCALATED,
        IntakeState.ASAM_EVALUATED,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.ASAM_EVALUATED: {
        IntakeState.FACILITY_MATCHING,
        IntakeState.CLINICAL_TRIAGE_ACTIVE,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.FACILITY_MATCHING: {
        IntakeState.REFERRAL_STAGED,
        IntakeState.ASAM_EVALUATED,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.REFERRAL_STAGED: {
        IntakeState.REFERRAL_TRANSMITTED,
        IntakeState.FACILITY_MATCHING,
        IntakeState.SESSION_PURGED,
    },
    IntakeState.REFERRAL_TRANSMITTED: {
        IntakeState.SESSION_PURGED,
    },
    IntakeState.SESSION_PURGED: set(),  # Terminal state
}


class StateTransitionRecord:
    """Immutable audit entry for a state transition."""

    def __init__(
        self,
        from_state: IntakeState,
        to_state: IntakeState,
        timestamp: datetime,
        prev_hash: str,
        actor_token: str,
        reason: Optional[str] = None
    ):
        self.from_state = from_state
        self.to_state = to_state
        self.timestamp = timestamp
        self.prev_hash = prev_hash
        self.actor_token = actor_token
        self.reason = reason or "USER_NAVIGATE"
        self.audit_hash = compute_audit_hash(
            prev_hash=prev_hash,
            timestamp_iso=timestamp.isoformat(),
            action=f"STATE_TRANSITION:{from_state.value}->{to_state.value}",
            actor_token=actor_token,
            payload_digest=digest_payload(self.reason)
        )


class IntakeStateMachine:
    """Manages the lifecycle of an individual intake session."""

    def __init__(self, session_id: str, pseudonym_token: str, initial_state: IntakeState = IntakeState.ARRIVED):
        self.session_id = session_id
        self.pseudonym_token = pseudonym_token
        self.current_state = initial_state
        self.history: List[StateTransitionRecord] = []
        self._latest_hash = "0" * 64

    def can_transition_to(self, target_state: IntakeState) -> bool:
        """Returns True if transition from current state to target state is permissible."""
        allowed = ALLOWED_TRANSITIONS.get(self.current_state, set())
        return target_state in allowed

    def transition_to(self, target_state: IntakeState, reason: Optional[str] = None) -> StateTransitionRecord:
        """
        Executes and records a validated state transition.
        Raises InvalidStateTransitionError if transition violates the state graph.
        """
        if not self.can_transition_to(target_state):
            raise InvalidStateTransitionError(
                f"Illegal transition from state '{self.current_state.value}' to '{target_state.value}'."
            )

        now = datetime.now(timezone.utc)
        record = StateTransitionRecord(
            from_state=self.current_state,
            to_state=target_state,
            timestamp=now,
            prev_hash=self._latest_hash,
            actor_token=self.pseudonym_token,
            reason=reason
        )
        self.current_state = target_state
        self._latest_hash = record.audit_hash
        self.history.append(record)
        return record

    def trigger_quick_exit(self) -> StateTransitionRecord:
        """Immediate failsafe transition to SESSION_PURGED."""
        return self.transition_to(IntakeState.SESSION_PURGED, reason="QUICK_EXIT_TRIGGERED")
