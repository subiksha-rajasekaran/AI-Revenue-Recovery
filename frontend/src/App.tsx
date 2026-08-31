import React, { useState } from 'react';
import { SystemHealthDashboard } from './components/SystemHealthDashboard';
import { ExecutiveRoiCard } from './components/ExecutiveRoiCard';
import { AiExplainabilityPanel } from './components/AiExplainabilityPanel';
import { OutreachChannelPreview } from './components/OutreachChannelPreview';
import { PreEmptiveScannerPanel } from './components/PreEmptiveScannerPanel';
import { RazorpayWebhookInspector } from './components/RazorpayWebhookInspector';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { HowRecovAiWorks } from './components/HowRecovAiWorks'; // <--- Import New Component
import { Play, Zap, ShieldAlert, RefreshCw, LayoutDashboard, GitMerge } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'how_it_works'>('dashboard');
  const [activeScenario, setActiveScenario] = useState<string>('dispute');
  const [triggering, setTriggering] = useState<boolean>(false);

  const handleScenarioTrigger = async (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setTriggering(true);
    try {
      await fetch('http://localhost:8000/api/v1/simulate/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioId,
          customer_id: `cust_demo_${scenarioId}`,
          amount_usd: 1200.00
        })
      });
    } catch (err) {
      console.error("Scenario trigger error:", err);
    } finally {
      setTimeout(() => setTriggering(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">RecovAI Platform</h1>
            <p className="text-xs text-slate-400">Autonomous & Bounded Multi-Agent Revenue Protection Engine</p>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard View
            </button>
            <button
              onClick={() => setActiveTab('how_it_works')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'how_it_works'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" /> How RecovAI Works
            </button>
          </div>

          <SystemArchitectureModal />
        </div>
      </header>

      {/* RENDER VIEW BASED ON ACTIVE TAB */}
      {activeTab === 'how_it_works' ? (
        <HowRecovAiWorks />
      ) : (
        <>
          {/* Module 1: System Telemetry Header */}
          <SystemHealthDashboard />

          {/* Scenario Trigger Control Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400" /> Judge Scenario Trigger Control Panel
              </span>
              {triggering && (
                <span className="text-xs font-mono text-indigo-400 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Processing Scenario...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleScenarioTrigger('dispute')}
                className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                  activeScenario === 'dispute'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Active Dispute
                </div>
                <p className="text-[10px] opacity-80">Triggers Rule R-102 Guardrail Halt</p>
              </button>

              <button
                onClick={() => handleScenarioTrigger('card_expired')}
                className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                  activeScenario === 'card_expired'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-blue-400">
                  Card Expired
                </div>
                <p className="text-[10px] opacity-80">Dispatches 1-Click Update Link</p>
              </button>

              <button
                onClick={() => handleScenarioTrigger('soft_decline')}
                className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                  activeScenario === 'soft_decline'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-purple-400">
                  Soft Decline
                </div>
                <p className="text-[10px] opacity-80">Dispatches Retell Hinglish Voice</p>
              </button>

              <button
                onClick={() => handleScenarioTrigger('general')}
                className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                  activeScenario === 'general'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-emerald-400">
                  Standard Recovery
                </div>
                <p className="text-[10px] opacity-80">Executes Multi-Channel Fallback</p>
              </button>
            </div>
          </div>

          {/* Module 3: Executive Dashboard & ROI Suite */}
          <ExecutiveRoiCard />

          {/* Module 4: Glass-Box AI Explainability Panel */}
          <AiExplainabilityPanel activeScenario={activeScenario} />

          {/* Module 5: Outreach Channel Preview Inspector */}
          <OutreachChannelPreview />

          {/* Module 6 & 7 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PreEmptiveScannerPanel />
            <RazorpayWebhookInspector />
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-4 mt-8 text-center text-xs text-slate-500">
        RecovAI Platform • Built for AI Buildathon 2026 • Autonomous & Bounded Revenue Protection Engine
      </footer>
    </div>
  );
};

export default App;