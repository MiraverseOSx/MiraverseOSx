import React, { useState, useMemo } from 'react';
import { Mail, Send, Paperclip, Search, FileText, Key, Stethoscope, Calendar, X, CheckCircle } from 'lucide-react';
import { useCommsStore } from '../store/useCommsStore';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

export default function MailApp() {
  const [folder, setFolder] = useState('inbox');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('MSG-001');
  const [draft, setDraft] = useState('');
  const [attachmentModal, setAttachmentModal] = useState(null);

  const storeEmails = useCommsStore((s) => s.emails);
  const addEmail = useCommsStore((s) => s.addEmail);
  const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
  const claimedComms = useOSStore((s) => s.gameplay.claimedComms);

  const emails = useMemo(() => {
    let list = storeEmails.filter((e) => e.folder ? e.folder === folder : (folder === 'inbox' || folder === 'alerts'));
    if (folder === 'alerts') {
      list = storeEmails.filter((e) => /alert|notice|security|orientation|setup|activation/i.test(e.subject));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.sender.toLowerCase().includes(q) ||
          (e.body && e.body.toLowerCase().includes(q))
      );
    }
    return list;
  }, [storeEmails, folder, search]);

  const selected = storeEmails.find((e) => e.id === selectedId) || emails[0] || null;
  const attachmentClaimed = selected?.attachment && claimedComms.includes(selected.id);

  const handleClaim = () => {
    if (!selected?.attachment || attachmentClaimed) return;
    claimCommsAttachment(selected.id, selected.attachment.amount, 50);
  };

  const sendMail = () => {
    if (!draft.trim()) return;
    const newMail = {
      id: `MSG-${Date.now()}`,
      sender: 'player@miraverse.os',
      faction: 'Player',
      subject: 'Re: ' + (selected?.subject || 'No Subject'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      attachment: null,
      body: draft,
      folder: 'sent',
    };
    addEmail(newMail);
    setDraft('');
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'key': return <Key size={16} className="text-amber-600" />;
      case 'medical': return <Stethoscope size={16} className="text-emerald-600" />;
      case 'schedule': return <Calendar size={16} className="text-indigo-600" />;
      default: return <FileText size={16} className="text-[#5f6ab0]" />;
    }
  };

  return (
    <section className="relative flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241]">
      {/* Top Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-slate-300/70 bg-white/70 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-bold text-xs tracking-wider text-[#1d2650]">
          <Mail size={15} className="text-[#5f6ab0]" />
          <span>CYACADEMY MAIL TERMINAL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs text-slate-600">
            <Search size={13} className="mr-2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mail archive..."
              className="w-48 bg-transparent text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar Folders */}
        <div className="w-44 shrink-0 border-r border-slate-300/70 bg-white/60 p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Mailbox</div>
          <div className="space-y-1">
            {[
              { id: 'inbox', label: 'Inbox', count: storeEmails.length },
              { id: 'alerts', label: 'System Alerts', count: storeEmails.filter((m) => /alert|notice/i.test(m.subject)).length },
              { id: 'sent', label: 'Sent Mail', count: storeEmails.filter((m) => m.folder === 'sent').length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setFolder(f.id); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  folder === f.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'text-slate-600 hover:bg-[#f2f3fb]'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] text-slate-400">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Email List */}
        <div className="w-80 shrink-0 border-r border-slate-300/70 bg-white/40 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] font-semibold text-slate-500">
            <span>{folder.toUpperCase()}</span>
            <span>{emails.length} items</span>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {emails.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition ${
                  selectedId === m.id
                    ? 'border-[#8c97d6] bg-[#eef0fb] shadow-sm'
                    : 'border-slate-200/80 bg-white/90 hover:bg-[#f7f7fd]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-semibold text-[#1f2954]">{m.subject}</p>
                  <span className="ml-2 shrink-0 text-[10px] text-slate-400">{m.time}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{m.sender}</span>
                  {m.attachment && <Paperclip size={12} className="text-[#5f6ab0]" />}
                </div>
              </button>
            ))}
            {!emails.length && (
              <div className="p-4 text-center text-xs text-slate-500">No messages in this folder</div>
            )}
          </div>
        </div>

        {/* Right Reader Pane */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#FAFAFC] p-4">
          {selected ? (
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b border-slate-300/70 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1c2650]">{selected.subject}</h2>
                    <div className="mt-1 text-xs text-slate-500">
                      From: <span className="font-semibold text-[#3b4785]">{selected.sender}</span> ({selected.faction}) · {selected.time}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="my-3 flex-1 overflow-auto whitespace-pre-line text-xs leading-relaxed text-[#243064] pr-2">
                {selected.body}
              </div>

              {/* Interactive Attachment Card */}
              {selected.attachment && (
                <div className="mb-3 rounded-lg border border-slate-300/80 bg-white/90 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setAttachmentModal(selected.attachment)}
                      className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition"
                    >
                      <div className="rounded-lg bg-[#eef0fb] p-2">
                        {getAttachmentIcon(selected.attachment.type)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1d2650] flex items-center gap-1.5">
                          {selected.attachment.name}
                          <span className="text-[10px] text-slate-400 font-mono">(Preview)</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {selected.attachment.previewTitle || 'Attachment Document'}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleClaim}
                      disabled={attachmentClaimed}
                      size="sm"
                      variant={attachmentClaimed ? 'ghost' : 'solid'}
                      className="text-xs font-semibold"
                    >
                      {attachmentClaimed ? (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={13} /> Claimed</span>
                      ) : (
                        `Claim +₡${selected.attachment.amount}`
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Reply */}
              <form onSubmit={(e) => { e.preventDefault(); sendMail(); }} className="flex items-center gap-2 pt-2 border-t border-slate-300/70">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a response…"
                  className="flex-1 bg-white border-slate-300/80 text-xs text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2"
                />
                <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1">
                  <Send size={13} /> Send
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              Select a message from the list to read
            </div>
          )}
        </div>
      </div>

      {/* Interactive Attachment Preview Modal */}
      {attachmentModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-300/90 bg-white p-5 shadow-2xl text-[#162241]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1d2650]">
                {getAttachmentIcon(attachmentModal.type)}
                <span>{attachmentModal.name}</span>
              </div>
              <button
                onClick={() => setAttachmentModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="my-4 space-y-2">
              <div className="text-xs font-semibold text-[#1f2954]">{attachmentModal.previewTitle}</div>
              <div className="rounded-lg border border-slate-200 bg-[#f7f8fd] p-3 font-mono text-[11px] leading-relaxed text-[#28335e] whitespace-pre-line">
                {attachmentModal.previewText}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
              <span className="text-slate-500">Reward: +₡{attachmentModal.amount}</span>
              {attachmentModal.type === 'dga_verification' ? (
                <Button
                  onClick={() => {
                    useOSStore.getState().verifyDGAIdentity();
                    handleClaim();
                    setAttachmentModal(null);
                  }}
                  size="sm"
                  variant="solid"
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  ⚡ Verify Identity & Unlock Civic Profile
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleClaim();
                    setAttachmentModal(null);
                  }}
                  disabled={attachmentClaimed}
                  size="sm"
                  variant={attachmentClaimed ? 'ghost' : 'solid'}
                >
                  {attachmentClaimed ? 'Already Claimed' : `Claim +₡${attachmentModal.amount}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
