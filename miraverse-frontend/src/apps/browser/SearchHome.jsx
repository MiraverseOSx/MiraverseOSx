import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { PORTALS } from './constants';

export default function SearchHome({ openTab, navigateTab }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigateTab(`https://search.aure/find?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Beautiful matching colors
    const colors = {
        'faithmed.aure': { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-500/5', iconColor: 'text-emerald-500' },
        'cyacademy.aure': { bg: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-200 hover:shadow-purple-500/5', iconColor: 'text-purple-500' },
        'dga.gov.aure': { bg: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200 hover:shadow-blue-500/5', iconColor: 'text-blue-500' },
        'library.aure': { bg: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200 hover:shadow-amber-500/5', iconColor: 'text-amber-500' },
        'vectornet.aure': { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-200 hover:shadow-cyan-500/5', iconColor: 'text-cyan-500' },
        'aurelinedaily.aure': { bg: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-200 hover:shadow-rose-500/5', iconColor: 'text-rose-500' },
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#fafbfc] px-8 text-slate-800 select-none">
            <div className="w-full max-w-2xl flex flex-col items-center space-y-10 -mt-8">
                
                {/* Logo & Branding */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center justify-center space-x-3.5">
                        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20 text-white">
                            <Globe size={28} className="animate-spin-slow" />
                        </div>
                        <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900 bg-clip-text text-transparent font-sans">
                            Aureline
                        </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                        Quantum Search Core
                    </p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="w-full max-w-xl relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Aureline nodes, citizens, or archives..."
                        className="w-full h-14 pl-12 pr-6 rounded-full border border-slate-200 bg-white text-slate-800 placeholder-slate-400/80 text-base font-medium outline-none shadow-sm hover:shadow-md focus:shadow-lg focus:border-purple-400 focus:ring-4 focus:ring-purple-500/5 transition-all duration-300"
                        spellCheck={false}
                    />
                </form>

                {/* Bookmark Tiles */}
                <div className="w-full max-w-2xl space-y-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 text-center">
                        Quick Launch Portal Directory
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(PORTALS).map(([url, portal]) => {
                            const IconComp = portal.icon;
                            const theme = colors[url] || { bg: 'bg-slate-50 text-slate-600 border-slate-100', iconColor: 'text-slate-500' };
                            return (
                                <button
                                    key={url}
                                    onClick={() => openTab(`https://${url}`, portal.title)}
                                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-left group"
                                >
                                    <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${theme.bg} transition-transform duration-300 group-hover:scale-110`}>
                                        <IconComp size={20} className={theme.iconColor} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-700 truncate group-hover:text-purple-700 transition-colors">
                                            {portal.title}
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-400 truncate">
                                            {url}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
