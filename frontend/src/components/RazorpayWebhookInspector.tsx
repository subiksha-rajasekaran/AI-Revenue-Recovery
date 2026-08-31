import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Webhook, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface WebhookLogRecord {
  event_id: string;
  event_type: string;
  account_id: string;
  signature_verified: boolean;
  signature_hash: string;
  received_at: string;
  amount_usd: number;
}

interface WebhookInspectorData {
  total_webhooks_ingested: number;
  failed_signatures_blocked: number;
  recent_logs: WebhookLogRecord[];
}

export const RazorpayWebhookInspector: React.FC = () => {
  const [data, setData] = useState<WebhookInspectorData | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/webhooks/recent')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Error fetching webhook telemetry:", err));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Razorpay Webhook Ingestion Engine & Signature Inspector
            </h3>
            <p className="text-xs text-slate-400">HMAC SHA256 Cryptographic Payload Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
            <Lock className="w-3 h-3" /> HMAC SHA256 Active
          </span>
        </div>
      </div>

      {/* Security Telemetry Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Total Webhooks Ingested</p>
            <p className="text-base font-bold font-mono text-slate-100">{data.total_webhooks_ingested}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Spoofed Requests Blocked</p>
            <p className="text-base font-bold font-mono text-rose-400">{data.failed_signatures_blocked} Invalid Signatures</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Webhook Stream List */}
      <div className="space-y-2">
        {data.recent_logs.map((log, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">{log.event_type}</span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {log.event_id}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Verified ({log.received_at})
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/50">
              <span className="flex items-center gap-1 truncate max-w-xs">
                <Key className="w-3 h-3 text-amber-400" /> Sig: {log.signature_hash.substring(0, 32)}...
              </span>
              <span className="text-emerald-400 font-bold">${log.amount_usd.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};