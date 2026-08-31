import time
from datetime import datetime
from typing import List, Dict, Any
from app.schemas import (
    TriggerScenarioRequest,
    TriggerScenarioResponse,
    BatchTestResponse,
    DashboardMetricsResponse,
    ExecutionStep,
    ActivityLogEntry
)

# Global State Engine
STATE = {
    "total_protected_arr": 128450.00,
    "active_workflows": 14,
    "human_escalations": 2,
    "recovered_count": 86,
    "total_failed_count": 102,
}

# In-Memory Event Stream Ring Buffer (Last 20 events)
EVENT_STREAM_BUFFER: List[ActivityLogEntry] = [
    ActivityLogEntry(
        id="evt_001",
        timestamp=datetime.utcnow().strftime("%H:%M:%S"),
        event_type="payment_failed",
        customer_id="cust_corp_882",
        amount_usd=1200.00,
        status="Recovered",
        action_taken="Retell AI Voice Campaign Dispatched"
    ),
    ActivityLogEntry(
        id="evt_002",
        timestamp=datetime.utcnow().strftime("%H:%M:%S"),
        event_type="payment_failed",
        customer_id="cust_retail_104",
        amount_usd=450.00,
        status="Escalated",
        action_taken="Halted: Active Billing Dispute Detected"
    )
]

def get_current_metrics() -> DashboardMetricsResponse:
    recovery_rate = round((STATE["recovered_count"] / max(STATE["total_failed_count"], 1)) * 100, 1)
    return DashboardMetricsResponse(
        total_protected_arr=STATE["total_protected_arr"],
        active_workflows=STATE["active_workflows"],
        human_escalations=STATE["human_escalations"],
        recovery_rate_percentage=recovery_rate
    )

def process_scenario(request: TriggerScenarioRequest) -> TriggerScenarioResponse:
    now_str = datetime.utcnow().strftime("%H:%M:%S")
    scenario = request.scenario_id.lower()
    
    # Generate Step-by-Step Execution Breadcrumbs
    steps: List[ExecutionStep] = [
        ExecutionStep(
            step_number=1,
            name="Request Ingestion",
            status="passed",
            timestamp=now_str,
            details=f"Received failure event for scenario [{request.scenario_id}]"
        ),
        ExecutionStep(
            step_number=2,
            name="Edge Pydantic Validation",
            status="passed",
            timestamp=now_str,
            details="Payload structure and data types verified"
        )
    ]
    
    if scenario == "dispute":
        risk_score = 0.95
        action = "Halted: Active Billing Dispute Detected -> Escalated to Human Support"
        compliance_flag = True
        
        steps.extend([
            ExecutionStep(
                step_number=3,
                name="Risk & Guardrail Evaluation",
                status="flagged",
                timestamp=now_str,
                details="High Risk (0.95) - Active billing dispute lock detected"
            ),
            ExecutionStep(
                step_number=4,
                name="Policy Enforcement",
                status="halted",
                timestamp=now_str,
                details="Hard-stop triggered: Automated outreach frozen per compliance rule R-102"
            ),
            ExecutionStep(
                step_number=5,
                name="Human Escalation",
                status="executed",
                timestamp=now_str,
                details="Ticket created in Zendesk/Salesforce queue for CSM intervention"
            )
        ])
        STATE["human_escalations"] += 1
        STATE["active_workflows"] += 1
        
    elif scenario == "card_expired":
        risk_score = 0.30
        action = "Dispatched 1-Click Update SMS & WhatsApp via Pre-Emptive Scanner"
        compliance_flag = False
        
        steps.extend([
            ExecutionStep(
                step_number=3,
                name="Risk & Guardrail Evaluation",
                status="passed",
                timestamp=now_str,
                details="Low Risk (0.30) - Card expired, customer churn probability low"
            ),
            ExecutionStep(
                step_number=4,
                name="Strategy Selection",
                status="passed",
                timestamp=now_str,
                details="Selected Multi-Channel Self-Serve Link (SMS + WhatsApp)"
            ),
            ExecutionStep(
                step_number=5,
                name="Outreach Dispatch",
                status="executed",
                timestamp=now_str,
                details="Sent personalized self-serve portal link"
            )
        ])
        STATE["total_protected_arr"] += request.amount_usd
        STATE["recovered_count"] += 1
        STATE["total_failed_count"] += 1
        
    else:  # General / Insufficient Funds
        risk_score = 0.65
        action = "Dispatched Retell AI Voice Campaign (Localized Hinglish Prompt)"
        compliance_flag = False
        
        steps.extend([
            ExecutionStep(
                step_number=3,
                name="Risk & Guardrail Evaluation",
                status="passed",
                timestamp=now_str,
                details="Medium Risk (0.65) - Soft decline / Insufficient funds"
            ),
            ExecutionStep(
                step_number=4,
                name="Strategy Selection",
                status="passed",
                timestamp=now_str,
                details="Selected High-Touch Voice Outreach Strategy"
            ),
            ExecutionStep(
                step_number=5,
                name="Voice Agent Execution",
                status="executed",
                timestamp=now_str,
                details="Initiated outbound call via Retell AI engine"
            )
        ])
        STATE["total_protected_arr"] += request.amount_usd
        STATE["recovered_count"] += 1
        STATE["total_failed_count"] += 1

    # Record into Live Event Stream Buffer
    log_entry = ActivityLogEntry(
        id=f"evt_{int(time.time())}",
        timestamp=now_str,
        event_type=f"scenario_{scenario}",
        customer_id=request.customer_id,
        amount_usd=request.amount_usd,
        status="Escalated" if compliance_flag else "Recovered",
        action_taken=action
    )
    EVENT_STREAM_BUFFER.insert(0, log_entry)
    if len(EVENT_STREAM_BUFFER) > 20:
        EVENT_STREAM_BUFFER.pop()

    return TriggerScenarioResponse(
        success=True,
        scenario_id=request.scenario_id,
        customer_id=request.customer_id,
        amount_usd=request.amount_usd,
        risk_score=risk_score,
        action_taken=action,
        compliance_flag=compliance_flag,
        execution_steps=steps,
        message=f"Scenario [{request.scenario_id}] executed successfully."
    )

def run_batch_simulation() -> BatchTestResponse:
    scenarios = ["dispute", "card_expired", "insufficient_funds"]
    results = []
    for s in scenarios:
        req = TriggerScenarioRequest(scenario_id=s, customer_id=f"cust_batch_{s}", amount_usd=500.0)
        res = process_scenario(req)
        results.append(res)
    return BatchTestResponse(
        total_executed=len(results),
        successful_runs=len(results),
        details=results
    )