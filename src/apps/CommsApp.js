import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

export default function CommsApp() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('Drift (The Drifters)');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);

  // Initial GDD Starter Emails
  const [emails, setEmails] = useState([
    {
      id: 'MSG-001',
      sender: 'Cyacademy Registration Office',
      faction: 'Cyacademy Admin',
      subject: 'Welcome to MIRAVERSEOSX',
      time: '08:00 AM',
      read: false,
      attachment: { type: 'credits', amount: 100, name: 'REGISTRATION_CARD.pdf', claimed: false },
      body: `Welcome, player.
      
Your provisional Cyacademy registration has been received. Your record currently contains no verified credits, no active contacts, no declared career track, no reputation standing, and no confirmed housing beyond temporary placement.

This is expected. MIRAVERSEOSX begins from a clean state so every player builds their identity through choices, work, study, relationships, and discovery.

Regards,
Registration Office`,
    },
    {
      id: 'MSG-002',
      sender: 'MIRAVERSEOSX Account Services',
      faction: 'System Services',
      subject: 'Your Temporary Login Credentials',
      time: '08:05 AM',
      read: false,
      attachment: null,
      body: `Temporary access has been generated for player.
      
Initial permissions include Mail, File Explorer, Settings, and limited desktop navigation. 

Additional applications, folders, websites, and communication channels will unlock as player completes orientation tasks and earns system trust.`,
    },
    {
      id: 'MSG-003',
      sender: 'Cyacademy Residential Services',
      faction: 'Cyacademy Admin',
      subject: 'Housing Assignment: Dorm Access Pending',
      time: '08:10 AM',
      read: false,
      attachment: { type: 'credits', amount: 150, name: 'DORM_KEY.ics', claimed: false },
      body: `Player has been assigned a starter dorm room pending arrival confirmation. 

The room includes basic sleep access, minimal storage, and default furnishings only. Upgrades, decorations, visitors, and expanded property options must be earned through credits, reputation, permissions, and progression.

- Residential Services`,
    },
    {
      id: 'MSG-004',
      sender: 'Aureline Civic Identity Bureau',
      faction: 'Civic Bureau',
      subject: 'Aura Passport Activation Required',
      time: '08:15 AM',
      read: false,
      attachment: { type: 'credits', amount: 50, name: 'AURA_CONSENT_FORM.pdf', claimed: false },
      body: `Player’s Aura Passport is currently inactive. 

Open Aura Passport to confirm basic identity fields, student status, and provisional clearance. Aura records, reputation standings, medical history, property records, and restricted lineage fields will remain blank until verified through gameplay.`,
    },
    {
      id: 'MSG-005',
      sender: 'Faith Medical Group',
      faction: 'Faith Medical',
      subject: 'Faith Medical Portal Registration',
      time: '08:20 AM',
      read: false,
      attachment: { type: 'credits', amount: 100, name: 'INTAKE_SCAN_REQUEST.pdf', claimed: false },
      body: `Faith Medical Group has created a basic patient record for player. No diagnostics are currently on file. 

Visit faithmed.aure in Browser to review the patient portal, schedule an intake scan, and activate aura health tracking. Some records may remain restricted until proper clearance is granted.`,
    },
    {
      id: 'MSG-006',
      sender: 'MIRAVERSEOSX Comms Services',
      faction: 'System Services',
      subject: 'Communications Setup Notice',
      time: '08:25 AM',
      read: false,
      attachment: null,
      body: `Player currently has no saved contacts. 

- Phone handles calls, texts, voicemail, contacts, and emergencies. 
- Comms handles OS-native direct messages, group channels, system alerts, and encrypted rooms. 
- Mail handles official messages and records. 
- ChatMeet handles scheduled calls and meetings. 
- Pulse handles public posts and reputation. 

Communication access expands as player meets people and earns trust.`,
    },
    {
      id: 'MSG-007',
      sender: 'Cyacademy Student Systems',
      faction: 'Cyacademy Admin',
      subject: 'Notice Board Access Granted',
      time: '08:30 AM',
      read: false,
      attachment: null,
      body: `Player has been granted access to the Notice Board. 

- Tasks are small to-dos. 
- Quests grant XP, credits, lore, reputation, or items. 
- Missions come from jobs and career organizations. 
- Adventures are larger events or arcs. 
- The Journey is the ongoing life path and does not end permanently.`,
    },
    {
      id: 'MSG-008',
      sender: 'Dean Cassian Rook',
      faction: 'Cyacademy Faculty',
      subject: 'Orientation Schedule: Day One',
      time: '08:35 AM',
      read: false,
      attachment: { type: 'credits', amount: 200, name: 'DAY_ONE_SCHEDULE.ics', claimed: false },
      body: `Player, welcome to Cyacademy. 

Your first day is simple: confirm registration, activate Aura Passport, check your dorm assignment, review the Notice Board, and attend orientation. 

Do not enter restricted areas. Do not attempt to access the Old Factory Ward. If the operating system behaves strangely, report the incident before investigating alone.

- Cassian Rook
Dean of Students`,
    },
  ]);

  // ShadowChat Live Feed
  const [chatFeed, setChatFeed] = useState([
    { id: 1, user: 'Phantom', team: 'Drifters', text: 'Syndicate patrol spotted near Sector 4 dead drop.', time: '10:01 AM' },
    { id: 2, user: 'NetRunner_X', team: 'Independent', text: 'Anyone got the decryption key for Voss Institute node 3?', time: '10:04 AM' },
    { id: 3, user: 'Drift', team: 'Drifters', text: 'Key posted in dead drop MSG-002. Keep it quiet.', time: '10:05 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const claimAttachment = (mailId) => {
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === mailId && m.attachment && !m.attachment.claimed) {
          addCredits(m.attachment.amount);
          addXP(m.attachment.amount / 2);
          const updatedMail = { ...m, attachment: { ...m.attachment, claimed: true } };
          setSelectedMail(updatedMail);
          return updatedMail;
        }
        return m;
      })
    );
  };

  const handleSendChat = (e) => {
    if (e.key !== 'Enter' || !chatInput.trim()) return;
    setChatFeed((prev) => [
      ...prev,
      { id: Date.now(), user: 'You (Operative)', team: 'Player', text: chatInput.trim(), time: 'Just now' },
    ]);
    setChatInput('');
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

  const unreadCount = emails.filter((e) => !e.read && !e.id.startsWith('SENT')).length;

  return (
    <div className="flex h-full w-full bg-slate-950 text-white font-sans text-xs select-none">
      {/* Sidebar */}
      <div className="w-52 border-r border-white/10 bg-slate-900/60 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm text-cyan-400">📧 Comms Portal</span>
            <button
              onClick={() => setComposing(true)}
              className="rounded-lg bg-cyan-500 px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-cyan-400 transition"
            >
              + Compose
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('inbox'); setSelectedMail(null); }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                activeTab === 'inbox' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span>📥 Inbox</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('shadowchat'); setSelectedMail(null); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                activeTab === 'shadowchat' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span>⚡ ShadowChat Feed</span>
            </button>

            <button
              onClick={() => { setActiveTab('voidcomms'); setSelectedMail(null); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                activeTab === 'voidcomms' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <span>🌌 VoidComms Monitor</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/50 space-y-1">
          <div>Encryption: AES-256</div>
          <div>Network: Drifter Mesh Node 9</div>
        </div>
      </div>

      {/* Main Mail & Feed Area */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'inbox' && (
          <div className="flex h-full w-full">
            {/* Email List */}
            <div className="w-64 border-r border-white/10 bg-black/20 p-2 overflow-auto">
              <div className="text-[10px] uppercase font-bold text-white/40 mb-2 px-2">Messages ({emails.length})</div>
              <div className="space-y-1">
                {emails.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMail(m);
                      setEmails((prev) => prev.map((e) => (e.id === m.id ? { ...e, read: true } : e)));
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      selectedMail?.id === m.id
                        ? 'border-cyan-400/60 bg-cyan-500/20'
                        : m.read
                        ? 'border-white/5 bg-white/5 opacity-70 hover:bg-white/10'
                        : 'border-cyan-500/30 bg-cyan-500/10 font-bold hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 font-semibold truncate">{m.sender}</span>
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
            </div>

            {/* Selected Email Panel */}
            <div className="flex-1 overflow-auto p-6 bg-slate-950">
              {selectedMail ? (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-cyan-300">{selectedMail.subject}</h2>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/50">{selectedMail.id}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                      <span className="font-semibold text-white">{selectedMail.sender}</span>
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">{selectedMail.faction}</span>
                      <span className="ml-auto text-[10px] text-white/40">{selectedMail.time}</span>
                    </div>
                  </div>

                  {selectedMail.attachment && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📎</span>
                        <div>
                          <div className="font-bold text-emerald-300">{selectedMail.attachment.name || 'Attached Funds'}</div>
                          <div className="text-[10px] text-emerald-400/80">Value: ₡{selectedMail.attachment.amount} Credits + {selectedMail.attachment.amount / 2} XP</div>
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
                <div className="flex h-full items-center justify-center text-white/40">
                  Select a transmission from the list to view.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shadowchat' && (
          <div className="flex flex-col h-full w-full p-4 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="font-bold text-cyan-400 text-sm">⚡ ShadowChat Live Feed (Drifter Mesh Network)</span>
              <span className="text-emerald-400 text-[10px]">ENCRYPTED / ANONYMOUS</span>
            </div>

            <div className="flex-1 overflow-auto bg-black/60 rounded-xl p-4 border border-white/10 space-y-3">
              {chatFeed.map((msg) => (
                <div key={msg.id} className="border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold text-cyan-300">{msg.user}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">{msg.team}</span>
                    <span className="ml-auto text-white/30">{msg.time}</span>
                  </div>
                  <div className="mt-1 text-white/80">{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleSendChat}
                placeholder="Broadcast anonymous distress signal or message..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {activeTab === 'voidcomms' && (
          <div className="flex flex-col h-full w-full p-6 bg-slate-950 text-xs text-white space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-purple-400">🌌 VoidComms Dimensional Monitor</h2>
              <p className="text-white/50 text-[11px]">Monitoring subspace frequencies across the Void Rift boundary.</p>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2">
              <div className="font-bold text-purple-300">Active Subspace Signal: Trans-Dimensional Beacon</div>
              <p className="text-white/80 leading-relaxed">
                "The Void Walkers report stable resonance. Signal origin: Sector 8 Rift Core. Reality index: 98.4%."
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-96 rounded-2xl border border-white/20 bg-slate-900 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-cyan-300 text-sm">Compose Transmission</span>
              <button onClick={() => setComposing(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/50 block mb-1">Recipient</label>
                <select
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white outline-none"
                >
                  <option>Drift (The Drifters)</option>
                  <option>Commander Vex Halvorn (Ironveil Empire)</option>
                  <option>Councilor Zephyra Nox (Verdant Republic)</option>
                  <option>ORACLE-9 (AI Guide)</option>
                  <option>Sable (Void Walkers)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/50 block mb-1">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/50 block mb-1">Transmission Text</label>
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write transmission body..."
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setComposing(false)}
                className="rounded-lg px-3 py-1.5 text-white/60 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCompose}
                className="rounded-lg bg-cyan-500 px-4 py-1.5 font-bold text-black hover:bg-cyan-400"
              >
                Send Transmission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
