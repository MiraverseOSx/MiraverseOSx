'use client';

import { useEffect, useState } from 'react';
import { DirectoryContact, loadComms, saveComms } from '@/lib/comms-client';

const DEPARTMENTS = ['Investigation', 'Medical', 'Intelligence', 'Government', 'Operations'] as const;

export function ContactManager() {
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [draft, setDraft] = useState<Partial<DirectoryContact>>({ department: 'Operations', status: 'Available', dialable: true });
  const [notice, setNotice] = useState('');

  const refresh = () => loadComms().then((snapshot) => setContacts(snapshot.contacts)).catch((error) => setNotice(error.message));
  useEffect(() => { void refresh(); }, []);

  const save = async () => {
    if (!draft.name?.trim()) return setNotice('A contact needs a name.');
    const snapshot = await saveComms('save-contact', { contact: draft });
    setContacts(snapshot.contacts);
    setDraft({ department: 'Operations', status: 'Available', dialable: true });
    setNotice('Contact saved to the shared directory.');
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr] bg-[#f0eff5]">
      <aside className="border-r border-[#cfcddb] overflow-y-auto bg-white">
        {contacts.map((contact) => (
          <button key={contact.id} type="button" onClick={() => setDraft(contact)} className="w-full text-left px-3 py-2 border-b border-[#eeeaf4] cursor-pointer hover:bg-[#f6f5fa]">
            <div className="text-[13px] font-semibold">{contact.name}</div>
            <div className="text-[11px] text-[#5c5a74]">{contact.extension} · {contact.email}</div>
          </button>
        ))}
      </aside>
      <form className="p-4 space-y-2 max-w-xl" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <div className="font-bold text-sm">Contact Manager</div>
        <p className="text-[12px] text-[#5c5a74]">Phone, cables, and channels all read this directory.</p>
        {notice && <div className="text-[12px] bg-[#e7f3ec] border border-[#b7d7c4] px-2 py-1">{notice}</div>}
        <input value={draft.name || ''} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Name" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <input value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Title" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <input value={draft.extension || ''} onChange={(event) => setDraft({ ...draft, extension: event.target.value })} placeholder="Extension" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <input value={draft.email || ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="Email" className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px]" />
        <select value={draft.department || 'Operations'} onChange={(event) => setDraft({ ...draft, department: event.target.value as DirectoryContact['department'] })} className="w-full border border-[#d0cedc] rounded px-2 py-1.5 text-[13px] bg-white">
          {DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
        </select>
        <button type="submit" className="h-8 px-3 rounded bg-[#2c2b3e] text-white text-[12px] font-bold cursor-pointer">Save contact</button>
      </form>
    </div>
  );
}
