import React, { useState, useEffect } from 'react';
import { Landmark, RefreshCw, ShieldCheck, Database, Layers, Activity, ArrowUpRight } from 'lucide-react';

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

export default function FinanceTerminal() {
  const [stats, setStats] = useState<BlockchairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchCryptoData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls local C# backend proxy which securely attaches BLOCKCHAIR_API_KEY
      const response = await fetch('/api/crypto');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Blockchair API wraps statistics under the 'data' key
      if (data && data.data) {
        setStats(data.data);
      } else if (data) {
        setStats(data);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Failed to load crypto data:', err);
      setError(err.message || 'Failed to communicate with local proxy');
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
              <span>Decentralized Proof-of-Work Matrix • Blockchair Gateway</span>
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

      {/* Loading & Error States */}
      {loading && !stats && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
          <div className="text-sm font-semibold text-slate-800 tracking-wide">
            Decrypting financial ledger via secure C# proxy...
          </div>
          <div className="text-xs text-slate-500">
            Querying Blockchair endpoint with sovereign credentials
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <span>⚠ Gateway Connectivity Notice</span>
          </div>
          <div>{error}</div>
          <div className="text-[11px] text-rose-700">
            Ensure the local C# host is running with a valid <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">BLOCKCHAIR_API_KEY</code>.
          </div>
        </div>
      )}

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
