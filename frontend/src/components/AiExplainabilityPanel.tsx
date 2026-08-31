import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertCircle, Gauge, ArrowRight } from 'lucide-react';

interface StrategyEvaluation {
  strategy_name: string;
  status: 'selected' | 'rejected' | 'blocked_by_guardrail';
  reason: string;
  estimated_recovery_probability: number;
}

interface AiExplainabilityData {
  scenario_id: string;
  risk_score: number;
  ai_confidence_percentage: number;
  compliance_guardrail_applied: string | null;
  is_halted: boolean;
  selected_strategy: string;
  decision_reasoning: string;
  evaluations: StrategyEvaluation[];
}

export const AiExplainabilityPanel: React.FC<{ activeScenario?: string }> = ({ activeScenario = 'dispute' }) => {
  const [data, setData] = useState<AiExplainabilityData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/agent/explainability?scenario_id=${activeScenario}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Error fetching explainability data:", err));
  }, [activeScenario]);

  if (!data) return null;

  const graphSteps = [
    { label: "1. Event Ingested", status: "completed" },
    { label: "2. Risk Evaluated", status: "completed" },
    { label: "3. Guardrail Intercept", status: data.is_halted ? "halted" : "completed" },
    { label: "4. Strategy Dispatched", status: data.is_halted ? "skipped" : "completed" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Glass-Box AI Decision & Guardrail Explainability Engine
            </h3>
            <p className="text-xs text-slate-400">LangGraph Execution Stepper & Policy Transparency</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase">AI Model Confidence</p>
            <p className="text-xs font-mono font-bold text-emerald-400">{data.ai_confidence_percentage}%</p>
          </div>
        </div>
      </div>

      {/* Visible Execution Stepper */}
      <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
        {graphSteps.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-slate-900 border border-slate-800">
            <span className={`font-semibold ${
              s.status === 'halted' ? 'text-rose-400' : s.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {s.label}
            </span>
            {idx < 3 && <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Decision Banner */}
      <div className={`p-4 rounded-lg border mb-4 ${
        data.is_halted 
          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
          : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.is_halted ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <span className="font-semibold text-sm">
              Selected Strategy: {data.selected_strategy}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
            Risk Score: {data.risk_score.toFixed(2)}
          </span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">{data.decision_reasoning}</p>

        {data.compliance_guardrail_applied && (
          <div className="mt-3 pt-2 border-t border-rose-800/40 flex items-center gap-2 text-xs font-mono font-semibold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Enforced Guardrail: {data.compliance_guardrail_applied}</span>
          </div>
        )}
      </div>

      {/* Evaluated Strategy Matrix */}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
        Evaluated Strategy Matrix & Counterfactual Reasoning
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.evaluations.map((e, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-200 truncate">{e.strategy_name}</span>
              {e.status === 'selected' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Selected
                </span>
              )}
              {e.status === 'blocked_by_guardrail' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  <XCircle className="w-3 h-3" /> Blocked
                </span>
              )}
              {e.status === 'rejected' && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Rejected
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-tight">{e.reason}</p>
            <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-800/50">
              <span className="text-slate-500">Recovery Prob.</span>
              <span className="font-mono font-semibold text-indigo-400">{e.estimated_recovery_probability}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};