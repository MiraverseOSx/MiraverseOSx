import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useGameStore } from '../store/useGameStore';
import {
  Sparkles, Shield, Flame, Droplets, Wind, Moon, Sun, Cpu, CheckCircle2, AlertCircle, RefreshCw, Zap, Lock, BookOpen, Layers
} from 'lucide-react';
import Button from '../components/ui/button';

export interface SpellModule {
  id: string;
  name: string;
  category: 'Defense' | 'Utility' | 'Elemental' | 'Void';
  region: 'Fross' | 'Lumia' | 'Marlowe' | 'Brisland' | 'Kaji' | 'Nephele' | 'Orynvell' | 'Core';
  element: string;
  power: number;
  description: string;
  icon: any;
}

const MODULES_INVENTORY: SpellModule[] = [
  { id: 'firewall', name: 'Firewall.mod', category: 'Defense', region: 'Kaji', element: 'Ignis', power: 65, description: 'Defensive code barrier that absorbs corruption pulses.', icon: Flame },
  { id: 'routing', name: 'Routing.mod', category: 'Utility', region: 'Brisland', element: 'Aer', power: 50, description: 'Redirects packet headers and signal flows.', icon: Wind },
  { id: 'encryption', name: 'Encryption.mod', category: 'Defense', region: 'Core', element: 'Cipher', power: 70, description: 'Locks data structure against external tampering.', icon: Lock },
  { id: 'anchor', name: 'Anchor.mod', category: 'Defense', region: 'Core', element: 'Terra', power: 60, description: 'Anchors reality frequency to prevent physical data bleeds.', icon: Shield },
  { id: 'echo', name: 'Echo.mod', category: 'Utility', region: 'Marlowe', element: 'Aqua', power: 45, description: 'Resonates through the Veil to map invisible nodes.', icon: Droplets },
  { id: 'maispace', name: 'Mai.space.mod', category: 'Utility', region: 'Core', element: 'Pulse', power: 40, description: 'Broadcasts frequencies across public mesh networks.', icon: Zap },
  { id: 'null', name: 'Null.mod', category: 'Void', region: 'Nephele', element: 'Umbra', power: 85, description: 'Deconstructs digital logic into pure silence.', icon: Moon },
  { id: 'compression', name: 'Compression.mod', category: 'Utility', region: 'Core', element: 'Matrix', power: 55, description: 'Compresses unstable memory blocks into sealed packets.', icon: Layers },
  { id: 'cryo', name: 'CryoFreeze.mod', category: 'Elemental', region: 'Fross', element: 'Cryo', power: 75, description: 'Freezes malicious threads and stabilizes corrupt files.', icon: Moon },
  { id: 'solar', name: 'SunspireGlow.mod', category: 'Elemental', region: 'Lumia', element: 'Lux', power: 80, description: 'Hard-light constructs that illuminate hidden objects.', icon: Sun },
  { id: 'aether', name: 'AetherHarmonic.mod', category: 'Elemental', region: 'Orynvell', element: 'Aether', power: 100, description: 'Royal celestial protocol capable of repairing AETHERCORE fractures.', icon: Sparkles },
];

const CANONICAL_COMBOS: Record<string, { name: string; type: string; desc: string; power: number }> = {
  'firewall+routing': { name: 'Reflect Shield', type: 'Combat Defense', desc: 'Redirects incoming PRISM corruption back toward its source.', power: 120 },
  'encryption+anchor': { name: 'Seal Lock', type: 'Veil Stabilization', desc: 'Temporarily stabilizes active data leaks and prevents district spread.', power: 135 },
  'echo+maispace': { name: 'Signal Chorus', type: 'Intelligence & Scan', desc: 'Reveals hidden ghost processes, encrypted servers, and lost NPCs.', power: 95 },
  'null+compression': { name: 'Void Packet', type: 'Hazard Disposal', desc: 'Safely stores and disposes unstable .veil code without aura damage.', power: 145 },
  'cryo+firewall': { name: 'Glacial Barrier', type: 'Fross Defense', desc: 'Freezes corrupt network sockets and lowers aura heat.', power: 140 },
  'aether+anchor': { name: 'Celestial Reality Anchor', type: 'Orynvell Protocol', desc: 'Restores the original pre-code stability of the Veil.', power: 180 },
};

export default function SpellForgeApp() {
  const [selectedSlotA, setSelectedSlotA] = useState<SpellModule | null>(MODULES_INVENTORY[0]);
  const [selectedSlotB, setSelectedSlotB] = useState<SpellModule | null>(MODULES_INVENTORY[1]);
  const [forgedHistory, setForgedHistory] = useState<any[]>([
    { name: 'Reflect Shield', combo: 'Firewall + Routing', date: 'Cycle 28', active: true }
  ]);
  const [forgeResult, setForgeResult] = useState<any>(null);

  const addXP = useOSStore((s) => s.addXP);
  const addCredits = useOSStore((s) => s.addCredits);

  const handleForge = () => {
    if (!selectedSlotA || !selectedSlotB) return;
    const key1 = `${selectedSlotA.id}+${selectedSlotB.id}`;
    const key2 = `${selectedSlotB.id}+${selectedSlotA.id}`;
    const combo = CANONICAL_COMBOS[key1] || CANONICAL_COMBOS[key2];

    if (combo) {
      setForgeResult(combo);
      setForgedHistory((prev) => [
        { name: combo.name, combo: `${selectedSlotA.name} + ${selectedSlotB.name}`, date: 'Now', active: true },
        ...prev
      ]);
      addXP(150);
      addCredits(200);
    } else {
      const generic = {
        name: `${selectedSlotA.name.split('.')[0]}-${selectedSlotB.name.split('.')[0]} Protocol`,
        type: 'Experimental Spell',
        desc: `Experimental synthesis of ${selectedSlotA.element} and ${selectedSlotB.element} frequencies.`,
        power: Math.round((selectedSlotA.power + selectedSlotB.power) * 0.9)
      };
      setForgeResult(generic);
      setForgedHistory((prev) => [
        { name: generic.name, combo: `${selectedSlotA.name} + ${selectedSlotB.name}`, date: 'Now', active: true },
        ...prev
      ]);
      addXP(80);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800 font-sans select-none overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-slate-900 font-mono uppercase">
              SPELLFORGE // PROTOCOL COMPILER
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Combine code modules to stabilize reality and forge spells for the Digital Veil.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Split */}
      <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
        {/* Module Inventory Tray */}
        <div className="col-span-4 border-r border-slate-200 p-5 overflow-y-auto space-y-3 bg-slate-50">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Module Inventory (11 Modules)</div>
          {MODULES_INVENTORY.map((mod) => {
            const Icon = mod.icon;
            const isSlotA = selectedSlotA?.id === mod.id;
            const isSlotB = selectedSlotB?.id === mod.id;

            return (
              <div
                key={mod.id}
                onClick={() => {
                  if (!selectedSlotA) setSelectedSlotA(mod);
                  else if (!selectedSlotB && selectedSlotA.id !== mod.id) setSelectedSlotB(mod);
                  else setSelectedSlotA(mod);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-xs ${
                  isSlotA
                    ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
                    : isSlotB
                    ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-xs">{mod.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{mod.region} • {mod.element}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-700">{mod.power} PWR</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Forge Assembly Workbench */}
        <div className="col-span-8 p-6 flex flex-col justify-between overflow-y-auto bg-[#FAFBFD]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Primary Slot */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="text-[10px] font-mono text-purple-700 uppercase tracking-wider font-bold">Primary Module Slot</div>
                {selectedSlotA ? (
                  <div>
                    <h3 className="font-bold text-base text-purple-950 font-mono">{selectedSlotA.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{selectedSlotA.description}</p>
                    <div className="text-xs font-mono text-slate-500 mt-2">Region: {selectedSlotA.region} | Power: {selectedSlotA.power}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-mono py-4">Click an inventory module to insert</div>
                )}
              </div>

              {/* Secondary Slot */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="text-[10px] font-mono text-sky-700 uppercase tracking-wider font-bold">Secondary Logic Slot</div>
                {selectedSlotB ? (
                  <div>
                    <h3 className="font-bold text-base text-sky-950 font-mono">{selectedSlotB.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{selectedSlotB.description}</p>
                    <div className="text-xs font-mono text-slate-500 mt-2">Region: {selectedSlotB.region} | Power: {selectedSlotB.power}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-mono py-4">Click an inventory module to insert</div>
                )}
              </div>
            </div>

            {/* Compile Action */}
            <div className="flex justify-center">
              <button
                onClick={handleForge}
                disabled={!selectedSlotA || !selectedSlotB}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-40 flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>Compile Protocol Spell</span>
              </button>
            </div>

            {/* Result Display */}
            {forgeResult && (
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">SYNTHESIS SUCCESSFUL</span>
                  <span className="text-xs font-mono font-bold text-amber-800">{forgeResult.power} PROTOCOL POWER</span>
                </div>
                <h4 className="text-lg font-bold text-purple-950 font-mono">{forgeResult.name}</h4>
                <div className="text-xs text-purple-700 font-mono">{forgeResult.type}</div>
                <p className="text-xs text-slate-700 mt-1">{forgeResult.desc}</p>
              </div>
            )}
          </div>

          {/* Compiled Spell Log */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Compiled Protocol History</div>
            <div className="space-y-2">
              {forgedHistory.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 flex justify-between items-center text-xs font-mono shadow-xs">
                  <div>
                    <span className="font-bold text-purple-950">{item.name}</span>
                    <span className="text-slate-500 ml-2">({item.combo})</span>
                  </div>
                  <span className="text-emerald-700 font-bold">READY TO CAST</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
