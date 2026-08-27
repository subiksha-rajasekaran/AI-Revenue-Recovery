import { useState } from 'react';
import { HeaderMetrics } from './components/HeaderMetrics';
import { SimulationToolbar } from './components/SimulationToolbar';
import type { PolicyMode, RecoveryMetric, RecoveryCase, AgentThought } from './types';
import { CheckCircle2, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export function App() {
  const [policyMode, setPolicyMode] = useState<PolicyMode>('AUTOPILOT');
  const [metrics, setMetrics] = useState<RecoveryMetric>({
    totalAtRiskUsd: 142500,
    recoveredUsd: 98400,
    recoveryRatePct: 69.05,
    activeWorkflows: 4,
    escalatedToHuman: 1,
  });

  const [cases, setCases] = useState<RecoveryCase[]>([
    {
      id: 'rec_01',
      customerName: 'Alex Mercer',
      companyName: 'Apex Data Corp',
      amountDue: 4500.0,
      failureReason: 'EXPIRED_CARD',
      riskTier: 'HIGH',
      language: 'EN',
      status: 'SUCCESS',
      recommendedAction: 'Retell Voice Call + Mandate Update Link',
      agentReasoning: 'LTV is high ($45,000). Dispensed soft voice negotiation with zero fee card update.',
      createdAt: '2 mins ago',
    },
    {
      id: 'rec_02',
      customerName: 'Priya Sharma',
      companyName: 'IndieLogistics',
      amountDue: 1200.0,
      failureReason: 'INVOICE_DISPUTE',
      riskTier: 'MEDIUM',
      language: 'HINGLISH',
      status: 'STOPPED_DISPUTE',
      recommendedAction: 'Freeze Automated Dunning & Alert Account Exec',
      agentReasoning: 'Hard Stopping Rule Met: Active ticket #8832 flags disputed line item.',
      createdAt: '12 mins ago',
    },
  ]);

  const [thoughts, setThoughts] = useState<AgentThought[]>([
    {
      id: 'th_1',
      stepName: 'RISK_SCORING',
      agentName: 'RiskScorerAgent',
      message: 'Account Apex Data Corp classified as HIGH LTV ($45,000). Risk score: 0.82.',
      guardrailPassed: true,
      timestamp: '2026-08-27 20:50:11',
    },
    {
      id: 'th_2',
      stepName: 'GUARDRAIL_CHECK',
      agentName: 'ComplianceGuardNode',
      message: 'Policy verified: Attempt count (1/3). Discount limit cap (Max 10%) enforced.',
      guardrailPassed: true,
      timestamp: '2026-08-27 20:50:12',
    },
  ]);

  const handleTriggerScenario = (scenarioKey: string) => {
    const newThought: AgentThought = {
      id: `th_${Date.now()}`,
      stepName: 'STRATEGY_SELECTION',
      agentName: 'StrategyRouterNode',
      message: `Triggered simulation: ${scenarioKey}. Evaluating guardrails and policy bounds...`,
      guardrailPassed: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setThoughts((prev) => [newThought, ...prev]);

    if (scenarioKey === 'EXPIRED_CARD_HIGH_VALUE') {
      const newCase: RecoveryCase = {
        id: `rec_${Date.now()}`,
        customerName: 'Sarah Jenkins',
        companyName: 'CloudScale Inc',
        amountDue: 3200.0,
        failureReason: 'EXPIRED_CARD',
        riskTier: 'HIGH',
        language: 'EN',
        status: policyMode === 'REVIEW_FIRST' ? 'PENDING' : 'SUCCESS',
        recommendedAction: 'Retell AI Voice Outreach (Card Update)',
        agentReasoning: 'Pre-Approved by Claude 3.5 Sonnet: High-value enterprise account.',
        createdAt: 'Just now',
      };
      setCases((prev) => [newCase, ...prev]);
      if (policyMode === 'AUTOPILOT') {
        setMetrics((prev) => ({
          ...prev,
          recoveredUsd: prev.recoveredUsd + 3200,
          totalAtRiskUsd: Math.max(0, prev.totalAtRiskUsd - 3200),
        }));
      }
    }
  };

  const handleRunBatchTest = () => {
    setMetrics((prev) => ({
      totalAtRiskUsd: prev.totalAtRiskUsd + 50000,
      recoveredUsd: prev.recoveredUsd + 34200,
      recoveryRatePct: 68.4,
      activeWorkflows: prev.activeWorkflows + 50,
      escalatedToHuman: prev.escalatedToHuman + 6,
    }));
  };

  const handleApproveCase = (id: string, amount: number) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'SUCCESS' as ActionOutcome } : c))
    );
    setMetrics((prev) => ({
      ...prev,
      recoveredUsd: prev.recoveredUsd + amount,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      <HeaderMetrics
        metrics={metrics}
        policyMode={policyMode}
        onTogglePolicyMode={setPolicyMode}
      />
      <SimulationToolbar
        onTriggerScenario={handleTriggerScenario}
        onRunBatchTest={handleRunBatchTest}
      />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Workflows & Review Queue */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Active Recovery Cases & Approval Queue
            </h2>
            <span className="text-xs text-slate-500 font-mono">{cases.length} Total Workflow(s)</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-100">{c.companyName}</span>
                    <span className="text-xs text-slate-400">({c.customerName})</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      {c.failureReason}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{c.agentReasoning}</p>
                  <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="text-slate-500">Strategy:</span> {c.recommendedAction}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="text-lg font-bold text-slate-100">${c.amountDue.toLocaleString()}</div>
                  {c.status === 'PENDING' ? (
                    <button
                      onClick={() => handleApproveCase(c.id, c.amountDue)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg shadow transition"
                    >
                      Approve & Dispatch
                    </button>
                  ) : c.status === 'SUCCESS' ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> Stopped (Dispute)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Agent Thought Stream */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400" />
            Agent Execution & Guardrail Stream
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 font-mono text-xs">
            {thoughts.map((t) => (
              <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span className="text-blue-400 font-semibold">{t.agentName}</span>
                  <span>{t.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{t.message}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;