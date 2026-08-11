import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, Terminal, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, ShieldAlert, FileText, HelpCircle, Activity } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { useWorldStore } from '../store/useWorldStore';
import { useGameStore } from '../store/useGameStore';
import { APPS } from '../apps/registry';
import soundEngine from '../utils/soundEngine';

export default function MAIDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'thinking' | 'executing' | 'error' | 'glitched'
  const [aiResponse, setAiResponse] = useState(null);

  const toggleApp = useOSStore((s) => s.toggleApp);
  const addXP = useOSStore((s) => s.addXP);
  const sendMAIPrompt = useWorldStore((s) => s.sendMAIPrompt);
  const prismCorruptionLevel = useOSStore((s) => s.gameplay.prismCorruptionLevel || 0);

  const isCorrupted = prismCorruptionLevel >= 15;

  const handleCommandSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || status === 'thinking') return;

    const userQuery = prompt.trim();
    setPrompt('');
    setStatus('thinking');
    soundEngine.playMAIPulse();

    const lowerQuery = userQuery.toLowerCase();

    // Check for help with specific forms
    if (lowerQuery.includes('form') || lowerQuery.includes('register') || lowerQuery.includes('onboard') || lowerQuery.includes('welcome')) {
      setStatus('executing');
      setAiResponse({
        thought: 'Municipal Form Guidance Protocol',
        response: 'Welcome packets arrive in your Mailbox. To activate your citizen identity, open CITIZEN_REGISTRATION_FORM.osform and submit your baseline telemetry in Citizen Record (passport).',
        action: { command: 'guide', form: 'CITIZEN_REGISTRATION_FORM.osform' }
      });
      addXP(10);
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    // Check direct OS app launching commands locally for zero lag
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

    // Call Express API / WorldAuthority & Python Ollama Brain for dynamic AI responses
    try {
      useGameStore.getState().requestNPCDialogue('Mai', userQuery);
      const response = await sendMAIPrompt(userQuery, { active_app: 'Desktop' });
      setStatus('executing');
      soundEngine.playSuccess();
      setAiResponse(response);
      addXP(15);
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setAiResponse({
        thought: 'Connection Notice',
        response: 'MAI System: Connected locally to Aureline Municipal Core.',
        action: null
      });
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getStatusRing = () => {
    if (isCorrupted) {
      return 'border-pink-500 bg-black text-pink-400 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.5)]';
    }
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
    <div className="relative z-40 font-sans">
      {/* Expanded MAI Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className={`absolute bottom-14 right-0 w-96 rounded-2xl border p-4 shadow-2xl select-none text-white backdrop-blur-2xl ${
              isCorrupted
                ? 'border-pink-500/80 bg-black/95 text-pink-100 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
                : 'border-purple-500/40 bg-[#0d0724]/95 text-purple-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-xl border ${getStatusRing()}`}>
                  {isCorrupted ? <ShieldAlert size={16} className="text-pink-400" /> : <Bot size={16} />}
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-white flex items-center gap-1.5">
                    <span>MAI CIVIC ASSISTANT</span>
                    {isCorrupted && <span className="text-[9px] font-mono text-pink-400 animate-pulse font-bold">[PRISM GLITCH]</span>}
                  </div>
                  <div className="text-[9px] font-mono text-purple-300/80">AURELINE OS GUIDE & LORE ENGINE</div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold border ${
                isCorrupted
                  ? 'border-pink-500/50 bg-pink-950/80 text-pink-300'
                  : 'border-purple-500/30 bg-purple-950/60 text-purple-300'
              }`}>
                {isCorrupted ? 'SIGNAL NOISE' : status.toUpperCase()}
              </span>
            </div>

            {/* PRISM Glitch Alert if Corruption > 15 */}
            {isCorrupted && (
              <div className="mb-3 rounded-xl border border-pink-500/50 bg-pink-950/60 p-2.5 text-[11px] text-pink-200 font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                  <AlertCircle size={13} /> <span>ANOMALOUS DATA BLEED DETECTED</span>
                </div>
                <p className="text-[10px] leading-snug text-pink-300/90 font-serif">
                  "Veil frequency fluctuating at {prismCorruptionLevel}%. Sub-Conduit whispers: 'The Lightborn heir remains hidden in the municipal registries...'"
                </p>
              </div>
            )}

            {/* AI Response Display Card */}
            {aiResponse ? (
              <div className="mb-3 rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 text-xs space-y-1.5 shadow-sm font-sans">
                <div className="text-[10px] font-mono text-purple-300 flex items-center gap-1 font-bold">
                  <Sparkles size={11} className="text-purple-400" /> {aiResponse.thought}
                </div>
                <div className="text-xs leading-relaxed text-white font-medium font-serif">
                  {aiResponse.response}
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-purple-500/20 bg-purple-950/40 p-3 text-xs text-purple-200/90 leading-relaxed font-sans">
                Welcome, citizen. Ask me about Aureline Year 1000 lore, Queen Ashara's decrees, onboarding forms (`.osform`), or type <span className="font-mono text-pink-300 font-bold">"launch SpellForge"</span>.
              </div>
            )}

            {/* Quick Municipal Help Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: '📄 Registration Form', cmd: 'how do I submit registration form?' },
                { label: '🏥 Faith Medical', cmd: 'how to scan aura at faithmed.aure?' },
                { label: '👑 Queen Ashara Lore', cmd: 'who is Queen Ashara and the Lightborn?' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(chip.cmd);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/30 text-[10px] text-purple-300 hover:text-white hover:bg-purple-900 transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask MAI or enter OS command..."
                className="flex-1 rounded-xl border border-purple-500/30 bg-purple-950/60 px-3 py-2 text-xs text-white placeholder:text-purple-400/60 outline-none focus:border-purple-400 font-sans"
              />
              <button
                type="submit"
                disabled={status === 'thinking'}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition shadow-sm cursor-pointer"
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
        className={`flex h-8 items-center gap-1.5 rounded-none border px-2.5 text-xs font-semibold transition ${
          isCorrupted
            ? 'border-pink-500/70 bg-black text-pink-300 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.4)]'
            : isOpen
              ? 'border-purple-600 bg-purple-600 text-white'
              : 'border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/65'
        }`}
        title="Open MAI Civic Assistant & Help Desk"
      >
        <Bot size={14} className={isCorrupted ? 'text-pink-400' : ''} />
        <span>MAI</span>
        {isCorrupted && <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />}
      </button>
    </div>
  );
}
