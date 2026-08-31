import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, ShieldAlert, CreditCard, RefreshCw, CheckCircle2, 
  XCircle, ArrowDown, ArrowRight, Zap, Cpu, Server, ShieldCheck, 
  Webhook, Database, Phone, MessageSquare, Send, UserCheck, Clock, Terminal, Info, X 
} from 'lucide-react';

// Types
type ScenarioType = 'dispute' | 'card_expired' | 'soft_decline' | 'standard';
type StepStatus = 'waiting' | 'running' | 'completed' | 'halted' | 'skipped';

interface FlowStep {
  id: string;
  title: string;
  oneLiner: string;
  icon: any;
  popupExplanation: string;
  latencyMs: number;
  branch?: 'dispute_branch' | 'standard_branch';
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const HowRecovAiWorks: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('dispute');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<'voice' | 'whatsapp' | 'sms' | 'retry'>('voice');
  const [activePopupStep, setActivePopupStep] = useState<FlowStep | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [recoveredAmount, setRecoveredAmount] = useState<number>(0);

  // Flow Steps Definition
  const steps: FlowStep[] = [
    {
      id: 'trigger',
      title: 'Judge Selects Scenario',
      oneLiner: 'User triggers payment failure simulation on React Control Panel.',
      icon: Play,
      popupExplanation: 'Scenario triggers initiate simulated card declines or webhook payload events into the platform gateway.',
      latencyMs: 10
    },
    {
      id: 'gateway',
      title: 'FastAPI API Gateway',
      oneLiner: 'Receives request and instantiates async recovery workflow.',
      icon: Server,
      popupExplanation: 'High-throughput ASGI server allocates a unique Correlation ID and creates a state tracker.',
      latencyMs: 12
    },
    {
      id: 'validation',
      title: 'Pydantic Validation',
      oneLiner: 'Validates request payload structure at compiled Rust speed.',
      icon: ShieldCheck,
      popupExplanation: 'Enforces strict edge data schema types before passing parameters downstream.',
      latencyMs: 4
    },
    {
      id: 'webhook_security',
      title: 'Webhook HMAC Verification',
      oneLiner: 'Cryptographically verifies Razorpay X-Signature hashes.',
      icon: Webhook,
      popupExplanation: 'Computes HMAC SHA256 digest against raw request body to prevent request spoofing.',
      latencyMs: 8
    },
    {
      id: 'store_event',
      title: 'Event Storage & State Lock',
      oneLiner: 'Persists raw event to PostgreSQL & sets Redis concurrency lock.',
      icon: Database,
      popupExplanation: 'Secures transactional audit logs and acquires distributed Redis locks to ensure idempotency.',
      latencyMs: 15
    },
    {
      id: 'risk_agent',
      title: 'Step 1: Risk Assessment Agent',
      oneLiner: 'Evaluates customer churn probability and transaction risk.',
      icon: Cpu,
      popupExplanation: 'Calculates customer recovery probability using transaction history, LTV, payment failures, and account behavior.',
      latencyMs: 45
    },
    {
      id: 'compliance_guardrail',
      title: 'Step 2: Compliance Guardrail',
      oneLiner: 'Enforces deterministic policy rules (e.g. Rule R-102 Dispute Lock).',
      icon: ShieldAlert,
      popupExplanation: 'Checks deterministic business rules such as maximum retries, active invoice dispute locks, and regulatory limits.',
      latencyMs: 20
    },
    {
      id: 'strategy_router',
      title: 'Strategy Router & Channel Selector',
      oneLiner: 'Selects optimal recovery channel based on risk score.',
      icon: Zap,
      popupExplanation: 'Selects the highest ROI recovery channel while respecting compliance policies.',
      latencyMs: 30,
      branch: 'standard_branch'
    },
    {
      id: 'outreach_received',
      title: 'Customer Receives Outreach',
      oneLiner: 'Tokenized 1-click update link delivered to customer device.',
      icon: Send,
      popupExplanation: 'Delivers PCI-compliant short-lived update URLs over preferred messaging channels.',
      latencyMs: 120,
      branch: 'standard_branch'
    },
    {
      id: 'payment_completed',
      title: 'Payment Settlement Verification',
      oneLiner: 'Payment gateway confirms successful subscription renewal.',
      icon: CheckCircle2,
      popupExplanation: 'Receives asynchronous settlement confirmation from card network or gateway.',
      latencyMs: 80,
      branch: 'standard_branch'
    },
    {
      id: 'update_analytics',
      title: 'Analytics & ARR Dashboard Update',
      oneLiner: 'Updates metrics, protected ARR totals, and audit streams.',
      icon: RefreshCw,
      popupExplanation: 'Calculates net ROI lift (+118.4%) and updates system-wide analytics widgets.',
      latencyMs: 15,
      branch: 'standard_branch'
    }
  ];

  // Dispute Halt Step (Branching)
  const disputeHaltStep: FlowStep = {
    id: 'escalate_human',
    title: 'Stop Workflow & Human CSM Escalation',
    oneLiner: 'Automated dunning frozen; ticket escalated to Zendesk/Salesforce.',
    icon: UserCheck,
    popupExplanation: 'Rule R-102 hard-stops automated outreach during active disputes to prevent legal chargeback escalation.',
    latencyMs: 25,
    branch: 'dispute_branch'
  };

  // Execution Driver Engine
  const startWorkflowExecution = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    setCurrentStepIndex(0);
    setIsExecuting(true);
    setLogs([]);
    setElapsedMs(0);
    setRecoveredAmount(0);

    // Channel Selection Mapping
    if (scenario === 'card_expired') setSelectedChannel('sms');
    else if (scenario === 'soft_decline') setSelectedChannel('voice');
    else if (scenario === 'standard') setSelectedChannel('whatsapp');

    const nowTime = () => new Date().toISOString().split('T')[1].slice(0, 8);

    // Step-by-Step Delay Execution Sequence
    let delay = 0;
    const maxSteps = scenario === 'dispute' ? 7 : steps.length;

    for (let i = 0; i < maxSteps; i++) {
      const step = steps[i];
      delay += step.latencyMs + 350; // Add visual pacing

      setTimeout(() => {
        setCurrentStepIndex(i);
        setElapsedMs((prev) => prev + step.latencyMs);

        // Append to Log Terminal
        setLogs((prev) => [
          {
            timestamp: nowTime(),
            message: `[${step.id.toUpperCase()}] ${step.title} -> Completed (${step.latencyMs}ms)`,
            type: i === 6 && scenario === 'dispute' ? 'warning' : 'info'
          },
          ...prev
        ]);

        // Final Step Operations
        if (i === maxSteps - 1) {
          if (scenario === 'dispute') {
            setLogs((prev) => [
              {
                timestamp: nowTime(),
                message: '[GUARDRAIL_HALT] Rule R-102 Enforced: Outreach Frozen -> Human CSM Escalated',
                type: 'error'
              },
              ...prev
            ]);
          } else {
            const amount = scenario === 'card_expired' ? 5400 : scenario === 'soft_decline' ? 1200 : 850;
            setRecoveredAmount(amount);
            setLogs((prev) => [
              {
                timestamp: nowTime(),
                message: `[RECOVERY_SUCCESS] Payment Settled -> $${amount} ARR Protected`,
                type: 'success'
              },
              ...prev
            ]);
          }
          setIsExecuting(false);
        }
      }, delay);
    }
  };

  useEffect(() => {
    startWorkflowExecution('dispute');
  }, []);

  const getStepStatus = (index: number, step: FlowStep): StepStatus => {
    if (activeScenario === 'dispute' && index > 6) return 'skipped';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return isExecuting ? 'running' : 'completed';
    return 'waiting';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">How RecovAI Works</h1>
              <p className="text-xs text-slate-400">End-to-End Visual Workflow & Interactive Execution Engine</p>
            </div>
          </div>
        </div>

        {/* Scenario Selection Toolbar */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => startWorkflowExecution('dispute')}
            disabled={isExecuting}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeScenario === 'dispute'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Active Dispute
          </button>
          <button
            onClick={() => startWorkflowExecution('card_expired')}
            disabled={isExecuting}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeScenario === 'card_expired'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Card Expired
          </button>
          <button
            onClick={() => startWorkflowExecution('soft_decline')}
            disabled={isExecuting}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeScenario === 'soft_decline'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-purple-400" /> Soft Decline
          </button>
          <button
            onClick={() => startWorkflowExecution(activeScenario)}
            disabled={isExecuting}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all ml-2"
            title="Replay Workflow"
          >
            <RotateCcw className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 mb-6 overflow-hidden">
        <motion.div 
          className={`h-full ${activeScenario === 'dispute' && currentStepIndex >= 6 ? 'bg-rose-500' : 'bg-emerald-400'}`}
          initial={{ width: '0%' }}
          animate={{ 
            width: `${Math.min(
              100, 
              ((currentStepIndex + 1) / (activeScenario === 'dispute' ? 7 : steps.length)) * 100
            )}%` 
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Flowchart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Left Column: Sequential Flow (Steps 0 to 6) */}
        <div className="lg:col-span-3 space-y-4">
          {steps.slice(0, 7).map((step, idx) => {
            const status = getStepStatus(idx, step);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border backdrop-blur-md transition-all relative ${
                    status === 'running'
                      ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
                      : status === 'completed'
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        status === 'running' 
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse' 
                          : status === 'completed' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-100">{step.title}</h3>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {step.latencyMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{step.oneLiner}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActivePopupStep(step)}
                        className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50"
                        title="View Explanation"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {status === 'running' && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Running
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {status === 'waiting' && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Arrow Connector */}
                {idx < 6 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className={`w-5 h-5 transition-colors ${
                      idx < currentStepIndex ? 'text-emerald-400 animate-bounce' : 'text-slate-700'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* DYNAMIC BRANCHING DECISION POINT */}
          <div className="my-6 border-t border-b border-slate-800 py-4 text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              LangGraph Decision Branching Point
            </span>
          </div>

          {/* BRANCH A: ACTIVE DISPUTE HALT */}
          {activeScenario === 'dispute' && currentStepIndex >= 6 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Rule R-102 Dispute Lock Triggered</span>
                </div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  Outreach Halted
                </span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed mb-3">
                Active dispute detected in database. Automated dunning is hard-stopped to prevent chargeback penalties.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-900/50 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <UserCheck className="w-4 h-4" /> Escalate to Human CSM Queue
                </span>
                <span className="text-emerald-400">Status: Ticket Created</span>
              </div>
            </motion.div>
          )}

          {/* BRANCH B: STANDARD RECOVERY FLOW (Steps 7 to 10) */}
          {activeScenario !== 'dispute' && (
            <div className="space-y-4">
              {/* Channel Selector Animation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Selected Strategy Channel:</span>
                <div className="flex gap-2 text-xs font-mono font-bold">
                  <span className={`px-2.5 py-1 rounded border ${selectedChannel === 'voice' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'opacity-40'}`}>
                    <Phone className="w-3 h-3 inline mr-1" /> Retell Voice (Hinglish)
                  </span>
                  <span className={`px-2.5 py-1 rounded border ${selectedChannel === 'whatsapp' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'opacity-40'}`}>
                    <MessageSquare className="w-3 h-3 inline mr-1" /> WhatsApp
                  </span>
                  <span className={`px-2.5 py-1 rounded border ${selectedChannel === 'sms' ? 'bg-blue-950 text-blue-300 border-blue-800' : 'opacity-40'}`}>
                    <Send className="w-3 h-3 inline mr-1" /> Twilio SMS
                  </span>
                </div>
              </div>

              {steps.slice(7).map((step, idx) => {
                const stepIdx = idx + 7;
                const status = getStepStatus(stepIdx, step);
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border backdrop-blur-md transition-all ${
                        status === 'running'
                          ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
                          : status === 'completed'
                          ? 'bg-slate-900/90 border-emerald-500/40'
                          : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg border ${
                            status === 'running'
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                              : status === 'completed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-100">{step.title}</h3>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                {step.latencyMs}ms
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{step.oneLiner}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActivePopupStep(step)}
                            className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {status === 'completed' && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    {idx < 3 && (
                      <div className="flex justify-center my-1">
                        <ArrowDown className={`w-5 h-5 ${stepIdx < currentStepIndex ? 'text-emerald-400 animate-bounce' : 'text-slate-700'}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mini Execution Telemetry Terminal */}
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Execution Summary</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </h3>
            
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Workflow Duration:</span>
                <span className="text-emerald-400 font-bold">{elapsedMs} ms</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Steps Completed:</span>
                <span className="text-slate-200 font-bold">
                  {currentStepIndex + 1} / {activeScenario === 'dispute' ? 7 : 11}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Compliance Status:</span>
                {activeScenario === 'dispute' ? (
                  <span className="text-rose-400 font-bold">Rule R-102 Enforced</span>
                ) : (
                  <span className="text-emerald-400 font-bold">100% Compliant</span>
                )}
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Recovered ARR:</span>
                <span className="text-emerald-400 font-bold text-sm">${recoveredAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Live Terminal Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" /> Live Event Log
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 max-h-80 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-[11px]">Initializing execution logs...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-[11px] leading-tight border-b border-slate-900 pb-1">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'error' ? 'text-rose-400 font-bold' :
                      log.type === 'warning' ? 'text-amber-400 font-bold' :
                      log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Explanation Popup Modal */}
      <AnimatePresence>
        {activePopupStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActivePopupStep(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">{activePopupStep.title}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800 font-sans">
                {activePopupStep.popupExplanation}
              </p>

              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Avg Processing Overhead:</span>
                <span className="text-emerald-400 font-bold">{activePopupStep.latencyMs} ms</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};