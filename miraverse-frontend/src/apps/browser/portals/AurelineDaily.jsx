import React, { useState } from 'react';

export default function AurelineDaily() {
    const [activeTab, setActiveTab] = useState('headlines');
    return (
        <div className="min-h-full bg-[#fcf9f2] text-slate-900 font-serif flex flex-col">
            <header className="border-b-4 border-slate-900 p-6 text-center relative bg-white">
                <div className="absolute left-6 top-6 text-xs text-slate-500 font-sans tracking-widest uppercase">Vol. CXIV — No. 42</div>
                <div className="absolute right-6 top-6 text-xs text-slate-500 font-sans tracking-widest uppercase">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h1 className="text-6xl font-bold tracking-tighter mt-4 mb-2">AURELINE DAILY</h1>
                <p className="text-sm italic text-slate-600 border-t border-slate-300 pt-2 w-1/3 mx-auto">"The Truth, Unveiled from the Aether"</p>
                <nav className="flex justify-center space-x-8 mt-8 text-sm font-bold uppercase tracking-widest font-sans border-t border-b border-slate-200 py-3">
                    {['headlines', 'politics', 'science', 'crime', 'opinion'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`hover:text-red-700 transition-colors ${activeTab === tab ? 'text-red-700' : 'text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
                {activeTab === 'headlines' && (
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8">
                            <div className="bg-red-700 text-white text-xs font-bold font-sans uppercase tracking-widest px-3 py-1 inline-block mb-3">Breaking News</div>
                            <h2 className="text-5xl font-bold leading-tight mb-4 hover:text-red-800 cursor-pointer transition-colors">PRISM Cult Claims Responsibility for Sector 4 Power Surge</h2>
                            <p className="text-xl text-slate-700 leading-relaxed mb-4">
                                In a brazen broadcast intercepted by DGA monitors, leadership elements of the notorious PRISM cult have stated they intentionally caused the massive Aethercore feedback loop that left three wards in darkness.
                            </p>
                            <div className="flex items-center text-sm font-sans text-slate-500 border-b border-slate-200 pb-6 mb-6">
                                <span className="font-bold text-slate-800 mr-2">By Elias Thorne</span> | 2 hours ago
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" alt="Cycademy" className="w-full h-48 object-cover mb-3 sepia-[.3]" />
                                    <h3 className="text-2xl font-bold mb-2 leading-tight">Cycademy Unveils New Resonance Damper</h3>
                                    <p className="text-sm text-slate-600">Faculty members demonstrate prototype device promising to reduce Veilwilt symptoms in high-magic areas.</p>
                                </div>
                                <div>
                                    <img src="https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=600&q=80" alt="FaithMed" className="w-full h-48 object-cover mb-3 sepia-[.3]" />
                                    <h3 className="text-2xl font-bold mb-2 leading-tight">FaithMed Reports Record Number of Aura Scans</h3>
                                    <p className="text-sm text-slate-600">Following the power surge, clinics across the city see influx of citizens seeking bio-etheric stabilization.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 border-l border-slate-300 pl-8">
                            <h3 className="text-lg font-black font-sans uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-6">Latest Briefs</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'DGA Increases Patrols in Old Factory Ward', time: '1 hr ago' },
                                    { title: 'Library Archives Temporarily Offline for Scheduled Purge', time: '3 hrs ago' },
                                    { title: 'Market Watch: Aether Battery Prices Surge 15%', time: '5 hrs ago' },
                                    { title: 'Opinion: Are We Relying Too Heavily on Pre-Collapse Tech?', time: '6 hrs ago' },
                                ].map((news, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <h4 className="text-lg font-bold leading-tight group-hover:text-red-700 transition-colors">{news.title}</h4>
                                        <p className="text-xs font-sans text-slate-500 mt-1">{news.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab !== 'headlines' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 capitalize border-b-2 border-slate-900 pb-4">{activeTab}</h2>
                        <div className="space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex border-b border-slate-200 pb-8 last:border-0 cursor-pointer group">
                                    <div className="flex-1 pr-8">
                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-red-700 transition-colors">Sample {activeTab} Article {i}: Lorem Ipsum Dolor Sit Amet</h3>
                                        <p className="text-slate-600 leading-relaxed mb-3">Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                        <div className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">Staff Writer • {i * 2} hours ago</div>
                                    </div>
                                    <div className="w-48 h-32 bg-slate-200 shrink-0"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
