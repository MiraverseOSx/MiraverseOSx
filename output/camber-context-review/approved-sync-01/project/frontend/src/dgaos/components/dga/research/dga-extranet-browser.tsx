'use client';

import React, { useState } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Search,
  Lock,
  Bookmark,
  ExternalLink,
  Building,
  FileText,
  AlertTriangle,
  Anchor,
  CheckCircle2
} from 'lucide-react';
import { EXTRANET_SITES, ExtranetWebsite } from '@/lib/extranet-data';

interface DgaExtranetBrowserProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function DgaExtranetBrowser({ onOpenCase, onNavigateTab }: DgaExtranetBrowserProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('https://phoenix-biotech.ch');
  const [urlInput, setUrlInput] = useState<string>('https://phoenix-biotech.ch');
  const [history, setHistory] = useState<string[]>(['https://phoenix-biotech.ch']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Interactive tool state
  const [alprQuery, setAlprQuery] = useState<string>('');
  const [alprResult, setAlprResult] = useState<string | null>(null);

  const [toxinQuery, setToxinQuery] = useState<string>('');
  const [toxinResult, setToxinResult] = useState<string | null>(null);

  const navigateTo = (url: string) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    setCurrentUrl(cleanUrl);
    setUrlInput(cleanUrl);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), cleanUrl]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setUrlInput(history[newIdx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setUrlInput(history[newIdx]);
    }
  };

  const currentDomain = currentUrl.replace('https://', '').replace('http://', '').split('/')[0];
  const matchedSite = EXTRANET_SITES.find((s) => s.domain === currentDomain) || EXTRANET_SITES[0];
  const currentPath = '/' + (currentUrl.replace(`https://${currentDomain}/`, '').replace(`http://${currentDomain}/`, '').split('/')[1] || '');
  const activePage = matchedSite.pages.find((p) => p.path === currentPath) || matchedSite.pages[0];

  const handleAlprSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = alprQuery.trim().toUpperCase();
    if (q === '7XYZ89') {
      setAlprResult(
        'VEHICLE HIT: 2024 Mercedes Sprinter High-Roof Van (Navy). Registered Owner: Apex Marine Freight Services LLC (Pier 42 Marine Terminal Bay 18). Last Sighting: 02:40 UTC Gantry #14 (Harbor South Access).'
      );
    } else if (q) {
      setAlprResult(`No active warrant flags or recent gantry sightings for license plate "${q}".`);
    }
  };

  const handleToxinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = toxinQuery.trim().toLowerCase();
    if (q.includes('organo') || q.includes('fluor') || q.includes('n26')) {
      setToxinResult(
        'MONOGRAPH FOUND: Methylphosphonofluoridate Synthetic Isomer (C4H10FO2P). High-affinity covalent AChE aging agent. Human LD50: 0.8 mg. Class 6 Toxic Hazard.'
      );
    } else {
      setToxinResult(`Chemical reference record for "${toxinQuery}" retrieved. Negative for scheduled biological warfare vectors.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* 1. TOP BROWSER CONTROLS BAR */}
      <div className="h-12 bg-white border-b border-[#cfcddb] px-3 flex items-center gap-2 shrink-0 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded hover:bg-[#edeaf6] text-[#5e5c7a] hover:text-[#1f1e30] disabled:opacity-30 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-[#edeaf6] text-[#5e5c7a] hover:text-[#1f1e30] disabled:opacity-30 cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo(currentUrl)}
            className="p-1.5 rounded hover:bg-[#edeaf6] text-[#5e5c7a] hover:text-[#1f1e30] cursor-pointer"
            title="Reload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Address URL input */}
        <form onSubmit={(e) => { e.preventDefault(); navigateTo(urlInput); }} className="flex-1 flex items-center">
          <div className="w-full bg-[#f8f7fc] border border-[#cfcddb] focus-within:border-[#4b4372] rounded px-2.5 py-1.5 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-xs text-[#1f1e30] placeholder-[#5e5c7a] focus:outline-none font-mono"
            />
          </div>
        </form>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
          EXTRANET GATEWAY
        </span>
      </div>

      {/* 2. BOOKMARKS BAR */}
      <div className="h-8 bg-[#eae8f2] border-b border-[#cfcddb] px-3 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5c7a] mr-1">
          FAVORITES:
        </span>
        {EXTRANET_SITES.map((site) => (
          <button
            key={site.id}
            onClick={() => navigateTo(`https://${site.domain}`)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              currentDomain === site.domain
                ? 'bg-white text-[#1f1e30] border border-[#cfcddb] shadow-2xs font-bold'
                : 'text-[#5e5c7a] hover:bg-white/60 hover:text-[#1f1e30]'
            }`}
          >
            <span>{site.domain}</span>
          </button>
        ))}
      </div>

      {/* 3. BROWSER RENDERED PAGE CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f0eff5]">
        <div className="max-w-4xl mx-auto bg-white border border-[#cfcddb] rounded-lg p-6 shadow-md space-y-5 text-[#1f1e30]">
          {/* Page Top Masthead */}
          <div className="flex items-center justify-between pb-4 border-b border-[#cfcddb]">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#4b4372] font-bold">
                {matchedSite.siteName}
              </div>
              <h1 className="text-xl font-bold text-[#1f1e30] mt-1">{activePage.title}</h1>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
              {matchedSite.securityLevel}
            </span>
          </div>

          {/* Page Content Body */}
          <div className="prose max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-line text-[#2c2a3e]">
            {activePage.content}
          </div>

          {/* Interactive Tools if page has one */}
          {activePage.interactiveTool === 'alpr_lookup' && (
            <div className="bg-[#f8f7fc] border border-[#cfcddb] p-4 rounded-lg space-y-3 pt-3 shadow-2xs">
              <div className="text-xs font-bold text-[#4b4372] uppercase tracking-wider">
                MUNICIPAL ALPR VEHICLE PLATE INQUIRY
              </div>
              <form onSubmit={handleAlprSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter license plate (e.g. 7XYZ89)..."
                  value={alprQuery}
                  onChange={(e) => setAlprQuery(e.target.value)}
                  className="flex-1 bg-white border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1f1e30] font-mono uppercase shadow-2xs focus:border-[#4b4372]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold cursor-pointer shadow-2xs"
                >
                  SEARCH CAMERAS
                </button>
              </form>
              {alprResult && (
                <div className="bg-purple-50/80 p-3 rounded border border-purple-300 text-xs text-[#362f59] font-mono">
                  {alprResult}
                </div>
              )}
            </div>
          )}

          {activePage.interactiveTool === 'toxin_search' && (
            <div className="bg-[#f8f7fc] border border-[#cfcddb] p-4 rounded-lg space-y-3 pt-3 shadow-2xs">
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                TOXNET CHEMICAL & POISON INDEX QUERY
              </div>
              <form onSubmit={handleToxinSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Query substance name or batch code (e.g. N26-RECRYSTALLIZED)..."
                  value={toxinQuery}
                  onChange={(e) => setToxinQuery(e.target.value)}
                  className="flex-1 bg-white border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1f1e30] font-mono shadow-2xs focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold cursor-pointer shadow-2xs"
                >
                  QUERY TOXIN
                </button>
              </form>
              {toxinResult && (
                <div className="bg-rose-50 p-3 rounded border border-rose-300 text-xs text-rose-900 font-mono">
                  {toxinResult}
                </div>
              )}
            </div>
          )}

          {/* Quick link button to cases */}
          <div className="pt-4 border-t border-[#cfcddb] flex items-center justify-between text-xs text-[#5e5c7a]">
            <span>External Domain: {matchedSite.domain}</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('cases')}
                className="text-[#4b4372] hover:text-[#1f1e30] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Return to Active Casework</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
