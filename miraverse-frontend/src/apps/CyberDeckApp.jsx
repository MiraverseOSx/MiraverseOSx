import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { Shield, Zap, Sparkles, AlertTriangle, CheckCircle2, Flame, RefreshCw, Cpu } from 'lucide-react';
import Button from '../components/ui/button';

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
    <div className="h-full w-full bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] p-4 text-xs text-[#162241] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header & Combat Status */}
      <div className="flex justify-between items-center border-b border-slate-300/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="text-[#5f6ab0]" size={18} />
          <div>
            <div className="font-bold text-[#1d2650] text-sm">CYBER DECK COMBAT MATRIX</div>
            <div className="text-[10px] text-slate-500">Turn-Based Tactical Digital Defense</div>
          </div>
        </div>

        <Button onClick={handleResetBattle} size="sm" variant="outline" className="flex items-center gap-1 text-[10px]">
          <RefreshCw size={12} /> Reset Battle
        </Button>
      </div>

      {/* Battle Canvas: Enemy vs Player Health Gauges */}
      <div className="grid grid-cols-2 gap-4 my-2">
        {/* Enemy Status Box */}
        <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 space-y-2 shadow-sm">
          <div className="flex justify-between items-center font-bold">
            <span className="text-rose-900 flex items-center gap-1">
              <AlertTriangle size={14} className="text-rose-600 animate-pulse" /> PRISM Malware Core
            </span>
            <span className="text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded text-rose-800 font-semibold">
              {turn === 'enemy' ? 'ATTACKING...' : 'TARGET'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>Core Integrity:</span>
              <span className="font-bold text-rose-700">{enemyHealth} / {maxEnemyHealth} HP</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-rose-300">
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(enemyHealth / maxEnemyHealth) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Player Status Box */}
        <div className="rounded-xl border border-indigo-300 bg-indigo-50/80 p-3 space-y-2 shadow-sm">
          <div className="flex justify-between items-center font-bold">
            <span className="text-indigo-900 flex items-center gap-1">
              <Shield size={14} className="text-[#5f6ab0]" /> Player Aura Matrix
            </span>
            <span className="text-[10px] bg-indigo-200/80 px-1.5 py-0.5 rounded text-indigo-800 font-semibold">
              {turn === 'player' ? 'YOUR TURN' : 'WAITING...'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>Aura Integrity:</span>
              <span className="font-bold text-[#1d2650]">{player.auraHealth} / 100 HP</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-indigo-300">
              <div
                className="bg-[#5f6ab0] h-full transition-all duration-300"
                style={{ width: `${player.auraHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log Box */}
      <div className="flex-1 bg-white/80 border border-slate-300/80 rounded-xl p-3 overflow-auto my-2 space-y-1 shadow-inner font-mono text-[11px]">
        {battleLog.map((log, idx) => (
          <div key={idx} className="leading-snug text-slate-700">
            {log}
          </div>
        ))}
      </div>

      {/* Combat Action Cards Deck */}
      <div className="pt-2 border-t border-slate-300/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Available Cyber Combat Actions</div>
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => handlePlayerAttack('Thermal Overload', 35)}
            disabled={turn !== 'player'}
            size="sm"
            variant="solid"
            className="flex flex-col items-center p-2 h-auto text-left rounded-xl"
          >
            <div className="flex items-center gap-1 font-bold text-xs"><Flame size={13} /> Thermal Strike</div>
            <div className="text-[10px] opacity-80 mt-0.5">35 Fire Dmg</div>
          </Button>

          <Button
            onClick={() => handlePlayerAttack('Reflect Shield', 15, 0, true)}
            disabled={turn !== 'player'}
            size="sm"
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-left rounded-xl"
          >
            <div className="flex items-center gap-1 font-bold text-xs text-[#1d2650]"><Shield size={13} /> Reflect Shield</div>
            <div className="text-[10px] text-slate-500 mt-0.5">15 Dmg + Defend</div>
          </Button>

          <Button
            onClick={() => handlePlayerAttack('Spring Restoration', 10, 20)}
            disabled={turn !== 'player'}
            size="sm"
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-left rounded-xl"
          >
            <div className="flex items-center gap-1 font-bold text-xs text-emerald-800"><Zap size={13} /> Restorative Pulse</div>
            <div className="text-[10px] text-slate-500 mt-0.5">10 Dmg +20 HP</div>
          </Button>

          <Button
            onClick={() => handlePlayerAttack('Glacial Freeze', 45)}
            disabled={turn !== 'player'}
            size="sm"
            variant="solid"
            className="flex flex-col items-center p-2 h-auto text-left rounded-xl"
          >
            <div className="flex items-center gap-1 font-bold text-xs"><Sparkles size={13} /> Glacial Freeze</div>
            <div className="text-[10px] opacity-80 mt-0.5">45 Ice Dmg</div>
          </Button>
        </div>
      </div>
    </div>
  );
}
