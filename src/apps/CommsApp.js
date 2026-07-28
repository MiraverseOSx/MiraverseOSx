import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { INITIAL_EMAILS, INITIAL_SHADOWCHAT_FEED } from '../data/commsData';
import { Plus, Smile, Mail, Users, MessageSquare, ArrowLeft } from 'lucide-react';

export default function CommsApp() {
  const [portalScreen, setPortalScreen] = useState('gateway'); // 'gateway' | 'email' | 'comms'
  const [activeContact, setActiveContact] = useState('Aelita');
  const [selectedMail, setSelectedMail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('Aelita');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);
  const prismCorruptionLevel = useOSStore((s) => s.gameplay.prismCorruptionLevel);

  // Initial Data
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [chatFeed, setChatFeed] = useState(INITIAL_SHADOWCHAT_FEED);
  const [chatInput, setChatInput] = useState('');

  // Contacts list matching Section 5C Cast
  const contacts = ['Aelita', 'Dr. Voss', 'Odd', 'Yumi', 'Jeremie', 'Ulrich', 'Sissi', 'Nerya'];

  const claimAttachment = (mailId) => {
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === mailId && m.attachment && !m.attachment.claimed) {
          addCredits(m.attachment.amount);
          addXP(m.attachment.amount / 2);
          advanceStarterPhase();
          useOSStore.getState().addSkillXP('Communication', 25);
          useOSStore.getState().addSkillXP('Networking', 25);
          const updatedMail = { ...m, attachment: { ...m.attachment, claimed: true } };
          setSelectedMail(updatedMail);
          return updatedMail;
        }
        return m;
      })
    );
  };

  const handleSendChat = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && chatInput.trim()) {
      setChatFeed((prev) => [
        ...prev,
        { id: Date.now(), user: 'You (Operative)', team: activeContact, text: chatInput.trim(), time: 'Just now' },
      ]);
      setChatInput('');
      useOSStore.getState().addSkillXP('Communication', 10);
    }
  };

  const handleSendCompose = () => {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    setEmails((prev) => [
      {
        id: `SENT-${Date.now().toString().slice(-4)}`,
        sender: `To: ${composeRecipient}`,
        faction: 'Sent Transmission',
        subject: composeSubject,
        time: 'Just now',
        read: true,
        attachment: null,
        body: composeBody,
      },
      ...prev,
    ]);
    setComposing(false);
    setComposeSubject('');
    setComposeBody('');
  };

  const unreadEmailCount = emails.filter((e) => !e.read && !e.id.startsWith('SENT')).length;
  const unreadCommsCount = 2; // Active live messages count

  return (
    <div className="flex flex-col h-full w-full bg-[#1E293B] text-white font-sans text-xs select-none overflow-hidden">
      {/* ================================================================== */}
      {/* 1. APP 4 LANDING GATEWAY SCREEN (SPECIFICATION COMPLIANT)           */}
      {/* ================================================================== */}
      {portalScreen === 'gateway' && (
        <div className="flex flex-col h-full w-full justify-between p-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative">
          {/* Top Header */}
          <div className="border-b border-blue-500/30 pb-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <h1 className="text-lg font-bold text-blue-300 font-mono tracking-wide">COMMS PORTAL</h1>
                  <p className="text-[11px] text-white/60">MIRAVERSEOSX Communication & Gateway Mesh</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300 border border-emerald-500/40">
                  ● AES-256 Mesh Online
                </span>
                {prismCorruptionLevel > 0 && (
                  <span className="rounded-full bg-pink-500/20 px-3 py-1 text-pink-300 border border-pink-500/40 animate-pulse">
                    ⚠️ PRISM Corruption: {prismCorruptionLevel}%
                  </span>
                )}
              </div>
            </div>

            {/* Independent Unread Badges */}
            <div className="flex gap-4 pt-1 text-xs font-mono">
              <span className="rounded-lg bg-blue-950/80 border border-blue-400/40 px-3 py-1 text-blue-200">
                Formal Email: <strong className="text-blue-400">{unreadEmailCount} Unread</strong>
              </span>
              <span className="rounded-lg bg-emerald-950/80 border border-emerald-400/40 px-3 py-1 text-emerald-200">
                Live Comms: <strong className="text-emerald-400">{unreadCommsCount} Active</strong>
              </span>
            </div>
          </div>

          {/* Main Button Row: Two Equal Side-by-Side Entry Cards */}
          <div className="grid grid-cols-2 gap-6 my-auto max-w-3xl mx-auto w-full">
            {/* Left Button: Email (Formal Inbox) */}
            <button
              onClick={() => setPortalScreen('email')}
              className="flex flex-col justify-between rounded-3xl border-2 border-blue-400/50 bg-gradient-to-b from-blue-950/60 to-slate-900/90 p-6 text-left shadow-xl hover:border-blue-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/40 group-hover:scale-110 transition">
                    <Mail size={32} />
                  </div>
                  {unreadEmailCount > 0 && (
                    <span className="rounded-full bg-blue-400 text-slate-950 font-mono font-bold text-xs px-2.5 py-0.5 shadow">
                      {unreadEmailCount} NEW
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-blue-200 font-mono">EMAIL INBOX</h2>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Formal inbox for school registration, Faith Medical notices, job messages, reports, receipts, and system confirmations.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-blue-500/20 flex items-center justify-between text-xs font-mono font-bold text-blue-300 group-hover:text-blue-200">
                <span>[ Open Formal Email ➔ ]</span>
                <span className="text-[10px] text-white/40">Official Records</span>
              </div>
            </button>

            {/* Right Button: Comms (Live Conversation Layer) */}
            <button
              onClick={() => setPortalScreen('comms')}
              className="flex flex-col justify-between rounded-3xl border-2 border-emerald-400/50 bg-gradient-to-b from-emerald-950/60 to-slate-900/90 p-6 text-left shadow-xl hover:border-emerald-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.25)] transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 group-hover:scale-110 transition">
                    <MessageSquare size={32} />
                  </div>
                  <span className="rounded-full bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-2.5 py-0.5 shadow">
                    {unreadCommsCount} LIVE
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-emerald-200 font-mono">LIVE COMMS MESH</h2>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Live communication layer for NPC DMs, group chats, faction rooms, squad planning, social prompts, and relationship scenes.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono font-bold text-emerald-300 group-hover:text-emerald-200">
                <span>[ Open Live Comms ➔ ]</span>
                <span className="text-[10px] text-white/40">Drifter Subnet</span>
              </div>
            </button>
          </div>

          {/* Footer Strip */}
          <div className="rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-white/80 flex items-center justify-between shrink-0 shadow-inner">
            <div className="flex items-center gap-2 truncate">
              <span className="text-blue-400 font-bold">📢 NOTICE:</span>
              <span className="truncate">Cyacademy Registration Active • Registration Card attached to Email #MSG-001</span>
            </div>
            <span className="text-purple-400 text-[10px] shrink-0 ml-2">NETWORK: MESH NODE 9</span>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 2. SUB-VIEW: FORMAL EMAIL INBOX                                    */}
      {/* ================================================================== */}
      {portalScreen === 'email' && (
        <div className="flex flex-col h-full w-full bg-slate-950">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2 shrink-0">
            <button
              onClick={() => setPortalScreen('gateway')}
              className="flex items-center gap-1.5 text-blue-300 font-mono font-bold text-xs hover:text-white transition"
            >
              <ArrowLeft size={16} /> ← Back to Gateway
            </button>
            <span className="font-mono font-bold text-xs text-white/70">FORMAL EMAIL INBOX ({emails.length})</span>
            <button
              onClick={() => setComposing(true)}
              className="rounded-lg bg-blue-500 px-3 py-1 font-bold text-slate-950 text-xs hover:bg-blue-400 transition"
            >
              + Compose Scroll
            </button>
          </div>

          {/* Email Main Panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Email List */}
            <div className="w-64 border-r border-white/10 bg-black/40 p-2 overflow-y-auto space-y-1">
              {emails.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMail(m);
                    setEmails((prev) => prev.map((e) => (e.id === m.id ? { ...e, read: true } : e)));
                  }}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selectedMail?.id === m.id
                      ? 'border-blue-400 bg-blue-500/20'
                      : m.read
                      ? 'border-white/5 bg-white/5 opacity-70 hover:bg-white/10'
                      : 'border-blue-500/30 bg-blue-500/10 font-bold hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-blue-300 font-semibold truncate">{m.sender}</span>
                    <span className="text-[9px] text-white/40">{m.time}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/90 truncate">{m.subject}</div>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-white/40">
                    <span>{m.faction}</span>
                    {m.attachment && !m.attachment.claimed && (
                      <span className="text-emerald-400 font-bold">📎 ₡{m.attachment.amount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Email Reader */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
              {selectedMail ? (
                <div className="space-y-4 max-w-2xl">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-blue-300">{selectedMail.subject}</h2>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/50">{selectedMail.id}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                      <span className="font-semibold text-white">{selectedMail.sender}</span>
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">{selectedMail.faction}</span>
                      <span className="ml-auto text-[10px] text-white/40">{selectedMail.time}</span>
                    </div>
                  </div>

                  {selectedMail.attachment && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📎</span>
                        <div>
                          <div className="font-bold text-emerald-300">{selectedMail.attachment.name || 'Attached Funds'}</div>
                          <div className="text-[10px] text-emerald-400/80">Value: ₡{selectedMail.attachment.amount} Credits</div>
                        </div>
                      </div>
                      <button
                        onClick={() => claimAttachment(selectedMail.id)}
                        disabled={selectedMail.attachment.claimed}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          selectedMail.attachment.claimed
                            ? 'bg-white/10 text-white/40 cursor-default'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400'
                        }`}
                      >
                        {selectedMail.attachment.claimed ? '✔ Claimed' : 'Claim Attachment'}
                      </button>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
                    {selectedMail.body}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-white/40 font-mono">
                  Select a formal transmission from the list to view.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 3. SUB-VIEW: LIVE COMMS MESH (EXACT WIREFRAME LAYOUT MATCH)         */}
      {/* ================================================================== */}
      {portalScreen === 'comms' && (
        <div className="flex flex-col h-full w-full bg-[#1E293B] text-white font-sans text-xs select-none border-4 border-slate-900 overflow-hidden shadow-2xl">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between bg-[#0F172A] px-4 py-1.5 border-b-2 border-slate-900 shrink-0">
            <button
              onClick={() => setPortalScreen('gateway')}
              className="flex items-center gap-1.5 text-blue-300 font-mono font-bold text-xs hover:text-white transition"
            >
              <ArrowLeft size={16} /> ← Back to Gateway
            </button>
            <span className="font-mono text-xs font-bold text-blue-200">LIVE COMMS MESH</span>
            <div className="w-20" />
          </div>

          {/* Centered Header Banner matching wireframe: Comms */}
          <div className="h-12 bg-[#334155] border-b-4 border-slate-900 flex items-center justify-center px-4 shrink-0">
            <h1 className="font-serif-y2k text-2xl font-black text-white tracking-wider">
              Comms
            </h1>
          </div>

          {/* Main Area: Sidebar + Chat Panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-52 bg-[#334155] border-r-4 border-slate-900 p-3 flex flex-col justify-between shrink-0">
              {/* Top Contact Stack */}
              <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                {contacts.map((contact) => (
                  <button
                    key={contact}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full py-1.5 px-3 rounded-lg border-2 border-slate-900 text-left font-mono font-bold text-xs transition shadow ${
                      activeContact === contact
                        ? 'bg-[#64748B] text-white shadow-md translate-x-1 border-blue-400'
                        : 'bg-[#475569] text-white hover:bg-[#64748B]'
                    }`}
                  >
                    CONTACT: {contact}
                  </button>
                ))}
              </div>

              {/* Bottom Side-by-Side Action Icons (Mail Envelope & Scroll) matching wireframe */}
              <div className="flex items-center justify-around pt-3 border-t-2 border-slate-900/40">
                <button
                  onClick={() => setPortalScreen('email')}
                  className="p-2.5 rounded-xl border-2 border-slate-900 bg-purple-500 hover:bg-purple-400 text-white transition shadow-md relative group"
                  title="Switch to Formal Email"
                >
                  <Mail size={20} />
                  {unreadEmailCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-slate-900 shadow">
                      {unreadEmailCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setComposing(true)}
                  className="p-2.5 rounded-xl border-2 border-slate-900 bg-amber-100 hover:bg-amber-200 text-slate-950 transition shadow-md group relative"
                  title="Compose Scroll"
                >
                  <span className="text-xl">📜</span>
                </button>
              </div>
            </div>

            {/* Right Main Chat Panel */}
            <div className="flex-1 flex flex-col justify-between bg-[#64748B] p-4 relative overflow-hidden">
              <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between border-b-2 border-slate-900/40 pb-2">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-950">
                    <MessageSquare size={18} className="text-slate-900" />
                    <span>Channel: {activeContact}</span>
                  </div>
                  <span className="bg-slate-900/40 px-2 py-0.5 rounded text-[10px] font-mono text-white border border-slate-900">
                    SECURE MESH
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 bg-[#475569]/60 rounded-2xl p-4 border-2 border-slate-900 shadow-inner">
                  <div className="flex flex-col items-center justify-center py-4 text-center text-slate-950">
                    <div className="p-4 rounded-full bg-white/30 border-2 border-slate-900 mb-2">
                      <Users size={40} className="text-slate-900" />
                    </div>
                    <span className="font-mono font-bold text-xs">Direct Transmission with {activeContact}</span>
                  </div>

                  {chatFeed.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border-2 border-slate-900 shadow-sm max-w-[80%] ${
                        msg.user.startsWith('You')
                          ? 'bg-blue-200 text-slate-950 ml-auto'
                          : 'bg-white text-slate-900 mr-auto'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1 border-b border-slate-900/20 pb-0.5">
                        <span>{msg.user}</span>
                        <span className="opacity-60">{msg.time}</span>
                      </div>
                      <div className="text-xs font-sans font-medium">{msg.text}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom Input Bar: + Input 🙂 */}
                <div className="h-12 bg-slate-200 rounded-xl border-2 border-slate-900 flex items-center px-3 gap-2 shadow-md shrink-0">
                  <button
                    onClick={() => alert('📎 Attachment menu opened!')}
                    className="p-1.5 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold border border-slate-500"
                    title="Add Attachment"
                  >
                    <Plus size={18} />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleSendChat}
                    placeholder={`Send message to ${activeContact}...`}
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-sans font-medium placeholder-slate-500"
                  />

                  <button
                    onClick={handleSendChat}
                    className="p-1.5 rounded-lg bg-blue-400 hover:bg-blue-500 text-slate-950 font-bold border border-slate-900 transition"
                    title="Send Message"
                  >
                    <Smile size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE MODAL */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-96 rounded-2xl border-4 border-slate-900 bg-[#334155] p-4 text-white space-y-3 shadow-2xl">
            <div className="flex justify-between border-b-2 border-slate-900 pb-2 font-mono font-bold">
              <span>Compose Transmission</span>
              <button onClick={() => setComposing(false)} className="hover:text-red-300">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] block font-mono">Recipient:</label>
                <select
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-900 bg-white text-slate-900 p-1.5 outline-none font-bold"
                >
                  {contacts.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] block font-mono">Subject:</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full rounded-lg border-2 border-slate-900 bg-white text-slate-900 p-1.5 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] block font-mono">Message:</label>
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write message..."
                  className="w-full rounded-lg border-2 border-slate-900 bg-white text-slate-900 p-1.5 outline-none font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setComposing(false)}
                className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-slate-300 text-slate-900 font-bold hover:bg-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCompose}
                className="px-4 py-1.5 rounded-lg border-2 border-slate-900 bg-blue-400 text-slate-950 font-bold hover:bg-blue-500"
              >
                Send Scroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
