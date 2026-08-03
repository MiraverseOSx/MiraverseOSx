import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, Terminal, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { useWorldStore } from '../store/useWorldStore';
import { APPS } from '../apps/registry';
import soundEngine from '../utils/soundEngine';

export default function MAIDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'thinking' | 'executing' | 'error'
  const [aiResponse, setAiResponse] = useState(null);

  const toggleApp = useOSStore((s) => s.toggleApp);
  const addXP = useOSStore((s) => s.addXP);
  const sendMAIPrompt = useWorldStore((s) => s.sendMAIPrompt);

  const handleCommandSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || status === 'thinking') return;

    const userQuery = prompt.trim();
    setPrompt('');
    setStatus('thinking');
    soundEngine.playMAIPulse();

    // Check direct OS app launching commands locally for zero lag
    const lowerQuery = userQuery.toLowerCase();
    const appMatch = APPS.find(
      (a) => lowerQuery.includes(a.title.toLowerCase()) || lowerQuery.includes(a.id)
    );

    if (lowerQuery.startsWith('open ') || lowerQuery.startsWith('launch ')) {
      if (appMatch) {
        toggleApp(appMatch);
        soundEngine.playWindowOpen();
        setStatus('executing');
        setAiResponse({
          thought: `Command recognized: Launching [${appMatch.title}]`,
          response: `Launching ${appMatch.title} application module.`,
          action: { command: 'launch', app: appMatch.title }
        });
        addXP(10);
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
    }

    // Call Express API / WorldAuthority for lore, NPCs, and dynamic AI responses
    try {
      const response = await sendMAIPrompt(userQuery, { active_app: 'Desktop' });
      setStatus('executing');
      soundEngine.playSuccess();
      setAiResponse(response);
      addXP(15);
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setAiResponse({
        thought: 'Connection error',
        response: 'MAI System: Unable to reach Express API server.',
        action: null
      });
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getStatusRing = () => {
    switch (status) {
      case 'thinking':
        return 'border-amber-400 bg-amber-100 animate-pulse text-amber-600';
      case 'executing':
        return 'border-emerald-400 bg-emerald-100 text-emerald-600';
      case 'error':
        return 'border-rose-400 bg-rose-100 text-rose-600';
      default:
        return 'border-[#8c97d6] bg-[#e9ebf6] text-[#5f6ab0]';
    }
  };

  return (
    <div className="relative z-40">
      {/* Expanded MAI Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="absolute bottom-14 right-0 w-96 rounded-2xl border border-white/90 bg-white/92 backdrop-blur-2xl p-4 shadow-[0_16px_40px_-8px_rgba(80,90,120,0.35)] select-none text-[#162241]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-xl border ${getStatusRing()}`}>
                  <Bot size={16} />
                </div>
                <div>
                  <div className="font-serif-y2k text-xs font-bold text-[#1d2650]">MAI AGENT ASSISTANT</div>
                  <div className="text-[9px] font-mono text-slate-400">SOVEREIGN OS LORE ENGINE</div>
                </div>
              </div>
              <span className="rounded bg-[#e9ebf6] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#5f6ab0]">
                {status.toUpperCase()}
              </span>
            </div>

            {/* AI Response Display Card */}
            {aiResponse ? (
              <div className="mb-3 rounded-xl border border-slate-200 bg-[#FAFAFC] p-3 text-xs space-y-1.5 shadow-sm">
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#5f6ab0]" /> {aiResponse.thought}
                </div>
                <div className="text-xs leading-relaxed text-[#243064] font-medium">
                  {aiResponse.response}
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-slate-200/80 bg-[#FAFAFC] p-3 text-xs text-slate-500 leading-relaxed">
                Welcome, player. Ask me about MIRAVERSE lore, NPCs, regions, or type commands like <span className="font-mono text-[#3b4785]">"launch SpellForge"</span> or <span className="font-mono text-[#3b4785]">"search lore Aethercore"</span>.
              </div>
            )}

            {/* Prompt Input Form */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask MAI or issue OS command..."
                className="flex-1 rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#8c97d6]"
              />
              <button
                type="submit"
                disabled={status === 'thinking'}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17213f] text-white hover:bg-[#28325f] transition shadow-sm"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar Toggle Button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
          isOpen
            ? 'border-[#17213f] bg-[#17213f] text-white shadow-sm'
            : 'border-slate-300/80 bg-white/70 text-[#1d2650] hover:bg-white'
        }`}
      >
        <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${getStatusRing()}`}>
          <Bot size={10} />
        </div>
        <span className="font-serif-y2k font-bold text-xs tracking-wide">MAI</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
