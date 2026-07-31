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
  const [activeTab, setActiveTab] = useState('passport'); // 'passport' | 'skills'
  const [isFlipped, setIsFlipped] = useState(false);
  const player = useOSStore((s) => s.gameplay.player);

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-[#FAF8FF] to-[#F0E9FC] p-6 text-slate-800 text-xs select-none overflow-auto">
      {/* Header with Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-purple-200/80 pb-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-purple-950">💳 Aura Passport & Student Registry</h2>
          <p className="text-[11px] text-slate-600">Official Cyacademy Record & 17.2 Core Skill System</p>
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
    </div>
  );
}
