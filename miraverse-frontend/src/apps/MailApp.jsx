import React, { useState, useMemo } from 'react';
import {
    Mail, Inbox, Star, Archive, Send, Paperclip, CheckCircle2,
    Shield, Activity, Lock, ArrowRight, Sparkles, ExternalLink, FileText
} from 'lucide-react';
import { useCommsStore } from '../store/useCommsStore';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import {
    AppShell, AppToolbar, AppSidebar, AppPane, EmptyState, SearchField, StatusBadge
} from '../components/ui/app-shell';
import DocumentModal from '../components/DocumentModal';
import { MOCK_DOCUMENTS } from '../data/mockDocuments';
import { useToastStore } from '../store/useToastStore';

export default function MailApp() {
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [activeFaction, setActiveFaction] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedMailId, setSelectedMailId] = useState('MSG-000');
    const [starredIds, setStarredIds] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState(null);
    const [openDocModal, setOpenDocModal] = useState(null);

    const emails = useCommsStore((s) => s.emails);
    const claimedComms = useOSStore((s) => s.gameplay.claimedComms);
    const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
    const toggleApp = useOSStore((s) => s.toggleApp);
    const pushToast = useToastStore((s) => s.pushToast);

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
            if (activeFolder === 'official' && !/DGA|Governance|Faith|Cyacademy|Bureau|Housing|Finance|Safety|Mobile|Integration|Pulse/i.test(mail.sender)) return false;

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

    const getMailAttachments = (mail) => {
        if (!mail) return [];
        if (mail.attachments && Array.isArray(mail.attachments)) return mail.attachments;
        if (mail.attachment) return [mail.attachment];
        return [];
    };

    const currentAttachments = getMailAttachments(selectedMail);

    const handleClaimAttachmentItem = (attId, amount) => {
        const claimId = `${selectedMail.id}_${attId || 'default'}`;
        if (claimedComms.includes(claimId)) return;
        claimCommsAttachment(claimId, amount || 100, 50);
        pushToast({
            title: 'Attachment claimed',
            message: `Added ${amount || 100} ₡ and 50 XP.`,
            tone: 'success',
        });
    };

    const handleOpenDocumentAttachment = (att) => {
        const mockKey = att.mockKey || 'dga-registration';
        const docDef = MOCK_DOCUMENTS[mockKey] || {
            id: att.id || 'doc',
            filename: att.name,
            name: att.name,
            extension: att.name.endsWith('.osform') ? '.osform' : '.pdf',
            category: 'Municipal Document',
            meta: { classification: 'MUNICIPAL DISPATCH', author: selectedMail?.sender || 'Civic Bureau', timestamp: selectedMail?.time || 'TODAY', fileSize: '4.0 KB' },
            security: { isEncrypted: false },
            content: { title: att.previewTitle || att.name, subtitle: att.previewText || 'Municipal Attachment Document', bodyText: selectedMail?.body || 'Official Municipal Document' }
        };
        setOpenDocModal(docDef);
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
        pushToast({ title: 'Reply sent', message: selectedMail?.subject, tone: 'success' });
        setReplyText('');
        setTimeout(() => setReplyStatus(null), 3000);
    };

    return (
        <AppShell>
            <AppToolbar
                icon={Mail}
                title="AureMail Mailbox"
                subtitle="Personal Citizen Inbox & Municipal Dispatches"
                actions={(
                    <>
                        <SearchField
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search dispatches..."
                            label="Search dispatches and notices"
                            className="w-52"
                        />
                        <StatusBadge tone="info">{emails.length} messages</StatusBadge>
                    </>
                )}
            />

            {/* ── MAIN MAILBOX LAYOUT (3 PANES) ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* PANE 1: LEFT FOLDERS & NAVIGATION */}
                <AppSidebar className="w-[22%] min-w-44 max-w-52 shrink-0 p-3 space-y-4" label="Mailbox folders and factions">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#17213f] to-[#3a497b] py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition">
                        <Sparkles size={14} className="text-purple-300" /> New Dispatch
                    </button>

                    <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 mb-1.5 px-2">
                            Mailbox Folders
                        </div>
                        {[
                            { id: 'inbox', label: 'Inbox', icon: Inbox, count: emails.length },
                            { id: 'starred', label: 'Starred', icon: Star, count: starredIds.length },
                            { id: 'official', label: 'Official Dispatches', icon: Shield, count: emails.filter((m) => /DGA|Faith|Cyacademy|Bureau|Housing|Finance/i.test(m.sender)).length },
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

                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 px-2">
                            Factions
                        </div>
                        <div className="flex flex-wrap gap-1 px-1">
                            {['all', 'dga', 'faith', 'cyacademy', 'civic'].map((fac) => (
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
                </AppSidebar>

                {/* PANE 2: CENTER EMAIL FEED LIST */}
                <AppPane className="w-[32%] min-w-60 max-w-80 shrink-0 border-r border-slate-300/70 bg-white/40 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] font-semibold text-slate-500 bg-white/60">
                        <span>{activeFolder.toUpperCase()}</span>
                        <span>{filteredEmails.length} messages</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {filteredEmails.map((mail) => {
                            const isSelected = selectedMailId === mail.id;
                            const isStarred = starredIds.includes(mail.id);
                            const atts = getMailAttachments(mail);

                            return (
                                <div
                                    key={mail.id}
                                    onClick={() => setSelectedMailId(mail.id)}
                                    className={`group relative cursor-pointer rounded-xl border p-3 transition shadow-xs ${isSelected
                                        ? 'border-[#8c97d6] bg-[#eef0fb] shadow-sm'
                                        : 'border-slate-200/80 bg-white/90 hover:bg-[#f7f7fd]'
                                        }`}
                                >
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

                                    <div className="mt-1 truncate text-xs font-medium text-[#243064]">
                                        {mail.subject}
                                    </div>

                                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-snug">
                                        {mail.body}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-medium">
                                            {mail.faction || 'Official Dispatch'}
                                        </span>
                                        {atts.length > 0 && (
                                            <span className="flex items-center gap-1 text-[#5f6ab0] font-semibold">
                                                <Paperclip size={11} /> {atts.length} {atts.length === 1 ? 'Attachment' : 'Attachments'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!filteredEmails.length && (
                            <EmptyState icon={Inbox} title="No dispatches found" description="Try another folder, faction, or search term." />
                        )}
                    </div>
                </AppPane>

                {/* PANE 3: RIGHT DISPATCH READER */}
                <main className="flex min-w-0 flex-1 flex-col bg-[#FAFAFC] overflow-y-auto p-6">
                    {selectedMail ? (
                        <div className="flex h-full flex-col space-y-4">
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

                                <div className="text-xs leading-relaxed text-[#243064] whitespace-pre-line font-serif bg-[#FAF9FF] p-4 rounded-xl border border-purple-200/50">
                                    {selectedMail.body}
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {currentAttachments.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                                        <Paperclip size={14} className="text-[#5f6ab0]" />
                                        <span>Attached Municipal Enclosures ({currentAttachments.length})</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {currentAttachments.map((att, idx) => {
                                            const attId = att.id || `att-${idx}`;
                                            const claimId = `${selectedMail.id}_${attId}`;
                                            const isClaimed = claimedComms.includes(claimId);

                                            return (
                                                <div key={attId} className="rounded-xl border border-slate-300/80 bg-white p-3.5 shadow-sm flex items-center justify-between">
                                                    <div
                                                        onClick={() => handleOpenDocumentAttachment(att)}
                                                        className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition"
                                                    >
                                                        <div className="rounded-lg bg-[#eef0fb] p-2.5 text-[#5f6ab0]">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-[#1d2650] flex items-center gap-2">
                                                                {att.name}
                                                                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                                    Inspect Form
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                                {att.previewTitle || att.previewText || 'Municipal Attachment Document'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => handleOpenDocumentAttachment(att)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-xs font-bold text-[#5f6ab0] border border-slate-200 flex items-center gap-1"
                                                        >
                                                            Open <ExternalLink size={12} />
                                                        </Button>

                                                        <Button
                                                            onClick={() => handleClaimAttachmentItem(attId, att.amount || 100)}
                                                            disabled={isClaimed}
                                                            size="sm"
                                                            variant={isClaimed ? 'ghost' : 'solid'}
                                                            className="font-bold text-xs px-3 py-1.5"
                                                        >
                                                            {isClaimed ? (
                                                                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                                                    <CheckCircle2 size={13} /> Claimed (+₡{att.amount || 100})
                                                                </span>
                                                            ) : (
                                                                `Claim (+₡${att.amount || 100})`
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                        <EmptyState icon={Mail} title="No dispatch selected" description="Select a dispatch from the message list to read it." />
                    )}
                </main>
            </div>

            {/* Document Inspection Modal */}
            {openDocModal && (
                <DocumentModal file={openDocModal} onClose={() => setOpenDocModal(null)} />
            )}
        </AppShell>
    );
}
