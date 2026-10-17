import React from 'react';
import { Activity, ArrowUpRight, Check, HeartPulse, Home, ShieldAlert } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { launchDesktopApp } from '../components/desktop/appDirectory';
import CelestialScene from '../components/desktop/CelestialScene';
import '../styles/apps/VitalsApp.css';

export default function VitalsApp() {
  const player = useOSStore((state) => state.gameplay.player);
  const corruption = useOSStore((state) => state.gameplay.prismCorruptionLevel);
  const setBrowserUrl = useOSStore((state) => state.setBrowserUrl);
  const auraHealth = player.auraHealth;
  const conditions: string[] = player.conditions;
  const status = auraHealth < 30 ? 'Critical' : auraHealth < 70 ? 'Recovering' : 'Stable';
  const ringLength = 2 * Math.PI * 81;

  return (
    <section className="vitals-workspace" aria-label="VITALS bio-aura monitor">
      <header className="vitals-heading">
        <div><span className="mira-eyebrow">FAITH MEDICAL / PERSONAL TELEMETRY</span><h1>A little closer to balance.</h1><p>Your aura, conditions, and recovery in one place.</p></div>
        <span className="vitals-live"><i /> Live telemetry</span>
      </header>

      <div className="vitals-layout">
        <article className="vitals-aura-card" data-status={status.toLowerCase()}>
          <div className="vitals-card-label"><HeartPulse size={17} /><h2>Aura integrity</h2><span className="vitals-status">{status}</span></div>
          <div className="vitals-gauge" role="progressbar" aria-label="Aura integrity" aria-valuenow={auraHealth} aria-valuemin={0} aria-valuemax={100}>
            <svg viewBox="0 0 210 210" aria-hidden="true"><circle className="vitals-gauge-halo" cx="105" cy="105" r="96" /><circle className="vitals-gauge-track" cx="105" cy="105" r="81" /><circle className="vitals-gauge-value" cx="105" cy="105" r="81" strokeDasharray={ringLength} strokeDashoffset={ringLength * (1 - Math.min(100, Math.max(0, auraHealth)) / 100)} /><path className="vitals-pulse" d="M76 115h13l7-13 10 26 10-33 9 20h10" /></svg>
            <div className="vitals-gauge-number" aria-hidden="true"><strong>{auraHealth}<small>%</small></strong><span>AURA INTEGRITY</span></div>
          </div>
          <div className="vitals-citizen"><span>{(player.name || 'Citizen').slice(0, 1).toUpperCase()}</span><div><strong>{player.name || 'Provisional Citizen'}</strong><small>Personal bio-aura record</small></div><Activity size={18} /></div>
          <p className="vitals-aura-note">{auraHealth < 70 ? 'Your aura needs time to recover. Rest or visit Faith Medical.' : 'Your aura is holding steady. Keep an eye on conditions after field work.'}</p>
        </article>

        <div className="vitals-detail-stack">
          <article className="vitals-exposure-card">
            <CelestialScene className="vitals-exposure-art" />
            <div className="vitals-card-label"><ShieldAlert size={16} /><h2>World PRISM exposure</h2></div>
            <div className="vitals-exposure-number">{corruption}<span>%</span></div>
            <progress className="vitals-exposure-meter" aria-label="PRISM corruption" value={corruption} max={100} />
            <p>World corruption rises at night.<br />Review your aura after field work.</p>
          </article>
          <article className="vitals-conditions-card">
            <div className="vitals-card-label"><h2>Active conditions</h2><span className="vitals-condition-count">{conditions.length.toString().padStart(2, '0')}</span></div>
            {conditions.length ? <ul>{conditions.map((condition) => <li key={condition}><span className="vitals-condition-dot" /><strong>{condition}</strong><span>Needs attention</span></li>)}</ul> : <p className="vitals-clear"><Check size={16} /> No active conditions. Your record is clear.</p>}
          </article>
        </div>
      </div>

      <section className="vitals-recovery" aria-labelledby="vitals-recovery-title">
        <span className="vitals-recovery-icon"><Home size={21} /></span>
        <div><h2 id="vitals-recovery-title">Make room for recovery.</h2><p>Rest at home to restore aura, or visit Faith Medical for condition treatment.</p></div>
        <div className="vitals-recovery-actions"><button className="mira-button" onClick={() => launchDesktopApp('housing')}>Housing <ArrowUpRight size={15} /></button><button className="mira-button mira-button--primary" onClick={() => { setBrowserUrl('https://faithmed.aure'); launchDesktopApp('browser'); }}>Faith Medical <ArrowUpRight size={15} /></button></div>
      </section>
      <footer className="vitals-footer"><span><i /> In-world bio-aura telemetry</span><span>FAITH MEDICAL · AURELINE</span></footer>
    </section>
  );
}
