import React, { useState } from 'react';
import { Shield, AlertTriangle, Users, Eye, HelpCircle, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/button';

export default function DGA({ navigateTab }) {
    const [activeTab, setActiveTab] = useState('overview');

    const defensiveUnits = [
        { name: 'Strategic Operations Command [SOC]', desc: 'Oversees sector deployment and DGA tactical grid operations.' },
        { name: 'Rapid Response Bureau [RRB]', desc: 'Deploys combat squads to neutralize active physical threat sectors.' },
        { name: 'Protective Security Detail [PSD]', desc: 'Escort and defense details for high-clearance agency officials.' },
        { name: 'Experimental Tactics Group [ETG]', desc: 'R&D division testing spell module protocols against cyber anomalies.' }
    ];

    const investigativeUnits = [
        { name: 'Signals Intelligence [SIGINT]', desc: 'Monitoring frequency streams and radio signal intercepts.' },
        { name: 'Human & Civil Intelligence [HUMINT]', desc: 'Field surveillance and asset management in urban districts.' },
        { name: 'Research & Analysis Bureau [RAB]', desc: 'Intelligence processing and cyber forensics decoding.' },
        { name: 'Counter Intelligence [CIS]', desc: 'Internal audits, threat monitoring, and PRISM quarantine enforcement.' }
    ];

    return (
        <div className="min-h-full bg-white flex flex-col text-slate-800 font-sans">
            {/* Header Bar */}
            <header className="bg-slate-900 text-white p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Shield size={32} className="text-blue-400" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Digital Governance Agency</h1>
                        <p className="text-blue-200 text-sm font-mono uppercase tracking-wider text-[10px]">Order. Security. Progress.</p>
                    </div>
                </div>
                <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'leadership', label: 'Leadership & Divisions' },
                        { id: 'advisories', label: 'Advisories' },
                        { id: 'services', label: 'Citizen Portal' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="bg-slate-100 rounded-2xl p-8 border-l-4 border-blue-600">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Maintaining the Balance</h2>
                            <p className="text-slate-700 leading-relaxed text-sm">
                                The Digital Governance Agency (DGA) is responsible for overseeing cyber-infrastructure, 
                                public safety, and aetheric regulation across Aureline. By decree of the High Council, 
                                all active residents must declare their biometrics and verify clearance compliance.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-slate-200 rounded-xl p-5 space-y-2">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Shield size={18} className="text-blue-600" /> Defense Mandates
                                </h3>
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    Protecting sector conduits from unauthorized spellweaving attacks and PRISM malware injection bleeds.
                                </p>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5 space-y-2">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Eye size={18} className="text-blue-600" /> Signal Compliance
                                </h3>
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    Monitoring and auditing encrypted transmissions to maintain civil order and isolate hostile netrunners.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'leadership' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Organizational Structure</h2>
                            <p className="text-slate-500 text-xs mt-1">DGA Division and Sub-Unit Registry</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Defensive Division */}
                            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                                    <Shield size={18} className="text-blue-600" /> 1. DEFENSIVE DIVISION ["Shield"]
                                </h3>
                                <div className="space-y-3">
                                    {defensiveUnits.map((u, i) => (
                                        <div key={i} className="text-xs">
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className="text-blue-500">├──</span> {u.name}
                                            </div>
                                            <p className="text-slate-500 ml-5 mt-0.5">{u.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Investigative Division */}
                            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                                    <Eye size={18} className="text-indigo-600" /> 2. INVESTIGATIVE DIVISION ["Eyes"]
                                </h3>
                                <div className="space-y-3">
                                    {investigativeUnits.map((u, i) => (
                                        <div key={i} className="text-xs">
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className="text-indigo-500">├──</span> {u.name}
                                            </div>
                                            <p className="text-slate-500 ml-5 mt-0.5">{u.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Special Units */}
                        <div className="border border-amber-500/20 rounded-xl p-6 bg-amber-500/5 space-y-3">
                            <h3 className="font-bold text-amber-800 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-600" /> 3. SPECIAL UNITS // BLACKOUT TEAM
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                                <div className="border border-amber-500/10 rounded p-3 bg-white">
                                    <span className="text-slate-400 block text-[9px] uppercase">STATUS</span>
                                    <span className="text-amber-700 font-bold">Classified Co-Op Unit</span>
                                </div>
                                <div className="border border-amber-500/10 rounded p-3 bg-white">
                                    <span className="text-slate-400 block text-[9px] uppercase">OPERATIVE CAPACITY</span>
                                    <span className="text-slate-800 font-bold">5 Registered Slots</span>
                                </div>
                                <div className="border border-amber-500/10 rounded p-3 bg-white">
                                    <span className="text-slate-400 block text-[9px] uppercase">PRIMARY DIRECTIVE</span>
                                    <span className="text-slate-800 font-bold">Neutralize Ghostnet Threats</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'advisories' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Public Advisories</h2>
                        {[
                            { id: 'ADV-892', type: 'Security', text: 'Increased PRISM activity detected in the Lower Wards.', date: 'Today' },
                            { id: 'ADV-891', type: 'Maintenance', text: 'Aethercore pressure venting scheduled for sector 4.', date: 'Yesterday' }
                        ].map(a => (
                            <div key={a.id} className="border border-slate-200 rounded-xl p-5 flex items-start transition hover:border-slate-300">
                                <AlertTriangle size={20} className={`${a.type === 'Security' ? 'text-red-500' : 'text-amber-500'} mr-4 mt-0.5`} />
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{a.id} - {a.type}</h3>
                                    <p className="text-slate-600 text-xs mt-1">{a.text}</p>
                                    <p className="text-slate-400 text-[10px] mt-2 font-mono">{a.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="text-center p-12 border border-slate-200 rounded-xl bg-slate-50 max-w-md mx-auto">
                        <Shield size={40} className="text-slate-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Citizen Portal Redirect</h3>
                        <p className="text-slate-600 text-xs mb-6">For secure civic registration dossiers and lineage archives, please proceed to the Central Library.</p>
                        <Button 
                            onClick={() => navigateTab('https://library.aure')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 mx-auto"
                        >
                            Access Archives <ArrowRight size={14} />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
