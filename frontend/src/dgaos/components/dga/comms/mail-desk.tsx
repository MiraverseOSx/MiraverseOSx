'use client';

import { useEffect, useMemo, useState } from 'react';
import { DirectoryMessage, MessageFolder, loadComms, saveComms } from '@/lib/comms-client';

const FOLDERS: MessageFolder[] = ['inbox', 'sent', 'drafts', 'archived'];

export function MailDesk() {
  const [messages, setMessages] = useState<DirectoryMessage[]>([]);
  const [folder, setFolder] = useState<MessageFolder>('inbox');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = () => loadComms().then((snapshot) => setMessages(snapshot.messages.filter((item) => item.kind === 'cable' || item.kind === 'channel'))).catch((error) => setNotice(error.message));
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const visible = messages.filter((item) => item.folder === folder && item.kind === 'cable');
  const threads = useMemo(() => {
    const map = new Map<string, DirectoryMessage>();
    for (const message of visible) if (!map.has(message.threadId)) map.set(message.threadId, message);
    return [...map.values()];
  }, [visible]);
  const open = messages.filter((item) => item.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const sendReply = async () => {
    const current = open[open.length - 1];
    if (!current || !reply.trim()) return;
    const snapshot = await saveComms('reply', {
      threadId: current.threadId,
      message: {
        kind: 'cable',
        threadId: current.threadId,
        contactId: current.contactId,
        recipient: current.senderName,
        subject: current.subject.startsWith('Re:') ? current.subject : `Re: ${current.subject}`,
        body: reply.trim(),
        inReplyTo: current.id,
        senderName: 'Special Agent Miracle Jerome'
      }
    });
    setMessages(snapshot.messages.filter((item) => item.kind === 'cable' || item.kind === 'channel'));
    setReply('');
    setNotice('Reply stored in Sent. Matching triggers will create the follow-up after their delay.');
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-[220px_1fr] bg-[#f0eff5]">
      <aside className="border-r border-[#cfcddb] bg-white p-2 space-y-1">
        {FOLDERS.map((item) => (
          <button key={item} type="button" onClick={() => { setFolder(item); setThreadId(null); }} className={`w-full text-left px-2 py-1.5 rounded text-[12px] font-semibold cursor-pointer ${folder === item ? 'bg-[#2c2b3e] text-white' : 'hover:bg-[#f4f3f8]'}`}>
            {item} ({messages.filter((message) => message.folder === item && message.kind === 'cable').length})
          </button>
        ))}
        <div className="pt-3 text-[10px] uppercase font-bold text-[#6d6b86]">Threads</div>
        {threads.map((message) => (
          <button key={message.threadId} type="button" onClick={() => setThreadId(message.threadId)} className="w-full text-left px-2 py-1.5 text-[12px] cursor-pointer hover:bg-[#f6f5fa]">
            <div className="font-semibold truncate">{message.subject}</div>
            <div className="text-[10px] text-[#6d6b86] truncate">{message.senderName}</div>
          </button>
        ))}
      </aside>
      <section className="flex flex-col min-h-0">
        {notice && <div className="px-3 py-1 text-[12px] bg-[#e7f3ec]">{notice}</div>}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {open.map((message) => (
            <article key={message.id} className="bg-white border border-[#d9d7e4] rounded p-3">
              <div className="text-[11px] text-[#6d6b86]">{message.folder} · {message.senderName} → {message.recipient}</div>
              <div className="font-semibold text-[13px]">{message.subject}</div>
              <p className="text-[13px] whitespace-pre-wrap mt-1">{message.body}</p>
              {message.folder !== 'archived' && (
                <button type="button" onClick={() => void saveComms('archive', { id: message.id }).then(refresh)} className="mt-2 text-[11px] font-bold text-[#4A627A] cursor-pointer">Archive</button>
              )}
            </article>
          ))}
        </div>
        {threadId && (
          <form className="p-3 border-t border-[#d9d7e4] flex gap-2" onSubmit={(event) => { event.preventDefault(); void sendReply(); }}>
            <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply in this thread" className="flex-1 border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
            <button type="submit" className="h-8 px-3 rounded bg-[#2c2b3e] text-white text-[12px] font-bold cursor-pointer">Reply</button>
          </form>
        )}
      </section>
    </div>
  );
}
