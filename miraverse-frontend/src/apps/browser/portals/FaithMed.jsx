import React, { useState } from 'react';
import { Activity, CheckCircle2, Lock, User } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { useOSStore } from '../../../store/useOSStore';
import { NPCS } from '../../../db/miraverseDb';

export default function FaithMed({ navigateTab }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [scheduled, setScheduled] = useState(false);
    const player = useOSStore((s) => s.gameplay.player);
    const healAura = useOSStore((s) => s.healAura);
    const removeCondition = useOSStore((s) => s.removeCondition);
    const addCareerXP = useOSStore((s) => s.addCareerXP);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleIntakeScan = () => {
        healAura(30);
        removeCondition('Veilwilt');
        removeCondition('Riftspine Fracture');
        removeCondition('Sunspire Burn Fever');
        addCareerXP('medical', 50);
        addCredits(150);
        addXP(75);
        alert('Intake Scan Complete. Medical data uploaded to your neural link. Aura stabilized.');
    };

    return (
        <div className="min-h-full bg-white flex flex-col">
            <header className="bg-emerald-800 text-white p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Activity size={32} className="text-emerald-300" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Faith Medical Group</h1>
                        <p className="text-emerald-200 text-sm">Aura Stabilization & Bio-Etheric Care</p>
                    </div>
                </div>
                <div className="flex space-x-1 bg-emerald-900/50 rounded-lg p-1">
                    {['overview', 'providers', 'services', 'portal'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700'}`}
                        >
                            {tab === 'portal' ? 'Patient Portal' : tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                            <h2 className="text-3xl font-light text-emerald-900 mb-4">Pioneering Aura Health in Aureline.</h2>
                            <p className="text-emerald-700 text-lg leading-relaxed max-w-3xl">
                                Faith Medical Group is the premier healthcare provider dedicated to treating Aether-burns, Veilwilt, and other elemental exposure conditions. Our facilities blend traditional medical science with advanced bio-etheric resonance therapies.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { title: 'Emergency Trauma', desc: '24/7 care for acute elemental surges and combat-related injuries.' },
                                { title: 'Aura Rehabilitation', desc: 'Long-term care for Veilwilt and chronic magic strain.' },
                                { title: 'Cybernetics Clinic', desc: 'Integration and maintenance of neural links and prosthetics.' }
                            ].map((s, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
                                    <Activity size={24} className="text-emerald-600 mb-3" />
                                    <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                                    <p className="text-slate-600 text-sm">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'providers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Specialists</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {NPCS.filter(n => n.faction === 'Faith Medical').map((npc, i) => (
                                <div key={i} className="flex border border-slate-200 rounded-xl p-4 items-center">
                                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4 shrink-0">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{npc.name}</h3>
                                        <p className="text-emerald-700 text-sm mb-1">{npc.role}</p>
                                        <p className="text-slate-500 text-xs">{npc.region}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Treatments</h2>
                        <div className="space-y-4">
                            <div className="border border-slate-200 rounded-xl p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Complete Intake Scan & Detox</h3>
                                    <p className="text-slate-600 text-sm max-w-xl mt-1">Full diagnosis of etheric imbalances, removal of acute magical conditions, and minor aura healing.</p>
                                </div>
                                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleIntakeScan}>Initiate Scan</Button>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Routine Checkup</h3>
                                    <p className="text-slate-600 text-sm max-w-xl mt-1">Standard medical evaluation.</p>
                                </div>
                                <Button variant="outline" onClick={() => { setScheduled(true); alert('Appointment scheduled.'); }}>
                                    {scheduled ? 'Scheduled' : 'Book Appointment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'portal' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto mt-12">
                        {!loggedIn ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock size={28} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Portal</h2>
                                <p className="text-slate-500 text-sm mb-6">Log in with your secure Miraverse ID to access your medical records.</p>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setLoggedIn(true)}>Authenticate via Neural Link</Button>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
                                    <h2 className="text-xl font-bold text-emerald-900">Patient Dashboard</h2>
                                    <Button variant="ghost" size="sm" onClick={() => setLoggedIn(false)} className="text-emerald-700 hover:bg-emerald-100">Log Out</Button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Patient Name</span>
                                        <div className="text-lg font-medium text-slate-800">{player.name || 'Anonymous User'}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Aura Health Status</span>
                                        <div className="flex items-center mt-1">
                                            <div className="w-full bg-slate-200 rounded-full h-2.5 mr-3">
                                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${player.auraHealth}%` }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-emerald-800">{player.auraHealth}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Active Conditions</span>
                                        {player.conditions.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {player.conditions.map((c, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium">{c}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 text-sm mt-1 flex items-center"><CheckCircle2 size={16} className="text-emerald-500 mr-1" /> Clean bill of health</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
