import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { WORK_DEFINITIONS, nextWorkStage, resolveWorkStage, resultForStage, evaluateLinkedActivities, type TaskResult, type WorkOrder } from '../gameplay/ActivityEngine';
import { getOpportunity, briefingText } from '../gameplay/AssignmentFlow';
import { isOpportunityRevealed } from '../gameplay/ProgressionEngine';
import ReportEditor from '../components/editor/ReportEditor';
import BroadStreetCasePanel from './investigation/BroadStreetCasePanel';
import { RichMailBody } from './mail/RichMailEditor';

export default function WorknetOrderPanel({ missionId, onFeedback }: { missionId: string; onFeedback: (message: string) => void }) {
  const player = useOSStore(state => state.gameplay.player);
  const cycle = useOSStore(state => state.gameplay.timeCycleCount);
  const acceptEmployment = useOSStore(state => state.acceptEmployment);
  const openOrder = useOSStore(state => state.openWorknetOrder);
  const saveDraft = useOSStore(state => state.saveWorknetDraft);
  const submitStage = useOSStore(state => state.submitWorknetStage);
  const remediate = useOSStore(state => state.remediateWorknetOrder);
  const acknowledgeBriefing = useOSStore(state => state.acknowledgeAssignmentBriefing);
  const [incidentNote, setIncidentNote] = useState('');
  const definition = WORK_DEFINITIONS[missionId];
  if (!definition) return <p className="text-xs">No playable workflow is configured for this assignment.</p>;
  const order: WorkOrder | undefined = player.worknetOrders?.[missionId];
  const legacyCompleted = !order && player.completedWorknetMissionIds?.includes(missionId) && (definition.kind !== 'shift' || definition.track === 'medical');
  if (legacyCompleted) return <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">Previously cleared assignment retained from your earlier save. Its payout remains recorded; no new work order is required.</p>;
  const results: Record<string, TaskResult> = player.taskResults || {};
  const assignedStage = order ? nextWorkStage(order, results) : undefined;
  const current = assignedStage ? resolveWorkStage(assignedStage, order?.drafts[assignedStage.id]) || assignedStage : undefined;
  const draft = order && current ? order.drafts[current.id] || {} : {};
  const needsContract = definition.kind === 'shift' && !player.employmentContracts?.[definition.track];
  const canRepeat = definition.kind === 'shift' && definition.track !== 'medical' && order?.status === 'accepted' && cycle > order.cycle;
  const feedback = (result: { ok: boolean; message: string }) => onFeedback(`${result.ok ? '✓' : '⚠'} ${result.message}`);
  const activities = evaluateLinkedActivities(results).filter(activity => isOpportunityRevealed(activity.id, player) && activity.milestones.some(milestone => milestone.requirements.some(requirement => requirement.definitionId === missionId)));
  if (missionId === 'ms-case-002') return <BroadStreetCasePanel />;
  return (
    <section className="space-y-3 text-xs font-ui" aria-label="Assignment work order">
      <div className="work-order-block space-y-3">
        {missionId === 'ms-spec-01' && <button type="button" className="assignment-secondary" onClick={() => useOSStore.getState().openWindow('fieldOperations')}>Open playable Tunnel 09 field investigation</button>}
        <div className="flex justify-between gap-3 items-start">
          <h3 className="font-bold text-amber-950">{definition.kind === 'shift' ? 'Work shift' : definition.kind === 'quest' ? 'Civic quest' : 'Institutional mission'} · {definition.subject}</h3>
          <span className="text-[10px] uppercase text-amber-800">{order?.status || 'Available'}</span>
        </div>
        {needsContract && <div className="space-y-2">
          <p>Employment terms: available shifts, assigned duties for {definition.subject}, published pay for accepted work. Clearance {definition.clearance} required.</p>
          <button type="button" onClick={() => feedback(acceptEmployment(definition.track))} className="rounded-lg bg-slate-900 text-white px-3 py-2 font-semibold">Accept employment contract</button>
        </div>}
        {player.employmentContracts?.[definition.track] && definition.kind === 'shift' && <p className="text-slate-600">Employed as {player.employmentContracts[definition.track].position} · Available shifts · Paid per accepted work order</p>}
        <details className="work-order-briefing" open={Boolean(order && !order.briefingReadAt)}><summary>Mission briefing & assignment</summary><pre>{briefingText(getOpportunity(missionId)!)}</pre></details>
        {(!order || canRepeat) && <button type="button" disabled={needsContract} onClick={() => feedback(openOrder(missionId))} className="rounded-lg bg-amber-300 text-amber-950 px-3 py-2 font-bold disabled:opacity-50">{canRepeat ? 'Open next-cycle shift' : 'Accept assignment and reserve equipment'}</button>}
        {order && <>
          <div className="assignment-actions"><button type="button" className="assignment-secondary" onClick={() => useOSStore.getState().openAssignmentFiles(missionId)}>Open briefing folder in VAULT</button>{!order.briefingReadAt && order.status === 'active' && <button type="button" onClick={() => feedback(acknowledgeBriefing(missionId))}>I’ve read the briefing · begin activities</button>}</div>
          <p className="text-[10px] text-slate-500 break-all">{order.id}</p>
          <p>Evaluation {order.evaluation}/100 · {order.timeRemaining} work units remaining · Supplies lost: {order.resourcesUsed}</p>
          <details>
            <summary className="cursor-pointer font-semibold">Assigned Tasks · {order.resultIds.length}/{definition.stages.length} outputs accepted</summary>
          <ol className="space-y-1.5 pt-2" aria-label="Required stages">
            {definition.stages.map((stage, index) => {
              const result = resultForStage(order, stage.id, results);
              return <li key={stage.id} className={result ? 'text-emerald-800' : current?.id === stage.id ? 'font-bold text-amber-950' : 'text-slate-500'}>{result ? '✓' : `${index + 1}.`} {stage.title}{result && <details className="mt-1 font-normal text-[11px]"><summary className="cursor-pointer">Saved output</summary><p className="break-all">{result.id}</p><dl>{Object.entries(result.output).filter(([key]) => !key.endsWith('__html')).map(([key, value]) => <div key={key} className="py-0.5"><dt className="inline font-semibold">{key}: </dt><dd className="inline whitespace-pre-wrap">{result.output[`${key}__html`] ? <RichMailBody html={result.output[`${key}__html`]} text={value} /> : value}</dd></div>)}</dl></details>}</li>;
            })}
          </ol>
          </details>
          {order.briefingReadAt && (order.remediationRequired ? <form className="space-y-2 border-t border-rose-200 pt-3" onSubmit={event => { event.preventDefault(); feedback(remediate(missionId, incidentNote)); }}>
            <p role="alert" className="text-rose-800 font-semibold">Equipment offline. Isolate the unsafe equipment and record supervisor review before retrying.</p>
            <label className="block">Remediation note<textarea maxLength={4000} value={incidentNote} onChange={event => setIncidentNote(event.target.value)} className="block w-full border border-rose-200 bg-white text-slate-900 rounded-lg p-2 mt-1 min-h-20" /></label>
            <button type="submit" className="rounded-lg bg-rose-800 text-white px-3 py-2">Submit remediation</button>
          </form> : current && order.status === 'active' ? <form key={`${order.id}:${current.id}`} className="space-y-3 border-t border-amber-200 pt-3" onSubmit={event => { event.preventDefault(); feedback(submitStage(missionId, current.id, draft)); }}>
            <div><h4 className="font-bold text-slate-900">{current.title}</h4><span className="text-[10px] uppercase text-amber-800">{current.mechanic}</span></div>
            {current.approaches?.length && <label className="block">Choose your approach<select aria-label="Task approach" value={draft._approach || 'default'} onChange={event => saveDraft(missionId, current.id, { _approach: event.target.value })} className="block w-full border border-slate-300 bg-white p-2 mt-1"><option value="default">{current.defaultApproachLabel || 'Follow the assigned procedure'}</option>{current.approaches.map(approach => <option key={approach.id} value={approach.id}>{approach.label}</option>)}</select></label>}
            <p className="leading-relaxed text-slate-700">{current.brief}</p>
            {current.fields.map(field => <div key={field.id} className="block text-slate-800 font-medium"><span>{field.label}</span>
              {field.kind === 'select' ? <select aria-label={field.label} value={draft[field.id] || ''} onChange={event => saveDraft(missionId, current.id, { ...draft, [field.id]: event.target.value })} className="block w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2 mt-1"><option value="">Select…</option>{field.options!.map(option => <option key={option}>{option}</option>)}</select>
                : field.kind === 'report' ? <ReportEditor label={field.label} text={draft[field.id] || ''} html={draft[`${field.id}__html`]} onChange={(text, html) => saveDraft(missionId, current.id, { ...draft, [field.id]: text, [`${field.id}__html`]: html })} />
                  : <input aria-label={field.label} type={field.kind === 'number' ? 'number' : 'text'} step="any" maxLength={4000} value={draft[field.id] || ''} onChange={event => saveDraft(missionId, current.id, { ...draft, [field.id]: event.target.value })} className="block w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2 mt-1" />}
            </div>)}
            <p className="text-[10px] text-slate-500">Drafts save automatically. Incorrect findings reduce evaluation; unsafe procedures lose supplies and require remediation.</p>
            <button type="submit" className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 font-bold">Perform stage and save output</button>
          </form> : !current && <p className="font-semibold text-emerald-800">All required outputs accepted. {order.status === 'accepted' ? 'Work order finalized.' : 'Finalize below to close this work order.'}</p>)}
          {order.incidents.length > 0 && <details><summary className="cursor-pointer text-rose-800">Procedure review ({order.incidents.length})</summary>{order.incidents.map((incident, index) => <p key={index} className="text-slate-700 mt-1">{incident.severity}: {incident.message}</p>)}</details>}
          {order.resultIds.some(id => results[id]?.compensationPaid) && <p className="text-emerald-800">Clinical pay and experience already issued for this patient. Finalization records chart acceptance without paying that work again.</p>}
        </>}
      </div>
      {activities.length > 0 && <div className="work-order-links space-y-3">
        <h3 className="font-bold text-indigo-950">Shared progress</h3>
        <p className="text-slate-600">These activities reference the original task receipts. Each keeps its own requirements.</p>
        {activities.map(activity => <div key={activity.id}><p className="font-semibold text-indigo-950">{activity.kind} · {activity.title}</p>{activity.milestones.map(milestone => <p key={milestone.id} className={milestone.complete ? 'text-emerald-800' : 'text-slate-500'}>{milestone.complete ? '✓' : '○'} {milestone.complete ? milestone.unlock : milestone.label}</p>)}</div>)}
      </div>}
    </section>
  );
}
