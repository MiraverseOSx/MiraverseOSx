'use client';

import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Users,
  Clock,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  DIALOGUE_TREES,
  PhoneContact,
  VoicemailRecord,
  CallLogEntry,
  DialogueNode,
  normalizeContactStatus
} from '@/lib/phone-data';
import { loadComms } from '@/lib/comms-client';
import { playDtmfTone, playRadioChirp } from '@/lib/phone-audio';
import { getDGAState, emitDgaEvent, recordVoicemailListened } from '@/lib/dga-store';
import { subscribeDgaEvent } from '@/lib/dga-events';

interface DgaPhoneConsoleProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
  activeContactIdOverride?: string | null;
}

export function DgaPhoneConsole({
  onOpenCase,
  onNavigateTab,
  activeContactIdOverride
}: DgaPhoneConsoleProps) {
  const [subTab, setSubTab] = useState<'dialer' | 'contacts' | 'voicemail' | 'history'>('contacts');
  const [dialNumber, setDialNumber] = useState('');
  const [activeCall, setActiveCall] = useState<{
    contact: PhoneContact;
    currentNode: DialogueNode;
    dialogueHistory: Array<{ speaker: string; text: string }>;
  } | null>(null);

  const [voicemails, setVoicemails] = useState<VoicemailRecord[]>([]);
  const [playingVmId, setPlayingVmId] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    void loadComms().then((snapshot) => {
      setContacts(snapshot.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        title: contact.title,
        department: contact.department,
        phoneExtension: contact.extension,
        status: contact.status as PhoneContact['status'],
        avatarInitials: contact.avatar,
        directDialable: contact.dialable,
        priorityLine: contact.priorityLine
      })));
      setVoicemails(snapshot.messages.filter((item) => item.kind === 'voicemail').map((item) => ({
        id: item.id,
        contactId: item.contactId || '',
        callerName: item.senderName,
        callerTitle: item.recipient,
        timestamp: item.createdAt,
        duration: '0:30',
        durationSeconds: 30,
        isNew: !item.read,
        subject: item.subject,
        transcript: item.body,
        caseId: item.caseId
      })));
      setCallLogs(snapshot.messages.filter((item) => item.kind === 'call').map((item) => ({
        id: item.id,
        contactId: item.contactId || '',
        callerName: item.senderName,
        direction: item.folder === 'sent' ? 'outgoing' : 'incoming',
        timestamp: item.createdAt,
        duration: 'logged',
        caseId: item.caseId,
        summary: item.subject
      })));
    }).catch(() => setActionNotice('The contact directory could not be loaded from the database.'));

    // Dynamic listen for new voicemails generated from missed calls
    const unsubVm = subscribeDgaEvent('VOICEMAIL_RECEIVED', (evt) => {
      if (evt.payload) {
        setVoicemails((prev) => [evt.payload, ...prev.filter((v) => v.id !== evt.payload.id)]);
      }
    });

    return () => {
      unsubVm();
    };
  }, []);

  // Auto-initiate call if activeContactIdOverride is supplied
  React.useEffect(() => {
    if (activeContactIdOverride) {
      const contact = contacts.find((c) => c.id === activeContactIdOverride);
      if (contact) {
        startCallWithContact(contact);
      }
    }
  }, [activeContactIdOverride, contacts]);

  const handleDialKeyPress = (key: string) => {
    playDtmfTone(key);
    setDialNumber((prev) => prev + key);
  };

  const handleClearDial = () => {
    setDialNumber('');
  };

  const startCallWithContact = (contact: PhoneContact) => {
    playRadioChirp();
    const tree = DIALOGUE_TREES[contact.id] || DIALOGUE_TREES['CONT-YUMI'];
    const rootNode = tree.root;

    setActiveCall({
      contact,
      currentNode: rootNode,
      dialogueHistory: [{ speaker: contact.name, text: rootNode.speakerText }],
    });

    // Add to call log
    setCallLogs((prev) => [
      {
        id: `CL-${Date.now()}`,
        contactId: contact.id,
        callerName: contact.name,
        direction: 'outgoing',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: 'Active',
        summary: `Connected with ${contact.name}`,
      },
      ...prev,
    ]);
  };

  const handleSelectDialogueOption = (option: DialogueNode['options'][0]) => {
    if (!activeCall) return;
    playRadioChirp();

    const contactId = activeCall.contact.id;
    const tree = DIALOGUE_TREES[contactId] || DIALOGUE_TREES['CONT-YUMI'];

    // Append player's choice to dialogue history
    const updatedHistory = [
      ...activeCall.dialogueHistory,
      { speaker: 'Special Agent Jerome', text: option.text },
    ];

    // Execute option action if any
    if (option.action === 'add_evidence' && option.actionPayload) {
      const state = getDGAState();
      const targetCase = state.cases.find((c) => c.id === (option.actionPayload?.caseId || 'INV-2026-0417'));
      if (targetCase) {
        targetCase.evidence.unshift({
          id: `EV-CALL-${Date.now()}`,
          title: option.actionPayload.evidenceTitle || 'CCTV Lead Item',
          category: (option.actionPayload.evidenceCategory as any) || 'Digital Media',
          description: option.actionPayload.evidenceDesc || 'Evidence recovered via telephone debrief.',
          locationFound: 'Embassy North Service Gate',
          dateRecovered: '2026-09-29 08:10 UTC',
          custodyStatus: 'In DGA Custody',
        });
      }
      setActionNotice(option.actionPayload.message || 'Evidence added to Evidence Vault!');
      setTimeout(() => setActionNotice(null), 6000);
    } else if (option.action === 'hang_up') {
      endActiveCall();
      return;
    }

    if (option.nextNodeId && tree[option.nextNodeId]) {
      const nextNode = tree[option.nextNodeId];
      updatedHistory.push({ speaker: activeCall.contact.name, text: nextNode.speakerText });

      setActiveCall({
        ...activeCall,
        currentNode: nextNode,
        dialogueHistory: updatedHistory,
      });
    } else {
      endActiveCall();
    }
  };

  const endActiveCall = () => {
    playRadioChirp();
    setActiveCall(null);
  };

  const handleTogglePlayVoicemail = (vm: VoicemailRecord) => {
    if (playingVmId === vm.id) {
      setPlayingVmId(null);
    } else {
      playDtmfTone('*');
      setPlayingVmId(vm.id);
      // Mark as read
      setVoicemails((prev) =>
        prev.map((item) => (item.id === vm.id ? { ...item, isNew: false } : item))
      );

      // Step 6: Listen to voicemail -> task created in active case
      void recordVoicemailListened(vm).then((createdTask) => {
        if (createdTask) {
          setActionNotice(`Directive derived from voicemail: "${createdTask.title}" created in Docket ${vm.caseId}!`);
        }
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* 1. TOP PHONE HEADER */}
      <div className="h-12 bg-white border-b border-[#cfcddb] px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#edeaf6] border border-[#cfcddb] flex items-center justify-center text-[#4b4372]">
            <PhoneCall className="w-4 h-4 text-[#4b4372]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1f1e30] tracking-wide">
                AGENCY COMMUNICATIONS TERMINAL // SECURE VOIP & CAD
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
                NODE DGA-PHONE-04
              </span>
            </div>
            <div className="text-[11px] text-[#5e5c7a]">
              Encrypted Type 1 NSA Certified Voice Link • 6 Active Speed-Dial Extensions
            </div>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 bg-[#eae8f2] p-1 rounded border border-[#cfcddb]">
          {[
            { id: 'contacts', label: 'Directory', icon: Users },
            { id: 'dialer', label: 'Keypad', icon: Phone },
            { id: 'voicemail', label: `Voicemail (${voicemails.filter((v) => v.isNew).length})`, icon: Voicemail },
            { id: 'history', label: 'Call Log', icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1f1e30] shadow-2xs font-bold border border-[#cfcddb]'
                    : 'text-[#5e5c7a] hover:text-[#1f1e30] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="bg-[#edeaf6] border-b border-[#cfcddb] px-4 py-2 text-xs flex items-center justify-between text-[#362f59]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('investigation')}
              className="px-2 py-0.5 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-[11px] font-bold cursor-pointer"
            >
              Open Evidence Vault →
            </button>
          )}
        </div>
      )}

      {/* 2. ACTIVE CALL OVERLAY OR TAB CONTENT */}
      {activeCall ? (
        <div className="flex-1 flex flex-col bg-white p-6 max-w-4xl mx-auto w-full my-4 border border-[#cfcddb] rounded-lg shadow-xl overflow-hidden">
          {/* Active Call Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e4e2ee]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#edeaf6] border border-[#4b4372] flex items-center justify-center text-[#362f59] font-bold text-base shadow-sm animate-pulse">
                {activeCall.contact.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#1f1e30]">{activeCall.contact.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                    CONNECTED ENCRYPTED
                  </span>
                </div>
                <div className="text-xs text-[#5e5c7a]">
                  {activeCall.contact.title} • {activeCall.contact.phoneExtension}
                </div>
              </div>
            </div>

            <button
              onClick={endActiveCall}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>TERMINATE CALL</span>
            </button>
          </div>

          {/* Dialogue Transcript Stream */}
          <div className="flex-1 overflow-y-auto my-4 space-y-3 p-3 bg-[#f8f7fc] border border-[#cfcddb] rounded">
            {activeCall.dialogueHistory.map((item, idx) => {
              const isAgent = item.speaker !== activeCall.contact.name;
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-mono text-[#5e5c7a] mb-1">
                    {item.speaker}
                  </span>
                  <div
                    className={`max-w-xl p-3 rounded text-xs leading-relaxed ${
                      isAgent
                        ? 'bg-[#edeaf6] text-[#1f1e30] border border-[#cfcddb] font-medium'
                        : 'bg-white text-[#2c2a3e] border border-[#cfcddb] shadow-2xs'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Player Choices */}
          <div className="pt-2 border-t border-[#e4e2ee] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372]">
              AVAILABLE RESPONSE OPTIONS:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {activeCall.currentNode.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectDialogueOption(opt)}
                  className="w-full text-left p-3 rounded bg-white hover:bg-[#edeaf6] border border-[#cfcddb] hover:border-[#4b4372] text-xs text-[#1f1e30] flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="font-medium group-hover:text-[#4b4372]">{opt.text}</span>
                  <ArrowRight className="w-4 h-4 text-[#4b4372] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* TAB CONTENT WHEN NOT IN AN ACTIVE CALL */
        <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
          {/* TAB: CONTACT DIRECTORY */}
          {subTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                <div className="text-xs text-[#5e5c7a]">
                  Click to initiate direct secure voice communication with agency specialists and investigating officers.
                </div>
                <span className="text-xs font-mono font-bold text-[#4b4372]">
                  {contacts.length} Registered Extensions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-white border border-[#cfcddb] rounded p-3 flex items-center justify-between hover:border-[#4b4372] shadow-2xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#edeaf6] border border-[#cfcddb] flex items-center justify-center text-[#362f59] font-bold text-xs shrink-0">
                        {contact.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1f1e30] truncate">{contact.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
                            {contact.phoneExtension}
                          </span>
                        </div>
                        <div className="text-xs text-[#5e5c7a] truncate">{contact.title}</div>
                        <div className="flex items-center gap-1.5 text-[10px] mt-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              normalizeContactStatus(contact.status) === 'AVAILABLE'
                                ? 'bg-emerald-500'
                                : normalizeContactStatus(contact.status) === 'BUSY'
                                ? 'bg-amber-500'
                                : normalizeContactStatus(contact.status) === 'IN FIELD'
                                ? 'bg-purple-500 animate-pulse'
                                : normalizeContactStatus(contact.status) === 'OFF DUTY'
                                ? 'bg-slate-400'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              normalizeContactStatus(contact.status) === 'AVAILABLE'
                                ? 'text-emerald-700'
                                : normalizeContactStatus(contact.status) === 'BUSY'
                                ? 'text-amber-700'
                                : normalizeContactStatus(contact.status) === 'IN FIELD'
                                ? 'text-purple-700'
                                : normalizeContactStatus(contact.status) === 'OFF DUTY'
                                ? 'text-slate-500'
                                : 'text-rose-700'
                            }`}
                          >
                            {normalizeContactStatus(contact.status)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[#5e5c7a]">{contact.department}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startCallWithContact(contact)}
                      className="px-3 py-1.5 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>CALL</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KEYPAD DIALER */}
          {subTab === 'dialer' && (
            <div className="max-w-xs mx-auto py-6 space-y-4">
              {/* Dial Display Screen */}
              <div className="bg-white border border-[#cfcddb] rounded p-3 text-center space-y-1 shadow-2xs">
                <div className="text-[10px] font-mono text-[#5e5c7a] uppercase font-bold">FEDERAL SECURE DIALER</div>
                <div className="text-2xl font-mono font-bold text-[#1f1e30] tracking-widest h-8 flex items-center justify-center">
                  {dialNumber || 'ENTER EXT'}
                </div>
              </div>

              {/* 12-Key Pad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleDialKeyPress(key)}
                    className="h-12 bg-white hover:bg-[#edeaf6] active:bg-[#dedaf0] border border-[#cfcddb] text-[#1f1e30] rounded font-mono font-bold text-lg flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Call / Clear Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleClearDial}
                  className="flex-1 py-2.5 bg-[#f0eff5] hover:bg-[#e4e2ee] border border-[#cfcddb] text-[#5e5c7a] rounded font-semibold text-xs cursor-pointer"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => {
                    // Try to match dialed extension with contact
                    const matched = contacts.find(
                      (c) => c.phoneExtension.replace('x', '') === dialNumber
                    ) || contacts[0];
                    startCallWithContact(matched);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-600 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>DIAL EXT</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: VOICEMAIL INBOX */}
          {subTab === 'voicemail' && (
            <div className="space-y-3">
              <div className="text-xs text-[#5e5c7a] pb-2 border-b border-[#cfcddb]">
                Archived audio recordings and automatic neural speech-to-text transcripts.
              </div>

              {voicemails.map((vm) => {
                const isPlaying = playingVmId === vm.id;
                return (
                  <div
                    key={vm.id}
                    className={`bg-white border rounded p-4 space-y-3 transition-colors shadow-2xs ${
                      vm.isNew ? 'border-[#4b4372] bg-purple-50/30' : 'border-[#cfcddb]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Voicemail className="w-4 h-4 text-[#4b4372]" />
                        <span className="text-sm font-bold text-[#1f1e30]">{vm.callerName}</span>
                        {vm.isNew && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-[#4b4372] border border-purple-200">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5e5c7a] font-mono">
                        {vm.timestamp} • Duration: {vm.duration}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-[#362f59]">{vm.subject}</div>

                    {/* Audio Player Controls */}
                    <div className="bg-[#f8f7fc] border border-[#cfcddb] rounded p-2.5 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePlayVoicemail(vm)}
                        className="px-3 py-1 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 text-rose-300" /> : <Play className="w-3.5 h-3.5 text-emerald-300" />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY AUDIO'}</span>
                      </button>

                      {/* Simulated Audio Waveform Bars */}
                      <div className="flex items-center gap-1">
                        {[12, 24, 18, 36, 28, 44, 20, 32, 14, 26, 40, 16, 22].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded-full ${
                              isPlaying ? 'bg-[#4b4372] animate-pulse' : 'bg-[#cfcddb]'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-[11px] font-mono text-[#4b4372] font-semibold">
                        {isPlaying ? 'PLAYING 44.1kHz PCM' : vm.duration}
                      </div>
                    </div>

                    {/* Neural Speech-To-Text Transcript */}
                    <div className="bg-[#f8f7fc] p-3 rounded border border-[#cfcddb] text-xs text-[#2c2a3e] leading-relaxed">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b4372] block mb-1">
                        TRANSCRIPTION:
                      </span>
                      {vm.transcript}
                    </div>

                    {/* Quick Call Back Button */}
                    <div className="flex items-center justify-between pt-1">
                      {vm.caseId && (
                        <span className="text-[10px] font-mono text-[#5e5c7a]">
                          Linked Docket: {vm.caseId}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          const contact = contacts.find((c) => c.id === vm.contactId) || contacts[0];
                          startCallWithContact(contact);
                        }}
                        className="px-2.5 py-1 bg-[#edeaf6] hover:bg-[#dedaf0] border border-[#cfcddb] text-[#362f59] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <PhoneCall className="w-3 h-3 text-[#4b4372]" />
                        <span>CALL BACK NOW</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: CALL HISTORY LOG */}
          {subTab === 'history' && (
            <div className="bg-white border border-[#cfcddb] rounded overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0eff5] text-[#5e5c7a] text-[10px] font-bold uppercase border-b border-[#cfcddb]">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Call Brief & Notes</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2ee] text-[#1f1e30]">
                  {callLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8f7fc]">
                      <td className="p-3">
                        {log.direction === 'missed' ? (
                          <span className="text-rose-600 flex items-center gap-1 font-bold">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>MISSED</span>
                          </span>
                        ) : log.direction === 'incoming' ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-bold">
                            <PhoneIncoming className="w-3.5 h-3.5" />
                            <span>ANSWERED</span>
                          </span>
                        ) : (
                          <span className="text-[#4b4372] flex items-center gap-1 font-bold">
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                            <span>OUTGOING</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-[#1f1e30]">{log.callerName}</td>
                      <td className="p-3 font-mono text-[#5e5c7a]">{log.timestamp}</td>
                      <td className="p-3 font-mono">{log.duration}</td>
                      <td className="p-3 text-[#2c2a3e]">{log.summary}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const c = contacts.find((item) => item.id === log.contactId) || contacts[0];
                            startCallWithContact(c);
                          }}
                          className="px-2 py-1 bg-[#edeaf6] hover:bg-[#dedaf0] text-[#362f59] rounded text-[11px] font-semibold cursor-pointer border border-[#cfcddb]"
                        >
                          Redial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
