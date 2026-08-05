import React, { useState } from 'react';
import { BookOpen, FileText, Key, Shield } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { SAMPLE_ARCHIVES } from '../constants';

const Unlock = (props) => <Key {...props} />;

export default function Library() {
    const [activeTab, setActiveTab] = useState('catalog');
    const [loggedIn, setLoggedIn] = useState(false);

    return (
        <div className="min-h-full bg-[#fdfbf7] flex flex-col">
            <header className="bg-amber-900 text-[#fdfbf7] p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <BookOpen size={32} className="text-amber-400" />
                    <div>
                        <h1 className="text-2xl font-serif font-bold tracking-tight">Central Library & Archives</h1>
                        <p className="text-amber-200/80 text-sm font-serif italic">Preserving the past. Informing the future.</p>
                    </div>
                </div>
                <div className="flex space-x-1 bg-amber-950/50 rounded-lg p-1">
                    {['catalog', 'manuscripts', 'vault'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-[#fdfbf7] text-amber-900 shadow-sm' : 'text-amber-100 hover:bg-amber-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {activeTab === 'catalog' && (
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-amber-950 mb-6 border-b border-amber-200 pb-2">Public Catalog</h2>
                        <div className="space-y-6">
                            {SAMPLE_ARCHIVES.map(arc => (
                                <div key={arc.id} className="bg-white p-6 border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-amber-900 font-serif">{arc.title}</h3>
                                        <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded">{arc.id}</span>
                                    </div>
                                    <p className="text-sm text-amber-900/60 font-mono mb-4">{arc.address}</p>
                                    <p className="text-slate-700 leading-relaxed">"{arc.excerpt}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'manuscripts' && (
                    <div className="text-center p-12">
                        <FileText size={48} className="text-amber-300 mx-auto mb-4" />
                        <h3 className="text-xl font-serif font-bold text-amber-900 mb-2">Digital Manuscripts Offline</h3>
                        <p className="text-amber-800/70">The high-resolution manuscript viewer is undergoing maintenance. Please visit the physical archives in the Upper Ward.</p>
                    </div>
                )}

                {activeTab === 'vault' && (
                    <div className="max-w-xl mx-auto mt-8">
                        {!loggedIn ? (
                            <div className="bg-white border border-amber-200 rounded-xl p-8 shadow-sm text-center">
                                <Key size={48} className="text-amber-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-serif font-bold text-amber-950 mb-2">Restricted Vault Access</h2>
                                <p className="text-amber-800/70 text-sm mb-6">Level 4 DGA or Archival clearance required.</p>
                                <div className="space-y-4">
                                    <Input type="password" placeholder="Access Code" className="border-amber-200 focus:ring-amber-500" />
                                    <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white" onClick={() => setLoggedIn(true)}>Authenticate</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-stone-900 text-amber-50 rounded-xl p-8 font-mono border border-amber-900 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><Shield size={120} /></div>
                                <h2 className="text-xl font-bold text-amber-400 mb-4 border-b border-amber-800 pb-2 flex items-center">
                                    <Unlock size={20} className="mr-2" /> DECRYPTED: LIGHTBORN LINEAGE
                                </h2>
                                <div className="space-y-4 text-sm z-10 relative">
                                    <p>SUBJECT: Hereditary Veil Sensitivity</p>
                                    <p className="text-amber-200/60">CLASSIFICATION: TOP SECRET // OMEGA</p>
                                    <div className="bg-black/50 p-4 rounded border border-amber-900/50">
                                        <p>Analysis confirms individuals displaying spontaneous Aetheric generation are descendants of the original Pre-Collapse architects.</p>
                                        <br />
                                        <p>Recommendation: Continued monitoring by DGA operatives. Do not alert Cycademy faculty.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="mt-8 border-amber-700 text-amber-400 hover:bg-amber-900/50" onClick={() => setLoggedIn(false)}>Purge Cache & Exit</Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
