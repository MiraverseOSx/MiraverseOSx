import React from 'react';
import { ArrowUpRight, Clock3, HeartPulse, ListTodo } from 'lucide-react';
import { NOTICES } from '../../data/notices';
import { useOSStore } from '../../store/useOSStore';
import { launchDesktopApp } from './appDirectory';
import '../../styles/apps/DesktopWidgetRail.css';

interface DesktopWidgetRailProps {
  now: Date;
}

const SEGMENTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export default function DesktopWidgetRail({ now }: DesktopWidgetRailProps) {
  const player = useOSStore((state) => state.gameplay.player);
  const cycle = useOSStore((state) => state.gameplay.timeCycleCount ?? 1);
  const segmentIndex = useOSStore((state) => state.gameplay.timeSegmentIndex ?? 0);
  const aura = player.auraHealth ?? 100;
  const conditionCount = (player.conditions ?? []).length;
  const completedIds: string[] = player.completedNoticeIds ?? [];
  const pendingNotices = NOTICES.filter((notice) => !notice.completed && !completedIds.includes(notice.id));

  return (
    <aside className="desktop-widget-rail" aria-label="Desktop widgets" tabIndex={0}>
      <section className="desktop-widget desktop-widget--clock" aria-labelledby="desktop-clock-title">
        <div className="desktop-widget-heading"><Clock3 size={14} aria-hidden="true" /><h2 id="desktop-clock-title">Your day</h2><span>AURELINE</span></div>
        <time className="desktop-widget-clock" dateTime={now.toISOString()}>
          <strong>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</strong>
          <span>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </time>
        <div className="desktop-widget-cycle"><span>Cycle {String(cycle).padStart(2, '0')}</span><span>{SEGMENTS[segmentIndex] ?? 'Morning'}</span></div>
      </section>

      <section className="desktop-widget desktop-widget--aura" aria-labelledby="desktop-aura-title">
        <div className="desktop-widget-heading"><HeartPulse size={14} aria-hidden="true" /><h2 id="desktop-aura-title">Aura integrity</h2></div>
        <div className="desktop-widget-aura"><strong>{aura}<small>%</small></strong><span>{conditionCount === 0 ? 'No active conditions' : `${conditionCount} active condition${conditionCount === 1 ? '' : 's'}`}</span></div>
        <progress aria-label="Aura integrity" value={Math.min(100, Math.max(0, aura))} max={100} />
        <button className="desktop-widget-action" onClick={() => launchDesktopApp('vitals')}>View VITALS <ArrowUpRight size={13} aria-hidden="true" /></button>
      </section>

      <section className="desktop-widget desktop-widget--notices" aria-labelledby="desktop-notices-title">
        <div className="desktop-widget-heading"><ListTodo size={14} aria-hidden="true" /><h2 id="desktop-notices-title">Notice Board</h2><span className="desktop-widget-count" aria-label={`${pendingNotices.length} pending directives`}>{pendingNotices.length}</span></div>
        {pendingNotices.length ? <ul className="desktop-widget-notices">{pendingNotices.slice(0, 2).map((notice) => <li key={notice.id}><span aria-hidden="true" /><p>{notice.title}</p></li>)}</ul> : <p className="desktop-widget-empty">All directives complete</p>}
        <button className="desktop-widget-action" onClick={() => launchDesktopApp('board')}>Open Notice Board <ArrowUpRight size={13} aria-hidden="true" /></button>
      </section>
    </aside>
  );
}
