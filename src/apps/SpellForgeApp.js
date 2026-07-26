import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

const MODULES = {
  elements: [
    { id: 'Cryo', name: 'Cryo / Ice', region: 'Fross', desc: 'Slows corruption spread and freezes malicious processes.' },
    { id: 'Light', name: 'Light / Solar', region: 'Lumia', desc: 'Reveals hidden objects and creates hard-light shields.' },
    { id: 'Water', name: 'Water / Spring', region: 'Marlowe', desc: 'Heals aura damage and restores corrupted flow.' },
    { id: 'Air', name: 'Air / Autumn', region: 'Brisland', desc: 'Accelerates signal routing and grants network stealth.' },
    { id: 'Fire', name: 'Fire / Volcanic', region: 'Kaji', desc: 'Burns malware and overloads offensive protocols.' }
  ],
  utilities: [
    { id: 'Firewall', name: 'Firewall', desc: 'Blocks incoming connection requests and unauthorized packets.' },
    { id: 'Routing', name: 'Routing', desc: 'Directs data packets along optimal paths through network gateways.' },
    { id: 'Encryption', name: 'Encryption', desc: 'Encodes data using security keys to prevent sniffing.' },
    { id: 'Anchor', name: 'Anchor', desc: 'Locks virtual coordinates to stabilize reality rifts.' },
    { id: 'Echo', name: 'Echo', desc: 'Pings hosts to trace hidden background protocols.' },
    { id: 'Pulse', name: 'Pulse', desc: 'Emits a localized electromagnetic wave to disrupt hardware.' },
    { id: 'Null', name: 'Null', desc: 'Erases files or variables permanently from the heap.' },
    { id: 'Compression', name: 'Compression', desc: 'Reduces data payload size for rapid transmission.' }
  ]
};

const RECIPES = [
  { inputs: ['Firewall', 'Routing'], result: 'Reflect Shield', desc: 'Redirects incoming corruption back to its source.' },
  { inputs: ['Encryption', 'Anchor'], result: 'Seal Lock', desc: 'Stabilizes data leaks and prevents spread.' },
  { inputs: ['Echo', 'Pulse'], result: 'Signal Chorus', desc: 'Reveals hidden entities and spy processes.' },
  { inputs: ['Null', 'Compression'], result: 'Void Packet', desc: 'Stores unstable data safely before disposal.' },
  { inputs: ['Cryo', 'Compression'], result: 'Glacial Freeze', desc: 'Crystallizes breath and freezes malicious viruses.' },
  { inputs: ['Fire', 'Pulse'], result: 'Thermal Flare', desc: 'Overloads offensive malware and burns rogue processes.' }
];

export default function SpellForgeApp() {
  const player = useOSStore((s) => s.gameplay.player);
  const damageAura = useOSStore((s) => s.damageAura);
  const healAura = useOSStore((s) => s.healAura);
  const addCondition = useOSStore((s) => s.addCondition);
  const addForgedSpell = useOSStore((s) => s.addForgedSpell);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);

  const [activeTab, setActiveTab] = useState('forge'); // 'forge' | 'defense'
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [forging, setForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [log, setLog] = useState(['SpellForge v1.0 online. Load components to code a spell...']);

  const [threats, setThreats] = useState([
    { id: 'T1', name: 'Trojan.Lockscreen', type: 'Ransomware', status: 'ACTIVE', vulnerability: 'Seal Lock', reward: 300 },
    { id: 'T2', name: 'Malware.AETHERCORE.sys', type: 'Virus', status: 'ACTIVE', vulnerability: 'Glacial Freeze', reward: 400 },
    { id: 'T3', name: 'Daemon.Spyware.sniff', type: 'Spyware', status: 'ACTIVE', vulnerability: 'Signal Chorus', reward: 250 },
    { id: 'T4', name: 'Corrupted.FaithWard.log', type: 'Corrupted Process', status: 'ACTIVE', vulnerability: 'Reflect Shield', reward: 200 }
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
    }, 400);
  };

  const finishForge = () => {
    setForging(false);
    const inputs = [selectedElement, selectedUtility];
    const match = RECIPES.find(
      (r) =>
        (r.inputs[0] === inputs[0] && r.inputs[1] === inputs[1]) ||
        (r.inputs[0] === inputs[1] && r.inputs[1] === inputs[0])
    );

    if (match) {
      addForgedSpell(match.result);
      setLog((prev) => [
        `✅ Spell Created: [${match.result}] (${match.desc})`,
        `Successfully aligned ${selectedElement} and ${selectedUtility} protocols within the Veil.`,
        ...prev
      ]);
    } else {
      damageAura(15);
      addCondition('Veilwilt');
      setLog((prev) => [
        `💥 Protocol Instability! Alignment failed.`,
        `⚠️ Warning: 15 Aura Damage sustained. Contracted [Veilwilt] due to extreme elemental strain.`,
        ...prev
      ]);
    }
    setSelectedElement(null);
    setSelectedUtility(null);
  };

  const handleCleanse = (threat, spellName) => {
    if (threat.vulnerability === spellName) {
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'CLEANSED' } : t))
      );
      addCredits(threat.reward);
      addXP(threat.reward / 2);
      healAura(10);
      setLog((prev) => [
        `✨ Cleanse Successful! [${threat.name}] purged. +₡${threat.reward} Credits, +${threat.reward / 2} XP, Aura restored.`,
        ...prev
      ]);
    } else {
      damageAura(25);
      if (threat.type === 'Virus') addCondition('Frostlung Syndrome');
      if (threat.type === 'Ransomware') addCondition('Sunspire Burn Fever');
      setLog((prev) => [
        `❌ Cleansing Failed! Spell [${spellName}] is ineffective against ${threat.type}.`,
        `⚠️ Sustained 25 Aura damage. Feedback loops caused medical symptoms.`,
        ...prev
      ]);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-white font-sans text-xs select-none">
      {/* Sidebar Navigation */}
      <div className="w-48 border-r border-white/10 bg-slate-900/60 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-bold text-sm text-cyan-400">SpellForge</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('forge')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                activeTab === 'forge' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span>🔨 Spell Weaver</span>
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                activeTab === 'defense' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span>⚔️ Digital Defense</span>
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                {threats.filter((t) => t.status === 'ACTIVE').length}
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
          <div className="flex justify-between">
            <span className="text-white/40">Aura Health:</span>
            <span className={player.auraHealth < 30 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {player.auraHealth}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded bg-white/10 overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${player.auraHealth}%` }} />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === 'forge' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white">Weave Spell Code</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Combine one elemental module and one utility module to forge a spell protocol into the Veil.</p>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Elements Column */}
              <div className="space-y-2">
                <span className="font-semibold text-white/50 text-[10px] uppercase">1. Select Element Module</span>
                <div className="space-y-1.5">
                  {MODULES.elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElement(el.id)}
                      disabled={forging}
                      className={`w-full text-left p-2.5 rounded-xl border transition ${
                        selectedElement === el.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium text-white">{el.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Origin: {el.region} | {el.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Utilities Column */}
              <div className="space-y-2">
                <span className="font-semibold text-white/50 text-[10px] uppercase">2. Select Utility Module</span>
                <div className="space-y-1.5 max-h-[300px] overflow-auto pr-1">
                  {MODULES.utilities.map((ut) => (
                    <button
                      key={ut.id}
                      onClick={() => setSelectedUtility(ut.id)}
                      disabled={forging}
                      className={`w-full text-left p-2.5 rounded-xl border transition ${
                        selectedUtility === ut.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium text-white">{ut.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{ut.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Forge Button & Progress */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex flex-col items-center gap-3">
              {forging ? (
                <div className="w-full text-center space-y-2">
                  <div className="font-bold text-cyan-300 animate-pulse">Stabilizing elements within the Veil... {forgeProgress}%</div>
                  <div className="h-2 w-full rounded bg-white/10 overflow-hidden max-w-sm mx-auto">
                    <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${forgeProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6 w-full justify-between">
                  <div className="text-xs">
                    <span className="text-white/50">Combined: </span>
                    <span className="font-bold text-cyan-300">{selectedElement || '---'}</span>
                    <span className="text-white/50"> + </span>
                    <span className="font-bold text-cyan-300">{selectedUtility || '---'}</span>
                  </div>
                  <button
                    onClick={handleForge}
                    disabled={!selectedElement || !selectedUtility}
                    className={`rounded-lg px-6 py-2 font-bold text-black transition ${
                      selectedElement && selectedUtility ? 'bg-cyan-400 hover:bg-cyan-300' : 'bg-white/10 text-white/40'
                    }`}
                  >
                    🔨 Forge Spell
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'defense' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white">Digital Defense Operations</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Use your forged spell inventory to quarantine and clean active operating system threats.</p>
            </div>

            <div className="space-y-3">
              {threats.map((threat) => (
                <div key={threat.id} className="rounded-xl border border-white/15 bg-white/5 p-4 flex justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${threat.status === 'CLEANSED' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                      <span className="font-bold text-white text-sm">{threat.name}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] text-white/50 uppercase">{threat.type}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mt-1">Requires: {threat.vulnerability} spell | Reward: ₡{threat.reward}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {threat.status === 'CLEANSED' ? (
                      <span className="text-emerald-400 font-bold text-sm">✔ PURGED</span>
                    ) : player.forgedSpells.length === 0 ? (
                      <span className="text-white/30 text-[10px]">No spells forged</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {player.forgedSpells.map((spell) => (
                          <button
                            key={spell}
                            onClick={() => handleCleanse(threat, spell)}
                            className="bg-red-500/20 text-red-300 border border-red-500/40 rounded px-2.5 py-1 hover:bg-red-500 hover:text-black font-semibold text-[10px] transition"
                          >
                            Use {spell}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Logs footer */}
        <div className="h-32 border-t border-white/10 bg-black/40 p-4 font-mono text-[10px] text-green-400 overflow-auto flex flex-col-reverse gap-1 select-text">
          {log.map((entry, idx) => (
            <div key={idx} className="leading-normal">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
