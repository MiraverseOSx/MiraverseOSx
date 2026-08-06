import React, { useState } from 'react';
import { Globe, Search, BookOpen, User } from 'lucide-react';
import { PORTALS, SAMPLE_ARCHIVES } from './constants';
import { NPCS } from '../../db/miraverseDb';

export default function SearchResults({ query, navigateTab }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Sites', 'People', 'Archives', 'Images'];

    const getSearchResults = () => {
        const q = query.toLowerCase();
        let results = [];

        Object.entries(PORTALS).forEach(([url, portal]) => {
            if (url.toLowerCase().includes(q) || portal.title.toLowerCase().includes(q) || portal.category.toLowerCase().includes(q)) {
                results.push({ type: 'site', url, title: portal.title, snippet: `Official portal for ${portal.title} - ${portal.category}. Access services, information, and restricted areas.`, icon: portal.icon, accent: portal.accent });
            }
        });

        NPCS.forEach(npc => {
            if (npc.name.toLowerCase().includes(q) || npc.faction.toLowerCase().includes(q) || npc.role.toLowerCase().includes(q)) {
                results.push({ type: 'person', npc });
            }
        });

        SAMPLE_ARCHIVES.forEach(arc => {
            if (arc.title.toLowerCase().includes(q) || arc.excerpt.toLowerCase().includes(q)) {
                results.push({ type: 'archive', arc });
            }
        });

        if (results.length < 2) {
            results.push({ type: 'site', url: `wiki.aure/${query.replace(/\s+/g, '_')}`, title: `${query} - AureWiki`, snippet: `Community-driven encyclopedic entry regarding ${query} within the Miraverse timeline.`, icon: BookOpen, accent: 'blue' });
            results.push({ type: 'archive', arc: { id: `ARC-RAND-${Math.floor(Math.random() * 1000)}`, title: `Mention of "${query}" in DGA Logs`, address: `dga.gov.aure/search?q=${query}`, type: 'Log Search', excerpt: `Automated scan found 3 references to ${query} in standard patrol reports.` } });
        }

        return results;
    };

    const results = getSearchResults();

    return (
        <div className="min-h-full bg-white">
            <div className="border-b border-slate-200 bg-white sticky top-0 z-10 px-6 pt-6">
                <div className="flex items-center mb-6">
                    <Globe size={28} className="text-purple-600 mr-4 cursor-pointer" onClick={() => navigateTab('https://search.aure')} />
                    <form className="flex-1 max-w-2xl relative" onSubmit={(e) => { e.preventDefault(); navigateTab(`https://search.aure/find?q=${encodeURIComponent(e.target.search.value)}`); }}>
                        <input name="search" defaultValue={query} className="w-full h-11 pl-4 pr-10 rounded-full border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm" />
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
                <p className="text-sm text-slate-400 mb-6">About {results.length} results (0.0{Math.floor(Math.random() * 9)} seconds)</p>

                <div className="space-y-8">
                    {results.map((result, idx) => {
                        if (activeFilter !== 'All' &&
                            ((activeFilter === 'Sites' && result.type !== 'site') ||
                                (activeFilter === 'People' && result.type !== 'person') ||
                                (activeFilter === 'Archives' && result.type !== 'archive'))) {
                            return null;
                        }

                        if (result.type === 'site') {
                            return (
                                <div key={idx} className="group">
                                    <div className="flex items-center space-x-2 text-sm text-slate-600 mb-1 cursor-pointer" onClick={() => navigateTab(`https://${result.url}`)}>
                                        <result.icon size={14} className={`text-${result.accent}-600`} />
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
                                <div key={idx} className="flex border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50/50">
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
                                        <p className="text-sm text-slate-600 line-clamp-2">{npc.description}</p>
                                    </div>
                                </div>
                            );
                        }

                        if (result.type === 'archive') {
                            const arc = result.arc;
                            return (
                                <div key={idx} className="group border-l-4 border-amber-400 pl-4 py-1">
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
                </div>
            </div>
        </div>
    );
}
