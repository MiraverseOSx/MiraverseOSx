import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

const MEDICAL_CONDITIONS = {
  'Veilwilt': {
    class: 'Aura-depletion disorder',
    effect: 'Aura greying, exhaustion, and mana flow dampening. Treated through rest & stabilization.',
    overlayColor: 'rgba(156, 163, 175, 0.4)'
  },
  'Frostlung Syndrome': {
    class: 'Cryo-respiratory disorder',
    effect: 'Cold chest pain, crystallized breath, and aura flow dimming. Requires thermal warming.',
    overlayColor: 'rgba(59, 130, 246, 0.5)'
  },
  'Sunspire Burn Fever': {
    class: 'Pyro-systemic fever',
    effect: 'High fever, visual glitches, and sudden aura flare bursts. Requires thermal cooling.',
    overlayColor: 'rgba(239, 68, 68, 0.6)'
  }
};

export default function AuraPassportApp() {
  const player = useOSStore((s) => s.gameplay.player);
  const healAura = useOSStore((s) => s.healAura);
  const clearConditions = useOSStore((s) => s.clearConditions);
  const decryptLineage = useOSStore((s) => s.decryptLineage);
  const addCredits = useOSStore((s) => s.addCredits);

  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'aura' | 'medical' | 'reputation' | 'lineage'
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptError, setDecryptError] = useState('');

  const handleDecrypt = () => {
    if (decryptInput.trim().toUpperCase() === 'AETHERCORE') {
      decryptLineage();
      setDecryptError('');
    } else {
      setDecryptError('❌ INSUFFICIENT AUTH KEY: DECRYPTION TERMINATED');
    }
  };

  const handleTreat = () => {
    if (player.credits < 100) return;
    addCredits(-100);
    healAura(50);
    clearConditions();
  };

  // Determine current aura temperature state based on conditions
  const getTempState = () => {
    if (player.conditions.includes('Sunspire Burn Fever')) return { temp: '41.2°C (Critical Pyro)', style: 'text-red-400 font-bold' };
    if (player.conditions.includes('Frostlung Syndrome')) return { temp: '34.8°C (Sub-Thermal)', style: 'text-blue-400 font-bold' };
    if (player.conditions.includes('Veilwilt')) return { temp: '36.1°C (Low Resonance)', style: 'text-slate-400' };
    return { temp: '36.8°C (Stable)', style: 'text-emerald-400' };
  };

  const tempState = getTempState();

  return (
    <div className="flex h-full w-full bg-slate-950 text-white font-sans text-xs select-none">
      {/* Sidebar Navigation */}
      <div className="w-48 border-r border-white/10 bg-slate-900/60 p-4 space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🪪</span>
          <span className="font-bold text-sm text-cyan-400">Aura Passport</span>
        </div>

        <button
          onClick={() => setActiveTab('identity')}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            activeTab === 'identity' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <span>👤 Identity Clear</span>
        </button>

        <button
          onClick={() => setActiveTab('aura')}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            activeTab === 'aura' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <span>🌐 Aura Circuit</span>
        </button>

        <button
          onClick={() => setActiveTab('medical')}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
            activeTab === 'medical' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <span>🏥 Faith Medical</span>
          {player.conditions.length > 0 && (
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 animate-pulse">
              !
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reputation')}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            activeTab === 'reputation' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <span>🏛️ Standing Map</span>
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            activeTab === 'lineage' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
          }`}
        >
          <span>🌌 Orynvell Lineage</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-slate-950 space-y-6">
        {activeTab === 'identity' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Citizen Student Identity Card</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Cyacademy Security Clearance Core Registry</p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-white/5 p-5">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 block">FULL NAME</label>
                  <span className="font-bold text-sm text-cyan-300">Player (Operative)</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">BOARDING HOUSE</label>
                  <span className="font-medium text-white">House Solenne</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">ACADEMIC YEAR</label>
                  <span className="font-medium text-white">First Year (Syntax Base)</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">SECURITY CLEARANCE</label>
                  <span className="font-bold text-emerald-400">Class 1 / Operative</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 block">DORM LOCATION</label>
                  <span className="font-medium text-white">Dorm Room 4B</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">NATIVE REGION</label>
                  <span className="font-medium text-white">Verdania (Lush Forest Arc)</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">IDENTITY INDEX</label>
                  <span className="font-mono text-white/60">ID-7345-SOL</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block">WALLET CREDITS</label>
                  <span className="font-bold text-emerald-400">₡{player.credits}</span>
                </div>
              </div>
            </div>

            {/* Careers & Skills Sub-Panel */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 space-y-4">
              <div>
                <h3 className="font-bold text-xs text-cyan-300 uppercase">Career Placements</h3>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <span className="text-[10px] text-white/40 block">Faith Medical</span>
                    <span className="font-semibold text-white">
                      {['Patient Volunteer', 'Clinic Assistant', 'Aura Technician', 'Diagnostic Intern', 'Research Associate', 'Veil Recovery Specialist'][player.careers?.medical?.rankIndex || 0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">DGA Careers</span>
                    <span className="font-semibold text-white">
                      {['Observer', 'Cadet Asset', 'Junior Operative', 'Field Operative', 'Containment Specialist', 'Strategic Agent'][player.careers?.dga?.rankIndex || 0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Government</span>
                    <span className="font-semibold text-white">
                      {['Civic Clerk', 'Policy Aide', 'Regional Liaison', 'Public Systems Analyst', 'Diplomatic Officer', 'Royal Administrative Attaché'][player.careers?.gov?.rankIndex || 0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <h3 className="font-bold text-xs text-cyan-300 uppercase">Core Subjects</h3>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {Object.entries(player.skills || {}).slice(0, 3).map(([name, data]) => (
                    <div key={name}>
                      <span className="text-[10px] text-white/40 block">{name}</span>
                      <span className="font-bold text-white">Level {data.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aura' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Aura Network Circuit Architecture</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Real-time telemetry scan of the player's elemental flux pathways.</p>
            </div>

            <div className="flex gap-6 items-center">
              {/* SVG Aura circuit diagram */}
              <div className="h-48 w-48 shrink-0 bg-slate-900/60 rounded-2xl border border-white/10 flex items-center justify-center p-2">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {/* Central Node */}
                  <circle cx="50" cy="50" r="8" fill={player.auraHealth < 30 ? '#ef4444' : '#06b6d4'} className="animate-pulse" />
                  
                  {/* Connecting lines */}
                  <line x1="50" y1="50" x2="50" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="50" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="50" y1="50" x2="20" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="50" y1="50" x2="50" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  
                  {/* Outer Nodes */}
                  <circle cx="50" cy="20" r="5" fill={player.conditions.includes('Sunspire Burn Fever') ? '#ef4444' : '#22c55e'} />
                  <circle cx="80" cy="50" r="5" fill={player.conditions.includes('Veilwilt') ? '#9ca3af' : '#22c55e'} />
                  <circle cx="20" cy="50" r="5" fill={player.conditions.includes('Frostlung Syndrome') ? '#3b82f6' : '#22c55e'} />
                  <circle cx="50" cy="80" r="5" fill="#22c55e" />

                  {/* Pulsing ring */}
                  <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>

              <div className="flex-1 space-y-3">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Veil Resonance:</span>
                    <span className="font-bold text-cyan-300">Aligned (Aura Health: {player.auraHealth}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aura Balance:</span>
                    <span className="font-semibold text-emerald-300">Spring-Aligned</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thermal Signature:</span>
                    <span className={tempState.style}>{tempState.temp}</span>
                  </div>
                </div>

                <div className="text-[10px] text-white/50 leading-relaxed">
                  * Note: Real-time sensor grids verify connection to the regional element grids. Damaged nodes will restrict spell casting potency in the SpellForge.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Faith Medical Group — Aura Diagnostic</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Clinical records of energetic fractures, spell strain, and syndromes.</p>
            </div>

            <div className="flex gap-6">
              {/* Human wireframe layout */}
              <div className="h-48 w-32 shrink-0 bg-slate-900/60 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                {/* Visual Representation of Silhouette */}
                <div className="h-36 w-16 border-2 border-white/20 rounded-full relative flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border border-white/20 absolute top-2" />
                  <div className="h-20 w-0.5 bg-white/10 absolute" />
                  <div className="h-10 w-12 border-t border-white/20 absolute bottom-10" />
                </div>
                {/* Condition Overlays */}
                {player.conditions.map((c) => {
                  const data = MEDICAL_CONDITIONS[c];
                  if (!data) return null;
                  return (
                    <div
                      key={c}
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ backgroundColor: data.overlayColor }}
                    />
                  );
                })}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <span className="font-semibold text-white/50 text-[10px] uppercase">Active Conditions ({player.conditions.length})</span>
                  {player.conditions.length === 0 ? (
                    <div className="text-emerald-400 font-bold">✔ NO ACTIVE CONDITIONS DETECTED</div>
                  ) : (
                    <div className="space-y-2">
                      {player.conditions.map((c) => {
                        const data = MEDICAL_CONDITIONS[c] || { class: 'Unknown Syndrome', effect: 'Unspecified' };
                        return (
                          <div key={c} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                            <div className="flex justify-between font-bold text-red-300 text-sm">
                              <span>{c}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-500/10 font-normal">{data.class}</span>
                            </div>
                            <p className="mt-1 text-white/80 text-[10px] leading-relaxed">{data.effect}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {player.conditions.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-300">Emergency Aura Cleansing</div>
                      <div className="text-[10px] text-white/60">Restores 50 Aura Health & Clears all conditions. Cost: ₡100 Credits</div>
                    </div>
                    <button
                      onClick={handleTreat}
                      disabled={player.credits < 100}
                      className={`rounded-lg px-4 py-1.5 font-bold text-black transition ${
                        player.credits >= 100 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Cleansing (₡100)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reputation' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Regional Delegations & Factions Standing</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Clearing parameters for boarding, library hubs, and military zones.</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Cyacademy Administration', rep: 85, color: 'bg-cyan-500' },
                { name: 'DGA (Digital Defense Agency)', rep: 60, color: 'bg-indigo-500' },
                { name: 'Faith Medical Group', rep: 75, color: 'bg-emerald-500' },
                { name: 'The Verdant Republic', rep: 70, color: 'bg-green-500' },
                { name: 'The Obsidian Syndicate', rep: 30, color: 'bg-purple-500' },
                { name: 'The Ironveil Empire', rep: 15, color: 'bg-red-500' }
              ].map((fac) => (
                <div key={fac.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-white">{fac.name}</span>
                    <span className="text-white/60 font-semibold">{fac.rep} / 100</span>
                  </div>
                  <div className="h-2 w-full rounded bg-white/5 overflow-hidden">
                    <div className={`h-full ${fac.color} transition-all duration-300`} style={{ width: `${fac.rep}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Lineage Key & Royal Clearance (Forbidden)</h2>
              <p className="text-white/60 text-[11px] mt-0.5">Decrypt Orynvell lineage authentication markers using the forbidden OS codes.</p>
            </div>

            {player.lineageDecrypted ? (
              <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-5 space-y-4 animate-fade-in">
                <div className="border-b border-purple-500/20 pb-3">
                  <h3 className="text-purple-300 font-bold text-sm uppercase">Orynvell Royal Registry Unlocked</h3>
                  <div className="text-[10px] text-purple-400 mt-0.5">Signature Key: AETHERCORE.sys (Decrypted)</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-purple-300/60 block uppercase">Lineage Type</label>
                    <span className="font-bold text-white">Lightborn Markers (Grade AA)</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-300/60 block uppercase">Registry Class</label>
                    <span className="font-bold text-white">Seraphima Core Class 4</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-300/60 block uppercase">Royal Clearance</label>
                    <span className="font-bold text-purple-400">Gate Authentication: EXALTED</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-300/60 block uppercase">Chronological Lock</label>
                    <span className="font-mono text-white/50">T-MINUS 400 YEARS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-4xl">🔒</div>
                <div>
                  <div className="font-bold text-white">AUTHENTICATION DECRYPTION KEY REQUIRED</div>
                  <div className="text-[10px] text-white/40 mt-1">Classified Orynvell Lineage logs require the signature code of the First Forbidden OS.</div>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <input
                    type="password"
                    placeholder="Enter Decryption Key..."
                    value={decryptInput}
                    onChange={(e) => setDecryptInput(e.target.value)}
                    className="w-full text-center rounded-xl border border-white/15 bg-black/60 px-4 py-2 font-mono text-xs text-purple-400 uppercase outline-none focus:border-purple-400"
                  />
                  {decryptError && (
                    <div className="text-[10px] text-red-400 font-bold">{decryptError}</div>
                  )}
                  <button
                    onClick={handleDecrypt}
                    className="w-full rounded-xl bg-purple-500 px-4 py-2 font-bold text-black hover:bg-purple-400 transition"
                  >
                    Decrypt Lineage
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
