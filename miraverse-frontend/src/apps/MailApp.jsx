import React, { useState, useMemo } from 'react';
import {
    Mail, Inbox, Star, Archive, Trash2, Send, Search, Paperclip, CheckCircle2,
    Shield, Activity, Building, Lock, ArrowRight, Sparkles, AlertCircle, FileText, ExternalLink
} from 'lucide-react';
import { useCommsStore } from '../store/useCommsStore';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

export default function MailApp() {
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [activeFaction, setActiveFaction] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedMailId, setSelectedMailId] = useState('MSG-000');
    const [starredIds, setStarredIds] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState(null);

    const emails = useCommsStore((s) => s.emails);
    const claimedComms = useOSStore((s) => s.gameplay.claimedComms);
    const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
    const toggleApp = useOSStore((s) => s.toggleApp);
    const dgaVerified = useOSStore((s) => s.gameplay.player.dgaVerified);

    const toggleStar = (id, e) => {
        e?.stopPropagation();
        setStarredIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const filteredEmails = useMemo(() => {
        return emails.filter((mail) => {
            // Folder filter
            if (activeFolder === 'starred' && !starredIds.includes(mail.id)) return false;
            if (activeFolder === 'official' && !/DGA|Governance|Faith|Cyacademy|Bureau/i.test(mail.sender)) return false;

            // Faction filter
            if (activeFaction !== 'all') {
                const fac = (mail.faction || '').toLowerCase();
                if (!fac.includes(activeFaction.toLowerCase())) return false;
            }

            // Search filter
            if (search.trim()) {
                const q = search.toLowerCase();
                return (
                    mail.subject.toLowerCase().includes(q) ||
                    mail.sender.toLowerCase().includes(q) ||
                    mail.body.toLowerCase().includes(q)
                );
            }

            return true;
        });
    }, [emails, activeFolder, activeFaction, search, starredIds]);

    const selectedMail = emails.find((m) => m.id === selectedMailId) || emails[0];
    const isAttachmentClaimed = selectedMail?.attachment && claimedComms.includes(selectedMail.id);

    const handleClaimAttachment = () => {
        if (!selectedMail?.attachment || isAttachmentClaimed) return;
        claimCommsAttachment(selectedMail.id, selectedMail.attachment.amount, 50);
    };

    const handleActionClick = (actionType) => {
        if (actionType === 'dga_verification' || selectedMail?.id === 'MSG-000') {
            const passportApp = APPS.find((a) => a.id === 'passport');
            if (passportApp) toggleApp(passportApp);
        } else if (actionType === 'faith_intake' || selectedMail?.id === 'MSG-005') {
            const browserApp = APPS.find((a) => a.id === 'browser');
            if (browserApp) {
                useOSStore.getState().setBrowserUrl('https://faithmed.aure');
                toggleApp(browserApp);
            }
        }
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setReplyStatus('Reply sent to dispatch channel.');
        setReplyText('');
        setTimeout(() => setReplyStatus(null), 3000);
    };

    return (
        <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241] font-sans select-none overflow-hidden">
            {/* ── TOP MAILBOX CONTROL BAR ── */}
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-300/80 bg-white/80 px-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8c97d6] to-[#5f6ab0] text-white shadow-sm">
                        <Mail size={16} />
                    </div>
                    <div>
                        <h1 className="text-xs font-bold text-[#1d2650] font-serif tracking-wide">
                            AURELINE CIVIC MAILBOX
                        </h1>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            OFFICIAL DISPATCH & INTAKE PORTAL
                        </span>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-slate-300/80 bg-white/90 px-3 py-1 text-xs shadow-inner">
                        <Search size={13} className="mr-2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search dispatches & notices..."
                            className="w-48 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-800">
                        {emails.length} Messages
                    </span>
                </div>
            </header>

            {/* ── MAIN MAILBOX LAYOUT (3 PANES) ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* PANE 1: LEFT FOLDERS & NAVIGATION */}
                <aside className="w-52 shrink-0 border-r border-slate-300/70 bg-white/60 p-3 space-y-4">
                    {/* New Dispatch Badge */}
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17213f] to-[#3a497b] py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition">
                        <Sparkles size={14} className="text-purple-300" /> New Dispatch
                    </button>

                    {/* Mailbox Folders */}
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 mb-1.5 px-2">
                            Mailbox Folders
                        </div>
                        {[
                            { id: 'inbox', label: 'Inbox', icon: Inbox, count: emails.length },
                            { id: 'starred', label: 'Starred', icon: Star, count: starredIds.length },
                            { id: 'official', label: 'Official Dispatches', icon: Shield, count: emails.filter((m) => /DGA|Faith|Cyacademy/i.test(m.sender)).length },
                            { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
                        ].map((f) => {
                            const IconComp = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFolder(f.id)}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${activeFolder === f.id
                                            ? 'bg-[#e9ebf6] font-bold text-[#1d2650] shadow-sm'
                                            : 'text-slate-600 hover:bg-[#f2f3fb]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <IconComp size={14} className={activeFolder === f.id ? 'text-[#5f6ab0]' : 'text-slate-400'} />
                                        <span>{f.label}</span>
                                    </div>
                                    {f.count > 0 && (
                                        <span className={`text-[10px] font-mono rounded px-1.5 py-0.2 ${activeFolder === f.id ? 'bg-[#5f6ab0] text-white' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {f.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Faction Filter Pills */}
                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 px-2">
                            Factions
                        </div>
                        <div className="flex flex-wrap gap-1 px-1">
                            {['all', 'dga', 'faith', 'cyacademy', 'netrunners'].map((fac) => (
                                <button
                                    key={fac}
                                    onClick={() => setActiveFaction(fac)}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize transition ${activeFaction === fac
                                            ? 'bg-[#17213f] text-white'
                                            : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                                        }`}
                                >
                                    {fac}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* PANE 2: CENTER EMAIL FEED LIST */}
                <div className="w-80 shrink-0 border-r border-slate-300/70 bg-white/40 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] font-semibold text-slate-500 bg-white/60">
                        <span>{activeFolder.toUpperCase()}</span>
                        <span>{filteredEmails.length} messages</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {filteredEmails.map((mail) => {
                            const isSelected = selectedMailId === mail.id;
                            const isStarred = starredIds.includes(mail.id);

                            return (
                                <div
                                    key={mail.id}
                                    onClick={() => setSelectedMailId(mail.id)}
                                    className={`group relative cursor-pointer rounded-xl border p-3 transition shadow-xs ${isSelected
                                            ? 'border-[#8c97d6] bg-[#eef0fb] shadow-sm'
                                            : 'border-slate-200/80 bg-white/90 hover:bg-[#f7f7fd]'
                                        }`}
                                >
                                    {/* Top Sender Row */}
                                    <div className="flex items-center justify-between">
                                        <span className="truncate text-xs font-bold text-[#1f2954]">
                                            {mail.sender}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-400 font-mono">{mail.time}</span>
                                            <button
                                                onClick={(e) => toggleStar(mail.id, e)}
                                                className="text-slate-300 hover:text-amber-400 transition ml-1"
                                            >
                                                <Star size={13} className={isStarred ? 'fill-amber-400 text-amber-400' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subject Line */}
                                    <div className="mt-1 truncate text-xs font-medium text-[#243064]">
                                        {mail.subject}
                                    </div>

                                    {/* Body Snippet */}
                                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-snug">
                                        {mail.body}
                                    </p>

                                    {/* Badges */}
                                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-medium">
                                            {mail.faction || 'Official Dispatch'}
                                        </span>
                                        {mail.attachment && (
                                            <span className="flex items-center gap-1 text-[#5f6ab0] font-semibold">
                                                <Paperclip size={11} /> Attachment
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!filteredEmails.length && (
                            <div className="p-8 text-center text-xs text-slate-500 italic">
                                No dispatches found in this folder.
                            </div>
                        )}
                    </div>
                </div>

                {/* PANE 3: RIGHT DISPATCH READER */}
                <main className="flex min-w-0 flex-1 flex-col bg-[#FAFAFC] overflow-y-auto p-6">
                    {selectedMail ? (
                        <div className="flex h-full flex-col space-y-4">
                            {/* Header Box */}
                            <div className="rounded-2xl border border-slate-300/80 bg-white p-5 shadow-sm space-y-3">
                                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                                    <div>
                                        <h2 className="text-base font-bold text-[#1c2650] font-serif">
                                            {selectedMail.subject}
                                        </h2>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono">
                                            <span className="font-bold text-[#1d2650]">{selectedMail.sender}</span>
                                            <span>•</span>
                                            <span>{selectedMail.time}</span>
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-purple-100 border border-purple-300 px-3 py-1 font-mono text-[10px] font-bold text-purple-800 flex items-center gap-1">
                                        <Shield size={12} /> {selectedMail.faction || 'Encrypted Dispatch'}
                                    </span>
                                </div>

                                {/* Body Content Box */}
                                <div className="text-xs leading-relaxed text-[#243064] whitespace-pre-line font-serif  bg-[#FAF9FF] p-4 rounded-xl border border-purple-200/50">
                                    {selectedMail.body}
                                </div>
                            </div>

                            {/* Special Interactive Action Card (e.g. DGA Identity Verification or Faith Medical Intake) */}
                            {(selectedMail.id === 'MSG-000' || selectedMail.id === 'MSG-005') && (
                                <div className="rounded-2xl border border-amber-300/90 bg-gradient-to-r from-amber-500/10 via-purple-950/5 to-purple-950/10 p-5 shadow-md space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
                                            {selectedMail.id === 'MSG-000' ? <Lock size={20} /> : <Activity size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-[#1d2650] font-serif uppercase tracking-wider">
                                                {selectedMail.id === 'MSG-000'
                                                    ? '⚡ DGA Provisional Identity Verification Portal'
                                                    : '🏥 Faith Medical Baseline Diagnostic Scan'}
                                            </h3>
                                            <p className="text-[11px] text-slate-600">
                                                {selectedMail.id === 'MSG-000'
                                                    ? 'Complete your biometric identity setup in the Citizen Record app to unlock full OS features.'
                                                    : 'Schedule your mandatory aura baseline scan on the Faith Medical Portal.'}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleActionClick(selectedMail.id === 'MSG-000' ? 'dga_verification' : 'faith_intake')}
                                        size="sm"
                                        variant="solid"
                                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-black font-bold text-xs shadow-md flex items-center justify-center gap-2 rounded-xl"
                                    >
                                        <span>
                                            {selectedMail.id === 'MSG-000'
                                                ? 'Open Citizen Record App & Scan Biometrics >'
                                                : 'Launch Faith Medical Portal in Net Browser >'}
                                        </span>
                                        <ArrowRight size={14} />
                                    </Button>
                                </div>
                            )}

                            {/* Attachment Box */}
                            {selectedMail.attachment && (
                                <div className="rounded-2xl border border-slate-300/80 bg-white p-4 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-[#eef0fb] flex items-center justify-center text-[#5f6ab0]">
                                            <Paperclip size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#1d2650] flex items-center gap-2">
                                                {selectedMail.attachment.name}
                                                <span className="text-[10px] font-mono text-slate-400">PDF Document</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                {selectedMail.attachment.previewTitle || 'Official Document Attachment'}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleClaimAttachment}
                                        disabled={isAttachmentClaimed}
                                        size="sm"
                                        variant={isAttachmentClaimed ? 'ghost' : 'solid'}
                                        className="font-bold text-xs px-4 py-2"
                                    >
                                        {isAttachmentClaimed ? (
                                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                                <CheckCircle2 size={14} /> Claimed (+₡{selectedMail.attachment.amount})
                                            </span>
                                        ) : (
                                            `Claim Attachment (+₡${selectedMail.attachment.amount})`
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Reply Form Box */}
                            <div className="mt-auto pt-2 border-t border-slate-200">
                                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                                    <Input
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a formal reply to this dispatch..."
                                        className="flex-1 bg-white border-slate-300 text-xs text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5"
                                    />
                                    <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1.5 px-4 py-2.5">
                                        <Send size={13} /> Send Reply
                                    </Button>
                                </form>
                                {replyStatus && (
                                    <p className="mt-1 text-[10px] text-emerald-600 font-mono">{replyStatus}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-slate-400">
                            <Mail size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-medium">Select a dispatch from the left column to read.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
