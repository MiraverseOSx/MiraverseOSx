import React, { useState } from 'react';
import { Radio, AlertTriangle } from 'lucide-react';

export default function VectorNet() {
    const [activeTab, setActiveTab] = useState('forums');

    return (
        <div className="min-h-full bg-[#0a0f14] text-cyan-500 font-mono flex flex-col selection:bg-cyan-900 selection:text-cyan-100">
            <header className="border-b border-cyan-900/50 p-4 flex items-center justify-between bg-black/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <Radio className="text-cyan-400 animate-pulse" size={24} />
                    <h1 className="text-xl font-bold tracking-widest text-cyan-400 glow-text">v e c t o r / / n e t</h1>
                </div>
                <div className="flex space-x-4 text-xs">
                    {['forums', 'leaks', 'exploits', 'mesh'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`uppercase tracking-wider hover:text-cyan-300 transition-colors ${activeTab === tab ? 'text-cyan-300 border-b border-cyan-400 pb-1' : 'text-cyan-700'}`}
                        >
                            [{tab}]
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                {activeTab === 'forums' && (
                    <div className="space-y-4">
                        <div className="border border-cyan-900/30 bg-black/20 p-4 rounded">
                            <div className="flex justify-between text-xs text-cyan-700 mb-2 border-b border-cyan-900/30 pb-2">
                                <span>THREAD</span>
                                <span>AUTHOR / REPLIES</span>
                            </div>
                            {[
                                { title: 'Bypassing DGA Sector 4 Checkpoints', author: 'null_pointer', replies: 142 },
                                { title: 'Anyone seen the new FaithMed cybernetics?', author: 'chrome_doc', replies: 89 },
                                { title: 'WARNING: PRISM signatures in the lower mesh', author: 'ghost_in_the_wire', replies: 304 },
                                { title: 'Selling slightly used Aethercore batteries (no questions asked)', author: 'scrap_king', replies: 12 }
                            ].map((t, i) => (
                                <div key={i} className="flex justify-between items-center py-3 hover:bg-cyan-900/10 cursor-pointer">
                                    <div className="font-bold text-cyan-300 hover:underline">{t.title}</div>
                                    <div className="text-xs text-cyan-600 text-right">
                                        <div>@{t.author}</div>
                                        <div>{t.replies} msgs</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'leaks' && (
                    <div className="space-y-6">
                        <div className="bg-red-900/10 border border-red-900/30 p-6 rounded">
                            <h3 className="text-red-500 font-bold mb-4 flex items-center"><AlertTriangle size={16} className="mr-2" /> PRISM INTELLIGENCE DOSSIER</h3>
                            <div className="text-sm text-cyan-600/80 space-y-2">
                                <p>FILE: <span className="text-cyan-400">#88-A-CULT</span></p>
                                <p>Intercepted comms indicate PRISM is planning a coordinated strike on the <span className="bg-cyan-900/50 text-cyan-100 px-1">REDACTED</span> facility in the Upper Wards.</p>
                                <p>Objective appears to be the acquisition of <span className="bg-cyan-900/50 text-cyan-100 px-1">REDACTED</span> for ritualistic Aether consumption.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exploits' && (
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { name: 'Zero-Day: Cycademy Login Bypass', status: 'PATCHED', risk: 'HIGH' },
                            { name: 'FaithMed Database Dumper v2.1', status: 'ACTIVE', risk: 'CRITICAL' },
                            { name: 'DGA Drone Spoofing Script', status: 'ACTIVE', risk: 'MEDIUM' }
                        ].map((e, i) => (
                            <div key={i} className="border border-cyan-900/40 p-4 rounded bg-black/30">
                                <div className="text-cyan-300 font-bold mb-2">{e.name}</div>
                                <div className="flex space-x-4 text-xs">
                                    <span className={`px-2 py-1 rounded ${e.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>{e.status}</span>
                                    <span className="px-2 py-1 bg-cyan-900/20 text-cyan-600 border border-cyan-900/30 rounded">RISK: {e.risk}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'mesh' && (
                    <div className="border border-cyan-900/50 rounded h-[400px] flex flex-col bg-black/40">
                        <div className="p-2 border-b border-cyan-900/50 text-xs text-cyan-600 text-center">ENCRYPTED P2P CONNECTION ESTABLISHED</div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            <div className="text-sm"><span className="text-cyan-600">@sysadmin:</span> Anyone online? The network is lagging bad today.</div>
                            <div className="text-sm"><span className="text-green-500">@runner_99:</span> Yeah, DGA is running sweeps in sector 7. Routing everything through the old factory proxies.</div>
                            <div className="text-sm"><span className="text-cyan-600">@sysadmin:</span> Copy that. Stay frosty.</div>
                        </div>
                        <div className="p-2 border-t border-cyan-900/50 flex">
                            <span className="text-cyan-600 mr-2">{'>'}</span>
                            <input type="text" className="bg-transparent flex-1 outline-none text-cyan-300" placeholder="Type message..." disabled />
                        </div>
                    </div>
                )}
            </main>
            <style dangerouslySetInnerHTML={{
                __html: `
        .glow-text { text-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
      `}} />
        </div>
    );
}
