import time
import random
from datetime import datetime
from app.schemas import (
    TriggerScenarioRequest,
    TriggerScenarioResponse,
    RecoveryCase,
    AgentThought,
    BatchTestResponse,
    DashboardMetricsResponse
)

# Global Mock Telemetry State
STATE = {
    "total_at_risk_usd": 142500.0,
    "recovered_usd": 98400.0,
    "recovery_rate_pct": 69.05,
    "active_workflows": 4,
    "escalated_to_human": 1
}

def process_scenario(req: TriggerScenarioRequest) -> TriggerScenarioResponse:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_short = datetime.now().strftime("%H:%M:%S")
    event_id = f"rec_{int(time.time() * 1000)}"

    if req.scenario_key == "EXPIRED_CARD_HIGH_VALUE":
        amount = 3200.0
        status = "PENDING" if req.policy_mode == "REVIEW_FIRST" else "SUCCESS"
        
        new_case = RecoveryCase(
            id=event_id,
            customerName="Sarah Jenkins",
            companyName="CloudScale Inc",
            amountDue=amount,
            failureReason="EXPIRED_CARD",
            riskTier="HIGH",
            language="EN",
            status=status,
            recommendedAction="Retell AI Voice Outreach (Card Update)",
            agentReasoning="High LTV ($45,000). Executed voice negotiation with zero fee mandate update.",
            createdAt="Just now"
        )
        
        thoughts = [
            AgentThought(
                id=f"th_{time.time()}_1",
                stepName="RISK_SCORING",
                agentName="RiskScorerAgent",
                message="Account CloudScale Inc classified as HIGH LTV ($45,000). Risk score: 0.88.",
                guardrailPassed=True,
                timestamp=now_str
            ),
            AgentThought(
                id=f"th_{time.time()}_2",
                stepName="GUARDRAIL_CHECK",
                agentName="ComplianceGuardNode",
                message="Policy verified: Attempt count (1/3). Max 10% discount cap respected.",
                guardrailPassed=True,
                timestamp=now_str
            ),
            AgentThought(
                id=f"th_{time.time()}_3",
                stepName="STRATEGY_SELECTION",
                agentName="StrategyRouterNode",
                message="Selected Retell AI Voice Call + Instant Mandate Link over generic email.",
                guardrailPassed=True,
                timestamp=now_str
            )
        ]
        
        if status == "SUCCESS":
            STATE["recovered_usd"] += amount
            STATE["total_at_risk_usd"] = max(0.0, STATE["total_at_risk_usd"] - amount)

        return TriggerScenarioResponse(
            success=True,
            scenario_key=req.scenario_key,
            recovered_amount=amount if status == "SUCCESS" else 0.0,
            new_case=new_case,
            thoughts=thoughts
        )

    elif req.scenario_key == "ACTIVE_DISPUTE_STOP":
        amount = 1800.0
        new_case = RecoveryCase(
            id=event_id,
            customerName="Marcus Vance",
            companyName="Vance Tech Solutions",
            amountDue=amount,
            failureReason="INVOICE_DISPUTE",
            riskTier="MEDIUM",
            language="EN",
            status="STOPPED_DISPUTE",
            recommendedAction="Freeze Automated Dunning & Alert Account Exec",
            agentReasoning="Hard Stopping Rule Met: Active open support ticket #9421 flags line item dispute.",
            createdAt="Just now"
        )
        
        thoughts = [
            AgentThought(
                id=f"th_{time.time()}_1",
                stepName="GUARDRAIL_CHECK",
                agentName="ComplianceGuardNode",
                message="HARD STOP TRIGGERED: Customer open dispute flag detected. Aborting automated dunning.",
                guardrailPassed=False,
                timestamp=now_str
            )
        ]
        
        STATE["escalated_to_human"] += 1
        return TriggerScenarioResponse(
            success=True,
            scenario_key=req.scenario_key,
            recovered_amount=0.0,
            new_case=new_case,
            thoughts=thoughts
        )

    # Fallback default scenario response
    amount = 1500.0
    new_case = RecoveryCase(
        id=event_id,
        customerName="Demo User",
        companyName="Enterprise Corp",
        amountDue=amount,
        failureReason="INSUFFICIENT_FUNDS",
        riskTier="LOW",
        language="HINGLISH" if req.scenario_key == "HINGLISH_VOICE_CALL" else "EN",
        status="SUCCESS",
        recommendedAction="Smart Card Retry (+24h clearing window)",
        agentReasoning="Temporary liquidity gap detected. Scheduled retry during bank batch window.",
        createdAt="Just now"
    )
    
    thoughts = [
        AgentThought(
            id=f"th_{time.time()}_1",
            stepName="STRATEGY_SELECTION",
            agentName="StrategyRouterNode",
            message=f"Executing strategy for {req.scenario_key}.",
            guardrailPassed=True,
            timestamp=now_str
        )
    ]
    
    STATE["recovered_usd"] += amount
    return TriggerScenarioResponse(
        success=True,
        scenario_key=req.scenario_key,
        recovered_amount=amount,
        new_case=new_case,
        thoughts=thoughts
    )


def run_batch_simulation() -> BatchTestResponse:
    start_time = time.time()
    total_invoices = 50
    batch_volume = 50000.0
    recovered = 34200.0
    escalated = 6

    STATE["total_at_risk_usd"] += batch_volume
    STATE["recovered_usd"] += recovered
    STATE["active_workflows"] += total_invoices
    STATE["escalated_to_human"] += escalated
    
    # Recalculate rate
    if STATE["total_at_risk_usd"] > 0:
        STATE["recovery_rate_pct"] = round((STATE["recovered_usd"] / (STATE["recovered_usd"] + STATE["total_at_risk_usd"])) * 100, 2)

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return BatchTestResponse(
        total_invoices=total_invoices,
        total_at_risk_usd=batch_volume,
        recovered_usd=recovered,
        recovery_rate_pct=STATE["recovery_rate_pct"],
        escalated_to_human=escalated,
        processing_time_ms=elapsed_ms
    )


def get_current_metrics() -> DashboardMetricsResponse:
    return DashboardMetricsResponse(
        totalAtRiskUsd=STATE["total_at_risk_usd"],
        recoveredUsd=STATE["recovered_usd"],
        recoveryRatePct=STATE["recovery_rate_pct"],
        activeWorkflows=STATE["active_workflows"],
        escalatedToHuman=STATE["escalated_to_human"]
    )