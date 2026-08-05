import React, { useState } from 'react';
import { Globe, Search, RotateCw, Newspaper } from 'lucide-react';
import { PORTALS } from './constants';

export default function SearchHome({ openTab, navigateTab }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigateTab(`https://search.aure/find?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-full bg-gradient-to-b from-slate-50 to-white flex flex-col items-center pt-24 px-8 pb-12">
            <div className="text-center mb-10 w-full max-w-2xl">
                <div className="flex items-center justify-center mb-6 space-x-3 text-purple-600">
                    <Globe size={48} className="text-purple-500" />
                    <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                        Aureline Search
                    </h1>
                </div>

                <form onSubmit={handleSearch} className="relative w-full shadow-lg rounded-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-full border border-slate-200 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-shadow"
                        placeholder="Search the Aureline network..."
                        autoFocus
                    />
                </form>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mb-16">
                {Object.entries(PORTALS).map(([url, portal]) => (
                    <div
                        key={url}
                        onClick={() => openTab(`https://${url}`, portal.title)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                        <div className={`p-4 rounded-full mb-3 bg-${portal.accent}-50 text-${portal.accent}-600`}>
                            <portal.icon size={28} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{portal.title}</span>
                        <span className="text-xs text-slate-400 mt-1">{url}</span>
                    </div>
                ))}
            </div>

            <div className="w-full max-w-4xl grid grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <RotateCw size={14} className="mr-2" /> Recent History
                    </h3>
                    <div className="space-y-3">
                        {[
                            { title: 'Aethercore Resonance Data', url: 'library.aure/archives' },
                            { title: 'Veilwilt Symptoms', url: 'faithmed.aure/research' },
                            { title: 'DGA Advisory 44-B', url: 'dga.gov.aure/advisories' },
                            { title: 'Faculty Directory', url: 'cyacademy.aure/faculty' },
                            { title: 'Latest Exploits', url: 'vectornet.aure/exploits' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center text-sm cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg" onClick={() => navigateTab(`https://${item.url}`)}>
                                <Globe size={14} className="text-slate-400 mr-3 shrink-0" />
                                <div className="truncate">
                                    <div className="font-medium text-slate-700">{item.title}</div>
                                    <div className="text-xs text-slate-400 truncate">{item.url}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <Newspaper size={14} className="mr-2" /> Trending Now
                    </h3>
                    <div className="space-y-4">
                        <div className="cursor-pointer group" onClick={() => openTab('https://aurelinedaily.aure', 'Aureline Daily')}>
                            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">PRISM Activity Spikes in Lower Wards</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">DGA reports indicate a 40% increase in unauthorized Aether tapping along the eastern perimeter...</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago • Aureline Daily</span>
                        </div>
                        <div className="cursor-pointer group" onClick={() => openTab('https://aurelinedaily.aure', 'Aureline Daily')}>
                            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Cycademy Announces Breakthrough in Resonance Stabilization</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">Lead researchers claim new harmonic focal arrays could reduce Veilwilt risks by up to 15%...</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">5 hours ago • Aureline Daily</span>
                        </div>
                        <div className="cursor-pointer group" onClick={() => openTab('https://aurelinedaily.aure', 'Aureline Daily')}>
                            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">FaithMed Opens New Wing for Aether-Burn Victims</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">Responding to recent industrial incidents, the primary medical facility expands its specialized care...</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">1 day ago • Aureline Daily</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
