import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { DAILY_ACTIVITIES, dailyActivityPlan, emptyWorldJournal } from '../gameplay/ProgressionEngine';

export default function DailyLifePanel({ onShop }: { onShop?: () => void }) {
  const player = useOSStore(state => state.gameplay.player);
  const life = (player.worldJournal || emptyWorldJournal()).life;
  const [activityId, setActivityId] = useState('cook');
  const [detail, setDetail] = useState('');
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const plan = dailyActivityPlan(activityId, player)!;
  const perform = () => {
    if (step < plan.steps.length - 1) { setStep(current => current + 1); return; }
    const result = useOSStore.getState().performDailyActivity(activityId, detail, plan.steps.length);
    setMessage(result.message);
    if (result.ok) { setStep(0); setDetail(''); }
  };
  return <section className="daily-life" aria-label="Everyday life"><header><span className="workspace-kicker">Your home / your own time</span><h2>A little room for everyday life.</h2><p>Cook, tidy, rearrange your space, or spend time with someone. Familiar routines become easier while staying under your control.</p></header><nav aria-label="Everyday activities">{DAILY_ACTIVITIES.map(activity => <button key={activity.id} aria-pressed={activityId === activity.id} onClick={() => { setActivityId(activity.id); setDetail(''); setStep(0); setMessage(''); }}>{activity.title}</button>)}</nav><div className="daily-routine"><span className="workspace-kicker">{plan.familiar ? 'Familiar routine · fewer steps' : 'At your own pace'}</span><h3>{plan.title}</h3><label>What would you like to do?<select aria-label="Daily activity choice" value={detail} onChange={event => { setDetail(event.target.value); setStep(0); }}>{['', ...plan.choices].map(choice => <option value={choice} key={choice}>{choice || 'Choose…'}</option>)}</select></label><p>{detail ? `${step + 1}/${plan.steps.length} · ${plan.steps[step]}` : 'Choose a routine to begin.'}</p><button disabled={!detail} onClick={perform}>{step === plan.steps.length - 1 ? 'Finish this routine' : plan.steps[step]}</button>{message && <p role="status">{message}</p>}</div><footer>{onShop && <button onClick={onShop}>Browse furnishings & shop for your home</button>}<span>{life.minutesSpent} minutes spent on your own routines</span>{life.arrangement && <p>Current arrangement: {life.arrangement}</p>}<p>Daily life stays separate from formal objectives and their rewards.</p></footer>{life.history.length > 0 && <details><summary>Recent everyday moments</summary>{life.history.slice(-5).reverse().map((entry, index) => <p key={index}>{entry.detail} · Cycle {entry.cycle} · {entry.minutes} minutes</p>)}</details>}</section>;
}
