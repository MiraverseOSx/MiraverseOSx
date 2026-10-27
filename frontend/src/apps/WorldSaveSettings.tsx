import React, { useState, useSyncExternalStore } from 'react';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';
import { worldConnection, restoreWorldEntries } from '../backend/worldConnection';
import { createWorldBackup, parseWorldBackup } from '../backend/worldBackup';
import type { WorldEntries } from '../backend/worldSync';
import '../styles/apps/WorldSaveSettings.css';

export default function WorldSaveSettings() {
  const status = useSyncExternalStore(worldConnection.subscribe, worldConnection.getStatus);
  const remote = worldConnection.getRemoteSummary();
  const Icon = status.state === 'saved' ? CheckCircle2 : status.state === 'offline' || status.state === 'conflict' ? CloudOff : RefreshCw;
  const busy = status.state === 'loading' || status.state === 'saving';
  const [backup, setBackup] = useState<WorldEntries | null>(null);
  const [backupMessage, setBackupMessage] = useState('');
  const [restoring, setRestoring] = useState(false);
  const download = () => {
    try {
      const snapshot = createWorldBackup(localStorage);
      const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url;
      link.download = `miraverse-world-${new Date().toISOString().slice(0, 10)}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupMessage(`Backup downloaded with ${Object.keys(snapshot.entries).length} saved stores.`);
    } catch (error) { setBackupMessage(error instanceof Error ? error.message : 'Could not create a backup.'); }
  };
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
    <h3>Backup and restore</h3>
    <p>Download your saved world, including agency cases, TRACE records, drafts, reports, citizen identities, and issued documents.</p>
    <div className="world-save-actions"><button onClick={download} disabled={restoring}>Download world backup</button><label>Choose world backup<input aria-label="Choose world backup" type="file" accept=".json,application/json" disabled={restoring} onChange={async event => {
      const file = event.target.files?.[0]; setBackup(null); setBackupMessage('');
      if (!file) return;
      if (file.size > 16 * 1024 * 1024) { setBackupMessage('Choose a backup smaller than 16 MB.'); return; }
      try { const entries = parseWorldBackup(await file.text()); setBackup(entries); setBackupMessage(`Ready to restore ${Object.keys(entries).length} saved stores. Your current world will be backed up first.`); }
      catch (error) { setBackupMessage(error instanceof Error ? error.message : 'Could not read this backup.'); }
    }}/></label></div>
    {backup && <div className="world-save-actions"><button disabled={restoring} onClick={async () => {
      setRestoring(true);
      try { await restoreWorldEntries(backup); location.reload(); }
      catch (error) { setBackupMessage(error instanceof Error ? error.message : 'Could not restore this backup.'); setRestoring(false); }
    }}>{restoring ? 'Restoring…' : 'Restore selected backup'}</button><button disabled={restoring} onClick={() => { setBackup(null); setBackupMessage(''); }}>Cancel restore</button></div>}
    {backupMessage && <p role="status">{backupMessage}</p>}
  </section>;
}
