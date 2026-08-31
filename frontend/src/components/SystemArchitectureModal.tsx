import React, { useState } from 'react';
import { Cpu, X, Layers, Server, Send, ShieldCheck, Database, Play } from 'lucide-react';

export const SystemArchitectureModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runFlowSimulation = () => {
    setIsSimulating(true);
    setActiveStep(1);
    setTimeout(() => setActiveStep(2), 1200);
    setTimeout(() => setActiveStep(3), 2400);
    setTimeout(() => {
      setActiveStep(0);
      setIsSimulating(false);
    }, 3600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 px-3 py-1.5 rounded-lg transition-all shadow-lg active:scale-95"
      >
        <Layers className="w-4 h-4 text-indigo-400" />
        <span>View Animated Architecture</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                    RecovAI Live Data Flow Architecture
                  </h2>
                  <p className="text-xs text-slate-400">Interactive Visual Gateway & Multi-Agent Execution Pipeline</p>
                </div>
              </div>
              <button
                onClick={runFlowSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isSimulating ? 'Simulating Pipeline Flow...' : 'Simulate Live Packet Flow'}
              </button>
            </div>

            {/* Animated Nodes Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative">
              {/* Node 1 */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep === 1 
                  ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <Server className={`w-6 h-6 mx-auto mb-2 ${activeStep === 1 ? 'text-blue-400 animate-bounce' : 'text-slate-500'}`} />
                <h4 className="text-xs font-bold text-slate-200 text-center uppercase">1. Ingestion & Security Edge</h4>
                <p className="text-[10px] text-slate-400 text-center mt-1">FastAPI • HMAC SHA256 Webhooks • 48h Scanner</p>
                {activeStep === 1 && (
                  <span className="block text-[10px] text-center text-blue-400 font-mono mt-2 font-semibold">
                    [ Packet Ingested & Signed ]
                  </span>
                )}
              </div>

              {/* Node 2 */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep === 2 
                  ? 'bg-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20 scale-105' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <Cpu className={`w-6 h-6 mx-auto mb-2 ${activeStep === 2 ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                <h4 className="text-xs font-bold text-slate-200 text-center uppercase">2. LangGraph AI & Guardrails</h4>
                <p className="text-[10px] text-slate-400 text-center mt-1">Risk Scoring • Rule R-102 Interceptor • State Machine</p>
                {activeStep === 2 && (
                  <span className="block text-[10px] text-center text-indigo-400 font-mono mt-2 font-semibold">
                    [ Evaluating Policy Guardrails... ]
                  </span>
                )}
              </div>

              {/* Node 3 */}
              <div className={`p-4 rounded-xl border transition-all duration-500 ${
                activeStep === 3 
                  ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20 scale-105' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <Send className={`w-6 h-6 mx-auto mb-2 ${activeStep === 3 ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                <h4 className="text-xs font-bold text-slate-200 text-center uppercase">3. Multi-Channel Dispatch</h4>
                <p className="text-[10px] text-slate-400 text-center mt-1">Retell Hinglish Voice • WhatsApp • Twilio SMS</p>
                {activeStep === 3 && (
                  <span className="block text-[10px] text-center text-emerald-400 font-mono mt-2 font-semibold">
                    [ Dispatched Tokenized Link ]
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-sans text-slate-300">
              <h4 className="font-semibold text-indigo-400 uppercase text-[11px] mb-2 font-mono">System Execution Summary:</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Data enters via FastAPI endpoints or Razorpay webhooks, undergoes HMAC signature verification, passes through LangGraph policy nodes for risk evaluation, and terminates in automated outreach or human escalation queues.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};