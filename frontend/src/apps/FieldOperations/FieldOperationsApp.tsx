import React, { useEffect, useRef, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { FIELD_MISSION, FIELD_TARGETS, restoreFieldSession, fieldReady } from '../../gameplay/FieldOperations';
import { WORKNET_ASSIGNMENTS, nextWorkStage } from '../../gameplay/ActivityEngine';
import './field-operations.css';

export default function FieldOperationsApp() {
  const player = useOSStore(s => s.gameplay.player);
  const loggedIn = useOSStore(s => s.isLoggedIn);
  const focused = useOSStore(s => s.activeWindowId === 'fieldOperations' && !s.windows.find(w => w.id === 'fieldOperations')?.isMinimized);
  const order = player.worknetOrders?.[FIELD_MISSION];
  const session = restoreFieldSession(order?.fieldSession);
  const [message, setMessage] = useState('Select a location to walk there, or focus the scene and use WASD / arrow keys.');
  const [witness, setWitness] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [report, setReport] = useState(order?.drafts?.report?.report || '');
  const parent = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof import('./TunnelScene').createTunnelGame> | null>(null);
  const canPlay = Boolean(loggedIn && order?.status === 'active' && order.briefingReadAt && !order.remediationRequired);
  const run = (action: 'move' | 'interact' | 'record', payload?: any) => {
    const result = useOSStore.getState().fieldAction(action, payload);
    if (action !== 'move') setMessage(result.message);
    return result;
  };
  useEffect(() => {
    if (!canPlay || !parent.current) return;
    let cancelled = false;
    setReady(false); setError('');
    import('./TunnelScene').then(({ createTunnelGame }) => {
      if (cancelled || !parent.current) return;
      engine.current = createTunnelGame(parent.current, restoreFieldSession(useOSStore.getState().gameplay.player.worknetOrders[FIELD_MISSION].fieldSession),
        (x, y) => run('move', { x, y }), id => { if (id === 'witness') setWitness(true); else run('interact', { id }); });
      engine.current.game.events.once('ready', () => { if (!cancelled) setReady(true); });
    }).catch(reason => setError(`The field renderer could not start: ${reason.message}. Reopen this window to retry.`));
    return () => { cancelled = true; engine.current?.stop(); engine.current?.game.destroy(true); engine.current = null; };
  }, [canPlay]);
  useEffect(() => {
    const sync = () => {
      const game = engine.current?.game;
      if (!game || !ready) return;
      if (!focused || paused || witness || document.hidden) { engine.current?.stop(); game.pause(); }
      else game.resume();
    };
    sync(); document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [focused, paused, witness, ready]);
  const stage = order ? nextWorkStage(order, player.taskResults || {}) : undefined;
  const openWorknet = () => useOSStore.getState().openWindow('jobs');
  return <div className="field-app">
    <header className="field-header"><div><span className="field-eyebrow">DGA / FIELD OPERATIONS</span><h1>The signal beneath Aureline</h1><p>Tunnel 09 · Trace the memory bleed. Protect the platform.</p></div><button onClick={openWorknet}>Open WORKNET</button></header>
    {!canPlay ? <section className="field-brief"><span className="field-eyebrow">OPERATION 512</span><h2>{order?.status === 'accepted' ? 'Operation completed' : 'Your assignment awaits'}</h2><p>{order?.status === 'accepted' ? 'Your findings and reward receipt are saved in WORKNET. This one-time operation has already been paid.' : 'Accept “High-Priority Breach: Sub-Aureline Data Bleed Containment” in WORKNET and acknowledge its briefing. Clearance 2 and 10 stamina are required for finalization.'}</p>{!order && <button onClick={() => setMessage(useOSStore.getState().openWorknetOrder(FIELD_MISSION).message)}>Accept Tunnel 09 assignment</button>}{order?.status === 'active' && !order.briefingReadAt && <><p>Briefing: Enter the service tunnel, inspect three sources, interview technician Iona, and deploy Hazmat-01 and Patrol-12 under SealLockCrypt. Keep the public platform sealed. Record your findings and submit a containment report.</p><button onClick={() => setMessage(useOSStore.getState().acknowledgeAssignmentBriefing(FIELD_MISSION).message)}>I’ve read the briefing · enter Tunnel 09</button></>}{order?.remediationRequired && <p>Resolve the equipment incident in WORKNET to return to the scene.</p>}</section>
      : <div className="field-layout"><section className="field-stage"><div className="field-stage-bar"><span>{session.sealed ? 'CONTAINMENT ACTIVE' : 'LIVE FIELD LINK'} · Progress saves automatically</span><button onClick={() => setPaused(value => !value)}>{paused ? 'Resume scene' : 'Pause scene'}</button></div>
        <div ref={parent} className="field-canvas" tabIndex={0} role="group" aria-label="Tunnel 09 exploration. Use WASD or arrow keys to move; select a location below to inspect." onPointerDown={event => event.currentTarget.focus()} onKeyDown={event => { if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); if (focused && !paused && !witness) engine.current?.key(event.key, true); } }} onKeyUp={event => engine.current?.key(event.key, false)} onBlur={() => engine.current?.stop()} />
        {!ready && !error && <p>Preparing the field scene…</p>}{error && <p role="alert">{error}</p>}
        <div className="field-locations" aria-label="Travel and inspect locations">{FIELD_TARGETS.map(target => <button key={target.id} disabled={!ready || !focused || paused || witness} onClick={() => engine.current?.travel(target.id)}>{session.evidence.includes(target.id) || target.id === 'witness' && session.interviewed || target.id === 'seal' && session.sealed ? '✓ ' : '↗ '}{target.label}</button>)}</div>
        <p className="field-controls">Click the floor to walk. Click a marked location to approach and inspect it. Keyboard: WASD / arrows while the scene is focused.</p>
        {witness && <section className="field-interview" aria-label="Interview technician Iona"><h2>Technician Iona</h2><p>“The platform is sealed. What do you need to know?”</p><button onClick={() => { run('interact', { id: 'witness' }); setWitness(false); }}>What happened before the signal failed?</button><button onClick={() => { setMessage('“I am safe behind the platform seal. Check the service terminal and relay for the source.”'); setWitness(false); }}>Are you safe here?</button><button onClick={() => setWitness(false)}>Return to investigation</button></section>}
      </section><aside className="field-notebook"><span className="field-eyebrow">FIELD NOTEBOOK / 09</span><h2>Follow the signal</h2><p>{session.evidence.length}/3 findings · {session.interviewed ? 'Witness recorded' : 'Witness pending'}</p>{FIELD_TARGETS.filter(target => session.evidence.includes(target.id) || target.id === 'witness' && session.interviewed || target.id === 'seal' && session.sealed).map(target => <article key={target.id}><h3>{target.label}</h3><p>{target.detail}</p></article>)}
        <button disabled={!fieldReady(session) || !session.sealed} onClick={() => run('record')}>Record field findings in WORKNET</button>
        {stage?.id === 'report' && <form onSubmit={event => { event.preventDefault(); setMessage(useOSStore.getState().submitWorknetStage(FIELD_MISSION, 'report', { report }).message); }}><label>Containment report<textarea value={report} maxLength={4000} onChange={event => { setReport(event.target.value); useOSStore.getState().saveWorknetDraft(FIELD_MISSION, 'report', { report: event.target.value }); }} placeholder="Explain the source, carrier, location, and containment seal." /></label><button>Submit report</button></form>}
        {!stage && <button onClick={() => { const result = useOSStore.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[FIELD_MISSION]); setMessage(result.ok ? 'Operation accepted. Your WORKNET reward receipt is saved.' : result.reason || 'Review your assignment.'); }}>Finalize operation · claim WORKNET reward</button>}
      </aside></div>}
    <p className="field-feedback" role="status">{message}</p>
  </div>;
}
