import React, { useState, useMemo } from 'react';
import { Mail, Send, Paperclip, Search, Folder, AlertCircle } from 'lucide-react';
import { useCommsStore } from '../store/useCommsStore';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { Card, CardBody, CardHeader } from '../components/ui/card';

export default function MailApp() {
  // State
  const [folder, setFolder] = useState('inbox'); // inbox | alerts | sent
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');

  // Store access
  const storeEmails = useCommsStore((s) => s.emails);
  const addChatMessage = useCommsStore((s) => s.addChatMessage);
  const addEmail = useCommsStore((s) => s.addEmail);
  const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);

  // Filtered emails based on folder and search
  const emails = useMemo(() => {
    let list = storeEmails.filter((e) => e.folder ? e.folder === folder : e.folder === undefined);
    if (folder === 'alerts') {
      list = list.filter((e) => /alert|notice|security|orientation|setup|activation/i.test(e.subject));
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

  const selected = emails.find((e) => e.id === selectedId) || null;
  const attachmentClaimed = selected?.attachment && selected.attachment.claimed;

  const claimAttachment = () => {
    if (!selected?.attachment || attachmentClaimed) return;
    claimCommsAttachment(selected.id, selected.attachment.amount, 50);
    // mark claimed locally (temporary state only)
    selected.attachment.claimed = true;
  };

  const sendMail = () => {
    if (!draft.trim()) return;
    // For simplicity, just push to sent folder locally
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

  return (
    <section className="flex h-full w-full flex-col bg-gradient-to-b from-[#0a0a1a] to-[#15152f] text-[#e0e6ff]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-700/70 bg-[#0d0d1b]/80 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold tracking-[.14em]">
          <Mail size={16} />
          <span>MAIL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-600 bg-[#111122]/60 px-3 py-1 text-sm">
            <Search size={14} className="mr-2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mail"
              className="w-48 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Folder List */}
        <div className="w-48 shrink-0 border-r border-slate-700/70 bg-[#111122]/60 p-3">
          <div className="text-xs font-bold tracking-[.2em] text-slate-400 mb-2">FOLDERS</div>
          <div className="space-y-1">
            {['inbox', 'alerts', 'sent'].map((f) => (
              <button
                key={f}
                onClick={() => { setFolder(f); setSelectedId(null); }}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${folder === f ? 'bg-[#29293f] text-[#c5c9ff] font-semibold' : 'hover:bg-[#222236] text-slate-400'}`}
              >
                <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                <span className="text-xs text-slate-500">{f === 'inbox' ? storeEmails.length : storeEmails.filter((m) => /alert|notice|security|orientation|setup|activation/i.test(m.subject)).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="w-80 shrink-0 border-r border-slate-700/70 bg-[#111122]/50">
          <div className="flex items-center justify-between border-b border-slate-700/60 px-3 py-2 text-xs text-slate-300">
            <span>{folder.toUpperCase()}</span>
            <span>{emails.length} items</span>
          </div>
          <div className="h-full overflow-auto p-2">
            {emails.map((m) => (
              <Card key={m.id} className={`mb-1 px-3 py-2 ${selectedId===m.id? 'outline outline-1 outline-[#5a5ac5] bg-[#1e1e3a]' : 'bg-[#0a0a15]'}`} onClick={() => setSelectedId(m.id)}>
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-[#c5c9ff]">{m.subject}</p>
                  <span className="ml-2 shrink-0 text-xs text-slate-500">{m.time}</span>
                </div>
                <p className="truncate text-xs text-slate-400">{m.sender}</p>
              </Card>
            ))}
            {!emails.length && <div className="p-3 text-center text-sm text-slate-500">No messages</div>}
          </div>
        </div>

        {/* Detail / Compose */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Reader */}
          {selected && (
            <Card className="m-4 flex-1 overflow-auto bg-[#0a0a1a]/60 p-4 text-sm text-slate-300">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-base font-bold text-[#c5c9ff]">{selected.subject}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{selected.sender} · {selected.time}</div>
                </div>
                <Button onClick={() => setSelectedId(null)} size="sm" variant="ghost">Close</Button>
              </div>
              <div className="whitespace-pre-line mb-4">{selected.body}</div>
              {selected.attachment && (
                <Card className="mt-3 flex items-center justify-between bg-[#111122]/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Paperclip size={14} className="text-[#7280c9]" /> {selected.attachment.name}
                  </div>
                  <Button onClick={claimAttachment} disabled={attachmentClaimed} size="sm" variant={attachmentClaimed? 'ghost' : 'solid'}>
                    {attachmentClaimed ? 'Claimed' : `Claim +₡${selected.attachment.amount}`}
                  </Button>
                </Card>
              )}
            </Card>
          )}

          {/* Compose area */}
          <form onSubmit={(e) => { e.preventDefault(); sendMail(); }} className="border-t border-slate-700/70 bg-[#111122]/60 p-3 flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply…"
              className="flex-1 bg-[#0a0a15] text-slate-300"
            />
            <Button type="submit" className="flex items-center gap-1">
              <Send size={14} /> Send
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
