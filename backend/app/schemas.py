from pydantic import BaseModel
from typing import List, Literal, Optional,Dict

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

class ExecutionStep(BaseModel):
    step_number: int
    name: str
    status: Literal["passed", "flagged", "executed", "halted"]
    timestamp: str
    details: str

class ActivityLogEntry(BaseModel):
    id: str
    timestamp: str
    event_type: str
    customer_id: str
    amount_usd: float
    status: str
    action_taken: str

class TriggerScenarioResponse(BaseModel):
    success: bool
    scenario_id: str
    customer_id: str
    amount_usd: float
    risk_score: float
    action_taken: str
    compliance_flag: bool
    execution_steps: List[ExecutionStep]
    message: str

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
class DispatchOutreachRequest(BaseModel):
    case_id: str
    channel: Literal['RETELL_VOICE', 'TWILIO_SMS', 'WHATSAPP']
    customer_name: str
    phone_number: str = "+919876543210"
    amount_due: float
    language: Literal['EN', 'HINGLISH'] = 'EN'

class DispatchOutreachResponse(BaseModel):
    success: bool
    dispatch_id: str
    channel: str
    status: str
    rendered_payload: dict
    timestamp: str
class PreEmptiveScanResult(BaseModel):
    scanned_subscriptions: int
    expiring_cards_found: int
    pre_emptive_nudges_sent: int
    protected_arr_usd: float
    timestamp: str

class PreEmptiveScanResponse(BaseModel):
    success: bool
    scan_result: PreEmptiveScanResult
class RazorpayPaymentEntity(BaseModel):
    id: str
    amount: float
    currency: str = "INR"
    status: str
    method: str
    error_code: Optional[str] = None
    error_description: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None

class RazorpayWebhookPayload(BaseModel):
    event: Literal['payment.failed', 'invoice.paid', 'subscription.halted']
    account_id: str
    contains: List[str]
    payload: dict

class WebhookResponse(BaseModel):
    success: bool
    verified: bool
    event_type: str
    message: str
class ComponentHealth(BaseModel):
    status: str  # "operational" | "degraded" | "offline"
    latency_ms: float
    details: Optional[str] = None

class SystemHealthResponse(BaseModel):
    overall_status: str  # "healthy" | "degraded" | "critical"
    api_status: ComponentHealth
    database_status: ComponentHealth
    redis_status: ComponentHealth
    ai_agent_status: ComponentHealth
    pydantic_validation_status: ComponentHealth
    timestamp: str

class StrategyBreakdown(BaseModel):
    strategy_name: str
    amount_recovered: float
    success_rate: float

class FunnelStage(BaseModel):
    stage_name: str
    count: int
    conversion_percentage: float

class DetailedAnalyticsResponse(BaseModel):
    total_failed_arr: float
    total_recovered_arr: float
    net_roi_improvement_percentage: float
    strategy_breakdown: List[StrategyBreakdown]
    conversion_funnel: List[FunnelStage]
class StrategyEvaluation(BaseModel):
    strategy_name: str
    status: Literal["selected", "rejected", "blocked_by_guardrail"]
    reason: str
    estimated_recovery_probability: float

class AiExplainabilityResponse(BaseModel):
    scenario_id: str
    risk_score: float
    ai_confidence_percentage: float
    compliance_guardrail_applied: Optional[str]
    is_halted: bool
    selected_strategy: str
    decision_reasoning: str
    evaluations: List[StrategyEvaluation]

class ChannelMessagePayload(BaseModel):
    channel: Literal["voice_retell", "whatsapp", "sms_twilio"]
    title: str
    recipient: str
    content_payload: str
    action_url: Optional[str] = None
    fallback_channel: Optional[str] = None

class ChannelPreviewResponse(BaseModel):
    customer_id: str
    amount_usd: float
    channels: List[ChannelMessagePayload]
class PreEmptiveAccountRecord(BaseModel):
    customer_id: str
    card_last4: str
    card_brand: str
    amount_usd: float
    hours_until_expiration: int
    proactive_outreach_status: Literal["scheduled", "dispatched", "updated"]

class PreEmptivePreviewResponse(BaseModel):
    total_scanned: int
    expiring_48h_count: int
    protected_arr_at_risk: float
    accounts: List[PreEmptiveAccountRecord]
class WebhookLogRecord(BaseModel):
    event_id: str
    event_type: str
    account_id: str
    signature_verified: bool
    signature_hash: str
    received_at: str
    amount_usd: float

class WebhookInspectorResponse(BaseModel):
    total_webhooks_ingested: int
    failed_signatures_blocked: int
    recent_logs: List[WebhookLogRecord]