'use client';

import { useEffect, useState } from 'react';
import { CommsSnapshot, CommsTrigger, DirectoryMessage, loadComms, saveComms } from '@/lib/comms-client';

const EMPTY: CommsSnapshot = { contacts: [], channels: [], messages: [], events: [] };

export function MessageEventBuilder() {
  const [data, setData] = useState<CommsSnapshot>(EMPTY);
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState<Partial<DirectoryMessage>>({ kind: 'cable', folder: 'drafts', senderName: 'Special Agent Miracle Jerome', priority: 'Routine' });
  const [event, setEvent] = useState<Partial<CommsTrigger>>({
    name: 'Reply creates a follow-up',
    triggerType: 'reply',
    delaySeconds: 15,
    enabled: true,
    action: { kind: 'cable', senderName: 'Desk', subject: 'Follow-up', body: 'Received. Standing by for the next instruction.' }
  });

  const refresh = () => loadComms().then(setData).catch((error) => setNotice(error.message));
  useEffect(() => { void refresh(); }, []);

  const saveDraft = async (sendNow: boolean) => {
    const snapshot = await saveComms(sendNow ? 'send' : 'save-message', { message: { ...draft, folder: sendNow ? 'sent' : 'drafts' } });
    setData(snapshot);
    setNotice(sendNow ? 'Message stored in Sent.' : 'Draft stored.');
  };

  const saveEvent = async () => {
    if (!event.name?.trim() || !event.action?.body?.trim()) return setNotice('A trigger needs a name and the message it will create.');
    const snapshot = await saveComms('save-event', { event });
    setData(snapshot);
    setNotice(event.triggerType === 'delay' ? 'Delay trigger queued.' : 'Reply trigger saved. A reply to that contact will create the follow-up.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0eff5]">
      <div>
        <div className="font-bold text-sm">Message and event builder</div>
        <p className="text-[12px] text-[#5c5a74]">Templates, drafts, and triggers live in the communications database.</p>
      </div>
      {notice && <div className="text-[12px] bg-[#e7f3ec] border border-[#b7d7c4] px-2 py-1">{notice}</div>}
      <section className="bg-white border border-[#d9d7e4] rounded p-3 space-y-2 max-w-3xl">
        <div className="text-[12px] font-bold">Message</div>
        <div className="flex gap-2">
          <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as DirectoryMessage['kind'] })} className="border border-[#d0cedc] rounded px-2 py-1 text-[12px] bg-white">
            <option value="cable">Cable</option>
            <option value="channel">Channel</option>
            <option value="voicemail">Voicemail</option>
          </select>
          <select value={draft.contactId || ''} onChange={(e) => {
            const contact = data.contacts.find((item) => item.id === e.target.value);
            setDraft({ ...draft, contactId: contact?.id, recipient: contact?.email || contact?.name || '', threadId: contact ? `thr-${contact.id}` : draft.threadId });
          }} className="border border-[#d0cedc] rounded px-2 py-1 text-[12px] bg-white flex-1">
            <option value="">Choose contact</option>
            {data.contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </div>
        <input value={draft.subject || ''} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="Subject" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <textarea value={draft.body || ''} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Message" className="w-full min-h-24 border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <div className="flex gap-2">
          <button type="button" onClick={() => void saveDraft(false)} className="h-8 px-3 rounded border border-[#d0cedc] text-[12px] font-bold cursor-pointer">Save draft</button>
          <button type="button" onClick={() => void saveDraft(true)} className="h-8 px-3 rounded bg-[#2c2b3e] text-white text-[12px] font-bold cursor-pointer">Send</button>
        </div>
        <div className="text-[11px] text-[#5c5a74]">Templates: {data.messages.filter((item) => item.folder === 'templates').map((item) => item.subject).join(' · ') || 'none yet'}</div>
      </section>
      <section className="bg-white border border-[#d9d7e4] rounded p-3 space-y-2 max-w-3xl">
        <div className="text-[12px] font-bold">Trigger</div>
        <input value={event.name || ''} onChange={(e) => setEvent({ ...event, name: e.target.value })} placeholder="Trigger name" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <div className="flex gap-2">
          <select value={event.triggerType} onChange={(e) => setEvent({ ...event, triggerType: e.target.value as CommsTrigger['triggerType'] })} className="border border-[#d0cedc] rounded px-2 py-1 text-[12px] bg-white">
            <option value="reply">When they are replied to</option>
            <option value="keyword">When a keyword is sent</option>
            <option value="delay">After a delay</option>
          </select>
          <input type="number" min={0} value={event.delaySeconds || 0} onChange={(e) => setEvent({ ...event, delaySeconds: Number(e.target.value) })} className="w-24 border border-[#d0cedc] rounded px-2 py-1 text-[12px]" title="Delay in seconds" />
          <select value={event.matchContactId || ''} onChange={(e) => setEvent({ ...event, matchContactId: e.target.value })} className="border border-[#d0cedc] rounded px-2 py-1 text-[12px] bg-white flex-1">
            <option value="">Any contact</option>
            {data.contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </div>
        {event.triggerType === 'keyword' && (
          <input value={event.matchKeyword || ''} onChange={(e) => setEvent({ ...event, matchKeyword: e.target.value })} placeholder="Keyword" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        )}
        <textarea value={event.action?.body || ''} onChange={(e) => setEvent({ ...event, action: { ...event.action!, body: e.target.value } })} placeholder="Message this trigger creates" className="w-full min-h-20 border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <button type="button" onClick={() => void saveEvent()} className="h-8 px-3 rounded bg-[#2c2b3e] text-white text-[12px] font-bold cursor-pointer">Save trigger</button>
        <ul className="text-[12px] space-y-1">
          {data.events.map((item) => (
            <li key={item.id}>{item.name} · {item.triggerType} · {item.delaySeconds}s</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
