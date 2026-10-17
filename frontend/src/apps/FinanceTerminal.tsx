import React, { useState, useEffect } from 'react';
import { Landmark, RefreshCw, ShieldCheck, Database, Layers, Activity, Wallet } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';

interface BlockchairStats {
  blocks?: number;
  transactions?: number;
  mempool_transactions?: number;
  difficulty?: number;
  hashrate_24h?: string;
  suggested_transaction_fee_per_byte_sat?: number;
  market_price_usd?: number;
  [key: string]: any;
}

const FALLBACK_ORYN_STATS: BlockchairStats = {
  blocks: 892416,
  transactions: 1148920340,
  mempool_transactions: 4218,
  difficulty: 1.1376e14,
  hashrate_24h: '842.6 EH',
  suggested_transaction_fee_per_byte_sat: 3,
  market_price_usd: 94250,
};

export default function FinanceTerminal() {
  const [stats, setStats] = useState<BlockchairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const credits = useOSStore((s) => s.gameplay.credits);
  const bits = useOSStore((s) => s.gameplay.bits);
  const playerName = useOSStore((s) => s.gameplay.playerName);
  const maidId = useOSStore((s) => s.gameplay.maidId);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crypto');
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error(`Gateway status ${response.status}`);
      }
      const data = await response.json();

      if (data && data.data) {
        setStats(data.data);
      } else if (data) {
        setStats(data);
      }
      setIsFallbackMode(false);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setStats({
        ...FALLBACK_ORYN_STATS,
        blocks: (FALLBACK_ORYN_STATS.blocks || 892416) + Math.floor((Date.now() / 60000) % 12),
      });
      setIsFallbackMode(true);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-ui select-none rounded-2xl border border-slate-200 shadow-xs">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold shadow-xs">
            <Landmark size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wide text-slate-900">
              Oryn Finance Ledger
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Decentralized Proof-of-Work Matrix • {isFallbackMode ? 'Sovereign Local Telemetry' : 'Blockchair Gateway'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold transition shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-amber-600' : 'text-slate-500'} />
            <span>{loading ? 'Querying...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Citizen Sovereign Balance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <Wallet size={12} className="text-amber-600" /> Citizen Sovereign Balance ({playerName})
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₢ {credits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Oryn Credits</span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
            {maidId}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Encrypted Aether Bits Reserve
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-950 mt-1">
              ◈ {bits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Bits</span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-bold">
            VERIFIED
          </span>
        </div>
      </div>

      {/* Live Blockchain Metrics */}
      {stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Block Height */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-700" />
                  Block Height
                </span>
                <span className="text-[10px] text-emerald-700 uppercase font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Live</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-950 mt-2">
                {stats.blocks ? stats.blocks.toLocaleString() : 'N/A'}
              </div>
              <div className="text-[11px] text-amber-800/80 mt-1">
                Total confirmed ledger blocks
              </div>
            </div>

            {/* Mempool Transactions */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-sky-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-sky-700" />
                  Mempool Pending
                </span>
                <span className="text-[10px] text-amber-800 uppercase font-bold bg-amber-100 px-1.5 py-0.5 rounded">Queue</span>
              </div>
              <div className="text-2xl font-bold font-mono text-sky-950 mt-2">
                {stats.mempool_transactions ? stats.mempool_transactions.toLocaleString() : '0'}
              </div>
              <div className="text-[11px] text-sky-800/80 mt-1">
                Unconfirmed pending transactions
              </div>
            </div>

            {/* Market / Suggested Fee */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Database size={14} className="text-emerald-700" />
                  Suggested Fee
                </span>
                <span className="text-[10px] text-emerald-800 uppercase font-bold bg-emerald-100 px-1.5 py-0.5 rounded">sat/vB</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-950 mt-2">
                {stats.suggested_transaction_fee_per_byte_sat ?? '1'} sat/byte
              </div>
              <div className="text-[11px] text-emerald-800/80 mt-1">
                Recommended priority fee
              </div>
            </div>
          </div>

          {/* Detailed Ledger Metadata */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Orynvell Treasury Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Lifetime Transactions:</span>
                <span className="font-mono font-bold text-slate-900">
                  {stats.transactions ? stats.transactions.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Mining Difficulty:</span>
                <span className="font-mono font-bold text-slate-900">
                  {stats.difficulty ? stats.difficulty.toExponential(4) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Hashrate (24h):</span>
                <span className="font-mono font-bold text-slate-900">
                  {stats.hashrate_24h ? `${stats.hashrate_24h} H/s` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Security Verification:</span>
                <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck size={12} /> Encrypted Proxy
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
