import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ComponentHealth {
  status: 'operational' | 'degraded' | 'offline';
  latency_ms: number;
  details?: string;
}

interface SystemHealthData {
  overall_status: 'healthy' | 'degraded' | 'critical';
  api_status: ComponentHealth;
  database_status: ComponentHealth;
  redis_status: ComponentHealth;
  ai_agent_status: ComponentHealth;
  pydantic_validation_status: ComponentHealth;
  timestamp: string;
}

export const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/health/system');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error("Health check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-400 text-xs animate-pulse">
        Initializing Platform Health Telemetry...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Degraded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/80 border border-rose-800/50 px-2 py-0.5 rounded-full">
            Offline
          </span>
        );
    }
  };

  const services = [
    { name: 'FastAPI Service Engine', icon: Server, data: health.api_status },
    { name: 'PostgreSQL Relational DB', icon: Database, data: health.database_status },
    { name: 'Redis Cache & Lock State', icon: Activity, data: health.redis_status },
    { name: 'LangGraph Orchestrator', icon: Cpu, data: health.ai_agent_status },
    { name: 'Pydantic Edge Validator', icon: ShieldCheck, data: health.pydantic_validation_status },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              System Infrastructure & Service Telemetry
            </h3>
            <p className="text-xs text-slate-400">Live heartbeat monitoring sub-10ms response loops</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
            {health.timestamp}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                {getStatusBadge(s.data.status)}
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">{s.name}</p>
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Latency</span>
                <span className="text-xs font-mono font-semibold text-emerald-400">{s.data.latency_ms} ms</span>
              </div>
              {s.data.details && (
                <p className="text-[10px] text-slate-400 mt-1 truncate">{s.data.details}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};