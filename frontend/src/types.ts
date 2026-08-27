export type PolicyMode = 'AUTOPILOT' | 'REVIEW_FIRST';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type ActionOutcome = 'PENDING' | 'APPROVED' | 'SUCCESS' | 'STOPPED_DISPUTE' | 'ESCALATED';

export interface RecoveryMetric {
  totalAtRiskUsd: number;
  recoveredUsd: number;
  recoveryRatePct: number;
  activeWorkflows: number;
  escalatedToHuman: number;
}

export interface AgentThought {
  id: string;
  stepName: 'RISK_SCORING' | 'GUARDRAIL_CHECK' | 'STRATEGY_SELECTION' | 'OUTREACH_DISPATCH';
  agentName: string;
  message: string;
  guardrailPassed: boolean;
  timestamp: string;
}

export interface RecoveryCase {
  id: string;
  customerName: string;
  companyName: string;
  amountDue: number;
  failureReason: string;
  riskTier: RiskTier;
  language: 'EN' | 'HINGLISH';
  status: ActionOutcome;
  recommendedAction: string;
  agentReasoning: string;
  createdAt: string;
}

// Dummy runtime export to guarantee Vite sees this as a valid JavaScript ES Module
export const TYPES_VERSION = '1.0.0';