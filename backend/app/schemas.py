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