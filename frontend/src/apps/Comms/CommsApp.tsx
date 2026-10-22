import React, { useState } from 'react';
import { MessageSquare, Lock, Unlock, Send, Radio, RefreshCw, Shield } from 'lucide-react';
import { useCommsStore } from '../../store/useCommsStore';
import { useOSStore } from '../../store/useOSStore';
import { channelAccess, channelOrganization } from '../../integration/communicationsAccess';
import { LEGACY_DIRECT_CONTACTS } from '../../integration/phoneMessages';
import CommunicationsAccessPanel from '../CommunicationsAccessPanel';

export default function CommsApp() {
  const [activeId, setActiveId] = useState('city-alerts');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [accessOpen, setAccessOpen] = useState(false);
  const state = useCommsStore();
  const player = useOSStore(s => s.gameplay.player);
  const groups = [
    { name: 'Public broadcasts', channels: state.tier0Channels },
    { name: 'Community & institutions', channels: state.tier1Channels },
    { name: 'Workplace coordination', channels: state.tier2Channels },
  ];
  const active = groups.flatMap(group => group.channels).find(channel => channel.id === activeId);
  const allowed = Boolean(active && channelAccess(player, active.id));
  const readOnly = active?.readOnly || ['city-alerts', 'dga-bulletins'].includes(activeId);
  const corrupted = state.corruptedChannels.includes(activeId);
  function send(event: React.FormEvent) {
    event.preventDefault();
    if (!allowed || readOnly || !draft.trim()) return;
    const sent = state.addChatMessage(activeId, { id: crypto.randomUUID(), user: player.name || 'Citizen', team: 'Member', text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (!sent) { setNotice('Channel access changed. Review your membership before sending.'); return; }
    if (/PRISM|exploit|Old Factory Ward|malware|subconduit|illegal/i.test(draft) && !state.encryptionActive) {
      state.incrementInvestigationFlags();
      setNotice('Warden monitoring flagged this unencrypted transmission.');
    }
    setDraft('');
  }
  return <section className="institution-comms" aria-label="Institutional communications">
    {accessOpen && <CommunicationsAccessPanel onClose={() => setAccessOpen(false)}/>}
    <header><div><span className="workspace-kicker">Comms / shared channels</span><h1>Institutional network</h1></div><button onClick={() => setAccessOpen(true)}>Accounts & memberships</button><button onClick={() => state.requestPhoneMessages()}>Phone Messages</button></header>
    <div className="institution-comms-layout"><aside aria-label="Comms channels">
      {groups.map(group => <div key={group.name}><h2>{group.name}</h2>{group.channels.map(channel => {
        const access = channelAccess(player, channel.id);
        return <button key={channel.id} aria-pressed={activeId === channel.id} onClick={() => { setActiveId(channel.id); setDraft(''); setNotice(''); }}><span>{channel.name}</span><small>{!access ? 'Membership required' : channel.readOnly ? 'Read only' : 'Available'}</small>{!access && <Lock size={13}/>}</button>;
      })}</div>)}
      <details><summary>Restricted network destinations</summary>{state.lockedChannels.map(channel => <p key={channel.id}><strong>{channel.name}</strong><small>{channel.req}</small></p>)}</details>
      <details><summary>Earlier direct conversations</summary><p>Personal conversations continue in phone Messages. Their existing history is retained.</p>{Object.entries(LEGACY_DIRECT_CONTACTS).map(([id, name]) => <button key={id} onClick={() => state.requestPhoneMessages(name)}>{name} · open Messages</button>)}</details>
    </aside><main>
      <div className="institution-comms-channel"><div><Radio size={18}/><h2>{active?.name || 'Choose a channel'}</h2><p>{active?.desc}</p></div><button aria-pressed={state.encryptionActive} onClick={state.toggleEncryption}>{state.encryptionActive ? <Lock size={14}/> : <Unlock size={14}/>}{state.encryptionActive ? 'Encrypted' : 'Unencrypted'}</button></div>
      {!allowed ? <div className="institution-comms-empty"><Shield size={30}/><h2>Membership required</h2><p>{channelOrganization(activeId) || 'This institution'} controls access to this channel. No channel messages are displayed while membership is unavailable.</p><button onClick={() => setAccessOpen(true)}>Review memberships</button></div> : <>
        {corrupted && <div className="institution-comms-notice">Data bleed detected.<button onClick={() => {
          if (!state.purgeChannelCorruption(activeId)) return;
          useOSStore.getState().addXP(25);
          setNotice('Channel sanitized. Existing diagnostic award: +25 XP.');
        }}><RefreshCw size={14}/>Run channel diagnostic</button></div>}
        <div className="institution-comms-messages" aria-label="Channel messages">{(state.messages[activeId] || []).map(message => <article key={message.id}><div><strong>{message.user}</strong><small>{message.team} · {message.time}</small></div><p>{message.text}</p></article>)}</div>
        {readOnly ? <p className="institution-comms-readonly">Public broadcast · replies are disabled.</p> : <form onSubmit={send}><label className="sr-only" htmlFor="institution-comms-message">Channel message</label><input id="institution-comms-message" value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message ${active?.name}`}/><button disabled={!draft.trim()}><Send size={15}/>Send</button></form>}
      </>}
      {notice && <p role="status" className="institution-comms-notice">{notice}</p>}
    </main></div>
  </section>;
}
