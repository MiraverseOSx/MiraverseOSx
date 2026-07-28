import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { Shield, Zap, Sparkles, AlertTriangle, CheckCircle2, Flame, RefreshCw, Cpu } from 'lucide-react';

export default function CyberDeckApp() {
  const [enemyHealth, setEnemyHealth] = useState(150);
  const [maxEnemyHealth] = useState(150);
  const [turn, setTurn] = useState('player'); // 'player' | 'enemy' | 'victory' | 'defeat'
  const [battleLog, setBattleLog] = useState([
    '⚔️ Turn-Based Cyber Deck Combat Engaged!',
    '⚠️ Target Identified: [PRISM MALWARE CORE v4.8] — Health: 150/150',
    '⚡ Select a synthesized spell or cyber action from your deck to attack.'
  ]);

  const player = useOSStore((s) => s.gameplay.player);
  const damageAura = useOSStore((s) => s.damageAura);
  const healAura = useOSStore((s) => s.healAura);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const purgePrismCorruption = useOSStore((s) => s.purgePrismCorruption);

  const handlePlayerAttack = (actionName, damage, healAmount = 0, isShield = false) => {
    if (turn !== 'player') return;

    const newEnemyHp = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newEnemyHp);
    if (healAmount > 0) healAura(healAmount);

    const logEntry = `✨ Player cast [${actionName}]! Dealt ${damage} damage to PRISM Core.${
      healAmount > 0 ? ` Restored +${healAmount} Aura.` : ''
    }`;

    if (newEnemyHp <= 0) {
      setTurn('victory');
      addCredits(250);
      addXP(120);
      purgePrismCorruption(5.0);
      setBattleLog((prev) => [
        '🏆 VICTORY! PRISM Malware Core Purged.',
        '🎉 REWARDS: +250 ₡ Credits, +120 XP, PRISM Corruption Reduced (-5.0%).',
        logEntry,
        ...prev
      ]);
      return;
    }

    setBattleLog((prev) => [logEntry, ...prev]);
    setTurn('enemy');

    // Enemy Turn Counter-Attack after 1s
    setTimeout(() => {
      const enemyDmg = isShield ? 5 : Math.floor(Math.random() * 15) + 15;
      damageAura(enemyDmg);
      const enemyLog = `💥 PRISM Core Counter-Attacked! Sustained -${enemyDmg} Aura damage.`;

      if (player.auraHealth - enemyDmg <= 0) {
        setTurn('defeat');
        setBattleLog((prev) => ['💀 CRITICAL FAILURE! Aura Health Depleted.', enemyLog, ...prev]);
      } else {
        setBattleLog((prev) => [enemyLog, ...prev]);
        setTurn('player');
      }
    }, 1000);
  };

  const handleResetBattle = () => {
    setEnemyHealth(150);
    setTurn('player');
    setBattleLog([
      '⚔️ Battle Reset! New PRISM Malware Core Spawned.',
      '⚠️ Target Identified: [PRISM MALWARE CORE v4.8] — Health: 150/150'
    ]);
  };

  return (
    <div className="h-full w-full bg-slate-950 p-4 text-xs font-mono text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header & Combat Status */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="text-cyan-400 animate-pulse" size={18} />
          <div>
            <div className="font-bold text-cyan-300 text-sm">CYBER DECK COMBAT MATRIX</div>
            <div className="text-[10px] text-white/50">Turn-Based Tactical Digital Defense</div>
          </div>
        </div>

        <button
          onClick={handleResetBattle}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-bold text-cyan-200 transition"
        >
          <RefreshCw size={12} /> Reset Battle
        </button>
      </div>

      {/* Battle Canvas: Enemy vs Player Health Gauges */}
      <div className="grid grid-cols-2 gap-4 my-2">
        {/* Enemy Status Box */}
        <div className="rounded-xl border border-pink-500/40 bg-pink-950/30 p-3 space-y-2">
          <div className="flex justify-between items-center font-bold">
            <span className="text-pink-300 flex items-center gap-1">
              <AlertTriangle size={14} className="text-pink-400 animate-pulse" /> PRISM Malware Core
            </span>
            <span className="text-[10px] bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-200">
              {turn === 'enemy' ? 'ATTACKING...' : 'TARGET'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-white/70 mb-1">
              <span>Core Integrity:</span>
              <span className="font-bold text-pink-400">{enemyHealth} / {maxEnemyHealth} HP</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-pink-500/30">
              <div
                className="bg-pink-500 h-full transition-all duration-300 shadow-[0_0_10px_#EC4899]"
                style={{ width: `${(enemyHealth / maxEnemyHealth) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Player Status Box */}
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-3 space-y-2">
          <div className="flex justify-between items-center font-bold">
            <span className="text-cyan-300 flex items-center gap-1">
              <Shield size={14} className="text-cyan-400" /> Operative Aura
            </span>
            <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-200">
              Level {player.level}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-white/70 mb-1">
              <span>Aura Health:</span>
              <span className="font-bold text-emerald-400">{player.auraHealth} / 100 HP</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="bg-emerald-400 h-full transition-all duration-300 shadow-[0_0_10px_#34D399]"
                style={{ width: `${player.auraHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log Box */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-black/60 p-3 space-y-1 my-1 text-[10px]">
        {battleLog.map((log, idx) => (
          <div key={idx} className="leading-snug">{log}</div>
        ))}
      </div>

      {/* Player Action Deck Controls */}
      <div className="pt-2 border-t border-white/10">
        <div className="text-[10px] font-bold text-cyan-300 mb-1.5 flex items-center gap-1">
          <Zap size={12} /> Select Cyber Deck Action:
        </div>

        {turn === 'victory' ? (
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-400/40 p-3 text-center text-emerald-300 font-bold text-xs space-y-1">
            <div className="flex items-center justify-center gap-1"><CheckCircle2 size={16} /> BATTLE VICTORY!</div>
            <button
              onClick={handleResetBattle}
              className="mt-1 px-4 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
            >
              Start Next Battle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePlayerAttack('Thermal Flare', 50)}
              disabled={turn !== 'player'}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 hover:bg-amber-500/30 transition text-left disabled:opacity-50"
            >
              <div className="font-bold text-amber-300 flex items-center gap-1 text-[10px]">
                <Flame size={12} /> Thermal Flare
              </div>
              <div className="text-[8px] text-amber-200/70">50 Dmg • Overload Core</div>
            </button>

            <button
              onClick={() => handlePlayerAttack('Reflect Shield', 35, 0, true)}
              disabled={turn !== 'player'}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-2 hover:bg-cyan-500/30 transition text-left disabled:opacity-50"
            >
              <div className="font-bold text-cyan-300 flex items-center gap-1 text-[10px]">
                <Shield size={12} /> Reflect Shield
              </div>
              <div className="text-[8px] text-cyan-200/70">35 Dmg • Block Next Hit</div>
            </button>

            <button
              onClick={() => handlePlayerAttack('Seal Lock', 25, 15)}
              disabled={turn !== 'player'}
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-2 hover:bg-violet-500/30 transition text-left disabled:opacity-50"
            >
              <div className="font-bold text-violet-300 flex items-center gap-1 text-[10px]">
                <Sparkles size={12} /> Seal Lock
              </div>
              <div className="text-[8px] text-violet-200/70">25 Dmg • Restores +15 Aura</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
