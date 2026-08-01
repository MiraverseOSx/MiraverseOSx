import React from 'react';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import { Card, CardBody, CardHeader } from '../components/ui/card';

const TASKS = [
  { id: 't-identity', text: 'Complete registration & activate Aura Passport', reward: { xp: 50, credits: 50 }, phase: 1 },
  { id: 't-dorm', text: 'Confirm dorm assignment and review housing rules', reward: { xp: 40, credits: 50 }, phase: 2 },
  { id: 't-medical', text: 'Visit Faith Medical portal and schedule intake scan', reward: { xp: 60, credits: 75 }, phase: 3 },
  { id: 't-social', text: 'Attend orientation and join first ChatMeet session', reward: { xp: 40, credits: 25 }, phase: 4 },
];

export default function NoticeBoardApp() {
  const player = useOSStore((s) => s.gameplay.player);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);
  const addXP = useOSStore((s) => s.addXP);
  const addCredits = useOSStore((s) => s.addCredits);

  const currentPhase = player.starterPhase || 0;
  const available = TASKS.filter((t) => t.phase >= currentPhase && t.phase <= currentPhase + 1);

  const complete = (task) => {
    addXP(task.reward.xp);
    addCredits(task.reward.credits);
    advanceStarterPhase(task.phase);
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-b from-[#FBFBFE] to-[#F2F4FA] text-[#182241]">
      <div className="w-56 border-r border-slate-200 bg-white/70 p-3">
        <div className="text-[10px] font-bold tracking-[.2em] text-slate-600 mb-2">JOURNEY</div>
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-[12px]">
          <div className="text-slate-500">Starter Phase</div>
          <div className="mt-1 font-mono text-sm font-bold text-[#1c2550]">{currentPhase} / 5</div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-3 text-[11px] font-bold tracking-[.16em] text-slate-600">TASKS & MISSIONS</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((task) => (
            <Card key={task.id}>
              <CardHeader className="text-[12px] font-semibold text-[#1a224a]">{task.text}</CardHeader>
              <CardBody>
                <div className="text-[11px] text-slate-600">Rewards: +{task.reward.xp} XP, +₡{task.reward.credits}</div>
                <Button onClick={() => complete(task)} className="mt-3" size="sm">Complete</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
