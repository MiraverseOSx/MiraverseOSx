import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import {
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  Lock,
  Radio,
  Flame,
  Activity,
  Key
} from 'lucide-react';

export default function PhoneWidget() {
  const [activeTab, setActiveTab] = useState('messenger'); // 'messenger' | 'passport' | 'tasks' | 'spellforge' | 'radio' | 'camera'
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCommsContact, setActiveCommsContact] = useState('Dr. Maelis Voss');
  const [spellSelectedElement, setSpellSelectedElement] = useState(null);
  const [spellSelectedUtility, setSpellSelectedUtility] = useState(null);
  const [spellResult, setSpellResult] = useState('');

  const [npcMessages, setNpcMessages] = useState({
    'Dr. Maelis Voss': [
      { id: 1, text: 'Student, verify your Aethercore frequency before entry into Lab 4.', time: '09:12' },
      { id: 2, text: 'The Lightborn aura logic indicates a minor resonance shift in your record.', time: '09:15' },
    ],
    'Dean Cassian Rook': [
      { id: 3, text: 'Welcome to Cyacademy. Your provisional registration is active.', time: '08:30' },
      { id: 4, text: 'Remember to complete your daily Aura Passport check-in on the Bulletin Node.', time: '08:35' },
    ],
    'Agent Mara Quell': [
      { id: 5, text: 'DGA Field Alert: Patrol routes in Sector 7 are under heightened monitoring.', time: '09:00' },
      { id: 6, text: 'Keep your netrunner tools ready in case of PRISM corruption spikes.', time: '09:05' },
    ],
    'Archivist Selene': [
      { id: 7, text: 'Purge-era genealogy records have been logged in the restricted archives.', time: '08:45' },
    ],
  });
  const [chatInput, setChatInput] = useState('');

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const purgePrismCorruption = useOSStore((s) => s.purgePrismCorruption);

  const handleSendNpcMessage = (e) => {
    if (e.key !== 'Enter' || !chatInput.trim()) return;
    setNpcMessages((prev) => ({
      ...prev,
      [activeCommsContact]: [
        ...(prev[activeCommsContact] || []),
        { id: Date.now(), text: chatInput.trim(), time: 'Just now', isPlayer: true },
      ],
    }));
    setChatInput('');
  };

  const handleSynthesizeSpell = () => {
    if (!spellSelectedElement || !spellSelectedUtility) {
      setSpellResult('⚠️ Select 1 Element & 1 Utility.');
      return;
    }
    const spellName = `${spellSelectedElement} ${spellSelectedUtility}`;
    addCredits(75);
    addXP(40);
    purgePrismCorruption(1.5);
    setSpellResult(`✨ Synthesized [${spellName}]! +75 ₡, +40 XP.`);
    setSpellSelectedElement(null);
    setSpellSelectedUtility(null);
  };

  return (
    <div className="w-[280px] h-[520px] rounded-2xl border border-white/60 bg-[#F4F2F9] y2k-window-shadow select-none flex flex-col overflow-hidden text-slate-800">
      {/* Flat Header Strip matching OS windows */}
      <div className="flex h-8 shrink-0 items-center justify-between px-3 bg-[#9DA9CB] text-white font-sans text-xs font-semibold tracking-wide">
        <span className="flex items-center gap-1.5">
          <Radio size={14} className="text-white" /> AETHERIC DECK PANEL
        </span>
        <span className="text-[10px] text-white/80 font-mono">STAMP: 28.07</span>
      </div>

      {/* Flat Navigation Tabs */}
      <div className="flex bg-[#E6E0F2] border-b border-purple-200/80 p-1 gap-1 overflow-x-auto text-[10px] font-semibold text-slate-700">
        <button
          onClick={() => setActiveTab('messenger')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            activeTab === 'messenger' ? 'bg-purple-950 text-white shadow-sm' : 'hover:bg-white/60'
          }`}
        >
          <MessageSquare size={12} /> Comms
        </button>

        <button
          onClick={() => setActiveTab('passport')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            activeTab === 'passport' ? 'bg-purple-950 text-white shadow-sm' : 'hover:bg-white/60'
          }`}
        >
          <Key size={12} /> ID
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            activeTab === 'tasks' ? 'bg-purple-950 text-white shadow-sm' : 'hover:bg-white/60'
          }`}
        >
          <ShieldCheck size={12} /> Tasks
        </button>

        <button
          onClick={() => setActiveTab('spellforge')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            activeTab === 'spellforge' ? 'bg-purple-950 text-white shadow-sm' : 'hover:bg-white/60'
          }`}
        >
          <Flame size={12} /> Forge
        </button>

        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            activeTab === 'radio' ? 'bg-purple-950 text-white shadow-sm' : 'hover:bg-white/60'
          }`}
        >
          <Activity size={12} /> Radio
        </button>
      </div>

      {/* Flat Main Body Panel */}
      <div className="flex-1 p-3 bg-[#FAFAFC] flex flex-col justify-between overflow-hidden text-xs">
        {/* MESSENGER TAB */}
        {activeTab === 'messenger' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200">
              {Object.keys(npcMessages).map((npc) => (
                <button
                  key={npc}
                  onClick={() => setActiveCommsContact(npc)}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap transition ${
                    activeCommsContact === npc
                      ? 'bg-purple-800 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {npc}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto space-y-1.5 my-2 pr-1">
              {(npcMessages[activeCommsContact] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-2 border space-y-0.5 ${
                    msg.isPlayer
                      ? 'bg-purple-100 border-purple-300 ml-3'
                      : 'bg-white border-slate-200 mr-3 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-700">
                    <span>{msg.isPlayer ? 'YOU' : activeCommsContact}</span>
                    <span className="text-slate-400 font-normal">{msg.time}</span>
                  </div>
                  <div className="text-slate-800 text-[10px] leading-snug">{msg.text}</div>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleSendNpcMessage}
              placeholder={`Message ${activeCommsContact}...`}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-purple-600 shadow-sm"
            />
          </div>
        )}

        {/* PASSPORT ID TAB */}
        {activeTab === 'passport' && (
          <div className="h-full flex flex-col justify-between">
            <div className="rounded-xl border border-purple-200 bg-white p-3 space-y-2 text-[10px] shadow-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1 font-semibold">
                <span className="text-slate-500">Student:</span>
                <span className="text-slate-900 font-bold">PLAYERNAME</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 font-semibold">
                <span className="text-slate-500">Serial ID:</span>
                <span className="font-mono text-purple-700 font-bold">CY-9021-X9</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 font-semibold">
                <span className="text-slate-500">Level / XP:</span>
                <span className="text-emerald-700 font-bold">Level {player.level} ({player.xp} XP)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 font-semibold">
                <span className="text-slate-500">Credits:</span>
                <span className="text-emerald-700 font-bold">₡{player.credits}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Aura Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> VERIFIED
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 p-2 text-center font-mono text-[9px] text-white font-bold tracking-widest border border-slate-800">
              ||| | |||| ||| |||| | ||||| CY-9021
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-2 my-1 overflow-auto text-[10px]">
              <div className="rounded-xl border border-purple-200 bg-white p-2.5 space-y-1 shadow-sm">
                <div className="font-bold text-purple-950 flex items-center gap-1">
                  <Zap size={12} className="text-purple-600" /> Sector 7 Subnet Drill
                </div>
                <div className="text-slate-600">Monitor net nodes for PRISM corruption.</div>
                <div className="text-emerald-700 font-bold">Reward: +200 ₡, +100 XP</div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-2.5 space-y-1 shadow-sm">
                <div className="font-bold text-emerald-950 flex items-center gap-1">
                  <Lock size={12} className="text-emerald-600" /> Faith Medical Intake Scan
                </div>
                <div className="text-slate-600">Verify student aura health records.</div>
                <div className="text-emerald-700 font-bold">Reward: +150 ₡, +75 XP</div>
              </div>
            </div>
          </div>
        )}

        {/* SPELLFORGE TAB */}
        {activeTab === 'spellforge' && (
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-2 text-[10px]">
              <div>
                <div className="text-slate-500 font-semibold mb-1">Select Element:</div>
                <div className="grid grid-cols-3 gap-1">
                  {['Firewall', 'Cryo', 'Encryption'].map((el) => (
                    <button
                      key={el}
                      onClick={() => setSpellSelectedElement(el)}
                      className={`p-1.5 rounded-lg border font-semibold transition ${
                        spellSelectedElement === el
                          ? 'border-purple-600 bg-purple-100 text-purple-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {el}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Select Utility:</div>
                <div className="grid grid-cols-3 gap-1">
                  {['Routing', 'Anchor', 'Pulse'].map((ut) => (
                    <button
                      key={ut}
                      onClick={() => setSpellSelectedUtility(ut)}
                      className={`p-1.5 rounded-lg border font-semibold transition ${
                        spellSelectedUtility === ut
                          ? 'border-cyan-600 bg-cyan-100 text-cyan-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ut}
                    </button>
                  ))}
                </div>
              </div>

              {spellResult && (
                <div className="rounded-lg bg-purple-50 border border-purple-300 p-2 text-purple-950 font-semibold text-[9px]">
                  {spellResult}
                </div>
              )}
            </div>

            <button
              onClick={handleSynthesizeSpell}
              className="w-full rounded-xl border border-purple-300 bg-purple-950 py-2 font-bold text-white hover:bg-purple-900 transition shadow-sm text-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-300" /> Synthesize Spell
            </button>
          </div>
        )}

        {/* RADIO TAB */}
        {activeTab === 'radio' && (
          <div className="space-y-3 bg-white rounded-xl p-3 border border-slate-200 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800">
              <Activity size={28} className={isPlaying ? 'animate-pulse' : ''} />
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-slate-900">Aureline Sprawl Track #04</div>
              <div className="text-[9px] text-slate-500">Cyacademy Student Mesh</div>
            </div>

            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="w-10 h-10 mx-auto rounded-full bg-purple-950 text-white flex items-center justify-center font-bold hover:bg-purple-900 transition shadow-sm"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
