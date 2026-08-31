import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Filter, ToggleLeft, ToggleRight } from 'lucide-react';

interface StrategyBreakdown {
  strategy_name: string;
  amount_recovered: number;
  success_rate: number;
}

interface FunnelStage {
  stage_name: string;
  count: number;
  conversion_percentage: number;
}

interface DetailedAnalytics {
  total_failed_arr: number;
  total_recovered_arr: number;
  net_roi_improvement_percentage: number;
  strategy_breakdown: StrategyBreakdown[];
  conversion_funnel: FunnelStage[];
}

export const ExecutiveRoiCard: React.FC = () => {
  const [data, setData] = useState<DetailedAnalytics | null>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analytics/detailed-metrics')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Error fetching detailed metrics:", err));
  }, []);

  if (!data) return null;

  const currentRecovered = isAiMode ? data.total_recovered_arr : 45000.00;
  const currentRate = isAiMode ? 84.3 : 31.6;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1. Interactive Impact Box */}
      <div className={`border rounded-xl p-4 shadow-xl transition-all duration-300 ${
        isAiMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30' 
          : 'bg-slate-900/60 border-slate-800 opacity-80'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Platform Impact Simulator
          </span>
          <button
            onClick={() => setIsAiMode(!isAiMode)}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg border border-slate-700 transition-all"
          >
            {isAiMode ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-400" /> Mode: RecovAI Engine
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-rose-400" /> Mode: Standard Dunning
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <p className="text-[10px] text-slate-400 uppercase">Legacy System</p>
            <p className="text-sm font-bold text-slate-400">$45,000 / yr</p>
            <p className="text-[10px] text-rose-400 mt-0.5">31.6% Recovery Rate</p>
          </div>
          <div className={`p-2.5 rounded-lg border transition-all ${
            isAiMode ? 'bg-indigo-950/50 border-indigo-500/40' : 'bg-slate-950 border-slate-800'
          }`}>
            <p className="text-[10px] text-indigo-300 uppercase">Active Selection</p>
            <p className={`text-sm font-bold ${isAiMode ? 'text-emerald-400 font-mono' : 'text-slate-400'}`}>
              ${currentRecovered.toLocaleString()} / yr
            </p>
            <p className={`text-[10px] mt-0.5 font-bold ${isAiMode ? 'text-emerald-400' : 'text-slate-400'}`}>
              {currentRate}% Recovery
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-300">
          {isAiMode ? (
            <span>Autonomous orchestration prevented <strong className="text-emerald-400">$83,450</strong> in ARR churn (+118.4% Net Lift).</span>
          ) : (
            <span className="text-rose-300">Legacy dunning loses $83,450 annually due to unhandled declines & rigid emails.</span>
          )}
        </p>
      </div>

      {/* 2. Strategy Yield */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center justify-between">
          <span>Yield by Recovery Strategy</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </h4>
        <div className="space-y-2">
          {data.strategy_breakdown.map((s, idx) => (
            <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300 text-[11px] truncate">{s.strategy_name}</span>
                <span className="text-emerald-400 font-mono text-[11px]">${s.amount_recovered.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: isAiMode ? `${s.success_rate}%` : '20%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Conversion Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center justify-between">
          <span>End-to-End Recovery Funnel</span>
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
        </h4>
        <div className="space-y-1.5">
          {data.conversion_funnel.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950/40 px-2 py-1 rounded">
              <span className="text-slate-400">{f.stage_name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-200">{f.count}</span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/50">
                  {isAiMode ? `${f.conversion_percentage}%` : `${(f.conversion_percentage * 0.4).toFixed(1)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};