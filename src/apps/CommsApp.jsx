import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageSquare, Send, Hash, UserCircle2, Paperclip } from 'lucide-react';
import { INITIAL_EMAILS, INITIAL_SHADOWCHAT_FEED } from '../data/commsData';
import { useOSStore } from '../store/useOSStore';

const EMAIL_FOLDERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'alerts', label: 'Alerts' },
];

const CHANNELS = [
  { id: 'secure-relay', name: 'secure-relay', team: 'Ops' },
  { id: 'briefings', name: 'briefings', team: 'Faculty' },
  { id: 'dga-ops', name: 'dga-ops', team: 'Agency' },
];

const DIRECT_CONTACTS = [
  { id: 'dm:voss', name: 'Dr. Voss' },
  { id: 'dm:riven', name: 'Riven' },
  { id: 'dm:odd', name: 'Odd' },
];

export default function CommsApp() {
  const [mode, setMode] = useState('channels'); // 'channels' | 'email'
  const [folder, setFolder] = useState('inbox');
  const [search, setSearch] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [channelId, setChannelId] = useState('secure-relay');
  const [draft, setDraft] = useState('');
  const [chatDraft, setChatDraft] = useState('');

  const claimedComms = useOSStore((s) => s.gameplay.claimedComms);
  const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);

  // Email datasource
  const emails = useMemo(() => {
    let list = INITIAL_EMAILS;
    if (folder === 'alerts') {
      list = list.filter((m) => /alert|notice|security|orientation|setup|activation/i.test(m.subject) || /System|Services|Dean|Medical|Bureau|Security/i.test(m.sender));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.subject.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q) || (m.body || '').toLowerCase().includes(q));
    }
    return list;
  }, [folder, search]);

  const selectedMessage = useMemo(() => emails.find((m) => m.id === selectedMessageId) || null, [emails, selectedMessageId]);
  const attachmentClaimed = selectedMessage?.attachment && claimedComms.includes(selectedMessage.id);

  const openMessage = (m) => setSelectedMessageId(m?.id || null);
  const claimAttachment = () => {
    if (!selectedMessage?.attachment || claimedComms.includes(selectedMessage.id)) return;
    claimCommsAttachment(selectedMessage.id, selectedMessage.attachment.amount, 50);
  };
  const sendEmail = () => {
    if (!draft.trim()) return;
    setDraft('');
  };

  // Channels datasource (local state per channel)
  const [channelMessages, setChannelMessages] = useState(() => ({
    'secure-relay': INITIAL_SHADOWCHAT_FEED,
    briefings: [
      { id: 'b-1', user: 'Dean Rook', team: 'Faculty', text: 'Orientation block begins at 20:00 sharp.', time: '08:40 AM' },
    ],
    'dga-ops': [
      { id: 'd-1', user: 'Mara Quell', team: 'Agency', text: 'Ops window: verify Sector 7 nodes. Squad of four.', time: '09:10 AM' },
    ],
    'dm:voss': [ { id: 'dmv-1', user: 'Dr. Voss', team: 'Direct', text: 'Keep your relay sanitized. Report any PRISM anomalies immediately.', time: '09:22 AM' } ],
    'dm:riven': [ { id: 'dmr-1', user: 'Riven', team: 'Direct', text: 'Got a shortcut to the factory? Meet near Block C stairs.', time: '09:05 AM' } ],
    'dm:odd': [ { id: 'dmo-1', user: 'Odd', team: 'Direct', text: 'Heard a rumor: cafeteria pie heals +5 aura. Scientific.', time: '08:55 AM' } ],
  }));

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const entry = { id: Date.now(), user: 'You', team: 'Student', text: chatDraft, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChannelMessages((s) => ({ ...s, [channelId]: [...(s[channelId] || []), entry] }));
    setChatDraft('');
  };

  useEffect(() => {
    setSelectedMessageId(null);
  }, [folder]);

  return (
    <section className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241]">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-300/70 bg-white/70 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[.14em]">
          <button onClick={() => setMode('email')} className={`flex items-center gap-1.5 rounded px-2 py-1 ${mode === 'email' ? 'bg-[#162241] text-white' : 'text-[#3c4779] hover:bg-[#ecedf6]'}`}>
            <Mail size={14} /> EMAIL
          </button>
          <button onClick={() => setMode('channels')} className={`flex items-center gap-1.5 rounded px-2 py-1 ${mode === 'channels' ? 'bg-[#162241] text-white' : 'text-[#3c4779] hover:bg-[#ecedf6]'}`}>
            <MessageSquare size={14} /> CHANNELS
          </button>
        </div>
        {mode === 'email' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-slate-300 bg-white/75 px-3 py-1 text-[12px]">
              <span className="mr-2 text-slate-500">⌕</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mail" className="w-48 bg-transparent outline-none placeholder:text-slate-400" />
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-semibold tracking-[.14em] text-slate-600 flex items-center gap-2">
            <Hash size={12} className="text-[#636caa]" /> {channelId}
          </div>
        )}
      </div>

      {/* Main content */}
      {mode === 'email' ? (
        <div className="flex min-h-0 flex-1">
          {/* Folders */}
          <div className="w-44 shrink-0 border-r border-slate-300/70 bg-white/60 p-3">
            <div className="text-[10px] font-bold tracking-[.2em] text-slate-600 mb-2">MAILBOX</div>
            <div className="space-y-1">
              {EMAIL_FOLDERS.map((f) => (
                <button key={f.id} onClick={() => setFolder(f.id)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] ${folder === f.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'hover:bg-[#f2f3fb] text-slate-600'}`}>
                  <span>{f.label}</span>
                  <span className="text-[10px] text-slate-400">{f.id === 'inbox' ? INITIAL_EMAILS.length : INITIAL_EMAILS.filter((m) => /alert|notice/i.test(m.subject)).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message list */}
          <div className="w-80 shrink-0 border-r border-slate-300/70 bg-white/50">
            <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] text-slate-600">
              <span>{folder.toUpperCase()}</span>
              <span>{emails.length} items</span>
            </div>
            <div className="h-full overflow-auto p-2">
              {emails.map((m) => (
                <button key={m.id} onClick={() => openMessage(m)} className={`mb-1 w-full rounded-lg border px-3 py-2 text-left transition ${selectedMessageId === m.id ? 'border-[#8c97d6] bg-[#eef0fb]' : 'border-slate-200/80 bg-white hover:bg-[#f7f7fd]'}`}>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-[12px] font-semibold text-[#1f2954]">{m.subject}</p>
                    <span className="ml-2 shrink-0 text-[11px] text-slate-500">{m.time}</span>
                  </div>
                  <p className="truncate text-[11px] text-slate-600">{m.sender}</p>
                </button>
              ))}
              {!emails.length && <div className="p-3 text-center text-[12px] text-slate-500">No messages</div>}
            </div>
          </div>

          {/* Reader */}
          <div className="flex min-w-0 flex-1 flex-col">
            {!selectedMessage && (
              <div className="m-6 rounded-xl border border-slate-300/70 bg-white/60 p-6 text-[12px] text-slate-600">
                Select a message to read.
              </div>
            )}
            {selectedMessage && (
              <div className="m-3 flex min-h-0 flex-1 flex-col rounded-xl border border-slate-300/70 bg-white/70 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-[#1b254d]">{selectedMessage.subject}</div>
                    <div className="mt-0.5 text-[12px] text-slate-600">{selectedMessage.sender} · {selectedMessage.time}</div>
                  </div>
                  <button onClick={() => setSelectedMessageId(null)} className="rounded px-2 py-1 text-[12px] text-slate-600 hover:bg-[#eceff9]">Close</button>
                </div>
                <div className="mt-3 min-h-0 flex-1 overflow-auto whitespace-pre-line text-[13px] leading-relaxed text-[#243064]">
                  {selectedMessage.body}
                </div>
                {selectedMessage.attachment && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-300/70 bg-white/60 px-3 py-2 text-[12px]">
                    <div className="flex items-center gap-2 text-slate-700"><Paperclip size={14} className="text-[#7280c9]" /> {selectedMessage.attachment.name}</div>
                    <button onClick={claimAttachment} disabled={attachmentClaimed} className={`rounded px-2 py-1 font-semibold ${attachmentClaimed ? 'bg-slate-200 text-slate-500' : 'bg-[#1e2a55] text-white hover:opacity-95'}`}>
                      {attachmentClaimed ? 'Claimed' : `Claim +₡${selectedMessage.attachment.amount}`}
                    </button>
                  </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); sendEmail(); }} className="mt-3 flex items-center gap-2">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#8c97d6]" />
                  <button type="submit" className="flex items-center gap-1 rounded bg-[#1e2a55] px-3 py-2 text-[12px] font-semibold text-white hover:opacity-95"><Send size={14} /> Send</button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* Channel + Direct list */}
          <div className="w-56 shrink-0 border-r border-slate-300/70 bg-white/60 p-3 space-y-4">
            <div>
              <div className="text-[10px] font-bold tracking-[.2em] text-slate-600 mb-2">CHANNELS</div>
              <div className="space-y-1">
                {CHANNELS.map((c) => (
                  <button key={c.id} onClick={() => setChannelId(c.id)} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] ${channelId === c.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'hover:bg-[#f2f3fb] text-slate-600'}`}>
                    <Hash size={13} className="text-[#5f6ab0]" /> {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-[.2em] text-slate-600 mb-2">DIRECT MESSAGES</div>
              <div className="space-y-1">
                {DIRECT_CONTACTS.map((d) => (
                  <button key={d.id} onClick={() => setChannelId(d.id)} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] ${channelId === d.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'hover:bg-[#f2f3fb] text-slate-600'}`}>
                    <UserCircle2 size={13} className="text-[#6b74b5]" /> {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-slate-300/60 bg-white/50 px-3 py-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-2"><UserCircle2 size={14} className="text-[#6b74b5]" /> Mission Chat — Professional</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              <div className="mx-auto max-w-3xl space-y-2">
                {(channelMessages[channelId] || []).map((m) => (
                  <div key={m.id} className="max-w-[85%] rounded-lg border border-slate-300/70 bg-white/70 px-3 py-2">
                    <div className="mb-0.5 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold text-[#1c2650]">{m.user}</span>
                      <span>{m.time}</span>
                    </div>
                    <div className="text-[13px] text-[#28335e] leading-snug">{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="border-t border-slate-300/70 bg-white/60 p-3">
              <div className="mx-auto flex max-w-3xl items-center gap-2">
                <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} placeholder={channelId.startsWith('dm:') ? 'Message @direct' : 'Message #channel'} className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#8c97d6]" />
                <button type="submit" className="flex items-center gap-1 rounded bg-[#1e2a55] px-3 py-2 text-[12px] font-semibold text-white hover:opacity-95"><Send size={14} /> Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
