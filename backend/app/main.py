from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    TriggerScenarioRequest,
    TriggerScenarioResponse,
    BatchTestResponse,
    DashboardMetricsResponse
)
from app.simulator import process_scenario, run_batch_simulation, get_current_metrics

app = FastAPI(
    title="RecovAI Engine API",
    version="1.0.0",
    description="Fast Mock API Engine for Revenue Recovery Buildathon"
)

# Enable CORS for Frontend Development Server
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