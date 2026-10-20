import React, { useState, useEffect, useRef } from 'react';
import { Landmark, RefreshCw } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { parseTreasuryTelemetry, type TreasuryStats } from '../services/treasuryTelemetry';

const FALLBACK_ORYN_STATS: TreasuryStats = {
  blocks: 892416,
  transactions: 1148920340,
  mempool_transactions: 4218,
  difficulty: 1.1376e14,
  hashrate_24h: '842.6 EH',
  suggested_transaction_fee_per_byte_sat: 3,
};

export default function FinanceTerminal() {
  const [stats, setStats] = useState<TreasuryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const requestRef = useRef<AbortController | null>(null);

  const credits = useOSStore((s) => s.gameplay.player.credits);
  const bits = useOSStore((s) => s.gameplay.player.bits);
  const playerName = useOSStore((s) => s.gameplay.player.name || 'Citizen');
  const maidId = useOSStore((s) => s.gameplay.identity.citizenId || 'Provisional record');

  const fetchCryptoData = async () => {
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; request.abort(); }, 10000);
    setLoading(true);
    try {
      const response = await fetch('/api/crypto', { signal: request.signal });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error(`Gateway status ${response.status}`);
      }
      const data = parseTreasuryTelemetry(await response.json());
      if (!data) throw new Error('Gateway returned no valid ledger readings');
      if (requestRef.current !== request || request.signal.aborted) return;
      setStats(data);
      setIsFallbackMode(false);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      if (requestRef.current !== request || (request.signal.aborted && !timedOut)) return;
      setStats({
        ...FALLBACK_ORYN_STATS,
        blocks: (FALLBACK_ORYN_STATS.blocks || 892416) + Math.floor((Date.now() / 60000) % 12),
      });
      setIsFallbackMode(true);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === request && (!request.signal.aborted || timedOut)) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCryptoData();
    return () => { requestRef.current?.abort(); requestRef.current = null; };
  }, []);

  const ledgerMetrics = [
    { label: 'Confirmed blocks', value: stats?.blocks?.toLocaleString() ?? '—', detail: 'Ledger height' },
    { label: 'Pending transactions', value: stats?.mempool_transactions?.toLocaleString() ?? '—', detail: 'Awaiting confirmation' },
    { label: 'Suggested priority fee', value: `${stats?.suggested_transaction_fee_per_byte_sat ?? '—'} sat/vB`, detail: 'Network fee rate' },
    { label: 'Lifetime transactions', value: stats?.transactions?.toLocaleString() ?? '—', detail: 'Confirmed on the ledger' },
    { label: 'Mining difficulty', value: stats?.difficulty?.toExponential(4) ?? '—', detail: 'Proof-of-work network' },
    { label: '24-hour hashrate', value: stats?.hashrate_24h ?? '—', detail: 'Aggregate network activity' },
  ];
  return (
    <div className="treasury-workspace">
      <header className="treasury-heading"><div><span className="workspace-kicker">Oryn / personal treasury</span><h1>Account overview.</h1><p>{playerName} <span>· {maidId}</span></p></div><Landmark size={28} strokeWidth={1} /></header>
      <section className="treasury-balances" aria-label="Account balances"><div><span className="workspace-kicker">Available balance</span><strong><small>₢</small>{credits.toLocaleString()}</strong><p>Sovereign Oryn credits</p></div><div><span className="workspace-kicker">Aether reserve</span><strong><small>◈</small>{bits.toLocaleString()}</strong><p>Encrypted bits</p></div></section>
      <section className="treasury-ledger" aria-label="Treasury network telemetry"><header><div><span className="workspace-kicker">Network / proof of work</span><h2>Ledger activity</h2></div><button onClick={fetchCryptoData} disabled={loading}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing' : 'Refresh data'}</button></header><table><thead><tr><th>Measure</th><th>Reading</th><th>Context</th></tr></thead><tbody>{ledgerMetrics.map(metric => <tr key={metric.label}><th scope="row">{metric.label}</th><td>{metric.value}</td><td>{metric.detail}</td></tr>)}</tbody></table></section>
      <footer className="treasury-footer"><span><span className="workspace-status-dot" />{isFallbackMode ? 'Sovereign local telemetry' : 'Blockchair gateway'}</span><span>{lastUpdated ? `Updated ${lastUpdated}` : 'Connecting to treasury'}</span></footer>
    </div>
  );
}
