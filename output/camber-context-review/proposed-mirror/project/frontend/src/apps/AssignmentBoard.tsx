import React, { useEffect, useState } from 'react';
import { ArrowRight, FileText, Compass, CheckCircle2 } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { visibleOpportunities, opportunityStatus, activityReady, journeyChapterReady, emptyAssignmentJournal } from '../gameplay/AssignmentFlow';
import { ACTIVITY_HIERARCHY, ADVENTURE_CHOICES } from '../gameplay/ProgressionEngine';
import AdventureScene from './AdventureScene';
import { evaluateLinkedActivities, WORK_DEFINITIONS, WORKNET_ASSIGNMENTS } from '../gameplay/ActivityEngine';

export default function AssignmentBoard({ onOpenMission }: { onOpenMission?: (id: string) => void }) {
  const player = useOSStore(state => state.gameplay.player);
  const cycle = useOSStore(state => state.gameplay.timeCycleCount);
  const journal = player.assignmentJournal || emptyAssignmentJournal();
  const [selectedId, setSelectedId] = useState(journal.selectedId || 'ms-shift-04');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  useEffect(() => { if (journal.selectedId) { setSelectedId(journal.selectedId); setKind('all'); setQuery(''); setFeedback(''); } }, [journal.selectedId, journal.selectionVersion]);
  const visible = visibleOpportunities(player).filter(item => (kind === 'all' || item.kind === kind) && `${item.title} ${item.institution} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const selected = visible.find(item => item.id === selectedId) || visible[0];
  const activity = selected ? evaluateLinkedActivities(player.taskResults || {}).find(item => item.id === selected.id) : undefined;
  const openMission = onOpenMission || ((id: string) => useOSStore.getState().openAssignment(id));
  return <section className="assignment-board" aria-label="Opportunity directory">
    <aside className="assignment-directory">
      <header><span className="workspace-kicker">WorkNet / VerseNet</span><h2>Find your next chapter.</h2><p>A shift, a small favor, or a story worth following.</p><button className="world-journal-link" onClick={() => useOSStore.getState().openWorldJournal()}>Explore & open Discovery Journal <Compass size={13} /></button></header>
      <label>Activity type<select aria-label="Activity type" value={kind} onChange={event => setKind(event.target.value)}>{['all', 'task', 'quest', 'mission', 'journey', 'adventure'].map(value => <option key={value} value={value}>{value === 'all' ? 'All opportunities' : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      <label>Find an opportunity<input aria-label="Find an opportunity" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, workplace, or subject" /></label>
      <nav aria-label="Choose an opportunity">{visible.map(item => <button key={item.id} aria-pressed={item.id === selected?.id} onClick={() => { setSelectedId(item.id); setFeedback(''); }}><span className="workspace-kicker">{item.kind} · {opportunityStatus(item, player, cycle)}</span><strong>{item.title}</strong><small>{item.institution}</small><ArrowRight size={14} /></button>)}</nav>
      {!visible.length && <p className="assignment-empty">No opportunities match. Try another activity type or search.</p>}
    </aside>
    <article className="assignment-feature" aria-label="Opportunity briefing">
      {selected ? <>
        <p className="activity-hierarchy">{ACTIVITY_HIERARCHY.join(' › ')}<small>Layers of scope. Activities can connect without requiring every layer.</small></p>
        <div className="assignment-feature-meta"><span className="workspace-kicker">{selected.kind} / {selected.institution}{activity?.origin ? ` / ${activity.origin}` : ''}</span><Compass size={24} strokeWidth={1} /></div>
        <h1>{selected.title}</h1><p className="assignment-lede">{selected.description}</p>
        {activity?.styles && <p className="workspace-kicker">{activity.styles.join(' · ')} / prototype story</p>}
        <dl className="assignment-facts"><div><dt>Where</dt><dd>{selected.location}</dd></div><div><dt>At completion</dt><dd>{selected.reward}</dd></div></dl>
        <div className="assignment-actions">{selected.unlock ? <button onClick={() => setFeedback(useOSStore.getState().startAssignment(selected.id).message)}>{journal.started[selected.id] ? 'Briefing saved · resume activity' : `Choose this ${selected.kind}`} <ArrowRight size={14} /></button> : <button onClick={() => openMission(selected.parentMissionId || selected.id)}>{selected.kind === 'task' ? 'Perform this assigned Task' : 'Review assignment & employment terms'} <ArrowRight size={14} /></button>}
          {journal.files[`briefing:${selected.id}`] && <button className="assignment-secondary" onClick={() => useOSStore.getState().openAssignmentFiles(selected.id)}><FileText size={14} /> Open assignment folder</button>}</div>
        {feedback && <p className="assignment-feedback" role="status">{feedback}</p>}
        {selected.kind === 'adventure' && journal.started[selected.id] && <AdventureScene key={selected.id} adventureId={selected.id} />}
        {selected.kind === 'journey' && <section className="journey-chapters" aria-label="Journey chapters"><span className="workspace-kicker">Continuing Journey</span><h2>Complete chapters. Keep growing.</h2><p>{activity?.chaptersComplete ? 'Your current chapters are complete. This Journey remains open for future development.' : 'Each chapter records part of a continuing professional life.'}</p>{activity?.chapters.map(chapter => {
          const claimed = journal.chapterClaims?.[`${selected.id}:${chapter.id}`] || (chapter.id === 'accreditation' && journal.claimed[selected.id]);
          return <div key={chapter.id}><h3>{chapter.title}</h3><p>{claimed ? 'Chapter recorded · Journey ongoing' : journeyChapterReady(selected.id, chapter.id, player) ? 'Chapter ready to record' : chapter.after ? 'Complete the previous chapter and this chapter’s accepted work.' : 'Complete and submit this chapter’s field work.'}</p><button disabled={!journal.started[selected.id] || Boolean(claimed) || !journeyChapterReady(selected.id, chapter.id, player)} onClick={() => setFeedback(useOSStore.getState().claimJourneyChapter(selected.id, chapter.id).message)}>{claimed ? 'Chapter recorded' : 'Record chapter completion'}</button></div>;
        })}</section>}
        {selected.kind === 'adventure' && journal.started[selected.id] && <section className="adventure-approach" aria-label="Adventure approach"><span className="workspace-kicker">Your approach shapes the record</span><h2>How will you follow the lead?</h2>{player.worldJournal?.branches?.[selected.id] ? <p>{player.worldJournal.branches[selected.id].consequence}</p> : ADVENTURE_CHOICES.map(choice => <div key={choice.id}><button onClick={() => setFeedback(useOSStore.getState().chooseAdventureApproach(selected.id, choice.id).message)}>{choice.label}</button><p>{choice.consequence}</p></div>)}</section>}
        <section className="assignment-roadmap" aria-label="Assignment activities"><span className="workspace-kicker">Your assignment</span><h2>{selected.unlock ? 'A path through the story.' : 'The work you will do.'}</h2>
          {activity?.milestones.map((milestone, index) => <div className="assignment-milestone" key={milestone.id}><span>{milestone.complete ? <CheckCircle2 size={17} /> : String(index + 1).padStart(2, '0')}</span><div><h3>{milestone.label}</h3><p>{milestone.complete ? milestone.unlock : milestone.requirements.map(requirement => WORK_DEFINITIONS[requirement.definitionId].stages.find(stage => stage.id === requirement.stageId)?.title).join(' · ')}</p></div></div>)}
          {selected.missionIds.map(id => <div className="assignment-related" key={id}><div><h3>{WORKNET_ASSIGNMENTS[id].title}</h3><p>{WORK_DEFINITIONS[id].stages.map(stage => stage.mechanic).filter((value, index, values) => values.indexOf(value) === index).join(' · ')} · Clearance {WORK_DEFINITIONS[id].clearance}</p><ol>{WORK_DEFINITIONS[id].stages.filter(stage => !selected.taskStageId || stage.id === selected.taskStageId).map(stage => <li key={stage.id}>{stage.title}</li>)}</ol></div><button onClick={() => openMission(id)}>{player.worknetOrders?.[id]?.status === 'accepted' ? 'Review work' : 'Open assignment'} <ArrowRight size={13} /></button></div>)}
        </section>
        {selected.unlock && selected.kind !== 'journey' && <section className="assignment-unlock"><span className="workspace-kicker">Special unlock</span><h2>{selected.unlock.name}</h2><p>{journal.claimed[selected.id] ? 'Added to your collection. The record is available in your assignment folder.' : 'Complete and submit the required work, then collect this permanent record.'}</p><button disabled={!journal.started[selected.id] || !activityReady(selected.id, player) || (selected.kind === 'adventure' && !player.worldJournal?.branches?.[selected.id]) || Boolean(journal.claimed[selected.id])} onClick={() => setFeedback(useOSStore.getState().claimActivityUnlock(selected.id).message)}>{journal.claimed[selected.id] ? 'Collected' : 'Collect special unlock'}</button></section>}
        {journal.unlocks.length > 0 && <details className="assignment-collection"><summary>Your collection · {journal.unlocks.length}</summary>{journal.unlocks.map(name => <p key={name}>{name}</p>)}</details>}
      </> : <div className="workspace-empty"><h2>{kind === 'task' ? 'Tasks arrive with assignments.' : kind === 'adventure' ? 'Let the city surprise you.' : 'No matching opportunities.'}</h2><p>{kind === 'task' ? 'Accept work at an institution to receive its individual assigned Tasks.' : kind === 'adventure' ? 'Exploration, relationships, and work can reveal invitations. You can explore freely.' : 'Clear the search to see available work.'}</p><button className="world-journal-link" onClick={() => useOSStore.getState().openWorldJournal()}>Open Discovery Journal</button></div>}
    </article>
  </section>;
}
