import React, { useEffect, useMemo, useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import {
    Compass, Zap, Scroll, Briefcase, Sparkles, Award, Lock, Play, Globe,
    Check, MessageSquare, MapPin, User, FileCode, Search, CircleDot, Gift
} from 'lucide-react';
import {
    AppShell, AppToolbar, AppSidebar, AppPane, EmptyState, SearchField, StatusBadge
} from '../components/ui/app-shell';
import { useToastStore } from '../store/useToastStore';

const CATEGORY_DEFINITIONS = [
    { id: 'All', label: 'All Activities', icon: Globe, color: 'text-slate-400' },
    { id: 'Journey', label: 'Journey', icon: Compass, color: 'text-violet-400' },
    { id: 'Adventures', label: 'Adventures', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'Quests', label: 'Quests', icon: Scroll, color: 'text-blue-400' },
    { id: 'Tasks', label: 'Tasks', icon: Zap, color: 'text-amber-400' },
    { id: 'Missions', label: 'Missions', icon: Briefcase, color: 'text-pink-400' },
];

const STATUS_TONES = {
    LOCKED: 'neutral',
    AVAILABLE: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
};

export default function NoticeBoardApp() {
    const [activeTab, setActiveTab] = useState('Journey'); // 'Journey' | 'Adventures' | 'Quests' | 'Tasks' | 'Missions' | 'All'
    const [selectedActivityId, setSelectedActivityId] = useState('J01');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const player = useOSStore((s) => s.gameplay.player);
    const completeActivity = useOSStore((s) => s.completeActivity);
    const updateActivityStatus = useOSStore((s) => s.updateActivityStatus);
    const pushToast = useToastStore((s) => s.pushToast);

    const activities = player?.activities || [];

    const categories = CATEGORY_DEFINITIONS.map((category) => ({
        ...category,
        badge: category.id === 'All'
            ? activities.length
            : activities.filter((activity) => activity.category === category.id).length,
    }));

    const filteredActivities = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        return activities.filter((activity) => {
            const matchesCategory = activeTab === 'All' || activity.category === activeTab;
            const matchesStatus = statusFilter === 'ALL' || activity.status === statusFilter;
            const matchesSearch = !normalizedSearch || [activity.title, activity.subtitle, activity.giver, activity.location]
                .some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));
            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [activeTab, activities, searchQuery, statusFilter]);

    const selectedActivity = filteredActivities.find((activity) => activity.id === selectedActivityId) || filteredActivities[0] || null;

    useEffect(() => {
        if (selectedActivity?.id !== selectedActivityId) {
            setSelectedActivityId(selectedActivity?.id ?? null);
        }
    }, [selectedActivity, selectedActivityId]);

    const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
    const inProgressCount = activities.filter((a) => a.status === 'IN_PROGRESS').length;
    const completionPercentage = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

    const rewardXP = selectedActivity?.rewards?.xp ?? selectedActivity?.xp ?? 0;
    const rewardCredits = selectedActivity?.rewards?.credits ?? selectedActivity?.credits ?? 0;
    const isLocked = selectedActivity?.status === 'LOCKED';
    const isAvailable = selectedActivity?.status === 'AVAILABLE';
    const isCompleted = selectedActivity?.status === 'COMPLETED';

    const handlePrimaryAction = () => {
        if (!selectedActivity || isLocked || isCompleted) return;
        if (isAvailable) {
            updateActivityStatus(selectedActivity.id, 'IN_PROGRESS');
            pushToast({ title: 'Activity tracked', message: selectedActivity.title, tone: 'info' });
            return;
        }
        completeActivity(selectedActivity.id);
        pushToast({
            title: 'Rewards claimed',
            message: `+${rewardXP} XP and +${rewardCredits} ₡`,
            tone: 'success',
        });
    };

    return (
        <AppShell>
            <AppToolbar
                icon={Award}
                title="Master Activity Tracker"
                subtitle="Journey, operations, quests, tasks, and missions"
                actions={(
                    <div className="flex items-center gap-2">
                        <StatusBadge tone="warning">{inProgressCount} tracked</StatusBadge>
                        <StatusBadge tone="success">{completedCount} resolved</StatusBadge>
                    </div>
                )}
            />
            <div className="flex min-h-0 flex-1 overflow-hidden bg-slate-100 text-slate-800 font-sans select-none">
                {/* Sidebar Navigation */}
                <AppSidebar className="w-[22%] min-w-44 max-w-56 bg-slate-900 text-slate-200 p-4 flex flex-col justify-between shrink-0" label="Activity categories">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                                <Award size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-white leading-tight">Master Tracker</div>
                                <div className="text-[9px] text-purple-400 font-mono tracking-wider">MISSIONS JSON ENGINE</div>
                            </div>
                        </div>

                        {/* Progress Meter */}
                        <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700/50">
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-slate-300">Completion</span>
                                <span className="text-emerald-400 font-mono">{completionPercentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                <span>{inProgressCount} tracked</span>
                                <span>{completedCount}/{activities.length} resolved</span>
                            </div>
                        </div>

                        {/* Category Selector Tabs */}
                        <nav className="space-y-1">
                            {categories.map((cat) => {
                                const IconComp = cat.icon;
                                const isActive = activeTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveTab(cat.id);
                                            setStatusFilter('ALL');
                                            setSearchQuery('');
                                        }}
                                        className={`flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${isActive
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <IconComp size={16} className={isActive ? 'text-white' : cat.color} />
                                            <span>{cat.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                            {cat.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl text-[10px] text-slate-400 space-y-1 font-mono">
                        <div className="flex justify-between"><span>Level: <strong className="text-white">{player?.level || 1}</strong></span><span>XP: <strong className="text-purple-400">{player?.xp || 0}</strong></span></div>
                        <div className="flex justify-between"><span>Credits: <strong className="text-emerald-400">{player?.credits || 0} ₡</strong></span></div>
                    </div>
                </AppSidebar>

                {/* Middle List View */}
                <AppPane className="w-[31%] min-w-60 max-w-72 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 uppercase tracking-wider">
                        {activeTab} Index ({filteredActivities.length})
                    </div>
                    <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
                        <SearchField
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search operations..."
                            label="Search activities"
                        />
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:border-violet-400"
                        >
                            <option value="ALL">All states</option>
                            <option value="IN_PROGRESS">Tracked</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="LOCKED">Locked</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {filteredActivities.map((act) => {
                            const isSelected = selectedActivity?.id === act.id;
                            const isDone = act.status === 'COMPLETED';
                            return (
                                <button
                                    key={act.id}
                                    onClick={() => setSelectedActivityId(act.id)}
                                    className={`w-full text-left p-4 transition cursor-pointer flex flex-col space-y-1.5 ${isSelected ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                                        <span className="text-violet-600 uppercase">{act.category}</span>
                                        <StatusBadge tone={STATUS_TONES[act.status] ?? 'neutral'}>{act.status.replace('_', ' ')}</StatusBadge>
                                    </div>
                                    <div className="font-bold text-xs text-slate-900 leading-snug">{act.title}</div>
                                    <div className="text-[10px] text-slate-500 font-mono truncate">{act.subtitle || act.giver}</div>
                                </button>
                            );
                        })}
                        {filteredActivities.length === 0 && (
                            <EmptyState icon={Search} title="No matching activities" description="Adjust the category, state, or search filter." />
                        )}
                    </div>
                </AppPane>

                {/* Right Detailed Inspect Panel */}
                {selectedActivity ? (
                    <main className="flex-1 bg-white p-6 overflow-y-auto space-y-6">
                        {/* Header */}
                        <div className="border-b border-slate-200 pb-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase rounded-full">
                                    {selectedActivity.category}
                                </span>
                                <StatusBadge tone={STATUS_TONES[selectedActivity.status] ?? 'neutral'} className="uppercase">
                                    {selectedActivity.status.replace('_', ' ')}
                                </StatusBadge>
                                {selectedActivity.fileTriggers?.map((f, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded flex items-center gap-1">
                                        <FileCode size={11} /> {f}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-xl font-bold text-slate-900">{selectedActivity.title}</h1>
                            <p className="text-xs text-slate-500 font-mono">{selectedActivity.subtitle}</p>
                        </div>

                        {/* Metadata Badges */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                                <User className="text-purple-600 shrink-0" size={18} />
                                <div>
                                    <div className="text-[9px] text-slate-400 uppercase">Assigned By</div>
                                    <div className="font-bold text-slate-800">{selectedActivity.giver || 'MIRAVERSE OS'}</div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                                <MapPin className="text-emerald-600 shrink-0" size={18} />
                                <div>
                                    <div className="text-[9px] text-slate-400 uppercase">Target Context / Location</div>
                                    <div className="font-bold text-slate-800">{selectedActivity.appContext || selectedActivity.location || 'Desktop'}</div>
                                </div>
                            </div>
                        </div>

                        {selectedActivity.prerequisite && (
                            <div className={`flex items-start gap-3 rounded-xl border p-3 text-xs ${isLocked ? 'border-slate-300 bg-slate-100 text-slate-600' : 'border-blue-100 bg-blue-50 text-blue-800'}`}>
                                {isLocked ? <Lock size={16} className="mt-0.5 shrink-0" /> : <CircleDot size={16} className="mt-0.5 shrink-0" />}
                                <div><strong>Prerequisite:</strong> {selectedActivity.prerequisite}</div>
                            </div>
                        )}

                        {/* Lore Background */}
                        {selectedActivity.loreBackground && (
                            <div className="p-4 border border-purple-100 bg-purple-50/50 rounded-2xl space-y-1.5">
                                <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Lore Background</h3>
                                <p className="text-xs text-purple-900 leading-relaxed font-serif">
                                    {selectedActivity.loreBackground}
                                </p>
                            </div>
                        )}

                        {/* Steps Checklist */}
                        {selectedActivity.steps && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Objective Checklist</h3>
                                <div className="space-y-2">
                                    {selectedActivity.steps.map((step, i) => (
                                        <div key={i} className="p-3 border border-slate-200 rounded-xl flex items-center gap-3 bg-slate-50 text-xs">
                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step.done || selectedActivity.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {step.done || selectedActivity.status === 'COMPLETED' ? <Check size={12} /> : i + 1}
                                            </div>
                                            <span className={step.done || selectedActivity.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                                                {step.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dialogue Hooks */}
                        {selectedActivity.dialogueHooks && (
                            <div className="p-4 border border-slate-200 bg-slate-900 text-slate-200 rounded-2xl space-y-2 font-mono text-xs">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                    <MessageSquare size={14} /> Transmission Relay Log
                                </div>
                                <div className="text-slate-300 italic">
                                    "{selectedActivity.dialogueHooks.briefing || selectedActivity.dialogueHooks.completion}"
                                </div>
                            </div>
                        )}

                        {/* Rewards & Claim Button */}
                        <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-start gap-2">
                                <Gift size={18} className="mt-0.5 text-violet-600 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-mono">Completion Rewards</div>
                                    <div className="text-sm font-bold text-slate-900 font-mono">
                                        +{rewardXP} XP • +{rewardCredits} ₡
                                        {selectedActivity.rewards?.item && <span className="ml-1 text-violet-600">• {selectedActivity.rewards.item}</span>}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePrimaryAction}
                                disabled={isLocked || isCompleted}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${isCompleted
                                    ? 'bg-emerald-600 text-white opacity-90'
                                    : isLocked
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : isAvailable
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                                            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                                    }`}
                            >
                                {isCompleted ? <Check size={16} /> : isLocked ? <Lock size={16} /> : <Play size={16} />}
                                <span>{isCompleted ? 'Completed & Claimed' : isLocked ? 'Prerequisite Required' : isAvailable ? 'Accept & Track' : 'Complete & Claim'}</span>
                            </button>
                        </div>
                    </main>
                ) : (
                    <main className="flex-1 bg-white flex items-center justify-center p-8 text-center">
                        <EmptyState icon={Search} title="No operation selected" description="Adjust the category, state, or search filter to restore this node." />
                    </main>
                )}
            </div>
        </AppShell>
    );
}
