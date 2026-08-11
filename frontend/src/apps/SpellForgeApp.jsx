import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useGameStore } from '../store/useGameStore';
import {
  Sparkles, Shield, Flame, Zap, Compass, Award, RefreshCw, AlertTriangle,
  CheckCircle2, Activity, Layers, BookOpen, ChevronRight, Lock
} from 'lucide-react';
import Button from '../components/ui/button';

const MODULES = {
  elements: [
    { id: 'Cryo', name: 'Cryo / Ice', region: 'Fross Sub-Conduit', icon: '❄️', desc: 'Slows corruption spread and freezes malicious processes.' },
    { id: 'Light', name: 'Light / Solar', region: 'Lumia Sprawl', icon: '☀️', desc: 'Reveals hidden objects and creates hard-light shields.' },
    { id: 'Water', name: 'Water / Spring', region: 'Marlowe Springs', icon: '💧', desc: 'Heals aura damage and restores corrupted flow.' },
    { id: 'Air', name: 'Air / Wind', region: 'Brisland Docks', icon: '💨', desc: 'Accelerates signal routing and grants network stealth.' },
    { id: 'Fire', name: 'Fire / Volcanic', region: 'Kaji High Grounds', icon: '🔥', desc: 'Burns malware and overloads offensive protocols.' },
    { id: 'Void', name: 'Void / AETHER', region: 'Orynvell Core', icon: '🌌', desc: 'Pre-Collapse deep energy that pierces Veil anomalies.' }
  ],
  utilities: [
    { id: 'Firewall', name: 'Firewall Protocol', desc: 'Blocks incoming connection requests and unauthorized packets.' },
    { id: 'Routing', name: 'Routing Vector', desc: 'Directs data packets along optimal paths through network gateways.' },
    { id: 'Encryption', name: 'Encryption Cipher', desc: 'Encodes data using security keys to prevent sniffing.' },
    { id: 'Anchor', name: 'Reality Anchor', desc: 'Locks virtual coordinates to stabilize reality rifts.' },
    { id: 'Echo', name: 'Signal Echo', desc: 'Pings hosts to trace hidden background protocols.' },
    { id: 'Pulse', name: 'EMP Pulse', desc: 'Emits a localized electromagnetic wave to disrupt hardware.' },
    { id: 'Null', name: 'Null Purge', desc: 'Erases files or variables permanently from the memory heap.' },
    { id: 'Compression', name: 'Data Compression', desc: 'Reduces data payload size for rapid transmission.' }
  ],
  runes: [
    { id: 'Overclock', name: 'Overclock Rune', desc: 'Doubles spell efficacy (+100% rewards) but adds +15 Veil strain.' },
    { id: 'Stabilize', name: 'Stabilize Rune', desc: 'Guarantees alignment success and restores +15 Aura Health.' },
    { id: 'Echo', name: 'Echo Resonance Rune', desc: 'Casts spell across multiple node clusters simultaneously.' },
    { id: 'Amplify', name: 'Amplify Rune', desc: 'Grants +50% additional Spellcasting & Engineering XP.' },
    { id: 'Invert', name: 'Invert Rune', desc: 'Reverses elemental polarity for unconventional vulnerabilities.' }
  ]
};

const RECIPES = [
  { inputs: ['Firewall', 'Routing'], result: 'Reflect Shield', desc: 'Redirects incoming corruption back to its source.' },
  { inputs: ['Encryption', 'Anchor'], result: 'Seal Lock', desc: 'Stabilizes data leaks and prevents PRISM spread.' },
  { inputs: ['Echo', 'Pulse'], result: 'Signal Chorus', desc: 'Reveals hidden entities and spy processes in the network.' },
  { inputs: ['Null', 'Compression'], result: 'Void Packet', desc: 'Stores unstable data safely before terminal disposal.' },
  { inputs: ['Cryo', 'Compression'], result: 'Glacial Freeze', desc: 'Crystallizes node pipelines and freezes malicious viruses.' },
  { inputs: ['Fire', 'Pulse'], result: 'Thermal Flare', desc: 'Overloads offensive malware and incinerates rogue daemons.' },
  { inputs: ['Water', 'Anchor'], result: 'Aura Spring Ward', desc: 'Continuous aura regeneration and toxin flush.' },
  { inputs: ['Light', 'Firewall'], result: 'Prismatic Barrier', desc: 'Immunity to optical sensor tracking and cyber-attacks.' },
  { inputs: ['Air', 'Routing'], result: 'Zephyr Slipstream', desc: 'Accelerates network bandwidth by +200%.' },
  { inputs: ['Void', 'Encryption'], result: 'AETHER Key Cipher', desc: 'Unlocks pre-Collapse royal archives in Orynvell.' }
];

export default function SpellForgeApp() {
  const player = useOSStore((s) => s.gameplay.player);
  const damageAura = useOSStore((s) => s.damageAura);
  const healAura = useOSStore((s) => s.healAura);
  const addCondition = useOSStore((s) => s.addCondition);
  const addForgedSpell = useOSStore((s) => s.addForgedSpell);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const purgePrismCorruption = useOSStore((s) => s.purgePrismCorruption);
  const advanceAppRank = useOSStore((s) => s.advanceAppRank);
  const addSkillXP = useOSStore((s) => s.addSkillXP);

  const weaverRank = player?.appRanks?.weaver || 1;
  const forgedSpells = player?.forgedSpells || [];

  const [activeTab, setActiveTab] = useState('forge'); // 'forge' | 'defense' | 'grimoire'
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [selectedRune, setSelectedRune] = useState(null);
  const [forging, setForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [veilStrain, setVeilStrain] = useState(15);
  const [log, setLog] = useState(['SpellForge Matrix v2.5 initialized. Select Regional Element, Utility Protocol, and Rune Modifier...']);

  const [threats, setThreats] = useState([
    { id: 'T1', name: 'Trojan.Lockscreen', type: 'Ransomware', status: 'ACTIVE', vulnerability: 'Seal Lock', reward: 300 },
    { id: 'T2', name: 'Malware.AETHERCORE.sys', type: 'Virus', status: 'ACTIVE', vulnerability: 'Glacial Freeze', reward: 400 },
    { id: 'T3', name: 'Daemon.Spyware.sniff', type: 'Spyware', status: 'ACTIVE', vulnerability: 'Signal Chorus', reward: 250 },
    { id: 'T4', name: 'Corrupted.FaithWard.log', type: 'Corrupted Process', status: 'ACTIVE', vulnerability: 'Reflect Shield', reward: 200 },
    { id: 'T5', name: 'PRISM.Gateway.hijack', type: 'Veil Anomaly', status: 'ACTIVE', vulnerability: 'Aura Spring Ward', reward: 500 }
  ]);

  const handleForge = () => {
    if (!selectedElement || !selectedUtility) return;
    setForging(true);
    setForgeProgress(0);

    const interval = setInterval(() => {
      setForgeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          finishForge();
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const finishForge = () => {
    setForging(false);
    const inputs = [selectedElement, selectedUtility];
    const match = RECIPES.find(
      (r) =>
        (r.inputs[0] === inputs[0] && r.inputs[1] === inputs[1]) ||
        (r.inputs[0] === inputs[1] && r.inputs[1] === inputs[0])
    );

    let xpBonus = selectedRune === 'Amplify' ? 50 : 30;
    let strainIncrease = selectedRune === 'Overclock' ? 20 : 10;
    setVeilStrain((prev) => Math.min(100, prev + strainIncrease));

    if (selectedRune === 'Stabilize') {
      healAura(15);
    } else if (selectedRune === 'Overclock') {
      damageAura(10);
    }

    if (match || selectedRune === 'Stabilize') {
      const spellName = match ? match.result : `${selectedElement} ${selectedUtility}`;
      addForgedSpell(spellName);
      advanceAppRank('weaver');
      addSkillXP('Spellcasting', xpBonus);
      addSkillXP('Engineering', xpBonus);
      useGameStore.getState().requestSpellResolution(selectedElement || 'Aether', 50, selectedRune ? 2 : 1);
      setLog((prev) => [
        `✨ Spell Synthesized: [${spellName}] (${match ? match.desc : 'Stabilized Protocol'}) (+${xpBonus} Spell & Eng XP)`,
        `Rune [${selectedRune || 'Standard'}] applied. Veil Strain: ${Math.min(100, veilStrain + strainIncrease)}%.`,
        ...prev
      ]);
    } else {
      damageAura(15);
      addCondition('Veilwilt');
      setLog((prev) => [
        `💥 Protocol Instability! Matrix misaligned.`,
        `⚠️ 15 Aura Damage sustained. Contracted [Veilwilt] from raw elemental backlash.`,
        ...prev
      ]);
    }
    setSelectedElement(null);
    setSelectedUtility(null);
    setSelectedRune(null);
  };

  const handleCleanse = (threat, spellName) => {
    if (threat.vulnerability === spellName) {
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'CLEANSED' } : t))
      );
      addCredits(threat.reward);
      addXP(threat.reward / 2);
      healAura(10);
      purgePrismCorruption(3.0);
      setLog((prev) => [
        `✨ Cleanse Successful! [${threat.name}] purged with [${spellName}]. +₡${threat.reward} Credits, +${threat.reward / 2} XP.`,
        ...prev
      ]);
    } else {
      damageAura(20);
      if (threat.type === 'Virus') addCondition('Frostlung Syndrome');
      if (threat.type === 'Ransomware') addCondition('Sunspire Burn Fever');
      setLog((prev) => [
        `❌ Ineffective Spell! [${spellName}] cannot neutralize ${threat.type}.`,
        `⚠️ Sustained 20 Aura feedback damage.`,
        ...prev
      ]);
    }
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-b from-[#F7F8FC] to-[#EEF0F8] text-[#162241] font-sans text-xs select-none overflow-hidden">
      {/* ── LEFT NAVIGATION SIDEBAR ── */}
      <div className="w-52 shrink-0 border-r border-slate-200 bg-white/80 p-4 flex flex-col justify-between backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-[#1d2650]">SpellForge</div>
              <div className="text-[10px] text-slate-500 font-mono">Weaver Rank: <span className="font-bold text-indigo-700">Lv. {weaverRank} / 5</span></div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('forge')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'forge' ? 'bg-[#17213f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔮 Spell Weaver
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                activeTab === 'defense' ? 'bg-[#17213f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🛡️ Defense Grid</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                {threats.filter((t) => t.status === 'ACTIVE').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('grimoire')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'grimoire' ? 'bg-[#17213f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📖 Grimoire ({forgedSpells.length})
            </button>
          </div>
        </div>

        {/* Veil Strain Indicator (Bootstrap style progress) */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Veil Strain:</span>
            <span className={`font-bold ${veilStrain > 60 ? 'text-rose-600' : 'text-indigo-700'}`}>{veilStrain}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${veilStrain > 60 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-600'}`}
              style={{ width: `${veilStrain}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-400 font-mono text-center">Strain dissipates in Dorm</div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
        {/* TAB 1: SPELL WEAVER */}
        {activeTab === 'forge' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Elements Selection */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  1. Regional Element
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {MODULES.elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElement(el.id)}
                      className={`w-full text-left p-2.5 rounded-2xl border text-xs transition ${
                        selectedElement === el.id
                          ? 'border-indigo-500 bg-indigo-50/80 font-bold text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{el.icon}</span> {el.name}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{el.region}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{el.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Utility Protocols */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  2. Utility Protocol
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {MODULES.utilities.map((ut) => (
                    <button
                      key={ut.id}
                      onClick={() => setSelectedUtility(ut.id)}
                      className={`w-full text-left p-2.5 rounded-2xl border text-xs transition ${
                        selectedUtility === ut.id
                          ? 'border-indigo-500 bg-indigo-50/80 font-bold text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{ut.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{ut.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Rune Modifiers */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  3. Rune Modifier (Optional)
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {MODULES.runes.map((rn) => (
                    <button
                      key={rn.id}
                      onClick={() => setSelectedRune(selectedRune === rn.id ? null : rn.id)}
                      className={`w-full text-left p-2.5 rounded-2xl border text-xs transition ${
                        selectedRune === rn.id
                          ? 'border-indigo-500 bg-indigo-50/80 font-bold text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{rn.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{rn.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synthesize Action Bar */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#1d2650]">
                  Formula Matrix: <span className="text-indigo-700 font-mono">{selectedElement || '___'} + {selectedUtility || '___'} {selectedRune ? `+ [${selectedRune}]` : ''}</span>
                </div>
                <p className="text-[11px] text-slate-500">Combine regional elemental frequencies to craft network defense protocols.</p>
              </div>

              <Button
                onClick={handleForge}
                disabled={!selectedElement || !selectedUtility || forging}
                size="sm"
                variant="solid"
                className="px-6 py-2.5 font-bold"
              >
                {forging ? `Synthesizing ${forgeProgress}%...` : '⚡ Synthesize Spell'}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: DEFENSE GRID */}
        {activeTab === 'defense' && (
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Active Regional Network Threats & Anomalies
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {threats.map((threat) => (
                <div key={threat.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#1c2650]">{threat.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                      threat.status === 'CLEANSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {threat.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    Vulnerability Requirement: <strong className="text-indigo-700 font-mono">{threat.vulnerability}</strong>
                  </div>

                  {threat.status === 'ACTIVE' && (
                    <div className="pt-2 border-t border-slate-100 flex gap-1.5 flex-wrap">
                      {forgedSpells.map((spell) => (
                        <button
                          key={spell}
                          onClick={() => handleCleanse(threat, spell)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[10px] rounded-lg font-semibold transition border border-indigo-200"
                        >
                          Cast [{spell}]
                        </button>
                      ))}
                      {forgedSpells.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No crafted spells in Grimoire. Synthesize spells in Weaver tab.</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GRIMOIRE & RECIPES */}
        {activeTab === 'grimoire' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#1d2650] uppercase tracking-wider font-mono">
                Learned Grimoire Spells ({forgedSpells.length})
              </h3>
              {forgedSpells.length === 0 ? (
                <p className="text-[11px] text-slate-400">No spells crafted yet. Synthesize elemental modules in the Weaver tab!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {forgedSpells.map((s, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5">
                      <Sparkles size={12} className="text-purple-600" /> {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#1d2650] uppercase tracking-wider font-mono">
                Known Synthesis Blueprints
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {RECIPES.map((r, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 bg-[#FAFAFC] p-3 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#1d2650]">
                      <span>{r.result}</span>
                      <span className="text-[10px] font-mono text-indigo-600">{r.inputs[0]} + {r.inputs[1]}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FORGE ACTIVITY CONSOLE LOG ── */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3 max-h-28 overflow-y-auto text-[10px] font-mono text-slate-700 shadow-inner space-y-0.5">
          {log.map((entry, idx) => (
            <div key={idx}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
