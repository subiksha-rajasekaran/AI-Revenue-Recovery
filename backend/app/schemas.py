from pydantic import BaseModel
from typing import List, Literal, Optional

RiskTier = Literal['LOW', 'MEDIUM', 'HIGH']
ActionOutcome = Literal['PENDING', 'APPROVED', 'SUCCESS', 'STOPPED_DISPUTE', 'ESCALATED']
PolicyMode = Literal['AUTOPILOT', 'REVIEW_FIRST']

class TriggerScenarioRequest(BaseModel):
    scenario_key: str
    policy_mode: PolicyMode = 'AUTOPILOT'

class AgentThought(BaseModel):
    id: str
    stepName: Literal['RISK_SCORING', 'GUARDRAIL_CHECK', 'STRATEGY_SELECTION', 'OUTREACH_DISPATCH']
    agentName: str
    message: str
    guardrailPassed: bool
    timestamp: str

class RecoveryCase(BaseModel):
    id: str
    customerName: str
    companyName: str
    amountDue: float
    failureReason: str
    riskTier: RiskTier
    language: Literal['EN', 'HINGLISH']
    status: ActionOutcome
    recommendedAction: str
    agentReasoning: str
    createdAt: str

class TriggerScenarioResponse(BaseModel):
    success: bool
    scenario_key: str
    recovered_amount: float
    new_case: RecoveryCase
    thoughts: List[AgentThought]

class BatchTestResponse(BaseModel):
    total_invoices: int
    total_at_risk_usd: float
    recovered_usd: float
    recovery_rate_pct: float
    escalated_to_human: int
    processing_time_ms: float

class DashboardMetricsResponse(BaseModel):
    totalAtRiskUsd: float
    recoveredUsd: float
    recoveryRatePct: float
    activeWorkflows: int
    escalatedToHuman: int