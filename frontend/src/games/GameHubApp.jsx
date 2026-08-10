import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { GAMES_CATALOG } from './games';

export default function GameHubApp() {
  const [selectedGame, setSelectedGame] = useState(null);
  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const completeQuest = useOSStore((s) => s.completeQuest);
  const incrementHackedNodes = useOSStore((s) => s.incrementHackedNodes);
  const damageAura = useOSStore((s) => s.damageAura);
  const addCondition = useOSStore((s) => s.addCondition);
  const addSkillXP = useOSStore((s) => s.addSkillXP);
  const addCareerXP = useOSStore((s) => s.addCareerXP);

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
        incrementHackedNodes();
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
          { text: 'Hack the security terminal directly (High Risk)', reward: { credits: 300, xp: 120 }, damage: 15, condition: 'Veilwilt' },
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
          { text: 'Channel Void energy resonance (Heavy Veil strain)', reward: { credits: 400, xp: 150 }, damage: 25, condition: 'Riftspine Fracture' },
        ],
      },
      {
        id: 'Q03',
        title: 'Faith Medical Investigation',
        npc: 'Dr. Sharon (Faith Medical)',
        region: 'Aureline Medical Sector',
        desc: 'Review the clinical telemetry of a patient affected by AETHERCORE rifts and stabilize their flow.',
        choices: [
          { text: 'Apply warm-essence diagnostics', reward: { credits: 250, xp: 90 } },
          { text: 'Perform manual aura realignment (High element strain)', reward: { credits: 350, xp: 130 }, damage: 20, condition: 'Sunspire Burn Fever' },
        ],
      },
      {
        id: 'Q04',
        title: 'DGA Security Sweep',
        npc: 'Agent Vance (DGA)',
        region: 'Campus Gate',
        desc: 'Scan student profiles at the gate for unauthorized Seraphima signatures or Lightborn indicators.',
        choices: [
          { text: 'Use standard civic scanning protocols', reward: { credits: 150, xp: 60 } },
          { text: 'Bypass firewall and decrypt lineage markers', reward: { credits: 300, xp: 120 } },
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

      let msg = `Mission Complete! Gained ₡${choice.reward.credits} Credits and +${choice.reward.xp} XP.`;
      if (choice.damage) {
        damageAura(choice.damage);
        msg += ` Sustained ${choice.damage} Aura damage.`;
      }
      if (choice.condition) {
        addCondition(choice.condition);
        msg += ` Contracted [${choice.condition}] due to strain.`;
      }
      setResult(msg);
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
      damageAura(30);
      addCondition('Riftspine Fracture');
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

  // ------------------------------------------------------------------
  // Mini Game 4: Notice Board & Careers Hub
  // ------------------------------------------------------------------
  const JobsBoardGame = () => {
    const [activeSection, setActiveSection] = useState('board'); // 'board' | 'careers' | 'skills'
    const [progressing, setProgressing] = useState(null); // { type, id, name, key }
    const [actionProgress, setActionProgress] = useState(0);
    const [log, setLog] = useState(['Job & Skills dashboard initialized. Select a task or shift...']);
    const [cooldowns, setCooldowns] = useState({ medical: 0, dga: 0, gov: 0 });
    const [taskCooldowns, setTaskCooldowns] = useState({});
    const [promoPopup, setPromoPopup] = useState(null); // { trackName, rankName }
    const [now, setNow] = useState(() => Date.now());

    // 1-second tick for live cooldown countdowns
    useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }, []);

    // Auto-dismiss promotion popup after 3s
    useEffect(() => {
      if (!promoPopup) return;
      const t = setTimeout(() => setPromoPopup(null), 3000);
      return () => clearTimeout(t);
    }, [promoPopup]);

    const SHIFT_COOLDOWN_MS = 60_000;
    const TASK_COOLDOWN_MS  = 5_000;

    const tasks = [
      { id: 'T01', title: 'Clear digital clutter in Undervault',          skill: 'Programming',   reward: 50,  skillXP: 30, xp: 20, desc: 'Requires standard terminal cleaning protocols.' },
      { id: 'T02', title: 'Deliver botanical remedies to Faith Hospital',  skill: 'Communication', reward: 80,  skillXP: 45, xp: 30, desc: 'Sort and package warm-essence diagnostics.' },
      { id: 'T03', title: 'Stabilize SpellForge conduit leakage',          skill: 'Spellcasting',  reward: 120, skillXP: 60, xp: 45, desc: 'Requires alignment check in the elements compass.' },
    ];

    const careerTracks = {
      medical: {
        name: 'Faith Medical Group',
        ranks: ['Patient Volunteer', 'Clinic Assistant', 'Aura Technician', 'Diagnostic Intern', 'Research Associate', 'Veil Recovery Specialist'],
        shifts: { id: 'medical_shift', title: 'Volunteer at Clinic Intake',   reward: 100, careerXP: 30, xp: 25 },
      },
      dga: {
        name: 'DGA Careers',
        ranks: ['Observer', 'Cadet Asset', 'Junior Operative', 'Field Operative', 'Containment Specialist', 'Strategic Agent'],
        shifts: { id: 'dga_shift',     title: 'Monitor DGA Node Logs',         reward: 120, careerXP: 35, xp: 30 },
      },
      gov: {
        name: 'Governmental Careers',
        ranks: ['Civic Clerk', 'Policy Aide', 'Regional Liaison', 'Public Systems Analyst', 'Diplomatic Officer', 'Royal Administrative Attaché'],
        shifts: { id: 'gov_shift',     title: 'Sort Regional Archive Files',   reward: 90,  careerXP: 25, xp: 20 },
      },
    };

    const handleStartAction = (type, item, key = null) => {
      if (progressing) return;
      setProgressing({ type, id: item.id || key, name: item.title, key });
      setActionProgress(0);

      const interval = setInterval(() => {
        setActionProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            finishAction(type, item, key);
            return 100;
          }
          return prev + 20;
        });
      }, 400);
    };

    const finishAction = (type, item, key) => {
      setProgressing(null);
      setActionProgress(0);

      if (type === 'task') {
        addCredits(item.reward);
        addXP(item.xp);
        addSkillXP(item.skill, item.skillXP);
        setTaskCooldowns((prev) => ({ ...prev, [item.id]: Date.now() + TASK_COOLDOWN_MS }));
        setLog((prev) => [
          `\u2705 Task Completed: [${item.title}]. Received \u20a1${item.reward} Credits, +${item.xp} XP, and +${item.skillXP} ${item.skill} XP!`,
          ...prev,
        ]);
      } else if (type === 'shift') {
        addCredits(item.reward);
        addXP(item.xp);
        addCareerXP(key, item.careerXP);
        setCooldowns((prev) => ({ ...prev, [key]: Date.now() + SHIFT_COOLDOWN_MS }));

        const rankList       = careerTracks[key].ranks;
        const currentRankIdx = player.careers[key]?.rankIndex || 0;
        const nextXP         = (player.careers[key]?.xp || 0) + item.careerXP;
        let promoMsg         = '';

        if (nextXP >= 100 && currentRankIdx < rankList.length - 1) {
          const newRank = rankList[currentRankIdx + 1];
          promoMsg = ` \uD83C\uDF89 PROMOTED to Rank [${newRank}]!`;
          setPromoPopup({ trackName: careerTracks[key].name, rankName: newRank });
        }

        setLog((prev) => [
          `\uD83D\uDCBC Shift Complete: [${item.title}]. Gained \u20a1${item.reward} Credits, +${item.xp} XP, and +${item.careerXP} Career XP for ${careerTracks[key].name}.${promoMsg}`,
          ...prev,
        ]);
      }
    };

    // SVG ring constants
    const RING_R      = 30;
    const RING_C      = 2 * Math.PI * RING_R; // circumference

    return (
      <div className="flex h-full w-full bg-slate-950 text-white font-mono text-xs select-none relative">

        {/* ── Promotion Popup ── */}
        {promoPopup && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setPromoPopup(null)}
          >
            <div className="border border-white/20 bg-slate-900 rounded-xl p-8 text-center space-y-2 w-72">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Rank Promotion</div>
              <div className="text-white/50 text-[10px]">{promoPopup.trackName}</div>
              <div className="text-cyan-400 font-bold text-base">{promoPopup.rankName}</div>
              <div className="text-[9px] text-white/25 pt-2">Click anywhere to dismiss</div>
            </div>
          </div>
        )}

        {/* ── Sidebar Nav ── */}
        <div className="w-48 border-r border-white/10 bg-slate-900/60 p-4 space-y-1 shrink-0">
          {[
            { key: 'board',   label: '📋 Notice Board' },
            { key: 'careers', label: '💼 Job Center'    },
            { key: 'skills',  label: '📈 Skills Grid'   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                activeSection === key
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Main Panel ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-5 space-y-4">

            {/* Active task / shift — SVG ring */}
            {progressing && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-5">
                <svg
                  width="72" height="72" viewBox="0 0 80 80"
                  className="shrink-0"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  {/* track */}
                  <circle
                    cx="40" cy="40" r={RING_R}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                  />
                  {/* progress */}
                  <circle
                    cx="40" cy="40" r={RING_R}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="6"
                    strokeLinecap="butt"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C - (actionProgress / 100) * RING_C}
                    style={{ transition: 'stroke-dashoffset 0.35s linear' }}
                  />
                </svg>
                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-widest text-white/30">In Progress</div>
                  <div className="font-bold text-white">{progressing.name}</div>
                  <div className="text-cyan-400">{actionProgress}% complete</div>
                </div>
              </div>
            )}

            {/* ── Notice Board ── */}
            {activeSection === 'board' && !progressing && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-cyan-400">Notice Board Bulletin</h2>
                  <p className="text-[10px] text-white/50">Accept micro-tasks to hone your academic skills.</p>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const until      = taskCooldowns[task.id] || 0;
                    const onCooldown = until > now;
                    const secsLeft   = onCooldown ? Math.ceil((until - now) / 1000) : 0;
                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white">{task.title}</div>
                          <div className="text-[10px] text-white/40">{task.desc}</div>
                          <div className="text-[9px] text-cyan-300">
                            Gains: +{task.skillXP} {task.skill} XP | +\u20a1{task.reward} Credits
                          </div>
                        </div>
                        <button
                          disabled={onCooldown}
                          onClick={() => !onCooldown && handleStartAction('task', task)}
                          className={`rounded px-3 py-1 text-[10px] font-bold transition min-w-[52px] text-center ${
                            onCooldown
                              ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                              : 'bg-cyan-500 text-black hover:bg-cyan-400'
                          }`}
                        >
                          {onCooldown ? `${secsLeft}s` : 'Accept'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Careers ── */}
            {activeSection === 'careers' && !progressing && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-cyan-400">Student Placement Careers</h2>
                  <p className="text-[10px] text-white/50">Work shifts to gain professional rank promotions.</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(careerTracks).map(([key, value]) => {
                    const currentRankIdx = player.careers[key]?.rankIndex || 0;
                    const currentRank    = value.ranks[currentRankIdx];
                    const currentXP      = player.careers[key]?.xp || 0;
                    const until          = cooldowns[key] || 0;
                    const onCooldown     = until > now;
                    const secsLeft       = onCooldown ? Math.ceil((until - now) / 1000) : 0;
                    return (
                      <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-cyan-300">{value.name}</div>
                            <div className="text-[10px] text-white/60">
                              Rank: <span className="font-bold text-white">{currentRank}</span> (Level {currentRankIdx + 1})
                            </div>
                          </div>
                          <span className="text-[10px] text-white/40">XP: {currentXP} / 100</span>
                        </div>

                        <div className="h-1.5 w-full rounded bg-white/5 overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${currentXP}%` }} />
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <div className="text-[9px] text-emerald-400">
                            Shift: +{value.shifts.careerXP} Career XP | +\u20a1{value.shifts.reward} Credits
                          </div>
                          <button
                            disabled={onCooldown}
                            onClick={() => !onCooldown && handleStartAction('shift', value.shifts, key)}
                            className={`rounded px-3 py-1 text-[10px] font-bold transition min-w-[90px] text-center ${
                              onCooldown
                                ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400'
                            }`}
                          >
                            {onCooldown ? `Ready in ${secsLeft}s` : 'Work Shift'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Skills Grid ── */}
            {activeSection === 'skills' && !progressing && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-cyan-400">Academic Skill Register</h2>
                  <p className="text-[10px] text-white/50">Your current proficiency levels across the 9 core subjects.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(player.skills).map(([name, data]) => {
                    const nextLevelXP = data.level * 150;
                    const pct         = (data.xp / nextLevelXP) * 100;
                    return (
                      <div key={name} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
                        <div className="flex justify-between font-bold text-white">
                          <span>{name}</span>
                          <span className="text-cyan-300">Lv. {data.level}</span>
                        </div>
                        <div className="h-1.5 w-full rounded bg-white/5 overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[8px] text-white/40 text-right">XP: {data.xp} / {nextLevelXP}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Console footer logs */}
          <div className="h-28 border-t border-white/10 bg-black/40 p-4 font-mono text-[9px] text-green-400 overflow-auto flex flex-col-reverse gap-1 select-text shrink-0">
            {log.map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
          </div>
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
          {selectedGame === 'jobs' && <JobsBoardGame />}
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
