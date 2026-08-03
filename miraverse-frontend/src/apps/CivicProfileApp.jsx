import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import {
  User, Shield, Sparkles, BookOpen, Package, Home, Award, CheckCircle2,
  Code, Network, Cpu, MessageSquare, Palette, Search, ShieldAlert, Key, Zap, Lock
} from 'lucide-react';
import Button from '../components/ui/button';

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

const DORM_DECOR_ITEMS = [
  { id: 'DEC-01', name: 'Celestial Holo-Lamp', comfort: 15, icon: '💡', desc: 'Emits a soft ambient lavender light pad.' },
  { id: 'DEC-02', name: 'AETHERCORE Sub-Conduit Poster', comfort: 20, icon: '🖼️', desc: 'Pre-Collapse architectural CAD schematic.' },
  { id: 'DEC-03', name: 'Retro Synth Terminal', comfort: 25, icon: '🎹', desc: 'Synthesizes Y2K soundwaves in sleep mode.' },
];

export default function CivicProfileApp() {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'inventory' | 'skills' | 'clubs' | 'dorm'
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDecor, setSelectedDecor] = useState(null);

  const player = useOSStore((s) => s.gameplay.player);
  const setHouseAffiliation = useOSStore((s) => s.setHouseAffiliation);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);
  const healAura = useOSStore((s) => s.healAura);

  const pathChoice = player.pathChoice || 'none'; // 'none' | 'student' | 'freelancer'
  const isStudent = pathChoice === 'student';
  const isFreelancer = pathChoice === 'freelancer';

  const houses = [
    { name: 'Seraphima', desc: 'Noble lineage focused on diplomacy and aura purity.', color: 'from-[#FAF8FF] to-[#F0E9FC] border-purple-300' },
    { name: 'Obsidian', desc: 'Tech-focused house dedicated to cybernetics and hacking.', color: 'from-[#F0F8FF] to-[#E6F2FF] border-[#8c97d6]' },
    { name: 'Voss', desc: 'Military strategy, security protocols, and tactical warfare.', color: 'from-[#FFF0F2] to-[#FFE6E9] border-rose-300' },
    { name: 'Lightborn', desc: 'Ancient pre-Collapse affinity with high Veil & Spell capacity.', color: 'from-[#FAF6FF] to-[#EFF0FF] border-indigo-300' },
  ];

  const clubs = [
    { id: 'c-robotics', name: 'Robotics & Hardware Club', req: 'Engineering Lv.1', desc: 'Build autonomous cyber-drones and hardware firmware.', skills: 'Engineering & Programming' },
    { id: 'c-cyberdef', name: 'Cyber Defense Team', req: 'Networking Lv.1', desc: 'Compete in regional CTF hackathons and firewall defense.', skills: 'Networking & CyberSecurity' },
    { id: 'c-spellsoc', name: 'Spell Society', req: 'Spellcasting Lv.1', desc: 'Research protocol spellcrafting and Veil resonance.', skills: 'Spellcasting & Cryptography' },
    { id: 'c-art', name: 'Interface Weaving & Art', req: 'Creativity Lv.1', desc: 'Synthesize custom Y2K themes and OS desktop widgets.', skills: 'Creativity & Communication' },
  ];

  const handleChoosePath = (choice) => {
    useOSStore.setState((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          pathChoice: choice,
          starterPhase: Math.max(1, state.gameplay.player.starterPhase),
        },
      },
    }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241] p-5 text-xs select-none overflow-auto">
      {/* App Header & Sub-Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-300/80 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1d2650] font-serif-y2k flex items-center gap-2">
            <User size={18} className="text-[#5f6ab0]" /> CIVIC PROFILE & CITIZEN RECORD
          </h2>
          <p className="text-[11px] text-slate-500">Official Identity Badge, Backpack Inventory & Cycademy Student Registry</p>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-1 bg-white/70 border border-slate-300/80 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'record' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
            }`}
          >
            🆔 Record
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inventory' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
            }`}
          >
            🎒 Inventory
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'skills' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
            }`}
          >
            ⚡ Skills (9)
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'clubs' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
            }`}
          >
            🏛️ Clubs
          </button>
          <button
            onClick={() => setActiveTab('dorm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dorm' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
            }`}
          >
            🏠 Dorm
          </button>
        </div>
      </div>

      {/* ── TAB 1: CITIZEN RECORD & PATH SELECTION ── */}
      {activeTab === 'record' && (
        <div className="space-y-4">
          {/* Path Choice Selector Banner if not yet chosen */}
          {pathChoice === 'none' && (
            <div className="rounded-xl border border-indigo-300 bg-indigo-50/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                    <Zap size={14} className="text-[#5f6ab0]" /> PHASE 1: SELECT YOUR CITIZEN LIFE PATH
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    You are currently a Fresh Provisional Citizen. Choose whether to apply for Cycademy Student Clearance or remain an Independent Freelancer & Netrunner.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleChoosePath('student')}
                  className="group rounded-xl border border-[#8c97d6] bg-white p-3 text-left hover:bg-[#eef0fb] transition shadow-sm"
                >
                  <div className="font-bold text-xs text-[#1d2650] flex items-center gap-1.5">
                    🎓 Path A: Cycademy Student Track
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Submit Student Entrance Application, receive Dean Rook's acceptance letter, join a Student House, and unlock Cycademy Clubs & Elective Classes.
                  </p>
                </button>

                <button
                  onClick={() => handleChoosePath('freelancer')}
                  className="group rounded-xl border border-slate-300 bg-white p-3 text-left hover:bg-[#f2f3fb] transition shadow-sm"
                >
                  <div className="font-bold text-xs text-[#1d2650] flex items-center gap-1.5">
                    💻 Path B: Independent Freelancer & Netrunner
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Skip Cycademy application! Register as a Free Citizen, accept odd-jobs, build VectorNet & DGA faction reputation, and craft tech independently.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Flip Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              {!isFlipped ? (
                <div className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8c97d6] to-[#5f6ab0] flex items-center justify-center font-bold text-white text-lg">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1d2650]">{player.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {isStudent ? `Cycademy Student • ${player.houseAffiliation || 'Unsorted'}` : isFreelancer ? 'Independent Freelancer & Netrunner' : 'Fresh Provisional Citizen'}
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-[#e9ebf6] px-2 py-1 font-mono text-[10px] font-bold text-[#5f6ab0]">
                      LVL {player.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#FAFAFC] p-2 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Credits</div>
                      <div className="font-bold text-[#1d2650] font-mono">₡{player.credits}</div>
                    </div>
                    <div className="rounded-lg bg-[#FAFAFC] p-2 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Aura Health</div>
                      <div className="font-bold text-emerald-700 font-mono">{player.auraHealth}%</div>
                    </div>
                    <div className="rounded-lg bg-[#FAFAFC] p-2 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Phase</div>
                      <div className="font-bold text-indigo-700 font-mono">Phase {player.starterPhase}</div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 italic">
                    Click card to flip and view House / Faction clearance status 🔄
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/90 bg-[#17213f] p-5 shadow-md space-y-4 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="font-serif-y2k text-sm font-bold text-indigo-200">CITIZEN CLEARANCE RECORD</div>
                    <span className="text-[10px] font-mono text-indigo-300">ID: AURE-884-91</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Track Status:</span>{' '}
                      <span className="font-bold text-emerald-300">{isStudent ? 'Official Cycademy Student' : isFreelancer ? 'Licensed Freelancer' : 'Provisional Citizen'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">House Placement:</span>{' '}
                      <span className="font-bold text-indigo-300">{player.houseAffiliation || 'Unassigned (Select in Phase 2)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Forged Spells:</span>{' '}
                      <span className="font-bold text-indigo-200">{player.forgedSpells.length > 0 ? player.forgedSpells.join(', ') : 'None synthesized'}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-indigo-300 italic pt-2">
                    Click card to flip back 🔄
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* House Placement Selector for Students */}
          {isStudent && !player.houseAffiliation && (
            <div className="rounded-xl border border-slate-300/80 bg-white p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1d2650]">Select Your Cycademy House Placement</h3>
              <div className="grid grid-cols-2 gap-3">
                {houses.map((h) => (
                  <button
                    key={h.name}
                    onClick={() => {
                      setHouseAffiliation(h.name);
                      advanceStarterPhase(2);
                    }}
                    className={`rounded-xl border p-3 text-left transition ${h.color} hover:shadow-md`}
                  >
                    <div className="font-bold text-xs text-[#1d2650]">{h.name} House</div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: INVENTORY & BACKPACK ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>COLLECTED BACKPACK ITEMS</span>
            <span>3 / 20 Slots Used</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-lg">🔑</span>
                <span className="text-[9px] font-mono bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800 font-bold">KEY ITEM</span>
              </div>
              <div className="font-bold text-xs text-[#1d2650]">Orynvell Archives Key</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">Unlocks pre-Collapse manuscript vaults in Central Library.</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-lg">🧪</span>
                <span className="text-[9px] font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">POTION</span>
              </div>
              <div className="font-bold text-xs text-[#1d2650]">Aura Restoration Elixir</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">Restores +30 Aura Health immediately.</div>
              <Button onClick={() => healAura(30)} size="sm" variant="outline" className="w-full mt-1 text-[10px]">
                Consume Elixir
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-lg">💡</span>
                <span className="text-[9px] font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-bold">DECOR</span>
              </div>
              <div className="font-bold text-xs text-[#1d2650]">Celestial Holo-Lamp</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">Place in Dorm Room for +15 Comfort Level.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: 17.2 CORE SKILL SYSTEM ── */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(player.skills || {}).map(([skillName, skillData]) => {
            const IconComp = SKILL_ICONS[skillName] || Code;
            const desc = SKILL_DESCRIPTIONS[skillName] || { unlocks: 'Higher system efficiency', raised: 'System actions' };
            return (
              <div key={skillName} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1d2650]">
                    <IconComp size={15} className="text-[#5f6ab0]" /> {skillName}
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-700">LVL {skillData.level}</span>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5f6ab0] h-full" style={{ width: `${(skillData.xp % 100)}%` }} />
                </div>

                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-semibold text-slate-700">Unlocks:</span> {desc.unlocks}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 4: CYCADEMY CLUBS & ELECTIVES ── */}
      {activeTab === 'clubs' && (
        <div className="space-y-3">
          {!isStudent && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-center gap-2">
              <Lock size={16} className="text-amber-700 shrink-0" />
              <span>Cycademy Clubs & Elective Classes are exclusive to official Cycademy Students. Submit application in Record tab to join!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {clubs.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-sm">
                <div className="flex justify-between items-center font-bold text-xs text-[#1d2650]">
                  <span>{c.name}</span>
                  <span className="text-[10px] font-mono text-indigo-700">{c.req}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{c.desc}</p>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between items-center">
                  <span>Skills: {c.skills}</span>
                  <Button disabled={!isStudent} size="sm" variant="outline" className="text-[10px]">
                    Enroll Club
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: DORM ROOM & HOUSING ── */}
      {activeTab === 'dorm' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                <Home size={15} className="text-[#5f6ab0]" /> Current Housing: {isStudent ? 'Cycademy Student Suite 4B' : 'Provisional Citizen Quarters'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Comfort Rating: <span className="font-bold text-emerald-700">{player.dormComfort || 50}% (+15% XP Multiplier)</span></p>
            </div>

            <Button onClick={() => useOSStore.getState().restInDorm()} size="sm" variant="solid" className="px-4 py-2 font-bold">
              🌙 Rest in Dorm Bed
            </Button>
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placed Furniture & Decor</div>
          <div className="grid grid-cols-3 gap-3">
            {DORM_DECOR_ITEMS.map((d) => (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-sm">
                <div className="text-2xl">{d.icon}</div>
                <div className="font-bold text-xs text-[#1d2650]">{d.name}</div>
                <div className="text-[10px] text-slate-500">{d.desc}</div>
                <div className="text-[10px] text-emerald-700 font-bold font-mono">+{d.comfort} Comfort</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
