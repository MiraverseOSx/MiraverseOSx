// src/apps/ChatMeetApp.jsx
import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import {
  Video, Mic, MicOff, VideoOff, Users, Calendar, Clock, CheckCircle2,
  MessageSquare, ShieldCheck, Play, PhoneOff, Award, Sparkles, HelpCircle
} from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import GlassContainer from '../components/GlassContainer';

const SCHEDULED_MEETINGS = [
  {
    id: 'MEET-001',
    title: 'Day One Orientation & Campus Briefing',
    host: 'Dean Cassian Rook',
    time: '10:00 AM',
    duration: '45 mins',
    category: 'Academic',
    status: 'READY',
    participants: ['Dean Cassian Rook', 'Prof. Corvin Vale', 'Player', 'Yumi', 'Odd'],
    desc: 'Mandatory introductory call for all provisional assets. Overview of campus rules, dorm assignments, and Notice Board tasks.',
    dialogues: [
      { speaker: 'Dean Cassian Rook', text: 'Welcome, new assets. Cyacademy Cycle 28 is now in session. Keep your baseline scans verified.' },
      { speaker: 'Prof. Corvin Vale', text: 'Tactical drills start tomorrow. Make sure your firewall protocols are updated before accessing Sector 7.' },
    ],
    choices: [
      { label: '🙋‍♂️ Ask about Dorm Block A assignments', reply: 'Dean Rook: Dorm Block A rooms are assigned under provisional registration.' },
      { label: '⚡ Inquire about PRISM corruption spikes', reply: 'Prof. Vale: Containment protocols are active. Do not touch unverified nodes.' },
      { label: '👍 Acknowledge briefing and stand by', reply: 'Dean Rook: Good. Complete your Notice Board orientation tasks today.' }
    ]
  },
  {
    id: 'MEET-002',
    title: 'Reality Physics & Veil Harmonics Live Lecture',
    host: 'Dr. Maelis Voss',
    time: '11:30 AM',
    duration: '60 mins',
    category: 'Lecture',
    status: 'SCHEDULED',
    participants: ['Dr. Maelis Voss', 'Jeremie', 'Aelita', 'Player'],
    desc: 'Live streaming lecture on elemental protocol alignment and Veil resonance physics in Supercomputer Lab 4.',
    dialogues: [
      { speaker: 'Dr. Maelis Voss', text: 'Today we discuss subterranean conduit lines and elemental frequency alignment.' },
      { speaker: 'Jeremie', text: 'I am logging the audio spectrum now. It looks like a minor Veil spike near the factory.' },
    ],
    choices: [
      { label: '🔬 Ask Dr. Voss about AETHERCORE conduits', reply: 'Dr. Voss: Pre-Collapse conduits run deep under Old Factory Ward.' },
      { label: '📡 Share telemetry data with Jeremie', reply: 'Jeremie: Thanks! That frequency log helps calibrate our scanner.' },
    ]
  },
  {
    id: 'MEET-003',
    title: 'DGA Tactical Security & Clearance Review',
    host: 'Agent Mara Quell',
    time: '02:00 PM',
    duration: '30 mins',
    category: 'Security',
    status: 'SCHEDULED',
    participants: ['Agent Mara Quell', 'Prof. Corvin Vale', 'Player'],
    desc: 'Classified briefing reviewing student clearance status, PRISM threat warnings, and DGA mission assignments.',
    dialogues: [
      { speaker: 'Agent Mara Quell', text: 'DGA security notice: unauthorized node port scans in Sector 9 will result in clearance demotions.' },
    ],
    choices: [
      { label: '🛡️ Confirm DGA clearance compliance', reply: 'Agent Mara Quell: Loyalty noted. Report any unverified transmissions immediately.' },
      { label: '⚠️ Report suspicious frequency intercept', reply: 'Agent Mara Quell: Dispatching field agents to investigate.' },
    ]
  },
];

export default function ChatMeetApp() {
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [completedMeetings, setCompletedMeetings] = useState([]);
  const [selectedChoiceReply, setSelectedChoiceReply] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System Notice', text: 'Connected to Aureline Secure Video Node #88.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);

  const activeMeeting = SCHEDULED_MEETINGS.find((m) => m.id === activeMeetingId);

  const handleJoinMeeting = (id) => {
    setActiveMeetingId(id);
    setSelectedChoiceReply('');
    if (!completedMeetings.includes(id)) {
      addCredits(50);
      addXP(25);
      setCompletedMeetings((prev) => [...prev, id]);
    }
  };

  const handleSelectChoice = (choice) => {
    setSelectedChoiceReply(choice.reply);
    setChatMessages((prev) => [
      ...prev,
      { sender: 'You (Player)', text: choice.label },
      { sender: 'Meeting Host', text: choice.reply }
    ]);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'Player', text: newMessage }]);
    setNewMessage('');
  };

  return (
    <GlassContainer variant="light" className="flex h-full w-full font-sans text-xs text-[#162241] select-none overflow-hidden rounded-none border-none bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7]">
      {/* ── LIVE MEETING ROOM VIEW ── */}
      {activeMeeting ? (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFC]">
          {/* Top Call Bar */}
          <div className="bg-white/80 border-b border-slate-300/80 p-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-indigo-600 animate-ping" />
              <div>
                <div className="font-bold text-sm text-[#1d2650] font-serif-y2k">{activeMeeting.title}</div>
                <div className="text-[10px] text-slate-500 font-mono">Host: {activeMeeting.host} • {activeMeeting.duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                +50 Credits / +25 XP Claimed
              </span>
              <Button onClick={() => setActiveMeetingId(null)} size="sm" className="flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500 hover:text-black">
                <PhoneOff size={14} /> Leave Meeting
              </Button>
            </div>
          </div>

          {/* Main Call View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Participant Video Boxes & Active Speech Stream */}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
              {/* Speaker Video Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activeMeeting.participants.map((p, idx) => (
                  <div key={idx} className="relative rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4 flex flex-col items-center justify-center shadow-lg">
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-lg font-bold text-white shadow-md mb-2 border border-white/20">
                      {p.charAt(0)}
                      {p === activeMeeting.host && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center shadow">
                          👑
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white">{p}</div>
                    <span className="text-[9px] text-cyan-300/80 font-mono mt-0.5">
                      {p === activeMeeting.host ? '👑 Call Host' : p === 'Player' ? '⚡ You (Asset)' : 'Participant'}
                    </span>

                    {/* Audio frequency wave simulation */}
                    <div className="mt-2 flex items-center gap-0.5">
                      <div className="h-2 w-1 rounded-full bg-cyan-400 animate-pulse" />
                      <div className="h-3 w-1 rounded-full bg-cyan-400 animate-pulse delay-75" />
                      <div className="h-1.5 w-1 rounded-full bg-cyan-400 animate-pulse delay-150" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Speaker Dialogue & Interactive Response Choices */}
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles size={16} /> Live Meeting Speech & Responses
                </div>

                {/* Dialogue Stream */}
                <div className="space-y-2">
                  {activeMeeting.dialogues.map((d, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                      <div className="font-bold text-xs text-purple-300">{d.speaker}</div>
                      <p className="text-xs text-white/90 leading-relaxed font-sans">{d.text}</p>
                    </div>
                  ))}
                </div>

                {/* Interactive Player Choices */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/70">
                    Select Interactive Speech Response:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeMeeting.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectChoice(choice)}
                        className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-left text-xs text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400 transition flex items-center justify-between"
                      >
                        <span>{choice.label}</span>
                        <HelpCircle size={14} className="text-cyan-400 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Choice Reply Box */}
                {selectedChoiceReply && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-mono">
                    {selectedChoiceReply}
                  </div>
                )}
              </div>
            </div>

            {/* In-Call Text Chat Sidebar */}
            <div className="w-72 border-l border-white/10 bg-slate-900/90 flex flex-col shrink-0">
              <div className="p-3 border-b border-white/10 font-bold text-xs text-purple-300 flex items-center gap-2">
                <MessageSquare size={14} /> Live Meeting Feed
              </div>

              <div className="flex-1 overflow-auto p-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-white/5 p-2 space-y-0.5">
                    <div className="font-bold text-[10px] text-cyan-300">{msg.sender}</div>
                    <div className="text-xs text-white/80 leading-snug">{msg.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send chat message..."
                  className="flex-1 bg-black/60 text-cyan-300 text-xs"
                />
                <Button type="submit" size="sm">Send</Button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ── SCHEDULED MEETINGS FEED VIEW ── */
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-auto max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-white/10 pb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-cyan-400 font-serif-y2k">
                <Video size={20} /> ChatMeet Video & Scheduled Meetings Suite
              </div>
              <p className="text-xs text-white/50">APP 5C — Schedule & Event-driven video calls for orientation, lectures, and DGA briefings.</p>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30">
              📅 Today's Schedule
            </span>
          </div>

          {/* Scheduled Calls List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Available Scheduled Calls</h2>
            <div className="space-y-3">
              {SCHEDULED_MEETINGS.map((m) => {
                const isDone = completedMeetings.includes(m.id);
                return (
                  <div key={m.id} className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 flex items-center justify-between gap-4 hover:border-cyan-400/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-cyan-300">{m.title}</span>
                        <span className="rounded bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[9px] font-bold uppercase font-mono">{m.category}</span>
                        {isDone && (
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[9px] font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/60">Host: <strong className="text-white">{m.host}</strong> • Duration: {m.duration}</div>
                      <p className="text-xs text-white/70 leading-relaxed max-w-xl">{m.desc}</p>
                    </div>

                    <Button onClick={() => handleJoinMeeting(m.id)} className="px-5 py-2.5 flex items-center gap-1.5 shrink-0 shadow-md">
                      <Play size={14} /> {isDone ? 'Rejoin Call' : 'Join Call (+50 Credits, +25 XP)'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GlassContainer>
  );
}
