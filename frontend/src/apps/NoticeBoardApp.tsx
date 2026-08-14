import React, { useEffect, useMemo, useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useGameStore } from '../store/useGameStore';
import {
    Compass, Zap, Scroll, Briefcase, Sparkles, Award, Lock, Play, Globe,
    Check, MessageSquare, MapPin, User, FileCode, Search, CircleDot, Gift,
    CheckCircle2, ArrowRight, Shield, Activity, Calendar
} from 'lucide-react';
import {
    AppShell, AppToolbar, AppSidebar, AppPane, EmptyState, SearchField, StatusBadge
} from '../components/ui/app-shell';
import { useToastStore } from '../store/useToastStore';

const CATEGORY_DEFINITIONS = [
    { id: 'All', label: 'All Operations', icon: Globe, color: 'text-secondary' },
    { id: 'Journey', label: 'Journeys', icon: Compass, color: 'text-purple' },
    { id: 'Adventures', label: 'Adventures', icon: Sparkles, color: 'text-success' },
    { id: 'Quests', label: 'Quests', icon: Scroll, color: 'text-primary' },
    { id: 'Tasks', label: 'Tasks', icon: Zap, color: 'text-warning' },
    { id: 'Missions', label: 'City Missions', icon: Briefcase, color: 'text-danger' },
];

const STATUS_TONES = {
    LOCKED: 'secondary',
    AVAILABLE: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
};

export default function NoticeBoardApp() {
    const [activeTab, setActiveTab] = useState('Journey');
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

    const updateReputationTrack = useOSStore((s) => s.updateReputationTrack);
    const addSkillXP = useOSStore((s) => s.addSkillXP);

    const handlePrimaryAction = () => {
        if (!selectedActivity || isLocked || isCompleted) return;
        if (isAvailable) {
            updateActivityStatus(selectedActivity.id, 'IN_PROGRESS');
            pushToast({ title: 'Activity tracked', message: selectedActivity.title, tone: 'info' });
            return;
        }
        completeActivity(selectedActivity.id);

        if (selectedActivity.rewards?.repBonus) {
            updateReputationTrack(selectedActivity.rewards.repBonus.track, selectedActivity.rewards.repBonus.amount);
        }
        if (selectedActivity.rewards?.skillXP) {
            addSkillXP(selectedActivity.rewards.skillXP.skill, selectedActivity.rewards.skillXP.amount);
        }

        // Sync with central useGameStore & Python world tick
        useGameStore.getState().completeMission(selectedActivity.id);
        useGameStore.getState().requestTick();

        pushToast({
            title: 'Rewards claimed',
            message: `+${rewardXP} XP, +${rewardCredits} ₡${selectedActivity.rewards?.item ? `, ${selectedActivity.rewards.item}` : ''}`,
            tone: 'success',
        });
    };

    return (
        <AppShell>
            <AppToolbar
                icon={Award}
                title="Municipal & Student Notice Board"
                subtitle="Journeys, Adventures, Quests, Tasks & Career Shifts"
                actions={(
                    <div className="d-flex items-center gap-2">
                        <span className="badge bg-warning text-dark font-mono px-2.5 py-1">
                            {inProgressCount} Tracked
                        </span>
                        <span className="badge bg-success text-white font-mono px-2.5 py-1">
                            {completedCount} Completed
                        </span>
                    </div>
                )}
            />

            {/* Bootstrap Main Container */}
            <div className="container-fluid p-0 flex-1 min-h-0 d-flex overflow-hidden bg-light select-none">
                
                {/* ── LEFT BOOTSTRAP NAVIGATION SIDEBAR ── */}
                <div className="col-12 col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between shrink-0 border-end border-secondary">
                    <div className="space-y-4">
                        {/* Notice Board Header Branding */}
                        <div className="d-flex items-center gap-2.5 p-2 bg-secondary bg-opacity-20 rounded-3">
                            <div className="p-2 bg-primary rounded-3 text-white shadow-sm">
                                <Award size={20} />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0 text-white font-serif">Civic Notice Board</h6>
                                <small className="text-muted font-mono" style={{ fontSize: '9px' }}>AURELINE DISPATCH BOARD</small>
                            </div>
                        </div>

                        {/* Progress Meter Box */}
                        <div className="card bg-secondary bg-opacity-20 border-secondary border-opacity-30 p-3 text-white">
                            <div className="d-flex justify-content-between text-xs font-mono fw-bold mb-1">
                                <span>Board Clearance</span>
                                <span className="text-success">{completionPercentage}%</span>
                            </div>
                            <div className="progress mb-2" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-gradient bg-primary"
                                    role="progressbar"
                                    style={{ width: `${completionPercentage}%` }}
                                    aria-valuenow={completionPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                />
                            </div>
                            <div className="d-flex justify-content-between text-muted font-mono" style={{ fontSize: '10px' }}>
                                <span>{inProgressCount} active</span>
                                <span>{completedCount}/{activities.length} done</span>
                            </div>
                        </div>

                        {/* Bootstrap Nav Pills Categories */}
                        <div className="nav nav-pills flex-column gap-1">
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
                                        className={`nav-link d-flex justify-content-between align-items-center text-start text-xs fw-bold px-3 py-2.5 rounded-3 transition ${
                                            isActive
                                                ? 'active bg-primary text-white shadow-sm'
                                                : 'text-white-50 hover:bg-secondary hover:bg-opacity-30'
                                        }`}
                                    >
                                        <div className="d-flex items-center gap-2">
                                            <IconComp size={15} className={isActive ? 'text-white' : ''} />
                                            <span>{cat.label}</span>
                                        </div>
                                        <span className={`badge rounded-pill ${isActive ? 'bg-white text-primary' : 'bg-secondary'}`}>
                                            {cat.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Vitals Summary Footer */}
                    <div className="p-3 bg-secondary bg-opacity-20 rounded-3 text-white-50 font-mono text-xs space-y-1 mt-4">
                        <div className="d-flex justify-content-between"><span>Citizen Level:</span> <strong className="text-white">{player?.level || 1}</strong></div>
                        <div className="d-flex justify-content-between"><span>Credits:</span> <strong className="text-success">{player?.credits || 0} ₡</strong></div>
                    </div>
                </div>

                {/* ── CENTER LIST INDEX ── */}
                <div className="col-12 col-md-4 col-lg-3 bg-white border-end border-slate-200 d-flex flex-column shrink-0 overflow-hidden">
                    <div className="p-3 bg-light border-bottom font-bold text-xs text-uppercase tracking-wider text-muted">
                        {activeTab} Index ({filteredActivities.length})
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="p-3 border-bottom bg-white space-y-2">
                        <SearchField
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search operations..."
                            label="Search activities"
                        />
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="form-select form-select-sm text-xs font-mono fw-bold"
                        >
                            <option value="ALL">All States</option>
                            <option value="IN_PROGRESS">Tracked</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="LOCKED">Locked</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Activity List Group */}
                    <div className="list-group list-group-flush flex-1 overflow-y-auto">
                        {filteredActivities.map((act) => {
                            const isSelected = selectedActivity?.id === act.id;
                            return (
                                <button
                                    key={act.id}
                                    onClick={() => setSelectedActivityId(act.id)}
                                    className={`list-group-item list-group-item-action p-3 transition border-start border-4 ${
                                        isSelected ? 'border-primary bg-primary bg-opacity-10 fw-bold' : 'border-transparent'
                                    }`}
                                >
                                    <div className="d-flex justify-content-between align-items-center text-xs font-mono mb-1">
                                        <span className="badge bg-purple-100 text-purple border">{act.category}</span>
                                        <span className={`badge bg-${STATUS_TONES[act.status] || 'secondary'}`}>
                                            {act.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-dark">{act.title}</div>
                                    <div className="text-muted text-xs truncate mt-0.5">{act.subtitle || act.giver}</div>
                                </button>
                            );
                        })}

                        {filteredActivities.length === 0 && (
                            <EmptyState icon={Search} title="No matching activities" description="Adjust category or filter options." />
                        )}
                    </div>
                </div>

                {/* ── RIGHT DETAIL INSPECT PANEL ── */}
                {selectedActivity ? (
                    <main className="col-12 col-md-5 col-lg-7 bg-white p-4 overflow-y-auto space-y-4 flex-1">
                        
                        {/* Notice Card Header */}
                        <div className="card shadow-sm border-0 bg-gradient-to-r from-slate-50 to-purple-50 p-4 rounded-3 space-y-2">
                            <div className="d-flex items-center gap-2">
                                <span className="badge bg-primary text-white uppercase font-mono px-2.5 py-1">
                                    {selectedActivity.category}
                                </span>
                                <span className={`badge bg-${STATUS_TONES[selectedActivity.status] || 'secondary'} uppercase font-mono px-2.5 py-1`}>
                                    {selectedActivity.status.replace('_', ' ')}
                                </span>
                                {selectedActivity.fileTriggers?.map((f, i) => (
                                    <span key={i} className="badge bg-light text-dark border font-mono">
                                        <FileCode size={11} className="me-1" /> {f}
                                    </span>
                                ))}
                            </div>
                            <h4 className="fw-bold text-dark font-serif mb-0">{selectedActivity.title}</h4>
                            <p className="text-muted text-xs font-mono mb-0">{selectedActivity.subtitle}</p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="row g-3 text-xs font-mono">
                            <div className="col-md-6">
                                <div className="card border-0 bg-light p-3 rounded-3 d-flex flex-row items-center gap-3">
                                    <User className="text-primary shrink-0" size={20} />
                                    <div>
                                        <div className="text-muted uppercase text-[9px]">Assigned Authority</div>
                                        <div className="fw-bold text-dark">{selectedActivity.giver || 'Aureline Civic Bureau'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card border-0 bg-light p-3 rounded-3 d-flex flex-row items-center gap-3">
                                    <MapPin className="text-success shrink-0" size={20} />
                                    <div>
                                        <div className="text-muted uppercase text-[9px]">Target Context / Zone</div>
                                        <div className="fw-bold text-dark">{selectedActivity.appContext || selectedActivity.location || 'Municipal Core'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prerequisite Alert */}
                        {selectedActivity.prerequisite && (
                            <div className={`alert ${isLocked ? 'alert-secondary' : 'alert-info'} d-flex items-start gap-2 mb-0 text-xs rounded-3`}>
                                {isLocked ? <Lock size={16} className="mt-0.5 shrink-0" /> : <CircleDot size={16} className="mt-0.5 shrink-0" />}
                                <div><strong>Prerequisite Required:</strong> {selectedActivity.prerequisite}</div>
                            </div>
                        )}

                        {/* Lore Narrative Card */}
                        {selectedActivity.loreBackground && (
                            <div className="card border-purple-200 bg-purple-50/40 p-4 rounded-3 space-y-1">
                                <h6 className="fw-bold text-purple-950 uppercase text-xs tracking-wider mb-1">Lore & Tactical Context</h6>
                                <p className="text-purple-900 text-xs leading-relaxed font-serif mb-0">
                                    {selectedActivity.loreBackground}
                                </p>
                            </div>
                        )}

                        {/* Objective Checklist */}
                        {selectedActivity.steps && (
                            <div className="space-y-2">
                                <h6 className="fw-bold text-dark uppercase text-xs tracking-wider mb-2">Objective Checklist</h6>
                                <div className="list-group">
                                    {selectedActivity.steps.map((step, i) => (
                                        <div key={i} className="list-group-item d-flex items-center gap-3 text-xs bg-light border-0 mb-1 rounded-3">
                                            <div className={`rounded-circle d-flex items-center justify-center font-mono text-[10px] text-white ${
                                                step.done || selectedActivity.status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'
                                            }`} style={{ width: '22px', height: '22px' }}>
                                                {step.done || selectedActivity.status === 'COMPLETED' ? <Check size={13} /> : i + 1}
                                            </div>
                                            <span className={step.done || selectedActivity.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}>
                                                {step.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dialogue Transmission Hook */}
                        {selectedActivity.dialogueHooks && (
                            <div className="card bg-dark text-white p-3.5 rounded-3 font-mono text-xs space-y-1">
                                <div className="d-flex items-center gap-1.5 text-success fw-bold">
                                    <MessageSquare size={14} /> Transmission Relay Log
                                </div>
                                <div className="text-white-50 italic">
                                    "{selectedActivity.dialogueHooks.briefing || selectedActivity.dialogueHooks.completion}"
                                </div>
                            </div>
                        )}

                        {/* Rewards & Claim Footer Action Card */}
                        <div className="card bg-light border-0 p-4 rounded-3 d-flex flex-row justify-content-between align-items-center shadow-sm">
                            <div className="d-flex items-center gap-3">
                                <div className="p-2.5 bg-primary bg-opacity-10 text-primary rounded-3">
                                    <Gift size={22} />
                                </div>
                                <div>
                                    <div className="text-muted text-[10px] uppercase font-mono">Completion Rewards System</div>
                                    <div className="fw-bold text-dark font-mono text-xs d-flex flex-wrap items-center gap-1.5 mt-0.5">
                                        <span className="badge bg-purple-100 text-purple border">+{rewardXP} XP</span>
                                        <span className="badge bg-success bg-opacity-10 text-success border">+{rewardCredits} ₡</span>
                                        {selectedActivity.rewards?.item && (
                                            <span className="badge bg-primary text-white">🎁 {selectedActivity.rewards.item}</span>
                                        )}
                                        {selectedActivity.rewards?.repBonus && (
                                            <span className="badge bg-warning text-dark">🏆 +{selectedActivity.rewards.repBonus.amount}% {selectedActivity.rewards.repBonus.track} Rep</span>
                                        )}
                                        {selectedActivity.rewards?.skillXP && (
                                            <span className="badge bg-info text-dark">⚡ +{selectedActivity.rewards.skillXP.amount} {selectedActivity.rewards.skillXP.skill} XP</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePrimaryAction}
                                disabled={isLocked || isCompleted}
                                className={`btn btn-sm font-bold px-4 py-2 text-xs d-flex items-center gap-2 rounded-3 ${
                                    isCompleted
                                        ? 'btn-success text-white'
                                        : isLocked
                                            ? 'btn-secondary text-white disabled'
                                            : isAvailable
                                                ? 'btn-primary text-white shadow-sm'
                                                : 'btn-violet text-white shadow-sm'
                                }`}
                            >
                                {isCompleted ? <CheckCircle2 size={16} /> : isLocked ? <Lock size={16} /> : <Play size={16} />}
                                <span>{isCompleted ? 'Completed & Claimed' : isLocked ? 'Locked (Prerequisite)' : isAvailable ? 'Accept & Track' : 'Complete & Claim'}</span>
                            </button>
                        </div>
                    </main>
                ) : (
                    <main className="col-12 col-md-5 col-lg-7 bg-white d-flex items-center justify-center p-5 text-center">
                        <EmptyState icon={Search} title="No operation selected" description="Adjust category or filter options." />
                    </main>
                )}
            </div>
        </AppShell>
    );
}
