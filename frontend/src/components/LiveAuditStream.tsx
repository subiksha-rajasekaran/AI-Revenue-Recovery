import React, { useEffect, useState } from 'react';
import { Terminal, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  customer_id: string;
  amount_usd: number;
  status: string;
  action_taken: string;
}

export const LiveAuditStream: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  const fetchStream = () => {
    fetch('http://localhost:8000/api/v1/analytics/event-stream')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Event stream fetch error:", err));
  };

  useEffect(() => {
    fetchStream();
    const interval = setInterval(fetchStream, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl mb-6 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
            Live Platform Audit & Telemetry Stream
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          <Activity className="w-3 h-3 animate-spin" /> Live 3s Polling
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5 text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-[11px]">Awaiting system events...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between border-b border-slate-900 pb-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className="text-indigo-400 font-bold">{log.event_type}</span>
                <span className="text-slate-300">{log.customer_id} (${log.amount_usd})</span>
              </div>
              <div className="flex items-center gap-1">
                {log.status === 'Escalated' ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {log.action_taken}
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {log.action_taken}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};