import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { PORTALS } from './constants';

export default function SearchHome({ openTab, navigateTab }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const tileColors = {
        'versenet.aure': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        'faithmed.aure': 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
        'dga.gov': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        'cyacademy.edu': 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
        'records.orynvell.gov': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        'bank.aure': 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
        'shipping.aure': 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        'vectornet.onion': 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
        'auresuite.aure': 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full bg-[#f8fafc] px-6 py-10 text-slate-800 select-none overflow-y-auto font-sans">
            <div className="w-full max-w-3xl flex flex-col items-center space-y-10 my-auto">
                
                {/* Serif Logo Header matching the Versenet UI Blueprint */}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <h1 className="font-serif text-6xl font-bold tracking-tight text-[#0f172a]">
                        Versenet
                    </h1>
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase font-mono">
                        Aureline Quantum Search & Index Network
                    </p>
                </div>

                {/* Versenet Blueprint Search Bar with Green Search Button */}
                <form onSubmit={handleSearch} className="w-full max-w-xl flex items-center shadow-sm hover:shadow-md transition-shadow rounded-full overflow-hidden border border-slate-300 bg-white">
                    <div className="pl-5 text-slate-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search the web or enter a URL..."
                        className="flex-1 h-13 px-4 text-slate-800 placeholder-slate-400 text-base font-medium outline-none bg-transparent"
                        spellCheck={false}
                    />
                    <button
                        type="submit"
                        className="h-13 px-7 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center cursor-pointer"
                    >
                        Search
                    </button>
                </form>

                {/* Target Portal Directory Grid */}
                <div className="w-full space-y-4 pt-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400 text-center">
                        Verified Network Portals & Target Domains
                    </div>
                    <div className="grid grid-cols-3 gap-3.5">
                        {Object.entries(PORTALS).map(([url, portal]) => {
                            const IconComp = portal.icon;
                            const colorClass = tileColors[url] || 'bg-slate-50 text-slate-700 border-slate-200';
                            return (
                                <button
                                    key={url}
                                    onClick={() => openTab(`https://${url}`, portal.title)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border ${colorClass} transition-all duration-200 text-left group shadow-xs cursor-pointer`}
                                >
                                    <div className="h-9 w-9 shrink-0 rounded-lg bg-white shadow-xs flex items-center justify-center">
                                        <IconComp size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold truncate">
                                            {portal.title}
                                        </div>
                                        <div className="text-[9px] font-mono opacity-70 truncate">
                                            {url}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-slate-400 font-mono tracking-wider pt-6">
                VERSENET SECURE WEB ENGINE • AURELINE NETWORK PROTOCOL 4.2.1
            </div>
        </div>
    );
}
