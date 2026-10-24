'use client';

import React, { useState } from 'react';
import {
  Globe,
  Radio,
  Terminal,
  Satellite,
  Shield,
  Search,
  Eye,
  Key,
  Network,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import {
  INITIAL_OSINT_DATABASE,
  INITIAL_SIGINT_INTERCEPTS,
  INITIAL_CIPHER_CHALLENGES,
  SATELLITE_GEO_TARGETS,
  WATCHLIST_ROSTER,
  NETWORK_GRAPH_DATA,
  OsintSearchResult,
  CipherChallenge
} from '@/lib/intelligence-data';
import { triggerGovernmentBriefingFromIntel } from '@/lib/dga-crosslink-engine';

interface DgaIntelligenceHubProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function DgaIntelligenceHub({ onOpenCase, onNavigateTab }: DgaIntelligenceHubProps) {
  const [subSection, setSubSection] = useState<'osint' | 'sigint' | 'ciphers' | 'satellite' | 'watchlist' | 'graph'>('osint');
  const [osintQuery, setOsintQuery] = useState('');
  const [osintResults, setOsintResults] = useState<OsintSearchResult[]>(INITIAL_OSINT_DATABASE);
  const [cipherList, setCipherList] = useState<CipherChallenge[]>(INITIAL_CIPHER_CHALLENGES);
  const [cipherInput, setCipherInput] = useState<Record<string, string>>({});
  const [briefingFeedback, setBriefingFeedback] = useState<string | null>(null);

  const handleOsintSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!osintQuery.trim()) {
      setOsintResults(INITIAL_OSINT_DATABASE);
      return;
    }
    const q = osintQuery.toLowerCase();
    const filtered = INITIAL_OSINT_DATABASE.filter(
      (item) =>
        item.queryTerm.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q)
    );
    setOsintResults(filtered);
  };

  const handleSolveCipher = (cipherId: string) => {
    const input = cipherInput[cipherId]?.trim().toUpperCase();
    const target = cipherList.find((c) => c.id === cipherId);
    if (!target) return;

    if (input === target.plaintext.toUpperCase().replace(/[^A-Z0-9-]/g, '')) {
      setCipherList((prev) =>
        prev.map((c) => (c.id === cipherId ? { ...c, solved: true } : c))
      );
    } else {
      alert('Decryption failed: Key checksum mismatch. Review hint and rotation parameter.');
    }
  };

  const handleTriggerExecutiveBriefing = async () => {
    const res = await triggerGovernmentBriefingFromIntel('INT-2026-0941');
    if (res.success) {
      setBriefingFeedback(res.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* 1. TOP INTELLIGENCE HEADER */}
      <div className="h-12 bg-white border-b border-[#cfcddb] px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800">
            <Globe className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1f1e30] tracking-wide">
                INTELLIGENCE & SIGNALS DIVISION // ORACLE & CIPHER TERMINAL
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
                OPERATION BLACK SENTRY (INT-2026-0941)
              </span>
            </div>
            <div className="text-[11px] text-[#5e5c7a]">
              OSINT Data Mining • SIGINT Intercepts • NATO Admiralty Reliability A1-F6 • Satellite Reconnaissance
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 bg-[#eae8f2] p-1 rounded border border-[#cfcddb]">
          {[
            { id: 'osint', label: 'OSINT Search', icon: Search },
            { id: 'sigint', label: 'SIGINT Wiretaps', icon: Radio },
            { id: 'ciphers', label: 'Cryptanalysis', icon: Key },
            { id: 'satellite', label: 'Satellite Recon', icon: Satellite },
            { id: 'watchlist', label: 'Watchlists & Aliases', icon: Users },
            { id: 'graph', label: 'Network Graph', icon: Network },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubSection(item.id as any)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1f1e30] shadow-2xs font-bold border border-[#cfcddb]'
                    : 'text-[#5e5c7a] hover:text-[#1f1e30] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {briefingFeedback && (
        <div className="bg-[#edeaf6] border-b border-[#cfcddb] px-4 py-2 text-xs flex items-center justify-between text-[#362f59]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{briefingFeedback}</span>
          </div>
          {onOpenCase && (
            <button
              onClick={() => onOpenCase('GOV-2026-0052')}
              className="px-2 py-0.5 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-[11px] font-bold cursor-pointer"
            >
              Open Cabinet Docket (GOV-2026-0052) →
            </button>
          )}
        </div>
      )}

      {/* 2. SUB-SECTION CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full">
        {/* SUBSECTION: OSINT SEARCH */}
        {subSection === 'osint' && (
          <div className="space-y-4">
            {/* Search Query Bar */}
            <form onSubmit={handleOsintSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5e5c7a]" />
                <input
                  type="text"
                  value={osintQuery}
                  onChange={(e) => setOsintQuery(e.target.value)}
                  placeholder="Query corporate shells, license plates (e.g. 7XYZ89), SWIFT wires, or Viktor Krell..."
                  className="w-full bg-white border border-[#cfcddb] rounded pl-9 pr-3 py-2 text-xs text-[#1f1e30] placeholder-[#5e5c7a] focus:outline-none focus:border-[#4b4372] font-sans shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                EXECUTE QUERY
              </button>
            </form>

            {/* Results Grid */}
            <div className="space-y-3">
              {osintResults.map((res) => (
                <div key={res.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#4b4372] font-bold block mb-0.5">
                        {res.category} • SOURCE: {res.source}
                      </span>
                      <h4 className="text-sm font-bold text-[#1f1e30]">{res.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {res.reliabilityScore}
                    </span>
                  </div>

                  <p className="text-xs text-[#2c2a3e] leading-relaxed">{res.snippet}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#e4e2ee] text-[11px]">
                    {Object.entries(res.metadata).map(([k, v]) => (
                      <div key={k} className="bg-[#f8f7fc] p-2 rounded border border-[#cfcddb]">
                        <span className="text-[9.5px] font-bold text-[#5e5c7a] block uppercase">{k}</span>
                        <span className="font-mono text-[#4b4372] font-semibold truncate block">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBSECTION: SIGINT WIRETAPS */}
        {subSection === 'sigint' && (
          <div className="space-y-4">
            <div className="text-xs text-[#5e5c7a] pb-2 border-b border-[#cfcddb]">
              Real-time intercepted VHF marine and satellite communications decrypted by the CIPHER enclave.
            </div>

            {INITIAL_SIGINT_INTERCEPTS.map((sig) => (
              <div key={sig.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <span className="text-xs font-bold text-[#4b4372] font-mono">{sig.id}</span>
                    <span className="text-xs text-[#1f1e30] ml-2 font-semibold">[{sig.protocol}]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#5e5c7a]">{sig.interceptTime}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {sig.encryptionStatus}
                    </span>
                  </div>
                </div>

                {/* Raw Byte Payload */}
                <div className="bg-[#0a0a10] p-2 rounded border border-[#3e3c54] font-mono text-[11px] text-purple-300 overflow-x-auto shadow-inner">
                  <span className="text-[9px] uppercase text-slate-400 block mb-0.5">RAW HEX STREAM:</span>
                  {sig.rawIntercept}
                </div>

                {/* Plaintext Dialogue Transcript */}
                <div className="bg-[#f8f7fc] p-3 rounded border border-[#cfcddb] text-xs text-[#1f1e30] leading-relaxed italic">
                  {sig.translatedText}
                </div>

                {/* Flagged Keyword Badges */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-[#5e5c7a] uppercase font-bold">KEYWORD HITS:</span>
                  {sig.flaggedKeywords.map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-300 font-mono font-semibold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: CRYPTANALYSIS */}
        {subSection === 'ciphers' && (
          <div className="space-y-4">
            <div className="text-xs text-[#5e5c7a] pb-2 border-b border-[#cfcddb]">
              Clandestine adversary dead drop messages and encoded manifests requiring cryptographic resolution.
            </div>

            {cipherList.map((c) => (
              <div key={c.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1f1e30]">{c.title}</h4>
                    <span className="text-[10px] font-mono text-[#4b4372] font-semibold">{c.algorithm}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    c.solved ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-900 border border-amber-300'
                  }`}>
                    {c.solved ? 'DECRYPTED 100%' : 'CIPHER LOCKED'}
                  </span>
                </div>

                {/* Encoded String */}
                <div className="bg-[#0a0a10] p-3 rounded border border-[#3e3c54] font-mono text-xs text-purple-300 shadow-inner">
                  <span className="text-[9px] uppercase text-slate-400 block mb-1">ENCODED CIPHERTEXT:</span>
                  {c.encodedPayload}
                </div>

                {/* Solver input if unsolved */}
                {!c.solved ? (
                  <div className="space-y-2">
                    <div className="text-[11px] text-[#5e5c7a]">Hint: {c.hint}</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter decoded plaintext string..."
                        value={cipherInput[c.id] || ''}
                        onChange={(e) => setCipherInput({ ...cipherInput, [c.id]: e.target.value })}
                        className="flex-1 bg-white border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1f1e30] font-mono uppercase shadow-2xs focus:border-[#4b4372]"
                      />
                      <button
                        onClick={() => handleSolveCipher(c.id)}
                        className="px-3 py-1.5 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold cursor-pointer shadow-2xs"
                      >
                        DECRYPT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/70 p-3 rounded border border-emerald-300 text-xs font-mono text-emerald-900">
                    <span className="font-bold text-emerald-800 block mb-0.5">VERIFIED PLAINTEXT:</span>
                    {c.plaintext}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: SATELLITE RECONNAISSANCE */}
        {subSection === 'satellite' && (
          <div className="space-y-4">
            {SATELLITE_GEO_TARGETS.map((sat) => (
              <div key={sat.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1f1e30]">{sat.label}</h4>
                    <div className="text-xs text-[#4b4372] font-mono">
                      {sat.coordinates} • {sat.gridSquare}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb]">
                    {sat.sensorType}
                  </span>
                </div>

                <div className="h-48 bg-[#0a0a10] border border-[#3e3c54] rounded relative flex items-center justify-center shadow-inner">
                  <div className="text-center space-y-1">
                    <Satellite className="w-12 h-12 mx-auto text-sky-400 animate-pulse" />
                    <div className="text-xs font-mono text-white font-bold">{sat.facility}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sat.lastPassTime}</div>
                  </div>
                </div>

                <div className="bg-[#f8f7fc] p-3 rounded border border-[#cfcddb] text-xs text-[#2c2a3e] leading-relaxed">
                  <span className="font-bold text-[#4b4372] block mb-1">IMAGERY INTERPRETATION:</span>
                  {sat.analysisSummary}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: WATCHLISTS & ALIASES */}
        {subSection === 'watchlist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WATCHLIST_ROSTER.map((wl) => (
              <div key={wl.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <h4 className="text-base font-bold text-[#1f1e30]">{wl.primaryName}</h4>
                    <div className="text-[11px] text-[#4b4372] font-semibold">Biometric: {wl.biometricCode}</div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">
                    ADMIRALTY {wl.admiraltyRating}
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb]">
                  <div>
                    <span className="text-[#5e5c7a] text-[10px] uppercase font-bold">KNOWN ALIASES:</span>
                    <span className="text-[#1f1e30] ml-1 font-medium">{wl.aliases.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[#5e5c7a] text-[10px] uppercase font-bold">LAST LOCATION:</span>
                    <span className="text-rose-700 ml-1 font-semibold">{wl.lastConfirmedLocation}</span>
                  </div>
                  <div>
                    <span className="text-[#5e5c7a] text-[10px] uppercase font-bold">THREAT CATEGORY:</span>
                    <span className="text-[#1f1e30] ml-1 font-medium">{wl.threatCategory}</span>
                  </div>
                </div>

                <p className="text-xs text-[#2c2a3e] leading-relaxed">{wl.notes}</p>
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: COMMUNICATION & NETWORK GRAPH */}
        {subSection === 'graph' && (
          <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
              <div>
                <h4 className="text-sm font-bold text-[#1f1e30]">INTER-ENTITY CONNECTION & ESCROW TOPOLOGY</h4>
                <div className="text-xs text-[#5e5c7a]">
                  Cross-link matrix mapping suspects, corporate shells, escape vessels, and banking nodes.
                </div>
              </div>
              <button
                onClick={handleTriggerExecutiveBriefing}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                ESCALATE TO CABINET BRIEFING (GOV-2026-0052)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {NETWORK_GRAPH_DATA.links.map((lnk, i) => (
                <div key={i} className="bg-[#f8f7fc] border border-[#cfcddb] p-2.5 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1f1e30]">{lnk.source}</span>
                    <span className="text-[10px] font-mono text-[#4b4372] font-semibold">──({lnk.relation})──►</span>
                    <span className="font-bold text-[#1f1e30]">{lnk.target}</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
