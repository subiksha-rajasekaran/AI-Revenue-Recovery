import React, { useEffect, useState } from 'react';
import { Radar, CreditCard, ShieldCheck, Clock, Play, CheckCircle2 } from 'lucide-react';

interface PreEmptiveAccountRecord {
  customer_id: string;
  card_last4: string;
  card_brand: string;
  amount_usd: number;
  hours_until_expiration: number;
  proactive_outreach_status: 'scheduled' | 'dispatched' | 'updated';
}

interface ScannerPreviewData {
  total_scanned: number;
  expiring_48h_count: number;
  protected_arr_at_risk: number;
  accounts: PreEmptiveAccountRecord[];
}

export const PreEmptiveScannerPanel: React.FC = () => {
  const [data, setData] = useState<ScannerPreviewData | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  const fetchPreview = () => {
    fetch('http://localhost:8000/api/v1/scanner/preview')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Error fetching scanner preview:", err));
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const runLiveScan = async () => {
    setScanning(true);
    try {
      await fetch('http://localhost:8000/api/v1/cron/scan-preemptive', { method: 'POST' });
      fetchPreview();
    } catch (err) {
      console.error("Scan trigger failed:", err);
    } finally {
      setTimeout(() => setScanning(false), 1000);
    }
  };

  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
            <Radar className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              48-Hour Pre-Emptive Card Expiration Scanner
            </h3>
            <p className="text-xs text-slate-400">Proactive Churn Prevention Radar Engine</p>
          </div>
        </div>

        <button
          onClick={runLiveScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-400/30 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {scanning ? 'Scanning DB...' : 'Run 48h Scan Sweep'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Total Cards Scanned</p>
            <p className="text-base font-bold font-mono text-slate-100">{data.total_scanned.toLocaleString()}</p>
          </div>
          <CreditCard className="w-5 h-5 text-slate-500" />
        </div>
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Expiring in &lt; 48 Hours</p>
            <p className="text-base font-bold font-mono text-amber-400">{data.expiring_48h_count} Accounts</p>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Pre-Emptively Protected ARR</p>
            <p className="text-base font-bold font-mono text-emerald-400">${data.protected_arr_at_risk.toLocaleString()}</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-2.5">Customer ID</th>
              <th className="p-2.5">Payment Method</th>
              <th className="p-2.5">ARR at Risk</th>
              <th className="p-2.5">Expiration Window</th>
              <th className="p-2.5 text-right">Proactive Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {data.accounts.map((acc, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50">
                <td className="p-2.5 font-sans font-medium text-slate-200">{acc.customer_id}</td>
                <td className="p-2.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{acc.card_brand} •••• {acc.card_last4}</span>
                </td>
                <td className="p-2.5 text-emerald-400 font-bold">${acc.amount_usd.toLocaleString()}</td>
                <td className="p-2.5 text-amber-400 font-semibold">{acc.hours_until_expiration} hrs left</td>
                <td className="p-2.5 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Dispatched
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};