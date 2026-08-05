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
        return 'border-amber-400/60 bg-amber-950/40 animate-pulse text-amber-300';
      case 'executing':
        return 'border-emerald-400/60 bg-emerald-950/40 text-emerald-300';
      case 'error':
        return 'border-rose-400/60 bg-rose-950/40 text-rose-300';
      default:
        return 'border-purple-400/40 bg-purple-950/40 text-purple-300';
    }
  };

  return (
    <div className="relative z-40 font-serif">
      {/* Expanded MAI Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="absolute bottom-14 right-0 w-96 rounded-sm border border-purple-500/40 bg-[#0d0724]/95 backdrop-blur-2xl p-4 shadow-2xl select-none text-purple-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-sm border ${getStatusRing()}`}>
                  <Bot size={16} />
                </div>
                <div>
                  <div className="font-serif text-xs font-bold text-purple-200">MAI AGENT ASSISTANT</div>
                  <div className="text-[9px] font-mono text-purple-400/80">SOVEREIGN OS LORE ENGINE</div>
                </div>
              </div>
              <span className="rounded-sm border border-purple-500/30 bg-purple-950/60 px-2 py-0.5 font-mono text-[9px] font-semibold text-purple-300">
                {status.toUpperCase()}
              </span>
            </div>

            {/* AI Response Display Card */}
            {aiResponse ? (
              <div className="mb-3 rounded-sm border border-purple-500/30 bg-purple-950/40 p-3 text-xs space-y-1.5 shadow-sm">
                <div className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-purple-300" /> {aiResponse.thought}
                </div>
                <div className="text-xs leading-relaxed text-purple-100 font-medium">
                  {aiResponse.response}
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-sm border border-purple-500/20 bg-purple-950/40 p-3 text-xs text-purple-300/80 leading-relaxed">
                Welcome, citizen. Ask me about MIRAVERSE lore, NPCs, regions, or type commands like <span className="font-mono text-purple-200 font-bold">"launch SpellForge"</span> or <span className="font-mono text-purple-200 font-bold">"open browser"</span>.
              </div>
            )}

            {/* Prompt Input Form */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask MAI or issue OS command..."
                className="flex-1 rounded-sm border border-purple-500/30 bg-purple-950/60 px-3 py-2 text-xs text-purple-100 placeholder:text-purple-400/60 outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={status === 'thinking'}
                className="flex h-9 w-9 items-center justify-center rounded-sm bg-purple-600 text-white hover:bg-purple-500 transition shadow-sm"
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
        className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-sm text-[11px] font-serif transition ${
          isOpen
            ? 'border-purple-400 bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
            : 'border-purple-500/30 bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/60'
        }`}
        title="MAI Agent Assistant"
      >
        <Bot size={14} className="text-purple-300" />
        <span className="font-bold tracking-wide">MAI</span>
        {isOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>
    </div>
  );
}
