import React, { useEffect, useRef, useState } from 'react';
import { useMailState } from './MailContext';
import type { PersonalContact, MailRule } from './mailOrganization';

export default function MailTools({ view, onClose, onCompose }: { view: 'contacts' | 'settings'; onClose: () => void; onCompose: (address: string) => void }) {
  const state = useMailState(state => state);
  const org = state.mailOrganization;
  const dialog = useRef<HTMLDialogElement>(null);
  const [contact, setContact] = useState<Partial<PersonalContact>>({ name: '', address: '', groups: [] });
  const [filter, setFilter] = useState(''); const [group, setGroup] = useState(''); const [notice, setNotice] = useState('');
  const [rule, setRule] = useState<Omit<MailRule, 'id'>>({ field: 'sender', contains: '', action: 'archive', label: '' });
  useEffect(() => { dialog.current?.showModal(); }, []);
  function addName(event: React.FormEvent<HTMLFormElement>, key: 'labels' | 'folders' | 'groups') {
    event.preventDefault(); const form = event.currentTarget; const name = String(new FormData(form).get('name') || '').trim();
    if (!name || name.length > 40 || org[key].length >= 32 || org[key].some(item => item.toLowerCase() === name.toLowerCase())) { setNotice('Use a unique name of 1–40 characters (up to 32 entries).'); return; }
    state.updateMailOrganization(current => ({ ...current, [key]: [...current[key], name] })); form.reset(); setNotice(`${name} added.`);
  }
  return <dialog className="mail-tools" ref={dialog} aria-labelledby="mail-tools-title" onCancel={onClose} onClose={onClose}>
    <header><div><span className="mail-eyebrow">AureMail / saved on this device</span><h2 id="mail-tools-title">{view === 'contacts' ? 'Personal contacts' : 'Mail settings'}</h2></div><button onClick={onClose} aria-label="Close mail tools">Close</button></header>
    {view === 'contacts' ? <>
      <p>Keep your own address book alongside the read-only institutional directory.</p>
      <form className="mail-tools-form" onSubmit={event => { event.preventDefault(); const result = state.savePersonalContact(contact); setNotice(result.message); if (result.ok) setContact({ name: '', address: '', groups: [] }); }}>
        <h3>{contact.id ? 'Edit contact' : 'New contact'}</h3>
        <label>Name<input required maxLength={80} value={contact.name || ''} onChange={event => setContact({ ...contact, name: event.target.value })} /></label>
        <label>Email address<input required type="email" maxLength={254} value={contact.address || ''} onChange={event => setContact({ ...contact, address: event.target.value })} /></label>
        {org.groups.length > 0 && <fieldset><legend>Groups</legend>{org.groups.map(name => <label className="mail-checkbox" key={name}><input type="checkbox" checked={contact.groups?.includes(name) || false} onChange={event => setContact({ ...contact, groups: event.target.checked ? [...(contact.groups || []), name] : contact.groups?.filter(item => item !== name) })} />{name}</label>)}</fieldset>}
        <div className="mail-tool-actions"><button type="submit">Save contact</button>{contact.id && <button type="button" onClick={() => setContact({ name: '', address: '', groups: [] })}>Cancel edit</button>}</div>
      </form>
      <form className="mail-inline-form" onSubmit={event => addName(event, 'groups')}><input aria-label="New contact group" name="name" required maxLength={40} placeholder="New group" /><button>Add group</button></form>
      <div className="mail-name-list">{org.groups.map(name => <button key={name} aria-label={`Delete group ${name}`} onClick={() => { state.updateMailOrganization(current => ({ ...current, groups: current.groups.filter(item => item !== name) })); if (group === name) setGroup(''); }}>{name} ×</button>)}</div>
      <div className="mail-inline-form"><input aria-label="Search personal contacts" placeholder="Find a contact" value={filter} onChange={event => setFilter(event.target.value)} /><select aria-label="Contact group" value={group} onChange={event => setGroup(event.target.value)}><option value="">All groups</option>{org.groups.map(name => <option key={name}>{name}</option>)}</select></div>
      <div className="mail-contact-list">{org.contacts.filter(item => (!group || item.groups.includes(group)) && `${item.name} ${item.address}`.toLowerCase().includes(filter.toLowerCase())).map(item => <article key={item.id}><div><strong>{item.name}</strong><span>{item.address}</span><small>{item.groups.join(' · ')}</small></div><div className="mail-tool-actions"><button onClick={() => onCompose(item.address)}>Write</button><button onClick={() => setContact(item)}>Edit {item.name}</button><button onClick={() => { state.deletePersonalContact(item.id); if (contact.id === item.id) setContact({ name: '', address: '', groups: [] }); }}>Delete {item.name}</button></div></article>)}{!org.contacts.length && <p>No personal contacts yet.</p>}</div>
    </> : <>
      <section className="mail-tools-form"><h3>Reading & composing</h3>
        <label>Display density<select value={org.settings.density} onChange={event => state.updateMailOrganization(current => ({ ...current, settings: { ...current.settings, density: event.target.value as 'comfortable' | 'compact' } }))}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
        {([['autoRead', 'Mark conversations read when opened'], ['conversations', 'Group messages into conversations']] as const).map(([key, label]) => <label className="mail-checkbox" key={key}><input type="checkbox" checked={org.settings[key]} onChange={event => state.updateMailOrganization(current => ({ ...current, settings: { ...current.settings, [key]: event.target.checked } }))} />{label}</label>)}
        <label>Signature<textarea maxLength={2000} rows={3} value={org.settings.signature} onChange={event => state.updateMailOrganization(current => ({ ...current, settings: { ...current.settings, signature: event.target.value } }))} /></label><small>Leave blank to use the selected account’s signature. Changes apply to new outgoing mail.</small>
      </section>
      {(['labels', 'folders'] as const).map(key => <section className="mail-tools-form" key={key}><h3>{key === 'labels' ? 'Labels' : 'Folders'}</h3><form className="mail-inline-form" onSubmit={event => addName(event, key)}><input name="name" aria-label={`New ${key === 'labels' ? 'label' : 'folder'}`} required maxLength={40} placeholder="Name" /><button>Add {key === 'labels' ? 'label' : 'folder'}</button></form><div className="mail-name-list">{org[key].map(name => <button key={name} aria-label={`Delete ${key === 'labels' ? 'label' : 'folder'} ${name}`} onClick={() => state.updateMailOrganization(current => ({ ...current, [key]: current[key].filter(item => item !== name) }))}>{name} ×</button>)}</div><small>{key === 'labels' ? 'Removing a label leaves its messages intact.' : 'Removing a folder returns its messages to Inbox.'}</small></section>)}
      <section className="mail-tools-form"><h3>Incoming mail rules</h3><p>Match text in a sender or subject. Rules organize your mailbox; they do not send messages or alter your records.</p>
        <form className="mail-rule-form" onSubmit={event => { event.preventDefault(); if (!rule.contains.trim() || (rule.action === 'label' && !rule.label) || org.rules.length >= 32) return; state.updateMailOrganization(current => ({ ...current, rules: [...current.rules, { ...rule, contains: rule.contains.trim(), id: crypto.randomUUID() }] })); setRule({ ...rule, contains: '' }); setNotice('Rule saved. New mail is processed when AureMail is open.'); }}>
          <label>Match<select value={rule.field} onChange={event => setRule({ ...rule, field: event.target.value as MailRule['field'] })}><option value="sender">Sender contains</option><option value="subject">Subject contains</option></select></label>
          <label>Text<input required maxLength={100} value={rule.contains} onChange={event => setRule({ ...rule, contains: event.target.value })} /></label>
          <label>Action<select value={rule.action} onChange={event => setRule({ ...rule, action: event.target.value as MailRule['action'] })}><option value="archive">Archive</option><option value="spam">Move to Spam</option><option value="label">Apply label</option></select></label>
          {rule.action === 'label' && <label>Rule label<select required value={rule.label} onChange={event => setRule({ ...rule, label: event.target.value })}><option value="">Choose label</option>{org.labels.map(name => <option key={name}>{name}</option>)}</select></label>}<button>Add rule</button>
        </form>
        {org.rules.map(item => <div key={item.id} className="mail-rule-row"><span>{item.field} contains “{item.contains}” → {item.action}{item.label ? `: ${item.label}` : ''}</span><button onClick={() => state.updateMailOrganization(current => ({ ...current, rules: current.rules.filter(rule => rule.id !== item.id) }))}>Delete rule</button></div>)}
        <button onClick={() => { state.processMailRules(true); setNotice('Rules applied to existing incoming mail.'); }}>Apply rules to existing mail</button>
      </section>
      {!!state.blockedAddresses.length && <section className="mail-tools-form"><h3>Blocked senders</h3>{state.blockedAddresses.map(address => <button key={address} onClick={() => state.toggleBlockAddress(address)}>Unblock {address}</button>)}</section>}
    </>}
    <p className="mail-tool-notice" role="status">{notice}</p>
  </dialog>;
}

export function MailOrganizationBar({ ids }: { ids: string[] }) {
  const state = useMailState(state => state); const org = state.mailOrganization;
  const meta = org.metadata[ids[0]];
  return <div className="mail-organization-bar" aria-label="Organize selected mail">
    <button type="button" onClick={() => state.organizeMail(ids, meta?.spam ? 'not-spam' : 'spam')}>{meta?.spam ? 'Not spam' : 'Move to Spam'}</button>
    <select aria-label="Snooze mail" value="" onChange={event => { if (event.target.value) state.organizeMail(ids, 'snooze', event.target.value === 'wake' ? 0 : Date.now() + Number(event.target.value)); }}><option value="">Snooze…</option><option value="3600000">For 1 hour</option><option value="86400000">For 1 day</option><option value="wake">Return now</option></select>
    <select aria-label="Move mail to folder" value="" onChange={event => { if (event.target.value) state.organizeMail(ids, 'folder', event.target.value === 'inbox' ? '' : event.target.value); }}><option value="">Move to…</option><option value="inbox">Inbox</option>{org.folders.map(name => <option key={name}>{name}</option>)}</select>
    <select aria-label="Apply or remove mail label" value="" onChange={event => { if (event.target.value) state.organizeMail(ids, 'label', event.target.value); }}><option value="">Toggle label…</option>{org.labels.map(name => <option key={name}>{name}</option>)}</select>
    {meta?.labels?.map(name => <span key={name} className="mail-label-chip">{name}</span>)}
    {meta?.snoozedUntil && meta.snoozedUntil > Date.now() ? <small>Until {new Date(meta.snoozedUntil).toLocaleString()}</small> : null}
  </div>;
}
