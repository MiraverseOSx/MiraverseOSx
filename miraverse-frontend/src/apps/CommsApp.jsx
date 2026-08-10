import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageSquare, Send, UserCircle2, Paperclip, FileText, Key, Stethoscope, Calendar, X, CheckCircle, Shield } from 'lucide-react';
import { useCommsStore } from '../store/useCommsStore';
import { useOSStore } from '../store/useOSStore';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

const EMAIL_FOLDERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'alerts', label: 'Alerts' },
];

const useComms = () => ({
  channels: useCommsStore((s) => s.channels),
  directs: useCommsStore((s) => s.directs),
  messages: useCommsStore((s) => s.messages),
  addChatMessage: useCommsStore((s) => s.addChatMessage),
  emails: useCommsStore((s) => s.emails),
});

export default function CommsApp() {
  const [mode, setMode] = useState('channels'); // 'channels' | 'email'
  const [folder, setFolder] = useState('inbox');
  const [search, setSearch] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [channelId, setChannelId] = useState('secure-relay');
  const [draft, setDraft] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [attachmentModal, setAttachmentModal] = useState(null);
  const [maiToneSelected, setMaiToneSelected] = useState(null);

  const claimedComms = useOSStore((s) => s.gameplay.claimedComms);
  const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
  const selectMAITone = useOSStore((s) => s.selectMAITone);
  const maiTone = useOSStore((s) => s.gameplay.maiTone);

  const { emails: storeEmails, channels, directs, messages, addChatMessage } = useComms();

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === channelId) || directs.find((d) => d.id === channelId) || { name: channelId };
  }, [channels, directs, channelId]);

  const handleMAIToneChoice = (tone) => {
    selectMAITone(tone);
    setMaiToneSelected(tone);
  };

  const emails = useMemo(() => {
    let list = storeEmails;
    if (folder === 'alerts') {
      list = list.filter((m) => /alert|notice|security|orientation|setup|activation/i.test(m.subject) || /System|Services|Dean|Medical|Bureau|Security/i.test(m.sender));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.subject.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q) || (m.body || '').toLowerCase().includes(q));
    }
    return list;
  }, [storeEmails, folder, search]);

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

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const entry = { id: Date.now(), user: 'You', team: 'Student', text: chatDraft, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    addChatMessage(channelId, entry);
    setChatDraft('');
  };

  useEffect(() => {
    setSelectedMessageId(null);
  }, [folder]);

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
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
          <Button onClick={() => setMode('email')} size="sm" variant={mode === 'email' ? 'solid' : 'ghost'} className="flex items-center gap-1.5 text-xs">
            <Mail size={14} /> MAIL
          </Button>
          <Button onClick={() => setMode('channels')} size="sm" variant={mode === 'channels' ? 'solid' : 'ghost'} className="flex items-center gap-1.5 text-xs">
            <MessageSquare size={14} /> CHANNELS
          </Button>
        </div>
        {mode === 'email' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs">
              <span className="mr-2 text-slate-400">⌕</span>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mail" className="w-48 bg-transparent text-xs outline-none" />
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold tracking-wider text-[#1d2650] flex items-center gap-2">
            <Shield size={14} className="text-[#5f6ab0]" /> {activeChannel.name}
          </div>
        )}
      </div>

      {/* Main Content */}
      {mode === 'email' ? (
        <div className="flex min-h-0 flex-1">
          {/* Folders */}
          <div className="w-[19%] min-w-36 max-w-44 shrink-0 border-r border-slate-300/70 bg-white/60 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500 mb-2">Mailbox</div>
            <div className="space-y-1">
              {EMAIL_FOLDERS.map((f) => (
                <button key={f.id} onClick={() => setFolder(f.id)} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${folder === f.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'text-slate-600 hover:bg-[#f2f3fb]'}`}>
                  <span>{f.label}</span>
                  <span className="text-[10px] text-slate-400">{f.id === 'inbox' ? storeEmails.length : storeEmails.filter((m) => /alert|notice/i.test(m.subject)).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="w-[33%] min-w-60 max-w-80 shrink-0 border-r border-slate-300/70 bg-white/40">
            <div className="flex items-center justify-between border-b border-slate-300/60 px-3 py-2 text-[11px] font-semibold text-slate-500">
              <span>{folder.toUpperCase()}</span>
              <span>{emails.length} items</span>
            </div>
            <div className="h-full overflow-auto p-2 space-y-1">
              {emails.map((m) => (
                <button key={m.id} onClick={() => openMessage(m)} className={`w-full rounded-lg border p-2.5 text-left transition ${selectedMessageId === m.id ? 'border-[#8c97d6] bg-[#eef0fb]' : 'border-slate-200/80 bg-white/90 hover:bg-[#f7f7fd]'}`}>
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
              {!emails.length && <div className="p-3 text-center text-xs text-slate-500">No messages</div>}
            </div>
          </div>

          {/* Reader */}
          <div className="flex min-w-0 flex-1 flex-col bg-[#FAFAFC] p-4">
            {!selectedMessage && (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Select a message to read.
              </div>
            )}
            {selectedMessage && (
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-300/70 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#1c2650]">{selectedMessage.subject}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{selectedMessage.sender} · {selectedMessage.time}</div>
                    </div>
                    <Button onClick={() => setSelectedMessageId(null)} size="sm" variant="ghost">Close</Button>
                  </div>
                </div>
                <div className="my-3 flex-1 overflow-auto whitespace-pre-line text-xs leading-relaxed text-[#243064]">
                  {selectedMessage.body}
                </div>

                {/* MAI Welcome Packet Tone Response Selector */}
                {/MAI|Welcome Packet|Initialization Complete/i.test(selectedMessage.subject) && (
                  <div className="my-3 rounded-xl border border-purple-300 bg-purple-50/80 p-4 space-y-3 shadow-sm">
                    <div className="text-xs font-bold text-purple-900 font-serif flex items-center gap-2">
                      <Sparkles size={15} className="text-purple-600" /> MAI ALIGNMENT RESPONSE PROTOCOL
                    </div>
                    <p className="text-[11px] text-purple-700 leading-relaxed">
                      Select your response tone to set your initial relationship vector with MAI:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleMAIToneChoice('friendly')}
                        className={`rounded-lg border p-2 text-xs font-semibold text-center transition ${maiTone === 'friendly' ? 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold' : 'border-purple-200 bg-white text-purple-800 hover:bg-purple-100'
                          }`}
                      >
                        😊 Friendly (+Trust)
                      </button>
                      <button
                        onClick={() => handleMAIToneChoice('neutral')}
                        className={`rounded-lg border p-2 text-xs font-semibold text-center transition ${maiTone === 'neutral' ? 'border-indigo-500 bg-indigo-100 text-indigo-900 font-bold' : 'border-purple-200 bg-white text-purple-800 hover:bg-purple-100'
                          }`}
                      >
                        😐 Neutral (Balanced)
                      </button>
                      <button
                        onClick={() => handleMAIToneChoice('cold')}
                        className={`rounded-lg border p-2 text-xs font-semibold text-center transition ${maiTone === 'cold' ? 'border-rose-500 bg-rose-100 text-rose-900 font-bold' : 'border-purple-200 bg-white text-purple-800 hover:bg-purple-100'
                          }`}
                      >
                        ❄️ Cold (+Rivalry)
                      </button>
                    </div>
                    {maiTone && (
                      <p className="text-[10px] text-purple-600 font-mono text-center">
                        ✓ Tone Vector Established: <span className="font-bold uppercase">{maiTone}</span>
                      </p>
                    )}
                  </div>
                )}

                {selectedMessage.attachment && (
                  <div className="mb-3 rounded-lg border border-slate-300/80 bg-white/90 p-3 flex items-center justify-between shadow-sm">
                    <div
                      onClick={() => setAttachmentModal(selectedMessage.attachment)}
                      className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition"
                    >
                      <div className="rounded-lg bg-[#eef0fb] p-2">
                        {getAttachmentIcon(selectedMessage.attachment.type)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1d2650] flex items-center gap-1.5">
                          {selectedMessage.attachment.name}
                          <span className="text-[10px] text-slate-400 font-mono">(Preview)</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {selectedMessage.attachment.previewTitle || 'Attachment Document'}
                        </div>
                      </div>
                    </div>

                    <Button onClick={claimAttachment} disabled={attachmentClaimed} size="sm" variant={attachmentClaimed ? 'ghost' : 'solid'} className="text-xs font-semibold">
                      {attachmentClaimed ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={13} /> Claimed</span> : `Claim +₡${selectedMessage.attachment.amount}`}
                    </Button>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); sendEmail(); }} className="flex items-center gap-2 pt-2 border-t border-slate-300/70">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a reply…" className="flex-1 bg-white border-slate-300/80 text-xs text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2" />
                  <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1"><Send size={13} /> Send</Button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Channel Mode */
        <div className="flex min-h-0 flex-1">
          {/* Channel + Direct List */}
          <div className="w-[24%] min-w-44 max-w-56 shrink-0 border-r border-slate-300/70 bg-white/60 p-3 space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500 mb-2">Channels</div>
              <div className="space-y-1">
                {channels.map((c) => (
                  <button key={c.id} onClick={() => setChannelId(c.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${channelId === c.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'text-slate-600 hover:bg-[#f2f3fb]'}`}>
                    <Shield size={14} className="text-[#5f6ab0] shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500 mb-2">Direct Messages</div>
              <div className="space-y-1">
                {directs.map((d) => (
                  <button key={d.id} onClick={() => setChannelId(d.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${channelId === d.id ? 'bg-[#e9ebf6] text-[#1d2650] font-semibold' : 'text-slate-600 hover:bg-[#f2f3fb]'}`}>
                    <UserCircle2 size={14} className="text-[#6b74b5] shrink-0" />
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex min-w-0 flex-1 flex-col bg-[#FAFAFC]">
            <div className="flex items-center justify-between border-b border-slate-300/60 px-4 py-2 text-xs text-slate-500">
              <span className="flex items-center gap-2 font-medium text-[#1d2650]"><Shield size={14} className="text-[#5f6ab0]" /> {activeChannel.name} Communications</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 space-y-3">
              {(messages[channelId] || []).map((m) => (
                <div key={m.id} className="max-w-[85%] rounded-lg border border-slate-300/70 bg-white/90 p-3 text-xs shadow-sm">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-[#1c2650]">{m.user}</span>
                    <span>{m.time}</span>
                  </div>
                  <div className="text-[#28335e] leading-relaxed">{m.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="border-t border-slate-300/70 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <Input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} placeholder={`Message ${activeChannel.name}...`} className="flex-1 bg-white border-slate-300 text-xs text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2" />
                <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1"><Send size={13} /> Send</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {attachmentModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-300/90 bg-white p-5 shadow-2xl text-[#162241]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1d2650]">
                {getAttachmentIcon(attachmentModal.type)}
                <span>{attachmentModal.name}</span>
              </div>
              <button onClick={() => setAttachmentModal(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>

            <div className="my-4 space-y-2">
              <div className="text-xs font-semibold text-[#1f2954]">{attachmentModal.previewTitle}</div>
              <div className="rounded-lg border border-slate-200 bg-[#f7f8fd] p-3 font-mono text-[11px] leading-relaxed text-[#28335e] whitespace-pre-line">
                {attachmentModal.previewText}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
              <span className="text-slate-500">Reward: +₡{attachmentModal.amount}</span>
              <Button onClick={() => { claimAttachment(); setAttachmentModal(null); }} disabled={attachmentClaimed} size="sm" variant={attachmentClaimed ? 'ghost' : 'solid'}>
                {attachmentClaimed ? 'Already Claimed' : `Claim +₡${attachmentModal.amount}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
