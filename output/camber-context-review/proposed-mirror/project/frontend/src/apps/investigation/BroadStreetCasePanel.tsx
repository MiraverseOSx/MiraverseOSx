import React, { lazy, Suspense, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { BROAD_STREET, CASE_FINDINGS, CASE_MISSION, caseSource, restoreCaseProgress } from '../../gameplay/BroadStreetCase';
import ReportEditor from '../../components/editor/ReportEditor';
import { RichMailBody } from '../mail/RichMailEditor';
import './case-workspace.css';
const EvidenceBoard = lazy(() => import('./EvidenceBoard'));

function useCase() {
  const player = useOSStore(s => s.gameplay.player);
  useOSStore(s => s.isLoggedIn);
  const order = player.worknetOrders?.[CASE_MISSION];
  const eligible = useOSStore.getState().broadStreetEligible();
  return { player, order, eligible, progress: restoreCaseProgress(order?.caseProgress) };
}
export function CaseSourceView({ id, app, onBack }: { id: string; app: string; onBack?: () => void }) {
  const { order, eligible, progress } = useCase();
  const [notice, setNotice] = useState('');
  const source = caseSource(id);
  if (!source || source.app !== app) return <div className="case-workspace">Unknown case source.</div>;
  const allowed = eligible && order?.briefingReadAt && (order.status === 'active' || order.status === 'accepted');
  if (!allowed) return <div className="case-workspace"><h2>Case access required</h2><p>Accept and review the Broad Street assignment in WORKNET using your existing DGA/TRACE access.</p><button onClick={() => useOSStore.getState().openAssignment(CASE_MISSION)}>Open assignment</button>{onBack && <button onClick={onBack}>Return</button>}</div>;
  return <section className="case-workspace" aria-label={source.title}>
    <header><span className="case-kicker">FS-2026-00422 / ORIGINAL SOURCE</span><h2>{source.title}</h2><p>{source.publisher} · {BROAD_STREET.reference}</p></header>
    <article className="case-paper"><pre>{source.body}</pre></article>
    <div className="case-actions"><button disabled={progress.acquired.includes(id) || order.status !== 'active'} onClick={() => setNotice(useOSStore.getState().acquireCaseSource(id, app).message)}>{progress.acquired.includes(id) ? 'Source acquired' : 'Acquire source for case notebook'}</button><button onClick={() => useOSStore.getState().openAppWorkspace('dgaos', 'broadstreet:notebook')}>Open DGAOS evidence notebook</button>{onBack && <button onClick={onBack}>Return to files</button>}</div>
    <p role="status">{notice}</p>
  </section>;
}
export default function BroadStreetCasePanel({ notebook = false }: { notebook?: boolean }) {
  const { order, eligible, progress } = useCase();
  const [notice, setNotice] = useState('');
  const [hint, setHint] = useState(false);
  const state = useOSStore.getState;
  const update = (draft: typeof progress.draft) => { const result = state().saveCaseReport(draft); if (!result.ok) setNotice(result.message); };
  const canWork = eligible && order?.status === 'active' && Boolean(order.briefingReadAt);
  const latest = progress.reviews.at(-1);
  const reviewedCurrent = Boolean(order?.resultIds.includes(`${order.id}:case-review`));
  const accepted = order?.status === 'accepted';
  return <section className="case-workspace" aria-label="Broad Street connected investigation">
    <header><span className="case-kicker">EYES / CONNECTED CASE / FS-2026-00422</span><h2>Broad Street Vault Breach</h2><p>Compare records. Trace the source of each claim. Explain what remains uncertain.</p></header>
    {!eligible ? <div className="case-paper"><h3>Existing case access required</h3><p>DGA/TRACE authorization and clearance 2 are required. This assignment does not grant organization membership or credentials.</p></div> : !order ? <div className="case-paper"><h3>Begin the investigation</h3><p>A credential event, an assault, and a physical vault breach have been recorded. Review the source records and distinguish supported conclusions from assumptions.</p><p>Published compensation: 300 credits · 150 XP · one-time assignment. No deadline. Review feedback can be revised without penalty.</p><button onClick={() => setNotice(state().openWorknetOrder(CASE_MISSION).message)}>Accept Broad Street assignment</button></div> : <>
      {!order.briefingReadAt && <div className="case-paper"><h3>Assignment briefing</h3><p>Examine six original sources across VAULT, AureMail, DGAOS, and VerseNet. Request the guard’s clarification. Support three findings with citations and write an explanation of your reconstruction and its limits. The reviewer checks the selected findings and evidence; your wording is your own.</p><button onClick={() => setNotice(state().acknowledgeAssignmentBriefing(CASE_MISSION).message)}>I’ve read the briefing · begin investigation</button></div>}
      {order.briefingReadAt && <>
        <div className="case-progress"><strong>{accepted ? 'Operation accepted · receipt saved' : `${progress.acquired.length} of 6 sources acquired`}</strong><span>{progress.witnessRequested ? 'Witness clarification received' : 'Witness clarification not yet requested'}</span></div>
        <div className="case-actions"><button onClick={() => state().openAssignmentFiles(CASE_MISSION)}>Open case folder in VAULT</button>{notebook ? <button onClick={() => state().openAssignment(CASE_MISSION)}>Open report in WORKNET</button> : <button onClick={() => state().openAppWorkspace('dgaos', 'broadstreet:notebook')}>Open DGAOS evidence notebook</button>}<button onClick={() => setHint(value => !value)}>{hint ? 'Hide hint' : 'Optional hint'}</button></div>
        {hint && <p className="case-hint">Start with the access audit and facilities log in VAULT. Request the guard’s account through AureMail. Use the DGAOS laboratory sources and search VerseNet for “First Federal maintenance”. You can follow these leads in any order.</p>}
        {notebook && <Suspense fallback={<p role="status">Loading evidence board…</p>}><EvidenceBoard sources={BROAD_STREET.sources.filter(source => progress.acquired.includes(source.id))} board={progress.board} editable={canWork} onSave={board => state().saveCaseBoard(board)} onOpen={id => state().openCaseSource(id)}/></Suspense>}
        <div className="case-source-grid">{BROAD_STREET.sources.map(source => <article key={source.id}><span className="case-kicker">{source.app === 'files' ? 'VAULT' : source.app === 'mail' ? 'AUREMAIL' : source.app === 'browser' ? 'VERSENET' : 'DGAOS'}</span><h3>{source.title}</h3><p>{source.publisher}</p><button onClick={() => state().openCaseSource(source.id)}>{progress.acquired.includes(source.id) ? 'Reopen source' : source.id === 'guard-statement' && !progress.witnessRequested ? 'Request witness clarification' : 'Open original source'}</button><span className="case-source-status">{progress.acquired.includes(source.id) ? '✓ Acquired' : 'Not acquired'}</span></article>)}</div>
        {!notebook && !accepted && <form className="case-report" onSubmit={event => { event.preventDefault(); setNotice(state().reviewCaseReport().message); }}>
          <h3>Investigation findings</h3><p>Choose the finding supported by your sources, then cite the records that establish it. An association is different from a verdict.</p>
          {CASE_FINDINGS.map(finding => <fieldset key={finding.id} disabled={!canWork}><legend>{finding.title}</legend><label>Finding<select aria-label={finding.title} value={progress.draft.findings[finding.id].choice} onChange={event => update({ ...progress.draft, findings: { ...progress.draft.findings, [finding.id]: { ...progress.draft.findings[finding.id], choice: event.target.value } } })}><option value="">Choose a finding…</option>{finding.options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label><div className="case-citations" aria-label={`Citations for ${finding.id}`}>{BROAD_STREET.sources.map(source => <label key={source.id}><input type="checkbox" disabled={!progress.acquired.includes(source.id)} checked={progress.draft.findings[finding.id].citations.includes(source.id)} onChange={event => {
            const current = progress.draft.findings[finding.id]; update({ ...progress.draft, findings: { ...progress.draft.findings, [finding.id]: { ...current, citations: event.target.checked ? [...current.citations, source.id] : current.citations.filter(id => id !== source.id) } } });
          }} />{source.title}{!progress.acquired.includes(source.id) && ' (not acquired)'}</label>)}</div></fieldset>)}
          <h3>Written explanation</h3><ReportEditor label="Broad Street investigation report" text={progress.draft.text} html={progress.draft.html} onChange={(text, html) => update({ ...progress.draft, text, html })} />
          <p className="case-help">Explain your reasoning and remaining uncertainty in at least 80 characters. Review uses your selected findings and supporting sources, rather than matching keywords in your prose.</p><button disabled={!canWork} type="submit">Submit report for evidence review</button>
        </form>}
        {latest && <div className="case-review" role="status"><h3>{latest.accepted ? reviewedCurrent || accepted ? 'Evidence review accepted' : 'Earlier review — draft changed' : 'Review — revision requested'}</h3><ul>{latest.feedback.map((text, index) => <li key={index}>{text}</li>)}</ul>{!accepted && latest.accepted && !reviewedCurrent && <p>Your current draft differs from the accepted submission. Submit it for review again before finalizing.</p>}{!accepted && latest.accepted && reviewedCurrent && <p>Finalize this work order using the WORKNET compensation button. Editing findings or text requires a new review.</p>}</div>}
        {!!progress.reviews.length && <details className="case-history"><summary>Submitted report history ({progress.reviews.length})</summary>{progress.reviews.map((review, index) => <article key={review.id}><h3>Submission {index + 1} · {review.accepted ? 'Accepted' : 'Revision requested'}</h3><p>{review.submittedAt}</p><RichMailBody html={review.draft.html} text={review.draft.text} />{Object.entries(review.draft.findings).map(([id, finding]) => <p key={id}>{CASE_FINDINGS.find(item => item.id === id)?.title}: {finding.choice} · Sources: {finding.citations.map(id => caseSource(id)?.title || id).join('; ')}</p>)}</article>)}</details>}
        {accepted && <p>Your accepted findings and one-time WORKNET compensation are recorded. Reopening the report does not issue another payment.</p>}
      </>}
    </>}
    <p role="status" className="case-notice">{notice}</p>
  </section>;
}
