import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { Code, Network, Sparkles, Cpu, MessageSquare, Palette, Search, ShieldAlert, Key } from 'lucide-react';

const SKILL_ICONS = {
  Programming: Code,
  Networking: Network,
  Spellcasting: Sparkles,
  Engineering: Cpu,
  Communication: MessageSquare,
  Creativity: Palette,
  Research: Search,
  CyberSecurity: ShieldAlert,
  Cryptography: Key,
};

const SKILL_DESCRIPTIONS = {
  Programming: { unlocks: 'New terminal commands, developer tools, NPC apps', raised: 'Coding 101, Programming Club, terminal usage' },
  Networking: { unlocks: 'New network locations, connection speeds, hidden servers', raised: 'Network Architecture class, Cyber Defense Team' },
  Spellcasting: { unlocks: 'Advanced protocol spells, improved spell accuracy and range', raised: 'Spell Society, SpellForge use, Spell Theory class' },
  Engineering: { unlocks: 'Hardware upgrades, Robotics Club content, system modification', raised: 'Engineering elective, Robotics Club' },
  Communication: { unlocks: 'Richer NPC dialogue options, gift mechanics, persuasion paths', raised: 'Comms Portal use, social DMs, relationship deepening' },
  Creativity: { unlocks: 'Theme creation, in-OS software development, widget creation', raised: 'Art Club, Interface Weaving class, Publish tab' },
  Research: { unlocks: 'Library archives, investigative quests, historical lore discovery', raised: 'History elective, Journalism Club, browser research' },
  CyberSecurity: { unlocks: 'Firewall management, threat detection, virus quarantine', raised: 'Cyber Defense Team, Data Hygiene class, combat experience' },
  Cryptography: { unlocks: 'File decryption, code-breaking, cipher puzzles', raised: 'Decrypting archives, terminal cipher commands, Research synergy' },
};

export default function AuraPassportApp() {
  const [activeTab, setActiveTab] = useState('passport'); // 'passport' | 'skills' | 'onboarding'
  const [isFlipped, setIsFlipped] = useState(false);
  const player = useOSStore((s) => s.gameplay.player);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);
  const setHouseAffiliation = useOSStore((s) => s.setHouseAffiliation);
  const completeStarterLoop = useOSStore((s) => s.completeStarterLoop);

  const starterPhases = [
    { phase: 0, title: 'Phase 0 — First Boot', desc: 'Boot MIRAVERSEOSX, read registration emails, and confirm temporary credentials.' },
    { phase: 1, title: 'Phase 1 — Identity Setup', desc: 'Activate Citizen Record, choose House placement, and accept system policies.' },
    { phase: 2, title: 'Phase 2 — Life Setup', desc: 'Confirm Dorm room assignment, activate emergency phone routing, review zero-credit ledger.' },
    { phase: 3, title: 'Phase 3 — Health & Systems', desc: 'Complete Faith Medical intake, schedule baseline aura scan, review diagnostic portal.' },
    { phase: 4, title: 'Phase 4 — Social Activation', desc: 'Attend orientation, activate Comms Portal, initialize NPC relationship vectors.' },
    { phase: 5, title: 'Phase 5 — First Free Day', desc: 'Full OS clearance unlocked! Engage in daily loop, free quests, and career shifts.' },
  ];

  const houses = [
    { name: 'Seraphima', desc: 'Noble lineage focused on diplomacy and aura purity.', color: 'from-amber-500/20 to-yellow-500/20 border-amber-300' },
    { name: 'Obsidian', desc: 'Tech-focused house dedicated to cybernetics and hacking.', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-300' },
    { name: 'Voss', desc: 'Military strategy, security protocols, and tactical warfare.', color: 'from-red-500/20 to-rose-500/20 border-red-300' },
    { name: 'Lightborn', desc: 'Ancient pre-Collapse affinity with high Veil & Spell capacity.', color: 'from-purple-500/20 to-indigo-500/20 border-purple-300' },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-[#FAF8FF] to-[#F0E9FC] p-6 text-slate-800 text-xs select-none overflow-auto">
      {/* Header with Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-purple-200/80 pb-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-purple-950">💳 Aura Passport & Student Registry</h2>
          <p className="text-[11px] text-slate-600">Official Cyacademy Record, Starter Loop & 17.2 Core Skill System</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('passport')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              activeTab === 'passport'
                ? 'bg-purple-950 text-white'
                : 'bg-purple-100/80 text-purple-950 hover:bg-purple-200'
            }`}
          >
            💳 Passport ID Card
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              activeTab === 'skills'
                ? 'bg-purple-950 text-white'
                : 'bg-purple-100/80 text-purple-950 hover:bg-purple-200'
            }`}
          >
            🧠 17.2 Core Skills Matrix
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              activeTab === 'onboarding'
                ? 'bg-purple-950 text-white'
                : 'bg-purple-100/80 text-purple-950 hover:bg-purple-200'
            }`}
          >
            🚀 Starter Loop (Phase {player.starterPhase || 0}/5)
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: PASSPORT ID CARD                                            */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'passport' && (
        <>
          <div className="flex flex-col items-center justify-center my-2">
            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              className="mb-3 rounded-xl border border-purple-300 bg-purple-100/80 px-4 py-1.5 text-xs font-bold text-purple-950 hover:bg-purple-200 transition shadow-sm"
            >
              🔄 Flip ID Card
            </button>

            <div
              className="relative w-[420px] h-[260px] cursor-pointer group"
              style={{ perspective: '1200px' }}
              onClick={() => setIsFlipped((prev) => !prev)}
              title="Click to flip ID Card"
            >
              <div
                className="w-full h-full relative transition-transform duration-700 rounded-2xl shadow-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front Side */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-200 bg-white shadow-xl flex items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <img src="/front_id_card.svg" alt="Front ID Card" className="w-full h-full object-cover" />
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-200 bg-white shadow-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <img src="/back_id_card.svg" alt="Back ID Card" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-purple-800 font-semibold">
              {isFlipped ? '◀ Showing BACK View (Click card to Flip Front)' : '▶ Showing FRONT View (Click card to Flip Back)'}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 space-y-2 shadow-sm">
              <div className="text-purple-900 font-bold text-xs uppercase tracking-wider">Student Profile</div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900">PLAYERNAME</span>
              </div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">ID Serial:</span>
                <span className="font-mono text-purple-800 font-semibold">CY-9021-X9</span>
              </div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">Level:</span>
                <span className="font-bold text-emerald-700">Level {player.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credits:</span>
                <span className="font-bold text-emerald-700">₡{player.credits}</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 space-y-2 shadow-sm">
              <div className="text-purple-900 font-bold text-xs uppercase tracking-wider">Clearance Status</div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">Aura Synced:</span>
                <span className="text-emerald-700 font-bold">● ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">Faith Medical:</span>
                <span className="text-purple-900 font-semibold">VERIFIED</span>
              </div>
              <div className="flex justify-between border-b border-purple-100 pb-1">
                <span className="text-slate-500">Lineage:</span>
                <span className="text-slate-800">Cyacademy Netrunner</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rift Access:</span>
                <span className="text-purple-700 font-bold">AUTHORIZED</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: 17.2 CORE SKILLS MATRIX                                     */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-purple-300 bg-purple-900/10 p-3 text-purple-950 font-medium leading-snug text-xs">
            🧠 <strong>Section 17.2 Core Skills System (Game Dev Doc)</strong>: Progress through 9 core skill tracks by engaging in OS activities, school classes, and club drills.
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(player.skills).map(([skillName, data]) => {
              const IconComp = SKILL_ICONS[skillName] || Code;
              const info = SKILL_DESCRIPTIONS[skillName] || { unlocks: '', raised: '' };
              const nextLevelXP = data.level * 150;
              const progressPct = Math.min(100, Math.floor((data.xp / nextLevelXP) * 100));

              return (
                <div
                  key={skillName}
                  className="rounded-xl border border-purple-200/80 bg-white/95 p-3.5 space-y-2 shadow-sm hover:border-purple-400 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-purple-950 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                        <IconComp size={15} />
                      </div>
                      <span>{skillName}</span>
                    </div>
                    <span className="rounded-md bg-purple-950 text-white font-mono text-[10px] font-bold px-2 py-0.5">
                      Lvl {data.level}
                    </span>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Progress:</span>
                      <span className="font-bold text-purple-900">{data.xp} / {nextLevelXP} XP</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-100 space-y-1 leading-tight">
                    <div>
                      <strong className="text-purple-900">Unlocks:</strong> {info.unlocks}
                    </div>
                    <div className="text-slate-400 text-[9px]">
                      <em>Raised by: {info.raised}</em>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: STARTER LOOP (PHASE 0-5)                                   */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'onboarding' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="rounded-xl border border-purple-300 bg-gradient-to-r from-purple-900 to-indigo-950 p-4 text-white space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">🚀 Section 6.4 — Starter Progression Loop</span>
              <span className="rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-[11px] font-bold px-3 py-1 border border-cyan-400/40">
                Current: Phase {player.starterPhase || 0} / 5
              </span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              Complete onboarding phases to activate core systems, confirm your identity, select a Student House, and unlock full daily clearance.
            </p>
          </div>

          {/* Phase Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-purple-950 text-xs uppercase tracking-wider">Starter Onboarding Phases</h3>
            <div className="grid grid-cols-2 gap-3">
              {starterPhases.map((sp) => {
                const isCurrent = (player.starterPhase || 0) === sp.phase;
                const isComplete = (player.starterPhase || 0) > sp.phase;

                return (
                  <div
                    key={sp.phase}
                    className={`rounded-xl border p-4 transition space-y-2 flex flex-col justify-between shadow-sm ${
                      isComplete
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : isCurrent
                        ? 'border-purple-400 bg-white ring-2 ring-purple-300 shadow-md'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{sp.title}</span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          isComplete
                            ? 'bg-emerald-200 text-emerald-900'
                            : isCurrent
                            ? 'bg-purple-950 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isComplete ? '✔ COMPLETED' : isCurrent ? '⚡ ACTIVE' : '🔒 LOCKED'}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 leading-relaxed opacity-80">{sp.desc}</p>
                    </div>

                    {isCurrent && (
                      <button
                        onClick={() => advanceStarterPhase()}
                        className="mt-2 w-full rounded-lg bg-purple-950 text-white font-bold text-xs py-2 hover:bg-purple-900 transition shadow"
                      >
                        Advance to Phase {sp.phase + 1} (+100 Credits, +50 XP)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* House Placement Selection (Phase 1) */}
          <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-950 text-xs uppercase tracking-wider">🏠 House Placement Selection (Section 6.4 Phase 1)</h3>
              <span className="text-[11px] font-bold text-purple-900">
                Selected: {player.houseAffiliation ? <span className="text-cyan-700 font-extrabold">{player.houseAffiliation}</span> : 'Unassigned'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {houses.map((h) => {
                const isSelected = player.houseAffiliation === h.name;
                return (
                  <button
                    key={h.name}
                    onClick={() => setHouseAffiliation(h.name)}
                    className={`rounded-xl border p-3 text-left transition space-y-1 bg-gradient-to-br ${h.color} ${
                      isSelected ? 'ring-2 ring-purple-950 shadow-md font-bold' : 'hover:scale-[1.02]'
                    }`}
                  >
                    <div className="font-bold text-purple-950 text-xs">{h.name}</div>
                    <div className="text-[10px] text-slate-600 leading-snug">{h.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starter Gameplay Loops Tracker */}
          <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-purple-950 text-xs uppercase tracking-wider">🔁 Section 6.4B — Starter Gameplay Loops</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'identity', label: 'Identity Loop (Citizen Record)' },
                { id: 'dorm', label: 'Dorm Loop (Rest & Room Setup)' },
                { id: 'phone', label: 'Phone & Comms Loop (Contacts)' },
                { id: 'medical', label: 'Faith Medical Loop (Aura Scan)' },
                { id: 'credit', label: 'Starter Credit Loop (Board Tasks)' },
                { id: 'pulse', label: 'Pulse Loop (Social Feed)' },
              ].map((loop) => {
                const isDone = (player.starterCompletedLoops || []).includes(loop.id);
                return (
                  <button
                    key={loop.id}
                    onClick={() => completeStarterLoop(loop.id)}
                    className={`rounded-lg p-2.5 border text-left text-[11px] transition flex items-center justify-between ${
                      isDone
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 bg-slate-50 hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    <span>{loop.label}</span>
                    <span className="text-[10px]">{isDone ? '✔' : '＋ Log'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
