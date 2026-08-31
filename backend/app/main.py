import time
from datetime import datetime
import json
from typing import List, Optional, Dict
from fastapi import FastAPI, Response,Request, Header, HTTPException
from app.schemas import SystemHealthResponse, ComponentHealth
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ActivityLogEntry
from app.simulator import EVENT_STREAM_BUFFER
from app.schemas import DetailedAnalyticsResponse, StrategyBreakdown, FunnelStage
from app.schemas import AiExplainabilityResponse, StrategyEvaluation
from app.schemas import ChannelPreviewResponse, ChannelMessagePayload
from app.schemas import PreEmptivePreviewResponse, PreEmptiveAccountRecord
from app.schemas import WebhookInspectorResponse, WebhookLogRecord
from app.schemas import (
    TriggerScenarioRequest,
    TriggerScenarioResponse,
    BatchTestResponse,
    DashboardMetricsResponse,
    DispatchOutreachRequest,
    DispatchOutreachResponse,
    PreEmptiveScanResponse,
    RazorpayWebhookPayload,
    WebhookResponse
)
from app.simulator import process_scenario, run_batch_simulation, get_current_metrics
from app.outreach import dispatch_outreach
from app.scanner import execute_preemptive_card_scan
from app.webhooks import process_razorpay_webhook

app = FastAPI(
    title="RecovAI Engine API",
    version="1.0.0",
    description="Fast Mock API Engine for Revenue Recovery Buildathon"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"system": "RecovAI Engine API", "status": "active"}

@app.get("/api/v1/analytics/dashboard-metrics", response_model=DashboardMetricsResponse)
def fetch_dashboard_metrics():
    return get_current_metrics()

@app.post("/api/v1/simulate/trigger-event", response_model=TriggerScenarioResponse)
def trigger_event(request: TriggerScenarioRequest):
    return process_scenario(request)

@app.post("/api/v1/simulate/batch-test", response_model=BatchTestResponse)
def batch_test():
    return run_batch_simulation()

@app.post("/api/v1/outreach/dispatch", response_model=DispatchOutreachResponse)
def dispatch_outreach_channel(request: DispatchOutreachRequest):
    return dispatch_outreach(request)

@app.post("/api/v1/cron/scan-preemptive", response_model=PreEmptiveScanResponse)
def run_preemptive_scan():
    return execute_preemptive_card_scan()

@app.get("/api/v1/analytics/event-stream", response_model=List[ActivityLogEntry])
def get_event_stream():
    return EVENT_STREAM_BUFFER

@app.get("/api/v1/analytics/detailed-metrics", response_model=DetailedAnalyticsResponse)
def get_detailed_analytics():
    return DetailedAnalyticsResponse(
        total_failed_arr=142000.00,
        total_recovered_arr=128450.00,
        net_roi_improvement_percentage=118.4,
        strategy_breakdown=[
            StrategyBreakdown(strategy_name="Retell AI Voice Campaign", amount_recovered=64200.00, success_rate=78.5),
            StrategyBreakdown(strategy_name="1-Click WhatsApp / SMS", amount_recovered=42150.00, success_rate=65.2),
            StrategyBreakdown(strategy_name="Pre-Emptive 48-Hr Card Scan", amount_recovered=22100.00, success_rate=91.0)
        ],
        conversion_funnel=[
            FunnelStage(stage_name="Payments Failed", count=102, conversion_percentage=100.0),
            FunnelStage(stage_name="Risk & Policy Evaluated", count=102, conversion_percentage=100.0),
            FunnelStage(stage_name="Strategy Dispatched", count=100, conversion_percentage=98.0),
            FunnelStage(stage_name="Customer Engaged", count=92, conversion_percentage=90.1),
            FunnelStage(stage_name="Payment Successfully Recovered", count=86, conversion_percentage=84.3)
        ]
    )
@app.get("/api/v1/agent/explainability", response_model=AiExplainabilityResponse)
def get_agent_explainability(scenario_id: str = "dispute"):
    scenario = scenario_id.lower()
    
    if scenario == "dispute":
        return AiExplainabilityResponse(
            scenario_id="dispute",
            risk_score=0.95,
            ai_confidence_percentage=98.5,
            compliance_guardrail_applied="RULE R-102: Active Billing Dispute Lock",
            is_halted=True,
            selected_strategy="Human CSM Escalation (Outreach Halted)",
            decision_reasoning="Active invoice dispute detected in database. Per financial compliance Rule R-102, automated dunning is frozen to prevent chargeback escalation.",
            evaluations=[
                StrategyEvaluation(strategy_name="Retell AI Voice Call", status="blocked_by_guardrail", reason="Blocked by Rule R-102 (Active Dispute)", estimated_recovery_probability=0.0),
                StrategyEvaluation(strategy_name="WhatsApp / SMS Link", status="blocked_by_guardrail", reason="Blocked by Rule R-102 (Active Dispute)", estimated_recovery_probability=0.0),
                StrategyEvaluation(strategy_name="Human CSM Ticket", status="selected", reason="Selected as safe fallback for manual dispute resolution", estimated_recovery_probability=85.0)
            ]
        )
    else:
        return AiExplainabilityResponse(
            scenario_id=scenario_id,
            risk_score=0.35,
            ai_confidence_percentage=94.2,
            compliance_guardrail_applied=None,
            is_halted=False,
            selected_strategy="Retell AI Voice Campaign (Hinglish)",
            decision_reasoning="Medium churn risk detected with soft bank decline. Voice outreach selected based on historical 78.5% recovery rate for high-ARR accounts.",
            evaluations=[
                StrategyEvaluation(strategy_name="Retell AI Voice Call", status="selected", reason="Highest recovery yield for ARR > $1,000", estimated_recovery_probability=88.0),
                StrategyEvaluation(strategy_name="SMS Dunning Link", status="rejected", reason="Lower engagement rate for enterprise accounts", estimated_recovery_probability=42.0),
                StrategyEvaluation(strategy_name="Immediate Account Lock", status="rejected", reason="Overly punitive for first-time soft decline", estimated_recovery_probability=10.0)
            ]
        )
@app.get("/api/v1/scanner/preview", response_model=PreEmptivePreviewResponse)
def get_scanner_preview():
    return PreEmptivePreviewResponse(
        total_scanned=1420,
        expiring_48h_count=3,
        protected_arr_at_risk=22100.00,
        accounts=[
            PreEmptiveAccountRecord(
                customer_id="cust_enterprise_001",
                card_last4="4242",
                card_brand="Visa",
                amount_usd=12500.00,
                hours_until_expiration=14,
                proactive_outreach_status="dispatched"
            ),
            PreEmptiveAccountRecord(
                customer_id="cust_saas_992",
                card_last4="8812",
                card_brand="Mastercard",
                amount_usd=5400.00,
                hours_until_expiration=28,
                proactive_outreach_status="dispatched"
            ),
            PreEmptiveAccountRecord(
                customer_id="cust_scale_304",
                card_last4="1092",
                card_brand="Amex",
                amount_usd=4200.00,
                hours_until_expiration=41,
                proactive_outreach_status="scheduled"
            )
        ]
    )
@app.get("/api/v1/outreach/channel-previews", response_model=ChannelPreviewResponse)
def get_channel_previews(customer_id: str = "cust_corp_882", amount_usd: float = 1200.00):
    return ChannelPreviewResponse(
        customer_id=customer_id,
        amount_usd=amount_usd,
        channels=[
            ChannelMessagePayload(
                channel="voice_retell",
                title="Retell AI Voice Agent (Localized Hinglish)",
                recipient="+91 98765 43210",
                content_payload="Namaste Subiksha! Main RecovAI Assistant bol raha hu. Aapka $1,200 ka subscription payment complete nahi ho paya. Maine aapke registered WhatsApp par 1-click secure payment link bhej diya hai. Kya main abhi payment complete karne mein help karu?",
                action_url="https://pay.recovai.io/quick-update/tok_991823",
                fallback_channel="WhatsApp Business API"
            ),
            ChannelMessagePayload(
                channel="whatsapp",
                title="WhatsApp Interactive Card (1-Click Update)",
                recipient="+91 98765 43210",
                content_payload="Action Required: Your subscription renewal of $1,200 failed due to card expiration. Tap below to update payment details securely in 30 seconds.",
                action_url="https://pay.recovai.io/quick-update/tok_991823",
                fallback_channel="Twilio SMS"
            ),
            ChannelMessagePayload(
                channel="sms_twilio",
                title="Twilio SMS Dunning Fallback",
                recipient="+91 98765 43210",
                content_payload="RecovAI Notice: Payment of $1,200 failed. Avoid service interruption by updating your card details here: https://pay.recovai.io/quick-update/tok_991823",
                action_url="https://pay.recovai.io/quick-update/tok_991823",
                fallback_channel="Human Support Ticket"
            )
        ]
    )

@app.get("/api/v1/webhooks/recent", response_model=WebhookInspectorResponse)
def get_recent_webhooks():
    return WebhookInspectorResponse(
        total_webhooks_ingested=142,
        failed_signatures_blocked=3,
        recent_logs=[
            WebhookLogRecord(
                event_id="evt_rzp_pay_failed_882",
                event_type="payment.failed",
                account_id="acc_razorpay_saas_01",
                signature_verified=True,
                signature_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                received_at=datetime.utcnow().strftime("%H:%M:%S UTC"),
                amount_usd=1200.00
            ),
            WebhookLogRecord(
                event_id="evt_rzp_pay_failed_883",
                event_type="payment.failed",
                account_id="acc_razorpay_saas_01",
                signature_verified=True,
                signature_hash="4a3500021c33b000ef85d038f8888b1f5a5a1f0a1c1d1e1f1a1b1c1d1e1f1a1b",
                received_at=datetime.utcnow().strftime("%H:%M:%S UTC"),
                amount_usd=450.00
            )
        ]
    )
@app.post("/api/v1/webhooks/razorpay", response_model=WebhookResponse)
async def razorpay_webhook(
    payload: RazorpayWebhookPayload,
    x_razorpay_signature: str = Header(default="demo_signature")
):
    raw_body = json.dumps(payload.model_dump()).encode('utf-8')
    success, response = process_razorpay_webhook(raw_body, x_razorpay_signature)
    if not success:
        raise HTTPException(status_code=400, detail=response.message)
    return response

@app.get("/api/v1/health/system", response_model=SystemHealthResponse)
async def check_system_health():
    start_time = time.time()
    
    # 1. API Health Check
    api_latency = round((time.time() - start_time) * 1000, 2)
    api_health = ComponentHealth(status="operational", latency_ms=max(api_latency, 1.2))

    # 2. Database Health Check (Simulated fast ping over connection pool)
    db_start = time.time()
    db_latency = round((time.time() - db_start) * 1000 + 3.4, 2)
    db_health = ComponentHealth(status="operational", latency_ms=db_latency, details="PostgreSQL Pool: 12/20 Active")

    # 3. Redis Health Check
    redis_start = time.time()
    # In full Redis mode: await redis.ping()
    redis_latency = round((time.time() - redis_start) * 1000 + 1.1, 2)
    redis_health = ComponentHealth(status="operational", latency_ms=redis_latency, details="Cache Hit Rate: 98.4%")

    # 4. LangGraph Agent Runtime Check
    agent_start = time.time()
    agent_latency = round((time.time() - agent_start) * 1000 + 8.5, 2)
    agent_health = ComponentHealth(status="operational", latency_ms=agent_latency, details="LangGraph Core Active")

    # 5. Schema Validation Status
    validation_health = ComponentHealth(status="operational", latency_ms=0.4, details="Pydantic V2 Enforcement Active")

    return SystemHealthResponse(
        overall_status="healthy",
        api_status=api_health,
        database_status=db_health,
        redis_status=redis_health,
        ai_agent_status=agent_health,
        pydantic_validation_status=validation_health,
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    )
