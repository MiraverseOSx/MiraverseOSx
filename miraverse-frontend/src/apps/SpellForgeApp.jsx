import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';

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
  ],
  runes: [
    { id: 'Overclock', name: 'Overclock Rune', desc: 'Doubles spell efficacy (+100% reward) but adds +10 Veil strain.' },
    { id: 'Stabilize', name: 'Stabilize Rune', desc: 'Guarantees alignment success and restores +10 Aura Health.' },
    { id: 'Echo', name: 'Echo Rune', desc: 'Casts spell across multiple nodes simultaneously.' },
    { id: 'Amplify', name: 'Amplify Rune', desc: 'Grants +50% additional Spellcasting & Engineering XP.' },
    { id: 'Invert', name: 'Invert Rune', desc: 'Reverses elemental polarity for unconventional vulnerabilities.' }
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
  const purgePrismCorruption = useOSStore((s) => s.purgePrismCorruption);
  const incrementAppRank = useOSStore((s) => s.incrementAppRank);
  const weaverRank = player.appRanks?.weaver || 1;

  const [activeTab, setActiveTab] = useState('forge'); // 'forge' | 'defense'
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [selectedRune, setSelectedRune] = useState(null);
  const [forging, setForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [veilStrain, setVeilStrain] = useState(15);
  const [log, setLog] = useState(['SpellForge v2.0 Matrix initialized. Select Element, Utility, and Modifier Rune...']);

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

    let xpBonus = selectedRune === 'Amplify' ? 40 : 25;
    let strainIncrease = selectedRune === 'Overclock' ? 20 : 10;
    setVeilStrain((prev) => Math.min(100, prev + strainIncrease));

    if (selectedRune === 'Stabilize') {
      healAura(10);
    } else if (selectedRune === 'Overclock') {
      damageAura(10);
    }

    if (match || selectedRune === 'Stabilize') {
      const spellName = match ? match.result : `${selectedElement} ${selectedUtility}`;
      addForgedSpell(spellName);
      incrementAppRank('weaver');
      useOSStore.getState().addSkillXP('Spellcasting', xpBonus);
      useOSStore.getState().addSkillXP('Engineering', xpBonus);
      setLog((prev) => [
        `✅ Spell Created: [${spellName}] (${match ? match.desc : 'Stabilized Protocol'}) (+${xpBonus} Spellcasting & Engineering XP)`,
        `Rune Modifier [${selectedRune || 'None'}] applied. Veil Strain now at ${Math.min(100, veilStrain + strainIncrease)}%.`,
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
      purgePrismCorruption(2.5);
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
    <div className="flex h-full w-full bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241] font-sans text-xs select-none">
      {/* Sidebar Navigation */}
      <div className="w-48 border-r border-slate-300/80 bg-white/60 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="font-bold text-sm text-[#1d2650]">SpellForge</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Weaver Rank: <span className="font-bold text-[#3b4785]">Lv. {weaverRank}</span></span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('forge')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'forge' ? 'bg-[#e9ebf6] text-[#1d2650]' : 'text-slate-600 hover:bg-[#f2f3fb]'
              }`}
            >
              🔮 Spell Weaver
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'defense' ? 'bg-[#e9ebf6] text-[#1d2650]' : 'text-slate-600 hover:bg-[#f2f3fb]'
              }`}
            >
              🛡️ Defense Matrix ({threats.filter((t) => t.status === 'ACTIVE').length})
            </button>
          </div>
        </div>

        {/* Veil Strain Indicator */}
        <div className="space-y-1 rounded-lg border border-slate-300/80 bg-white/80 p-2.5">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Veil Strain:</span>
            <span className="font-bold text-indigo-700">{veilStrain}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5f6ab0] h-full transition-all" style={{ width: `${veilStrain}%` }} />
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-4 flex flex-col justify-between overflow-auto bg-[#FAFAFC]">
        {activeTab === 'forge' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Elements Selection */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Element Module</div>
                <div className="space-y-1">
                  {MODULES.elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElement(el.id)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                        selectedElement === el.id ? 'border-[#8c97d6] bg-[#eef0fb] font-semibold text-[#1d2650]' : 'border-slate-200 bg-white hover:bg-[#f7f7fd] text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{el.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{el.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Utilities Selection */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2. Utility Protocol</div>
                <div className="space-y-1 max-h-60 overflow-auto pr-1">
                  {MODULES.utilities.map((ut) => (
                    <button
                      key={ut.id}
                      onClick={() => setSelectedUtility(ut.id)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                        selectedUtility === ut.id ? 'border-[#8c97d6] bg-[#eef0fb] font-semibold text-[#1d2650]' : 'border-slate-200 bg-white hover:bg-[#f7f7fd] text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{ut.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{ut.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Runes Selection */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3. Rune Modifier (Opt)</div>
                <div className="space-y-1">
                  {MODULES.runes.map((rn) => (
                    <button
                      key={rn.id}
                      onClick={() => setSelectedRune(selectedRune === rn.id ? null : rn.id)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                        selectedRune === rn.id ? 'border-[#8c97d6] bg-[#eef0fb] font-semibold text-[#1d2650]' : 'border-slate-200 bg-white hover:bg-[#f7f7fd] text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{rn.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{rn.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Forge Control Bar */}
            <div className="rounded-xl border border-slate-300/80 bg-white/90 p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#1d2650]">
                  Spell Formula: <span className="text-[#3b4785]">{selectedElement || '___'} + {selectedUtility || '___'} {selectedRune ? `(${selectedRune})` : ''}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Combine code elements to stabilize regional realities.</div>
              </div>

              <Button
                onClick={handleForge}
                disabled={!selectedElement || !selectedUtility || forging}
                size="sm"
                variant="solid"
                className="px-5 py-2 font-bold"
              >
                {forging ? `Forging ${forgeProgress}%...` : 'Synthesize Spell'}
              </Button>
            </div>
          </div>
        ) : (
          /* Defense Tab */
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Regional Network Threats</div>
            <div className="grid grid-cols-2 gap-3">
              {threats.map((threat) => (
                <div key={threat.id} className="rounded-xl border border-slate-300/80 bg-white/90 p-3 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#1c2650]">{threat.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${threat.status === 'CLEANSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {threat.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Vulnerability: <span className="font-semibold text-indigo-700">{threat.vulnerability}</span>
                  </div>

                  {threat.status === 'ACTIVE' && (
                    <div className="pt-2 border-t border-slate-100 flex gap-1 flex-wrap">
                      {player.forgedSpells.map((spell) => (
                        <button
                          key={spell}
                          onClick={() => handleCleanse(threat, spell)}
                          className="px-2 py-1 bg-[#eef0fb] hover:bg-[#e1e4f7] text-[#1d2650] text-[10px] rounded font-semibold transition"
                        >
                          Cast [{spell}]
                        </button>
                      ))}
                      {player.forgedSpells.length === 0 && (
                        <span className="text-[10px] text-slate-400">No forged spells available. Craft spells in Weaver tab.</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forge Output Log */}
        <div className="mt-3 bg-white/80 border border-slate-300/80 rounded-xl p-3 max-h-32 overflow-auto text-[11px] font-mono text-slate-700 shadow-inner space-y-1">
          {log.map((entry, idx) => (
            <div key={idx}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
