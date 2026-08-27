from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

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