import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import { Card, CardBody, CardHeader } from '../components/ui/card';
import { Briefcase, CheckCircle2, Shield, Wrench, Package, Cpu, Zap } from 'lucide-react';

const TASKS = [
  { id: 't-identity', text: 'Complete registration & activate Civic Profile', reward: { xp: 50, credits: 50 }, phase: 0 },
  { id: 't-path', text: 'Choose Life Path (Cycademy Student or Freelancer)', reward: { xp: 50, credits: 100 }, phase: 1 },
  { id: 't-dorm', text: 'Confirm room quarters assignment & housing rules', reward: { xp: 40, credits: 50 }, phase: 2 },
  { id: 't-medical', text: 'Visit Faith Medical portal & schedule intake scan', reward: { xp: 60, credits: 75 }, phase: 3 },
  { id: 't-social', text: 'Attend orientation call or netrunner briefing in ChatMeet', reward: { xp: 40, credits: 50 }, phase: 4 },
];

const FREELANCE_GIGS = [
  {
    id: 'GIG-01',
    title: 'Terminal Sector Bad Cluster Format',
    category: 'Tech Maintenance',
    client: 'Cycademy Admin',
    desc: 'Format 5 corrupted sector blocks in Undervault storage.',
    reward: { credits: 150, xp: 40, item: 'Aura Elixir' },
    icon: Wrench,
  },
  {
    id: 'GIG-02',
    title: 'Encrypted Data Parcel Delivery',
    category: 'Logistics',
    client: 'VectorNet Underground',
    desc: 'Deliver an encrypted frequency disk to Sector 7 Node.',
    reward: { credits: 250, xp: 60, item: 'Exploit Disk' },
    icon: Package,
  },
  {
    id: 'GIG-03',
    title: 'Faith Medical Patient Telemetry Triage',
    category: 'Medical Assist',
    client: 'Aureline Health',
    desc: 'Triage 3 incoming student aura profiles during flux surge.',
    reward: { credits: 200, xp: 50, item: 'Medical Commendation' },
    icon: Zap,
  },
  {
    id: 'GIG-04',
    title: 'DGA Malware String Quarantine',
    category: 'Security Bounty',
    client: 'Digital Governance Agency',
    desc: 'Quarantine rogue PRISM corruption nodes in Sector 4.',
    reward: { credits: 300, xp: 80, item: 'Security Badge' },
    icon: Shield,
  },
];

export default function NoticeBoardApp() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'gigs'
  const [completedGigs, setCompletedGigs] = useState([]);

  const player = useOSStore((s) => s.gameplay.player);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);
  const addXP = useOSStore((s) => s.addXP);
  const addCredits = useOSStore((s) => s.addCredits);

  const currentPhase = player.starterPhase || 0;
  const availableTasks = TASKS.filter((t) => t.phase >= currentPhase && t.phase <= currentPhase + 1);

  const completeTask = (task) => {
    addXP(task.reward.xp);
    addCredits(task.reward.credits);
    advanceStarterPhase(task.phase);
  };

  const completeGig = (gig) => {
    if (completedGigs.includes(gig.id)) return;
    addXP(gig.reward.xp);
    addCredits(gig.reward.credits);
    setCompletedGigs((prev) => [...prev, gig.id]);
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241] font-sans text-xs select-none">
      {/* Sidebar Navigation */}
      <div className="w-52 border-r border-slate-300/80 bg-white/70 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold tracking-[.2em] text-slate-500 uppercase">MISSION BOARD</div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-[10px] text-slate-500">Starter Phase</div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[#1d2650]">Phase {currentPhase} / 5</div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tasks' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              📜 Journey Tasks ({availableTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('gigs')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'gigs' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              💼 Freelance Gigs ({FREELANCE_GIGS.length - completedGigs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      <div className="flex-1 p-5 overflow-auto bg-[#FAFAFC]">
        {activeTab === 'tasks' ? (
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">JOURNEY & STARTER TASKS</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="font-bold text-xs text-[#1d2650]">{task.text}</div>
                  <div className="text-[11px] text-slate-500">Rewards: +{task.reward.xp} XP, +₡{task.reward.credits}</div>
                  <Button onClick={() => completeTask(task)} size="sm" variant="solid" className="w-full mt-2">
                    Complete Task
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">FREELANCE ODD-JOBS & CONTRACTS</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FREELANCE_GIGS.map((gig) => {
                const IconComp = gig.icon;
                const isDone = completedGigs.includes(gig.id);
                return (
                  <div key={gig.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1d2650]">
                        <IconComp size={16} className="text-[#5f6ab0]" /> {gig.title}
                      </div>
                      <span className="text-[9px] bg-indigo-100 px-2 py-0.5 rounded font-mono text-indigo-800 font-bold">
                        {gig.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{gig.desc}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Client: {gig.client}</span>
                      <span className="font-bold text-[#1d2650]">
                        +₡{gig.reward.credits} • +{gig.reward.xp} XP
                      </span>
                    </div>

                    <Button
                      onClick={() => completeGig(gig)}
                      disabled={isDone}
                      size="sm"
                      variant={isDone ? 'outline' : 'solid'}
                      className="w-full mt-2"
                    >
                      {isDone ? '✅ Contract Completed' : 'Accept & Claim Contract'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
