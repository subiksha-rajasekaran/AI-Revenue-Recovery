import React from 'react';
import { ShieldCheck, Zap, DollarSign, Activity } from 'lucide-react';
import type { PolicyMode, RecoveryMetric } from '../types';

interface HeaderMetricsProps {
  metrics: RecoveryMetric;
  policyMode: PolicyMode;
  onTogglePolicyMode: (mode: PolicyMode) => void;
}

export const HeaderMetrics: React.FC<HeaderMetricsProps> = ({
  metrics,
  policyMode,
  onTogglePolicyMode,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6 text-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              RecovAI Engine
            </h1>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Buildathon Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous & Bounded Multi-Agent Revenue Protection Platform
          </p>
        </div>

        {/* Human-in-the-Loop Safety Switch */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => onTogglePolicyMode('AUTOPILOT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              policyMode === 'AUTOPILOT'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            Auto-Pilot Mode
          </button>
          <button
            onClick={() => onTogglePolicyMode('REVIEW_FIRST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              policyMode === 'REVIEW_FIRST'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Review-First Guard
          </button>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Recovered ARR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${metrics.recoveredUsd.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-500/80 font-medium">Verified Capture</span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Pipeline At Risk</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${metrics.totalAtRiskUsd.toLocaleString()}
          </div>
          <span className="text-xs text-amber-500/80 font-medium">Active Dunning Volume</span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Recovery Rate</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.recoveryRatePct.toFixed(1)}%
          </div>
          <span className="text-xs text-blue-500/80 font-medium">+14.2% vs Static Retry</span>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Active Swarms</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics.activeWorkflows}
          </div>
          <span className="text-xs text-purple-500/80 font-medium">
            {metrics.escalatedToHuman} Escalated to Human
          </span>
        </div>
      </div>
    </div>
  );
};