import React from 'react';
import { Play, Flame, AlertOctagon, Clock, Languages, Layers } from 'lucide-react';

interface SimulationToolbarProps {
  onTriggerScenario: (scenarioKey: string) => void;
  onRunBatchTest: () => void;
}

export const SimulationToolbar: React.FC<SimulationToolbarProps> = ({
  onTriggerScenario,
  onRunBatchTest,
}) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
          Judge Controls:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onTriggerScenario('EXPIRED_CARD_HIGH_VALUE')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          High-LTV Expired Card
        </button>

        <button
          onClick={() => onTriggerScenario('INSUFFICIENT_FUNDS_NSF')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          NSF Smart Retry
        </button>

        <button
          onClick={() => onTriggerScenario('ACTIVE_DISPUTE_STOP')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 text-xs font-medium text-rose-300 transition"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Active Dispute (Stopping Rule)
        </button>

        <button
          onClick={() => onTriggerScenario('HINGLISH_VOICE_CALL')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
        >
          <Languages className="w-3.5 h-3.5 text-purple-400" />
          Hinglish Voice Call
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={onRunBatchTest}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-blue-500/10 transition"
        >
          <Layers className="w-3.5 h-3.5" />
          Run 50-Invoice Batch Test
        </button>
      </div>
    </div>
  );
};