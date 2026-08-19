import React, { useState } from 'react';
import { Search, Globe, Sparkles } from 'lucide-react';

export interface SearchHomeProps {
    openTab?: (url: string, title?: string) => void;
    navigateTab: (url: string, title?: string) => void;
}

export default function SearchHome({ navigateTab }: SearchHomeProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        // If user typed a direct URL/domain, navigate to it, otherwise search
        if (trimmed.includes('.') && !trimmed.includes(' ')) {
            const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
            navigateTab(url);
        } else {
            navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full bg-[#FAFBFD] px-6 py-12 text-slate-800 select-none overflow-y-auto font-sans">
            <div className="w-full max-w-2xl flex flex-col items-center space-y-8 my-auto">
                
                {/* Logo & Tagline */}
                <div className="flex flex-col items-center space-y-2.5 text-center">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
                            <Globe size={26} />
                        </div>
                        <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900">
                            Versenet
                        </h1>
                    </div>
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase font-mono">
                        Aureline Quantum Search & Index Network
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-xl flex items-center shadow-sm hover:shadow-md transition-shadow rounded-full overflow-hidden border border-slate-300 bg-white">
                    <div className="pl-5 text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Versenet or enter web address..."
                        className="flex-1 h-12 px-4 text-slate-800 placeholder-slate-400 text-sm font-medium outline-none bg-transparent"
                        spellCheck={false}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center cursor-pointer"
                    >
                        Search
                    </button>
                </form>

                {/* Quick Helpful Search Prompts */}
                <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Try searching:</span>
                    {['DGA Directive 14-B', 'Faith Medical', 'Orynvell Treasury', 'AETHERCORE', 'Veilwilt'].map((term) => (
                        <button
                            key={term}
                            type="button"
                            onClick={() => navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(term)}`)}
                            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] transition shadow-xs cursor-pointer"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-slate-400 font-mono tracking-wider pt-6">
                VERSENET SECURE WEB ENGINE • AURELINE NETWORK PROTOCOL 4.2.1
            </div>
        </div>
    );
}
