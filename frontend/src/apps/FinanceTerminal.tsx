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
    <div className="p-6 space-y-6 bg-gradient-to-b from-[#142850] to-[#101F3D] min-h-full text-white font-ui select-none rounded-2xl border border-white/20 shadow-2xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#315D9E]/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#E5C370] to-[#F5D378] text-[#0E1A33] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(229,195,112,0.4)]">
            <Landmark size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wide text-[#FFFFFF]">
              Oryn Finance Ledger
            </h1>
            <p className="text-xs text-[#D5E2F5] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={13} className="text-[#4CD6C4]" />
              <span>Decentralized Proof-of-Work Matrix • Blockchair Gateway</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-[#D5E2F5]/80 font-mono hidden md:inline">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E3D75] hover:bg-[#315D9E] border border-white/25 text-xs text-[#FBE6AB] font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Querying...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Loading & Error States */}
      {loading && !stats && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5C370]/30 border-t-[#E5C370]" />
          <div className="text-sm font-semibold text-[#FBE6AB] tracking-wide">
            Decrypting financial ledger via secure C# proxy...
          </div>
          <div className="text-xs text-[#D5E2F5]/70">
            Querying Blockchair endpoint with sovereign credentials
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex flex-col gap-2">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <span>⚠ Gateway Connectivity Notice</span>
          </div>
          <div>{error}</div>
          <div className="text-[11px] text-rose-300/80">
            Ensure the local C# host is running with a valid <code className="bg-black/40 px-1 py-0.5 rounded">BLOCKCHAIR_API_KEY</code>.
          </div>
        </div>
      )}

      {/* Live Blockchain Metrics */}
      {stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Block Height */}
            <div className="p-4 rounded-2xl bg-[#1E3D75]/80 border border-white/20 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#FBE6AB] font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-[#E5C370]" />
                  Block Height
                </span>
                <span className="text-[10px] text-[#4CD6C4] uppercase">Live</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#FFFFFF] mt-2">
                {stats.blocks ? stats.blocks.toLocaleString() : 'N/A'}
              </div>
              <div className="text-[11px] text-[#D5E2F5]/80 mt-1">
                Total confirmed ledger blocks
              </div>
            </div>

            {/* Mempool Transactions */}
            <div className="p-4 rounded-2xl bg-[#1E3D75]/80 border border-white/20 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#FBE6AB] font-bold">
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-[#4CD6C4]" />
                  Mempool Pending
                </span>
                <span className="text-[10px] text-amber-300 uppercase">Queue</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#FFFFFF] mt-2">
                {stats.mempool_transactions ? stats.mempool_transactions.toLocaleString() : '0'}
              </div>
              <div className="text-[11px] text-[#D5E2F5]/80 mt-1">
                Unconfirmed pending transactions
              </div>
            </div>

            {/* Market / Suggested Fee */}
            <div className="p-4 rounded-2xl bg-[#1E3D75]/80 border border-white/20 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#FBE6AB] font-bold">
                <span className="flex items-center gap-1.5">
                  <Database size={14} className="text-[#E5C370]" />
                  Suggested Fee
                </span>
                <span className="text-[10px] text-[#4CD6C4] uppercase">sat/vB</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#FFFFFF] mt-2">
                {stats.suggested_transaction_fee_per_byte_sat ?? '1'} sat/byte
              </div>
              <div className="text-[11px] text-[#D5E2F5]/80 mt-1">
                Recommended priority fee
              </div>
            </div>
          </div>

          {/* Detailed Ledger Metadata */}
          <div className="p-5 rounded-2xl bg-[#142850]/90 border border-white/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FBE6AB]">
              Orynvell Treasury Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-[#D5E2F5]">Lifetime Transactions:</span>
                <span className="font-mono font-bold text-[#FFFFFF]">
                  {stats.transactions ? stats.transactions.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-[#D5E2F5]">Mining Difficulty:</span>
                <span className="font-mono font-bold text-[#FFFFFF]">
                  {stats.difficulty ? stats.difficulty.toExponential(4) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-[#D5E2F5]">Hashrate (24h):</span>
                <span className="font-mono font-bold text-[#FFFFFF]">
                  {stats.hashrate_24h ? `${stats.hashrate_24h} H/s` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <span className="text-[#D5E2F5]">Security Verification:</span>
                <span className="font-mono font-bold text-[#4CD6C4] flex items-center gap-1">
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
