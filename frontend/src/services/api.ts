import axios from 'axios';
import type { PolicyMode, RecoveryMetric, RecoveryCase, AgentThought } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface TriggerResponse {
  success: boolean;
  scenario_key: string;
  recovered_amount: number;
  new_case: RecoveryCase;
  thoughts: AgentThought[];
}

export interface BatchResponse {
  total_invoices: number;
  total_at_risk_usd: number;
  recovered_usd: number;
  recovery_rate_pct: number;
  escalated_to_human: number;
  processing_time_ms: number;
}

export const api = {
  fetchMetrics: async (): Promise<RecoveryMetric> => {
    const response = await axios.get<RecoveryMetric>(`${API_BASE_URL}/analytics/dashboard-metrics`);
    return response.data;
  },

  triggerScenario: async (scenarioKey: string, policyMode: PolicyMode): Promise<TriggerResponse> => {
    const response = await axios.post<TriggerResponse>(`${API_BASE_URL}/simulate/trigger-event`, {
      scenario_key: scenarioKey,
      policy_mode: policyMode,
    });
    return response.data;
  },

  runBatchTest: async (): Promise<BatchResponse> => {
    const response = await axios.post<BatchResponse>(`${API_BASE_URL}/simulate/batch-test`);
    return response.data;
  },
};