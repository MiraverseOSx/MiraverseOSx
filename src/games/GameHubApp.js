import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { GAMES_CATALOG } from './index';

export default function GameHubApp() {
  const [selectedGame, setSelectedGame] = useState(null);
  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const completeQuest = useOSStore((s) => s.completeQuest);

  // ------------------------------------------------------------------
  // Mini Game 1: Netrunner Hacking
  // ------------------------------------------------------------------
  const NetrunnerGame = () => {
    const [nodes, setNodes] = useState([
      { id: 1, name: 'Firewall Gateway', status: 'LOCKED', difficulty: 'Easy', reward: 50 },
      { id: 2, name: 'Proxy Core', status: 'LOCKED', difficulty: 'Easy', reward: 75 },
      { id: 3, name: 'Obsidian Data Vault', status: 'LOCKED', difficulty: 'Medium', reward: 150 },
      { id: 4, name: 'Voss Encryption Node', status: 'LOCKED', difficulty: 'Medium', reward: 200 },
      { id: 5, name: 'Imperial War Subnet', status: 'LOCKED', difficulty: 'Hard', reward: 300 },
      { id: 6, name: 'ORACLE-9 Mainframe', status: 'LOCKED', difficulty: 'Extreme', reward: 500 },
    ]);
    const [log, setLog] = useState(['Initiated Netrunner Interface. Select a node to breach...']);

    const hackNode = (node) => {
      if (node.status === 'HACKED') return;
      const successChance = node.difficulty === 'Easy' ? 0.9 : node.difficulty === 'Medium' ? 0.7 : node.difficulty === 'Hard' ? 0.5 : 0.3;
      const roll = Math.random();

      if (roll <= successChance) {
        setNodes((prev) =>
          prev.map((n) => (n.id === node.id ? { ...n, status: 'HACKED' } : n))
        );
        addCredits(node.reward);
        addXP(node.reward / 2);
        setLog((prev) => [
          `✅ Breach successful on [${node.name}]! +${node.reward} Credits, +${node.reward / 2} XP`,
          ...prev,
        ]);
      } else {
        setLog((prev) => [
          `❌ Countermeasures activated on [${node.name}]! Hack failed. Try again...`,
          ...prev,
        ]);
      }
    };

    return (
      <div className="flex flex-col h-full bg-slate-950 p-4 font-mono text-xs text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-cyan-400 font-bold text-sm">⚡ Netrunner Node Breach</span>
          <span className="text-emerald-400">Credits: ₡{player.credits}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => hackNode(node)}
              disabled={node.status === 'HACKED'}
              className={`p-3 rounded-xl border flex flex-col text-left transition ${
                node.status === 'HACKED'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 opacity-60'
                  : 'border-cyan-500/30 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{node.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10">{node.difficulty}</span>
              </div>
              <div className="mt-2 text-[11px] text-white/60">
                {node.status === 'HACKED' ? '✔ BREACHED' : `Reward: ₡${node.reward}`}
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-black/60 rounded-xl p-3 border border-white/10 overflow-auto text-green-400 space-y-1">
          {log.map((entry, idx) => (
            <div key={idx}>{entry}</div>
          ))}
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Mini Game 2: Faction Quest Runner
  // ------------------------------------------------------------------
  const QuestRunnerGame = () => {
    const quests = [
      {
        id: 'Q01',
        title: 'The Ironspire Intel Heist',
        npc: 'Drift (The Drifters)',
        region: 'Ironspire',
        desc: 'Infiltrate Commander Halvorn\'s war room and retrieve classified troop deployment schedules.',
        choices: [
          { text: 'Use stealth via sewage conduits', reward: { credits: 200, xp: 80 } },
          { text: 'Bribe an Imperial guard officer', reward: { credits: 100, xp: 40 } },
          { text: 'Hack the security terminal directly', reward: { credits: 300, xp: 120 } },
        ],
      },
      {
        id: 'Q02',
        title: 'ORACLE-9 Transmission',
        npc: 'ORACLE-9 (AI)',
        region: 'Digital Sprawl',
        desc: 'Decode a pre-Collapse data stream intercepted near the Void Rift.',
        choices: [
          { text: 'Run frequency synthesis algorithm', reward: { credits: 250, xp: 100 } },
          { text: 'Channel Void energy resonance', reward: { credits: 400, xp: 150 } },
        ],
      },
    ];

    const [activeQuestIdx, setActiveQuestIdx] = useState(0);
    const [result, setResult] = useState(null);

    const currentQuest = quests[activeQuestIdx];

    const handleChoice = (choice) => {
      addCredits(choice.reward.credits);
      addXP(choice.reward.xp);
      completeQuest(currentQuest.id);
      setResult(`Mission Complete! Gained ₡${choice.reward.credits} Credits and +${choice.reward.xp} XP.`);
    };

    return (
      <div className="flex flex-col h-full bg-slate-950 p-4 text-xs text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-cyan-400 font-bold text-sm">⚔️ Faction Quest Runner</span>
          <span className="text-white/60">Completed: {player.completedQuests.length} / {quests.length}</span>
        </div>

        <div className="my-4 bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-cyan-300">{currentQuest.title}</span>
            <span className="text-[10px] text-white/50">{currentQuest.region}</span>
          </div>
          <p className="text-white/80 leading-relaxed">{currentQuest.desc}</p>
          <div className="text-[11px] text-cyan-400/80">Client NPC: {currentQuest.npc}</div>
        </div>

        {!result ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-white/60">Select Approach:</div>
            {currentQuest.choices.map((c, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(c)}
                className="w-full text-left p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-cyan-500/20 hover:border-cyan-400 transition"
              >
                {c.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 space-y-3">
            <div>{result}</div>
            <button
              onClick={() => {
                setResult(null);
                setActiveQuestIdx((prev) => (prev + 1) % quests.length);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
            >
              Next Quest
            </button>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Mini Game 3: Void Rift Survival
  // ------------------------------------------------------------------
  const VoidRiftGame = () => {
    const [stability, setStability] = useState(70);
    const [timer, setTimer] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
      if (gameOver) return;
      const interval = setInterval(() => {
        setStability((prev) => {
          const delta = (Math.random() - 0.5) * 12;
          const next = Math.max(0, Math.min(100, prev + delta));
          if (next <= 0 || next >= 100) {
            setGameOver(true);
          }
          return next;
        });
        setTimer((t) => t + 1);
      }, 800);

      return () => clearInterval(interval);
    }, [gameOver]);

    const stabilize = (amount) => {
      if (gameOver) return;
      setStability((prev) => Math.max(10, Math.min(90, prev + amount)));
    };

    const claimRewards = () => {
      const rewardCredits = timer * 10;
      addCredits(rewardCredits);
      addXP(timer * 5);
      setStability(70);
      setTimer(0);
      setGameOver(false);
    };

    return (
      <div className="flex flex-col h-full bg-slate-950 p-4 text-xs text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-cyan-400 font-bold text-sm">🌌 Void Rift Stabilization</span>
          <span className="text-emerald-400">Survived: {timer}s</span>
        </div>

        <div className="my-6 space-y-3">
          <div className="flex justify-between text-xs">
            <span>Rift Stability</span>
            <span className={stability < 30 || stability > 80 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {Math.round(stability)}%
            </span>
          </div>

          <div className="h-4 w-full rounded-full bg-black/60 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                stability < 30 || stability > 80 ? 'bg-red-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${stability}%` }}
            />
          </div>

          {!gameOver ? (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => stabilize(-15)}
                className="flex-1 py-3 rounded-xl border border-blue-500/40 bg-blue-500/20 hover:bg-blue-500/40 font-bold"
              >
                Cool Down (-15%)
              </button>
              <button
                onClick={() => stabilize(15)}
                className="flex-1 py-3 rounded-xl border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/40 font-bold"
              >
                Inject Energy (+15%)
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 space-y-3 text-center">
              <div className="font-bold text-sm">Rift Collapse Detected!</div>
              <div>You survived for {timer} seconds. Total Reward: ₡{timer * 10} Credits</div>
              <button
                onClick={claimRewards}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Claim Rewards & Restart
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white">
      {/* Player Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-cyan-400">🎮 Game Hub</span>
          <span className="text-white/60">Level {player.level}</span>
          <span className="text-white/60">XP: {player.xp}</span>
        </div>
        <div className="text-emerald-400 font-medium">Credits: ₡{player.credits}</div>
      </div>

      {selectedGame ? (
        <div className="flex-1 relative">
          <button
            onClick={() => setSelectedGame(null)}
            className="absolute top-3 right-3 z-10 rounded-lg bg-black/60 px-3 py-1 text-xs text-white/70 hover:bg-white/20 hover:text-white"
          >
            ◀ Back to Catalog
          </button>
          {selectedGame === 'netrunner' && <NetrunnerGame />}
          {selectedGame === 'quests' && <QuestRunnerGame />}
          {selectedGame === 'voidrift' && <VoidRiftGame />}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-cyan-400">Available Games & Mini-Loops</h2>
            <p className="text-xs text-white/60">Select a game module to earn credits, level up, and unlock lore.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {GAMES_CATALOG.map((g) => (
              <div
                key={g.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/50 hover:bg-white/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{g.icon}</span>
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">{g.difficulty}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-white">{g.title}</h3>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">{g.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400">{g.reward}</span>
                  <button
                    onClick={() => setSelectedGame(g.id)}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-400"
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
