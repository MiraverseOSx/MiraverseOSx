import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/button';

export default function DGA({ navigateTab }) {
    const [activeTab, setActiveTab] = useState('overview');
    return (
        <div className="min-h-full bg-white flex flex-col">
            <header className="bg-slate-900 text-white p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Shield size={32} className="text-blue-400" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Digital Governance Agency</h1>
                        <p className="text-blue-200 text-sm">Order. Security. Progress.</p>
                    </div>
                </div>
                <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
                    {['overview', 'advisories', 'services'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>
            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="bg-slate-100 rounded-2xl p-8 border-l-4 border-blue-600">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Maintaining the Balance</h2>
                            <p className="text-slate-700">The DGA oversees cyber-infrastructure, public safety, and aetheric regulation across Aureline.</p>
                        </div>
                    </div>
                )}
                {activeTab === 'advisories' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Public Advisories</h2>
                        {[
                            { id: 'ADV-892', type: 'Security', text: 'Increased PRISM activity detected in the Lower Wards.', date: 'Today' },
                            { id: 'ADV-891', type: 'Maintenance', text: 'Aethercore pressure venting scheduled for sector 4.', date: 'Yesterday' }
                        ].map(a => (
                            <div key={a.id} className="border border-slate-200 rounded-lg p-4 flex">
                                <AlertTriangle size={24} className={`${a.type === 'Security' ? 'text-red-500' : 'text-amber-500'} mr-4`} />
                                <div>
                                    <h3 className="font-bold text-slate-800">{a.id} - {a.type}</h3>
                                    <p className="text-slate-600 text-sm">{a.text}</p>
                                    <p className="text-slate-400 text-xs mt-2">{a.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'services' && (
                    <div className="text-center p-12 border border-slate-200 rounded-xl bg-slate-50">
                        <Shield size={48} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Citizen Portal Redirect</h3>
                        <p className="text-slate-600 mb-6">For civic records and archival access, please use the Central Library portal.</p>
                        <Button onClick={() => navigateTab('https://library.aure')}>Go to Library Portal</Button>
                    </div>
                )}
            </main>
        </div>
    );
}
