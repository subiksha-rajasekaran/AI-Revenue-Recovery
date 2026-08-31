import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare, Send, ExternalLink, RefreshCw } from 'lucide-react';

interface ChannelMessagePayload {
  channel: 'voice_retell' | 'whatsapp' | 'sms_twilio';
  title: string;
  recipient: string;
  content_payload: string;
  action_url?: string;
  fallback_channel?: string;
}

interface ChannelPreviewData {
  customer_id: string;
  amount_usd: number;
  channels: ChannelMessagePayload[];
}

export const OutreachChannelPreview: React.FC = () => {
  const [data, setData] = useState<ChannelPreviewData | null>(null);
  const [activeTab, setActiveTab] = useState<'voice_retell' | 'whatsapp' | 'sms_twilio'>('voice_retell');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/outreach/channel-previews')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Error fetching outreach channel previews:", err));
  }, []);

  if (!data) return null;

  const currentChannel = data.channels.find(c => c.channel === activeTab) || data.channels[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Multi-Channel Outreach Dispatch & Script Inspector
            </h3>
            <p className="text-xs text-slate-400">Localized Retell Voice, WhatsApp & SMS Payloads</p>
          </div>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('voice_retell')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'voice_retell'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Voice (Retell)
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('sms_twilio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'sms_twilio'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Twilio SMS
          </button>
        </div>
      </div>

      {/* Payload Display Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-200">{currentChannel.title}</span>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            To: {currentChannel.recipient}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-md mb-3 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
          {currentChannel.content_payload}
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="font-mono">{currentChannel.action_url}</span>
          </div>
          {currentChannel.fallback_channel && (
            <div className="flex items-center gap-1 text-slate-400">
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Fallback: <strong className="text-slate-200">{currentChannel.fallback_channel}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};