import React, { useEffect, useState } from 'react';
import { fetchFactions, fetchLocations, fetchNPCs, FactionDocument, LocationDocument, NPCDocument } from '../utils/appwriteClient';
import { Shield, Globe, Users, RefreshCw, Sparkles, MapPin, Radio, Compass } from 'lucide-react';

export default function LoreExplorer() {
    const [activeTab, setActiveTab] = useState<'factions' | 'locations' | 'npcs'>('factions');
    const [factions, setFactions] = useState<FactionDocument[]>([]);
    const [locations, setLocations] = useState<LocationDocument[]>([]);
    const [npcs, setNPCs] = useState<NPCDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [factionsData, locationsData, npcsData] = await Promise.all([
                fetchFactions(),
                fetchLocations(),
                fetchNPCs(),
            ]);
            setFactions(factionsData);
            setLocations(locationsData);
            setNPCs(npcsData);
        } catch (err: any) {
            setError(err?.message || 'Failed to connect to Appwrite Cloud');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#f1f3f9] text-[#1a1f36] font-sans select-none overflow-hidden">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#ffffff] border-b border-[#d8dce8] shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-base font-bold tracking-wider text-[#1e2640] uppercase font-mono">
                            SYSTEM DIRECTORY // CLOUD REALITY REGISTRY
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Live synchronized data from Appwrite Cloud (<span className="font-mono text-indigo-600 font-semibold">nyc.cloud.appwrite.io</span>)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Tab Navigation */}
                    <div className="flex items-center bg-[#e9ecf4] p-1 rounded-lg border border-[#d8dce8]">
                        <button
                            onClick={() => setActiveTab('factions')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                                activeTab === 'factions'
                                    ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Shield size={13} />
                            <span>Factions ({factions.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('locations')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                                activeTab === 'locations'
                                    ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Globe size={13} />
                            <span>Locations ({locations.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('npcs')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                                activeTab === 'npcs'
                                    ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Users size={13} />
                            <span>NPCs ({npcs.length})</span>
                        </button>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-2 rounded-lg bg-[#ffffff] hover:bg-slate-100 text-slate-700 border border-[#d8dce8] transition active:scale-95 disabled:opacity-50"
                        title="Sync with Cloud"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="h-8 w-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin mb-3" />
                        <span className="text-xs font-mono tracking-wider uppercase text-slate-500">Querying Appwrite Cloud Registers...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
                        <span className="font-bold">Sync Error:</span> {error}
                    </div>
                ) : (
                    <>
                        {/* FACTIONS TAB */}
                        {activeTab === 'factions' && (
                            <div className="space-y-4">
                                {factions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                                        No faction documents found in collection.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {factions.map((faction) => {
                                            const name = faction.Name || faction.name || 'Unnamed Faction';
                                            const color = faction.Accent_Color || faction.accentColor || '#3b4785';
                                            const ideology = faction.Ideology || faction.ideology || faction.Description || faction.description || 'No ideology manifest recorded.';
                                            const influence = faction.Influence_Level ?? faction.influenceLevel ?? 50;

                                            return (
                                                <div
                                                    key={faction.$id}
                                                    className="bg-[#ffffff] p-5 rounded-xl border border-[#d8dce8] shadow-xs hover:shadow-md transition flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-bold text-base text-[#1e2640] tracking-tight">{name}</h3>
                                                            <span
                                                                className="text-[11px] px-2.5 py-0.5 rounded font-mono font-bold border"
                                                                style={{
                                                                    backgroundColor: `${color}15`,
                                                                    borderColor: `${color}40`,
                                                                    color: color,
                                                                }}
                                                            >
                                                                {faction.$id}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{ideology}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-[#f0f2f8] text-xs font-mono">
                                                        <span className="text-slate-400">INFLUENCE RATING</span>
                                                        <span className="font-bold text-[#1e2640]">{influence} / 100</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LOCATIONS TAB */}
                        {activeTab === 'locations' && (
                            <div className="space-y-4">
                                {locations.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                                        No location documents found in collection.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {locations.map((loc) => {
                                            const name = loc.Name || loc.name || 'Unnamed District';
                                            const type = loc.Type || loc.type || 'District';
                                            const desc = loc.Description || loc.description || 'Regional sector under municipal observation.';
                                            const danger = loc.Danger_Level ?? loc.dangerLevel ?? 1;

                                            return (
                                                <div
                                                    key={loc.$id}
                                                    className="bg-[#ffffff] p-5 rounded-xl border border-[#d8dce8] shadow-xs hover:shadow-md transition flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={14} className="text-indigo-600" />
                                                                <h3 className="font-bold text-sm text-[#1e2640]">{name}</h3>
                                                            </div>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 border border-slate-200">
                                                                {type}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{desc}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-[#f0f2f8] text-xs font-mono">
                                                        <span className="text-slate-400">DANGER RATING</span>
                                                        <span className={`font-bold ${danger > 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            LVL {danger}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* NPCS TAB */}
                        {activeTab === 'npcs' && (
                            <div className="space-y-4">
                                {npcs.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                                        No NPC documents found in collection.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {npcs.map((npc) => {
                                            const name = npc.Name || npc.name || 'Citizen';
                                            const title = npc.Title || npc.title || 'Resident';
                                            const role = npc.Role || npc.role || 'Citizen';
                                            const tone = npc.Dialogue_Tone || npc.dialogueTone || 'Neutral';

                                            return (
                                                <div
                                                    key={npc.$id}
                                                    className="bg-[#ffffff] p-5 rounded-xl border border-[#d8dce8] shadow-xs hover:shadow-md transition flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-bold text-sm text-[#1e2640]">{name}</h3>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 font-mono text-indigo-700 border border-indigo-200">
                                                                {role}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono mb-2">{title}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-[#f0f2f8] text-xs font-mono">
                                                        <span className="text-slate-400">TONE</span>
                                                        <span className="text-slate-700 font-semibold">{tone}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
