import React, { useMemo, useState } from 'react';
import { Globe, Search, BookOpen, User } from 'lucide-react';
import { PORTALS, SAMPLE_ARCHIVES } from './constants';
import { NPCS } from '../../db/miraverseDb';

const FILTER_TYPES = {
    Sites: 'site',
    People: 'person',
    Archives: 'archive',
    Images: 'image',
};

const ACCENT_CLASSES = {
    green: 'text-green-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-violet-600',
    amber: 'text-amber-600',
    indigo: 'text-indigo-600',
    orange: 'text-orange-600',
    cyan: 'text-cyan-600',
    rose: 'text-pink-600',
};

function getQueryHash(value) {
    return Array.from(value).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 0);
}

function includesQuery(value, query) {
    return String(value ?? '').toLowerCase().includes(query);
}

export default function SearchResults({ query, navigateTab }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Sites', 'People', 'Archives', 'Images'];

    const results = useMemo(() => {
        const normalizedQuery = String(query ?? '').trim();
        const q = normalizedQuery.toLowerCase();
        const queryHash = getQueryHash(normalizedQuery);
        const foundResults = [];

        Object.entries(PORTALS).forEach(([url, portal]) => {
            if (includesQuery(url, q) || includesQuery(portal.title, q) || includesQuery(portal.category, q)) {
                foundResults.push({ type: 'site', url, title: portal.title, snippet: `Official portal for ${portal.title} - ${portal.category}. Access services, information, and restricted areas.`, icon: portal.icon, accent: portal.accent });
            }
        });

        NPCS.forEach(npc => {
            if (includesQuery(npc.name, q) || includesQuery(npc.faction, q) || includesQuery(npc.role, q)) {
                foundResults.push({ type: 'person', npc });
            }
        });

        SAMPLE_ARCHIVES.forEach(arc => {
            if (includesQuery(arc.title, q) || includesQuery(arc.excerpt, q)) {
                foundResults.push({ type: 'archive', arc });
            }
        });

        if (normalizedQuery && foundResults.length < 2) {
            const encodedQuery = encodeURIComponent(normalizedQuery);
            foundResults.push({ type: 'site', url: `wiki.aure/${encodedQuery.replace(/%20/g, '_')}`, title: `${normalizedQuery} - AureWiki`, snippet: `Community-driven encyclopedic entry regarding ${normalizedQuery} within the Miraverse timeline.`, icon: BookOpen, accent: 'blue' });
            foundResults.push({ type: 'archive', arc: { id: `ARC-SEARCH-${queryHash % 1000}`, title: `Mention of "${normalizedQuery}" in DGA Logs`, address: `dga.gov.aure/search?q=${encodedQuery}`, type: 'Log Search', excerpt: `Automated scan found 3 references to ${normalizedQuery} in standard patrol reports.` } });
        }

        return foundResults;
    }, [query]);

    const filteredResults = useMemo(() => {
        const resultType = FILTER_TYPES[activeFilter];
        return resultType ? results.filter(result => result.type === resultType) : results;
    }, [activeFilter, results]);

    const searchDuration = useMemo(() => (getQueryHash(String(query ?? '')) % 9) + 1, [query]);

    return (
        <div className="min-h-full bg-white">
            <div className="border-b border-slate-200 bg-white sticky top-0 z-10 px-6 pt-6">
                <div className="flex items-center mb-6">
                    <Globe size={28} className="text-emerald-600 mr-4 cursor-pointer" onClick={() => navigateTab('https://versenet.aure')} />
                    <form className="flex-1 max-w-2xl relative" onSubmit={(e) => {
                        e.preventDefault();
                        const searchInput = e.currentTarget.elements.namedItem('search');
                        const nextQuery = searchInput instanceof HTMLInputElement ? searchInput.value.trim() : '';
                        if (nextQuery) navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(nextQuery)}`);
                    }}>
                        <input name="search" defaultValue={query} className="w-full h-11 pl-4 pr-10 rounded-full border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 h-5 w-5" />
                    </form>
                </div>
                <div className="flex space-x-6 text-sm">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeFilter === f ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-3xl px-6 py-8">
                <p className="text-sm text-slate-400 mb-6">About {filteredResults.length} results (0.0{searchDuration} seconds)</p>

                <div className="space-y-8">
                    {filteredResults.map(result => {
                        if (result.type === 'site') {
                            const Icon = result.icon;
                            return (
                                <div key={`site-${result.url}`} className="group">
                                    <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1 cursor-pointer" onClick={() => navigateTab(`https://${result.url}`)}>
                                        <Icon size={14} className={ACCENT_CLASSES[result.accent] ?? 'text-slate-600'} />
                                        <span className="truncate">https://{result.url}</span>
                                    </div>
                                    <h3 className="text-xl text-blue-700 font-medium cursor-pointer hover:underline mb-1" onClick={() => navigateTab(`https://${result.url}`)}>
                                        {result.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{result.snippet}</p>
                                </div>
                            );
                        }

                        if (result.type === 'person') {
                            const npc = result.npc;
                            return (
                                <div key={`person-${npc.id ?? npc.name}`} className="flex border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50/50">
                                    <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mr-4 shrink-0 text-slate-400">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-800">{npc.name}</h3>
                                        <div className="flex items-center space-x-2 mt-1 mb-2 text-xs">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{npc.role}</span>
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">{npc.faction}</span>
                                            <span className="text-slate-500">{npc.region}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2">{npc.description ?? `${npc.name} is currently ${String(npc.status ?? 'active').toLowerCase()} within the ${npc.faction ?? 'independent network'}.`}</p>
                                    </div>
                                </div>
                            );
                        }

                        if (result.type === 'archive') {
                            const arc = result.arc;
                            return (
                                <div key={`archive-${arc.id ?? arc.address}`} className="group border-l-4 border-amber-400 pl-4 py-1">
                                    <div className="text-xs text-amber-700 mb-1 font-mono">{arc.id} • {arc.type}</div>
                                    <h3 className="text-lg text-blue-700 font-medium cursor-pointer hover:underline mb-1" onClick={() => navigateTab(`https://${arc.address}`)}>
                                        {arc.title}
                                    </h3>
                                    <div className="text-xs text-emerald-700 mb-1 truncate">{arc.address}</div>
                                    <p className="text-sm text-slate-600 italic">"{arc.excerpt}"</p>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {filteredResults.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                            No {activeFilter.toLowerCase()} results found for “{query}”.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
