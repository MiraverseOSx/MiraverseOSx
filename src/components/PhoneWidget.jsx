import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { INITIAL_SMS_THREADS, INITIAL_VOICEMAILS, INITIAL_EVIDENCE_ITEMS } from '../data/phoneData';
import {
  MessageSquare,
  Camera,
  AlertOctagon,
  Pin,
  ChevronLeft,
  Heart,
  SkipBack,
  SkipForward,
  Sparkles,
  ShieldCheck,
  Search,
  Music,
  UserCheck,
  Flame,
  Phone,
  Volume2
} from 'lucide-react';

export default function PhoneWidget() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Social Messages Data from phoneData.js
  const [smsThreads, setSmsThreads] = useState(INITIAL_SMS_THREADS);
  const [activeSmsContact, setActiveSmsContact] = useState('Aelita');
  const [smsInput, setSmsInput] = useState('');

  // Calls & Voicemail Data from phoneData.js
  const [voicemails] = useState(INITIAL_VOICEMAILS);

  // Evidence Items from phoneData.js
  const [evidenceItems, setEvidenceItems] = useState(INITIAL_EVIDENCE_ITEMS);

  // SpellForge State
  const [spellElement, setSpellElement] = useState(null);
  const [spellUtility, setSpellUtility] = useState(null);
  const [spellResult, setSpellResult] = useState('');

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const purgePrismCorruption = useOSStore((s) => s.purgePrismCorruption);

  const handleSendSms = (e) => {
    if (e.key !== 'Enter' || !smsInput.trim()) return;
    setSmsThreads((prev) => ({
      ...prev,
      [activeSmsContact]: [
        ...(prev[activeSmsContact] || []),
        { id: Date.now(), sender: 'You', text: smsInput.trim(), time: 'Just now' },
      ],
    }));
    setSmsInput('');
  };

  const handleCaptureEvidence = () => {
    const newId = Date.now();
    setEvidenceItems((prev) => [
      ...prev,
      { id: newId, title: `Snapshot #${prev.length + 1}`, type: 'photo', tag: 'Aura Lens', note: 'Captured via Camera Lens' }
    ]);
    addCredits(50);
    addXP(25);
    alert('📷 Snapshot captured & pinned to Evidence Board! (+50 ₡, +25 XP)');
  };

  const handleSynthesizeSpell = () => {
    if (!spellElement || !spellUtility) {
      setSpellResult('⚠️ Select 1 Element & 1 Utility.');
      return;
    }
    const spellName = `${spellElement} ${spellUtility}`;
    addCredits(75);
    addXP(40);
    purgePrismCorruption(1.5);
    setSpellResult(`✨ Synthesized [${spellName}]! +75 ₡, +40 XP.`);
    setSpellElement(null);
    setSpellUtility(null);
  };

  return (
    <div
      className="w-[320px] h-[580px] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl flex flex-col justify-between p-3 select-none text-white relative font-sans overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=600&auto=format&fit=crop')`,
      }}
    >
      {/* Twilight Dusk Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C183B]/70 via-[#2E1C4E]/50 to-[#120E2E]/80 pointer-events-none" />

      {/* ------------------------------------------------------------------ */}
      {/* TOP STATUS BAR & SPEAKER NOTCH                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 flex justify-between items-center text-[10px] font-mono font-bold text-pink-200/90 px-2 py-0.5 border-b border-pink-300/20 shrink-0">
        <span>09:41</span>
        <div className="h-2.5 w-16 bg-purple-950/90 rounded-full border border-pink-300/30" />
        <div className="flex gap-1.5 items-center">
          <span>📶 5G</span>
          <span>🔋 100%</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PHONE SCREEN CONTENT AREA                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 flex-1 my-2 flex flex-col justify-between overflow-hidden">
        {/* HOME SCREEN */}
        {activeScreen === 'home' && (
          <div className="h-full flex flex-col justify-between space-y-2 overflow-y-auto pr-0.5">
            {/* TOP FROSTED DUSK GLASS WIDGET CONTAINER */}
            <div className="rounded-3xl border border-pink-300/30 bg-[#2D2359]/35 backdrop-blur-2xl p-3 space-y-2.5 shadow-[0_0_25px_rgba(192,132,252,0.25)]">
              {/* Music Player Card */}
              <div className="rounded-2xl border border-pink-200/25 bg-[#3B255D]/40 p-2.5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-11 h-11 rounded-xl bg-cover bg-center border border-pink-300/40 shadow-sm shrink-0"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop')`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono font-bold text-pink-200 truncate">
                      ☆ ✧::TWILIGHT DUSK #04::☽
                    </div>
                    <div className="text-[8px] text-purple-200/80 truncate">Cyacademy Dusk Lo-Fi</div>
                  </div>

                  <div className="flex items-center gap-1.5 text-pink-200">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:scale-110 transition">
                      <SkipBack size={12} />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-pink-400 hover:scale-110 transition">
                      <Heart size={13} className="fill-pink-400" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:scale-110 transition">
                      <SkipForward size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-purple-900/40 h-1 rounded-full overflow-hidden">
                    <div className="bg-pink-400 h-full w-2/3 rounded-full shadow-[0_0_8px_#F472B6]" />
                  </div>
                </div>
              </div>

              {/* Weather & Aura Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-pink-300/25 bg-[#3B255D]/30 p-2 flex items-center gap-2 text-[9px] font-mono">
                  <span className="text-base">🌆</span>
                  <div>
                    <div className="font-bold text-pink-100">01/07 Wednesday</div>
                    <div className="text-purple-200/80 text-[8px]">Twilight Dusk 🌙</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-pink-300/25 bg-[#3B255D]/30 p-2 flex flex-col justify-between text-[9px] font-mono">
                  <div className="flex justify-between items-center text-pink-200">
                    <span className="font-bold">Aura: 100% ⚡</span>
                    <Sparkles size={11} className="text-amber-300 animate-spin" />
                  </div>
                  <div className="text-[8px] text-pink-200/80">✧* 🎼 ฅ*•ω•*ฅ 🌆</div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: 4x2 SQUIRCLE APP GRID */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Messages */}
              <button
                onClick={() => setActiveScreen('messages')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-pink-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-pink-200 shadow z-20">
                  4
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-pink-300 group-hover:scale-105 transition">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">messages</span>
              </button>

              {/* Phone (Calls) */}
              <button
                onClick={() => setActiveScreen('phone')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-emerald-200 shadow z-20">
                  2
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-emerald-300 group-hover:scale-105 transition">
                  <Phone size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">phone</span>
              </button>

              {/* Passport */}
              <button
                onClick={() => setActiveScreen('passport')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-purple-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-purple-200 shadow z-20">
                  1
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
                  <UserCheck size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">passport</span>
              </button>

              {/* Missions */}
              <button
                onClick={() => setActiveScreen('missions')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-cyan-200 shadow z-20">
                  8
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-cyan-300 group-hover:scale-105 transition">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">missions</span>
              </button>

              {/* SpellForge */}
              <button
                onClick={() => setActiveScreen('spellforge')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-fuchsia-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-fuchsia-200 shadow z-20">
                  3
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-fuchsia-300 group-hover:scale-105 transition">
                  <Flame size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">spellforge</span>
              </button>

              {/* Evidence */}
              <button
                onClick={() => setActiveScreen('evidence')}
                className="flex flex-col items-center group relative"
              >
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-amber-200 shadow z-20">
                  5
                </span>
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-amber-300 group-hover:scale-105 transition">
                  <Pin size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">evidence</span>
              </button>

              {/* Media */}
              <button
                onClick={() => setActiveScreen('media')}
                className="flex flex-col items-center group"
              >
                <div className="h-11 w-11 rounded-2xl bg-[#3B255D]/40 backdrop-blur-xl border border-pink-300/30 shadow-md flex items-center justify-center text-pink-300 group-hover:scale-105 transition">
                  <Music size={18} />
                </div>
                <span className="text-[8px] font-medium text-pink-100/90 mt-1">media</span>
              </button>

              {/* Emergency */}
              <button
                onClick={() => setActiveScreen('emergency')}
                className="flex flex-col items-center group"
              >
                <div className="h-11 w-11 rounded-2xl bg-red-600/80 backdrop-blur-xl border border-red-400 shadow-md flex items-center justify-center text-white group-hover:scale-105 transition animate-pulse">
                  <AlertOctagon size={18} />
                </div>
                <span className="text-[8px] font-bold text-red-300 mt-1">emergency</span>
              </button>
            </div>

            {/* BOTTOM SEARCH PILL */}
            <div className="pt-1">
              <div className="w-full rounded-full border border-pink-300/30 bg-[#2D2359]/40 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 text-[9px] font-mono text-pink-200">
                <Search size={11} className="text-pink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Cyacademy dusk feed..."
                  className="w-full bg-transparent outline-none text-pink-100 text-[9px]"
                />
              </div>
            </div>

            {/* BOTTOM DOCK BAR */}
            <div className="rounded-2xl border border-pink-300/30 bg-[#2D2359]/50 backdrop-blur-2xl p-1.5 flex justify-around items-center">
              <button onClick={() => setActiveScreen('messages')} className="p-1 text-pink-300 hover:scale-110 transition">
                <MessageSquare size={16} />
              </button>
              <button onClick={() => setActiveScreen('phone')} className="p-1 text-emerald-300 hover:scale-110 transition">
                <Phone size={16} />
              </button>
              <button onClick={() => setActiveScreen('passport')} className="p-1 text-purple-300 hover:scale-110 transition">
                <UserCheck size={16} />
              </button>
              <button onClick={() => setActiveScreen('spellforge')} className="p-1 text-fuchsia-300 hover:scale-110 transition">
                <Flame size={16} />
              </button>
            </div>
          </div>
        )}

        {/* FULL-SCREEN APP VIEWS */}
        {activeScreen !== 'home' && (
          <div className="h-full flex flex-col justify-between bg-[#1F173B]/95 backdrop-blur-2xl rounded-2xl p-3 border border-pink-300/30 text-xs">
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-pink-300/20 pb-1.5 mb-1 shrink-0 font-mono">
              <button
                onClick={() => setActiveScreen('home')}
                className="flex items-center gap-1 text-[10px] font-bold text-pink-300 hover:text-white transition"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <span className="font-bold text-[10px] uppercase tracking-wide text-pink-200">
                {activeScreen}
              </span>
              <div className="w-4" />
            </div>

            {/* MESSAGES VIEW */}
            {activeScreen === 'messages' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden font-mono text-[10px]">
                <div className="flex gap-1 overflow-x-auto py-1 border-b border-white/10 text-[9px]">
                  {Object.keys(smsThreads).map((contact) => (
                    <button
                      key={contact}
                      onClick={() => setActiveSmsContact(contact)}
                      className={`px-2 py-0.5 rounded-full transition ${
                        activeSmsContact === contact ? 'bg-pink-500 text-slate-950 font-bold' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {contact}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto space-y-1.5 my-1.5 pr-1">
                  {(smsThreads[activeSmsContact] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-2 border space-y-0.5 ${
                        msg.sender === 'You' ? 'bg-purple-950/70 border-pink-400/40 ml-3' : 'bg-slate-950/70 border-white/10 mr-3'
                      }`}
                    >
                      <div className="flex justify-between text-[9px]">
                        <span className="font-bold text-pink-300">{msg.sender}</span>
                        <span className="text-white/40">{msg.time}</span>
                      </div>
                      <div className="text-[9px] text-white/90">{msg.text}</div>
                    </div>
                  ))}
                </div>

                {/* Vector Response Choices */}
                <div className="py-1 border-t border-white/10 space-y-1">
                  <div className="text-[8px] font-bold text-pink-300">Quick Response:</div>
                  <div className="flex gap-1 overflow-x-auto text-[8px]">
                    <button
                      onClick={() => {
                        const npcKey = activeSmsContact.toLowerCase().split(' ')[0];
                        useOSStore.getState().updateNPCVector(npcKey === 'dr.' ? 'voss' : npcKey, 'trust', 10);
                        setSmsThreads((prev) => ({
                          ...prev,
                          [activeSmsContact]: [
                            ...(prev[activeSmsContact] || []),
                            { id: Date.now(), sender: 'You', text: 'Understood. On my way.', time: 'Just now' },
                          ],
                        }));
                      }}
                      className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/40 font-bold"
                    >
                      🤝 +Trust ("Understood. On my way.")
                    </button>

                    <button
                      onClick={() => {
                        const npcKey = activeSmsContact.toLowerCase().split(' ')[0];
                        useOSStore.getState().updateNPCVector(npcKey === 'dr.' ? 'voss' : npcKey, 'sync', 10);
                        setSmsThreads((prev) => ({
                          ...prev,
                          [activeSmsContact]: [
                            ...(prev[activeSmsContact] || []),
                            { id: Date.now(), sender: 'You', text: 'Ready to sync frequencies!', time: 'Just now' },
                          ],
                        }));
                      }}
                      className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/40 font-bold"
                    >
                      ⚡ +Sync ("Ready to sync!")
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  onKeyDown={handleSendSms}
                  placeholder={`Message ${activeSmsContact}...`}
                  className="w-full rounded-lg border border-pink-400/40 bg-black/60 px-2 py-1.5 text-[10px] text-white outline-none font-mono"
                />
              </div>
            )}

            {/* PHONE CALLS & VOICEMAIL VIEW */}
            {activeScreen === 'phone' && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="flex-1 overflow-auto space-y-2 pr-1">
                  <div className="text-[10px] font-bold text-emerald-300 mb-1">📼 Voicemails & Audio Logs:</div>
                  {voicemails.map((vm) => (
                    <div key={vm.id} className="rounded-lg border border-emerald-400/30 bg-slate-950/80 p-2 space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="font-bold text-emerald-300">{vm.sender}</span>
                        <span className="text-white/40">{vm.time} ({vm.duration})</span>
                      </div>
                      <div className="text-[9px] text-white/80 leading-snug">{vm.text}</div>
                      <button
                        onClick={() => alert(`▶ Playing voicemail from ${vm.sender}...`)}
                        className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        <Volume2 size={11} /> Play Voicemail
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSPORT VIEW */}
            {activeScreen === 'passport' && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="rounded-xl border border-pink-300/40 bg-gradient-to-br from-purple-950/80 to-slate-950/90 p-3 space-y-2 my-auto">
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/60">Student:</span>
                    <span className="font-bold text-white">PLAYERNAME</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/60">Aura Serial:</span>
                    <span className="font-mono text-pink-300">CY-9021-X9</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/60">Level / XP:</span>
                    <span className="font-bold text-emerald-400">Level {player.level} ({player.xp} XP)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/60">Credits:</span>
                    <span className="font-bold text-emerald-400">₡{player.credits}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-2 text-center font-mono text-[9px] text-black font-bold tracking-widest border border-pink-300">
                  ||| | |||| ||| |||| | ||||| CY-9021
                </div>
              </div>
            )}

            {/* MISSIONS VIEW */}
            {activeScreen === 'missions' && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="space-y-2 my-auto">
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-2.5 space-y-1">
                    <div className="font-bold text-emerald-300">🛡️ Sector 7 Subnet Patrol</div>
                    <div className="text-white/80">Scan perimeter net nodes for PRISM corruption.</div>
                    <div className="text-emerald-400 font-bold">Reward: +200 ₡, +100 XP</div>
                  </div>

                  <div className="rounded-xl border border-purple-400/30 bg-purple-950/40 p-2.5 space-y-1">
                    <div className="font-bold text-purple-300">🏥 Faith Medical Intake Scan</div>
                    <div className="text-white/80">Verify student aura health records.</div>
                    <div className="text-emerald-400 font-bold">Reward: +150 ₡, +75 XP</div>
                  </div>
                </div>
              </div>
            )}

            {/* SPELLFORGE VIEW */}
            {activeScreen === 'spellforge' && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="space-y-2 my-auto">
                  <div>
                    <div className="text-white/50 mb-1">Select Element:</div>
                    <div className="grid grid-cols-3 gap-1">
                      {['Firewall', 'Cryo', 'Encryption'].map((el) => (
                        <button
                          key={el}
                          onClick={() => setSpellElement(el)}
                          className={`p-1.5 rounded-lg border font-semibold transition ${
                            spellElement === el
                              ? 'border-pink-400 bg-pink-500/30 text-white'
                              : 'border-white/10 bg-white/5 text-white/70'
                          }`}
                        >
                          {el}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/50 mb-1">Select Utility:</div>
                    <div className="grid grid-cols-3 gap-1">
                      {['Routing', 'Anchor', 'Pulse'].map((ut) => (
                        <button
                          key={ut}
                          onClick={() => setSpellUtility(ut)}
                          className={`p-1.5 rounded-lg border font-semibold transition ${
                            spellUtility === ut
                              ? 'border-purple-400 bg-purple-500/30 text-white'
                              : 'border-white/10 bg-white/5 text-white/70'
                          }`}
                        >
                          {ut}
                        </button>
                      ))}
                    </div>
                  </div>

                  {spellResult && (
                    <div className="rounded-lg bg-slate-950 border border-pink-400/40 p-2 text-pink-300 text-[9px]">
                      {spellResult}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSynthesizeSpell}
                  className="w-full rounded-xl border border-pink-400 bg-pink-500/20 py-2 font-bold text-pink-300 hover:bg-pink-500/40 transition"
                >
                  [ SYNTHESIZE SPELL ]
                </button>
              </div>
            )}

            {/* EVIDENCE VIEW */}
            {activeScreen === 'evidence' && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="flex-1 overflow-auto space-y-1.5 my-1 pr-1">
                  {evidenceItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-amber-400/30 bg-slate-950/80 p-2 space-y-0.5">
                      <div className="flex justify-between items-center font-bold text-amber-300">
                        <span>📌 {item.title}</span>
                        <span className="text-[8px] bg-amber-400/20 px-1 py-0.5 rounded text-amber-200">{item.tag}</span>
                      </div>
                      <div className="text-[9px] text-white/80">{item.note}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCaptureEvidence}
                  className="w-full rounded-xl border border-pink-400 bg-pink-500/20 py-1.5 font-bold text-pink-300 hover:bg-pink-500/40 transition text-[10px]"
                >
                  <Camera size={12} className="inline mr-1" /> Capture Evidence
                </button>
              </div>
            )}

            {/* MEDIA VIEW */}
            {activeScreen === 'media' && (
              <div className="flex-1 flex flex-col justify-between text-center font-mono my-auto space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-900/60 border border-pink-400/40 flex items-center justify-center text-pink-300">
                  <Music size={28} />
                </div>
                <div className="text-white font-bold">Twilight Dusk Synth Stream</div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-full rounded-xl border border-pink-400 bg-pink-500/20 py-2 font-bold text-pink-300 hover:bg-pink-500/40 transition"
                >
                  {isPlaying ? 'Pause Radio Stream' : 'Play Radio Stream'}
                </button>
              </div>
            )}

            {/* EMERGENCY VIEW */}
            {activeScreen === 'emergency' && (
              <div className="flex-1 flex flex-col justify-between font-mono space-y-2 my-auto">
                <button
                  onClick={() => alert('🚨 Emergency Call Dispatched to Faith Medical Group!')}
                  className="w-full rounded-xl border border-red-400 bg-red-600/30 p-2.5 text-left font-bold text-white hover:bg-red-600/50 transition"
                >
                  🏥 Faith Medical Emergency
                </button>
                <button
                  onClick={() => alert('🚨 Tactical Lockdown Dispatched to DGA Unit!')}
                  className="w-full rounded-xl border border-red-400 bg-red-600/30 p-2.5 text-left font-bold text-white hover:bg-red-600/50 transition"
                >
                  🛡️ DGA Response Unit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM HOME INDICATOR BAR                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 flex justify-center pb-0.5 shrink-0">
        <button
          onClick={() => setActiveScreen('home')}
          className="h-1.5 w-20 bg-pink-200/80 rounded-full hover:bg-white transition cursor-pointer"
          title="Return to Home Screen"
        />
      </div>
    </div>
  );
}
