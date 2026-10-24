import React, { useSyncExternalStore } from 'react';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';
import { worldConnection } from '../backend/worldConnection';
import '../styles/apps/WorldSaveSettings.css';

export default function WorldSaveSettings() {
  const status = useSyncExternalStore(worldConnection.subscribe, worldConnection.getStatus);
  const remote = worldConnection.getRemoteSummary();
  const Icon = status.state === 'saved' ? CheckCircle2 : status.state === 'offline' || status.state === 'conflict' ? CloudOff : RefreshCw;
  const busy = status.state === 'loading' || status.state === 'saving';
  return <section className="world-save-settings" aria-labelledby="world-save-title">
    <h3 id="world-save-title">Your saved world</h3>
    <p className="world-save-state" data-state={status.state} role="status"><Icon size={18} aria-hidden="true" />{status.message}</p>
    <p>Your progress saves automatically, including mail, files, browser records, and agency work. Offline changes stay on this device until the connection returns.</p>
    {status.state === 'conflict' ? <>
      <p>This browser and the database have different progress. Choose which copy to continue with. A backup is kept before either copy is replaced.</p>
      <p>Database save: {remote?.updatedAt ? new Date(remote.updatedAt).toLocaleString() : 'Not yet dated'} · Revision {remote?.revision ?? '—'}</p>
      <div className="world-save-actions"><button onClick={() => void worldConnection.keepDeviceCopy()}>Keep this browser’s progress</button><button onClick={() => void worldConnection.loadDatabaseCopy()}>Load database save</button></div>
    </> : <>
      {status.updatedAt && <p className="world-save-timestamp">Last database save: {new Date(status.updatedAt).toLocaleString()}</p>}
      <button disabled={busy} onClick={() => void worldConnection.sync(true)}>{busy ? status.message : 'Save now'}</button>
    </>}
  </section>;
}
