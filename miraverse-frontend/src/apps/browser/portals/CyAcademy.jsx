import React, { useState } from 'react';
import { Building, Sparkles, BookOpen, User, LogIn, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { NPCS } from '../../../db/miraverseDb';

export default function CyAcademy() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loggedIn, setLoggedIn] = useState(false);

    return (
        <div className="min-h-full bg-white flex flex-col">
            <header className="bg-indigo-900 text-white p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Building size={32} className="text-indigo-300" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cycademy of Sciences</h1>
                        <p className="text-indigo-200 text-sm">Veritas et Aether</p>
                    </div>
                </div>
                <div className="flex space-x-1 bg-indigo-950/50 rounded-lg p-1">
                    {['overview', 'programs', 'faculty', 'portal'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-indigo-800'}`}
                        >
                            {tab === 'portal' ? 'Student Portal' : tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 text-center">
                            <Sparkles size={48} className="text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-indigo-900 mb-4">Pushing the Boundaries of Known Aether</h2>
                            <p className="text-indigo-700 text-lg max-w-3xl mx-auto">
                                For over a century, the Cycademy has been the beacon of intellectual pursuit, blending traditional academia with rigorous study of elemental manipulation and Aethercore dynamics.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'programs' && (
                    <div className="animate-in fade-in grid grid-cols-2 gap-6">
                        {[
                            { title: 'Aetheric Engineering', desc: 'Design and maintain the city\'s core infrastructure.' },
                            { title: 'Theoretical Spellcraft', desc: 'Advanced study of spell matrices and Veil physics.' },
                            { title: 'Historical Archives', desc: 'Preservation of pre-Collapse knowledge.' },
                            { title: 'Bio-Etherics', desc: 'Intersection of biology and magical resonance.' }
                        ].map((p, i) => (
                            <div key={i} className="border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow">
                                <BookOpen size={24} className="text-indigo-600 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">{p.title}</h3>
                                <p className="text-slate-600 mt-2">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'faculty' && (
                    <div className="animate-in fade-in">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Distinguished Faculty</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {NPCS.filter(n => n.faction.includes('Faculty') || n.faction.includes('Admin') || n.faction.includes('Cycademy')).map((npc, i) => (
                                <div key={i} className="flex border border-slate-200 rounded-xl p-4 items-center">
                                    <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4 shrink-0">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{npc.name}</h3>
                                        <p className="text-indigo-700 text-sm">{npc.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'portal' && (
                    <div className="animate-in fade-in max-w-md mx-auto mt-12">
                        {!loggedIn ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                                <LogIn size={48} className="text-indigo-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Student / Faculty Portal</h2>
                                <p className="text-slate-500 text-sm mb-6">Enter your Cycademy credentials.</p>
                                <div className="space-y-4">
                                    <Input placeholder="Student/Faculty ID" />
                                    <Input type="password" placeholder="Passcode" />
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setLoggedIn(true)}>Log In</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
                                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                                <p className="text-slate-600">Your account lacks the necessary clearance to view current term schedules. Please contact administration.</p>
                                <Button variant="outline" className="mt-6" onClick={() => setLoggedIn(false)}>Sign Out</Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
