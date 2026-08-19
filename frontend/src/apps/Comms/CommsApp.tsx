import React, { useState, useMemo } from 'react';
import {
  Shield, AlertTriangle, Lock, Unlock, Key, Cpu, Radio, UserCheck, Send, Sparkles, Activity, CheckCircle, RefreshCw, MessageSquare
} from 'lucide-react';
import { useCommsStore } from '../../store/useCommsStore';
import { useOSStore } from '../../store/useOSStore';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { useToastStore } from '../../store/useToastStore';

export default function CommsApp() {
  const [activeChannelId, setActiveChannelId] = useState('city-alerts');
  const [chatDraft, setChatDraft] = useState('');
  const [wardenAlert, setWardenAlert] = useState<string | null>(null);

  const tier0Channels = useCommsStore((s) => s.tier0Channels);
  const tier1Channels = useCommsStore((s) => s.tier1Channels);
  const tier2Channels = useCommsStore((s) => s.tier2Channels);
  const directs = useCommsStore((s) => s.directs);
  const lockedChannels = useCommsStore((s) => s.lockedChannels);
  const messages = useCommsStore((s) => s.messages);
  const addChatMessage = useCommsStore((s) => s.addChatMessage);
  const corruptedChannels = useCommsStore((s) => s.corruptedChannels);
  const purgeChannelCorruption = useCommsStore((s) => s.purgeChannelCorruption);
  const investigationFlags = useCommsStore((s) => s.investigationFlags);
  const incrementInvestigationFlags = useCommsStore((s) => s.incrementInvestigationFlags);
  const encryptionActive = useCommsStore((s) => s.encryptionActive);
  const toggleEncryption = useCommsStore((s) => s.toggleEncryption);

  const player = useOSStore((s) => s.gameplay.player);
  const updateNPCVector = useOSStore((s) => s.updateNPCVector);
  const addXP = useOSStore((s) => s.addXP);
  const pushToast = useToastStore((s) => s.pushToast);

  // Combine all active channels
  const allActiveChannels = useMemo(() => {
    return [...tier0Channels, ...tier1Channels, ...tier2Channels, ...directs];
  }, [tier0Channels, tier1Channels, tier2Channels, directs]);

  const activeChannel: any = useMemo(() => {
    return allActiveChannels.find((c) => c.id === activeChannelId) || { name: activeChannelId, id: activeChannelId };
  }, [allActiveChannels, activeChannelId]);

  const isDirectLink = activeChannelId.startsWith('dm:');
  const isReadOnly = activeChannel.readOnly;
  const isCorrupted = corruptedChannels.includes(activeChannelId);

  // Send Message with DGA Surveillance Monitoring
  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!chatDraft.trim() || isReadOnly) return;

    const restrictedPattern = /PRISM|exploit|Old Factory Ward|malware|subconduit|illegal/i;
    if (restrictedPattern.test(chatDraft) && !encryptionActive) {
      incrementInvestigationFlags();
      setWardenAlert(`⚠️ DGA WARDEN BOT WARNING: Restricted keyword detected in unencrypted channel. Investigation Flag recorded (#${investigationFlags + 1}). Deploy Encryption Key to secure sub-channel.`);
      pushToast({ title: 'DGA Surveillance Warning', message: 'Restricted topic flagged by Warden Bot.', tone: 'error' });
    }

    const entry = {
      id: Date.now(),
      user: player?.name || 'Provisional Citizen',
      team: 'Citizen',
      text: chatDraft,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(activeChannelId, entry);
    setChatDraft('');
  };

  // Run OS Channel Diagnostic to Purge Corruption
  const handlePurgeCorruption = () => {
    purgeChannelCorruption(activeChannelId);
    addXP(25);
    pushToast({ title: 'Channel Sanitized', message: 'Purged data bleed. +25 XP awarded.', tone: 'success' });
  };

  // NPC Affinity Dialogue Options for Direct Links (Tier 3)
  const handleNPCDialogue = (npcKey: string, choice: any) => {
    if (choice.trust) updateNPCVector(npcKey, 'trust', choice.trust);
    if (choice.rivalry) updateNPCVector(npcKey, 'rivalry', choice.rivalry);
    if (choice.friendship) updateNPCVector(npcKey, 'friendship', choice.friendship);
    if (choice.sync) updateNPCVector(npcKey, 'sync', choice.sync);

    addChatMessage(activeChannelId, {
      id: Date.now(),
      user: 'You',
      team: 'Direct',
      text: choice.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setTimeout(() => {
      addChatMessage(activeChannelId, {
        id: Date.now() + 1,
        user: activeChannel.name,
        team: 'Direct',
        text: choice.npcResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);
  };

  const activeNPCVector = isDirectLink && activeChannel.npcKey && player?.npcVectors?.[activeChannel.npcKey];

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800 font-sans select-none overflow-hidden text-xs">
      {/* Top Protocol Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <MessageSquare size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-mono text-xs">COMMS MESH // AURELINE PROTOCOL</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Global Security / Encryption Toggle */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={toggleEncryption}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
              encryptionActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {encryptionActive ? <Lock size={12} className="text-emerald-600" /> : <Unlock size={12} className="text-slate-400" />}
            <span>{encryptionActive ? 'ENCRYPTED SUB-CHANNEL' : 'UNENCRYPTED (MONITORED)'}</span>
          </button>

          {/* DGA Investigation Status */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            investigationFlags > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            DGA Flags: {investigationFlags}
          </span>
        </div>
      </div>

      {/* Main Terminal Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Tiered Sidebar Navigation */}
        <div className="w-[26%] min-w-48 max-w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto space-y-4">
          
          {/* Tier 0: System Alerts */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-sky-800 mb-1.5 px-2 flex items-center gap-1">
              <Shield size={12} className="text-sky-600" /> Tier 0: System & Civic Alerts
            </div>
            <div className="space-y-1">
              {tier0Channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === c.id ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-1 rounded border border-rose-200">READ-ONLY</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier 1: Faction & District Rooms */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 mb-1.5 px-2 flex items-center gap-1">
              <Radio size={12} className="text-emerald-600" /> Tier 1: District & Faction Rooms
            </div>
            <div className="space-y-1">
              {tier1Channels.map((c) => {
                const hasBleed = corruptedChannels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChannelId(c.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                      activeChannelId === c.id ? 'bg-white text-slate-900 font-bold border border-emerald-300 shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {hasBleed && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded border border-amber-200 animate-pulse font-bold">BLEED</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 2: Squad Coordination */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-amber-900 mb-1.5 px-2 flex items-center gap-1">
              <Cpu size={12} className="text-amber-700" /> Tier 2: Squad & Quest Tactics
            </div>
            <div className="space-y-1">
              {tier2Channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === c.id ? 'bg-white text-slate-900 font-bold border border-amber-300 shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier 3: Direct Citizen Links (NPC Affinity) */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-purple-900 mb-1.5 px-2 flex items-center gap-1">
              <UserCheck size={12} className="text-purple-700" /> Tier 3: Direct Citizen Links
            </div>
            <div className="space-y-1">
              {directs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveChannelId(d.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === d.id ? 'bg-white text-slate-900 font-bold border border-purple-300 shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grayed-Out Teasers (Locked Channels) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-2">
              🔒 Locked Network Channels
            </div>
            <div className="space-y-1 opacity-60 select-none">
              {lockedChannels.map((l) => (
                <div key={l.id} className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[10px]">
                  <div className="font-bold text-slate-700 truncate">{l.name}</div>
                  <div className="text-[8px] text-rose-700 mt-0.5">{l.req}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Terminal Feed */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#FAFBFD]">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs">
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{activeChannel.name}</span>
                {isCorrupted && <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">DATA BLEED DETECTED</span>}
              </div>
              <div className="text-[10px] text-slate-500">{activeChannel.desc || activeChannel.title || 'Official Network Channel'}</div>
            </div>

            {/* Run OS Diagnostic Button if Corrupted */}
            {isCorrupted && (
              <button
                onClick={handlePurgeCorruption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs hover:bg-amber-300 transition shadow-xs"
              >
                <RefreshCw size={13} /> Run Channel Diagnostic
              </button>
            )}
          </div>

          {/* Warden Bot Warning Alert */}
          {wardenAlert && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{wardenAlert}</span>
              </div>
              <button onClick={() => setWardenAlert(null)} className="text-rose-700 font-bold hover:text-rose-950">✕</button>
            </div>
          )}

          {/* NPC Vector Meter (Tier 3 Directs) */}
          {activeNPCVector && (
            <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div><span className="text-slate-500">Trust:</span> <span className="font-bold text-emerald-700">{activeNPCVector.trust}%</span></div>
              <div><span className="text-slate-500">Rivalry:</span> <span className="font-bold text-rose-700">{activeNPCVector.rivalry}%</span></div>
              <div><span className="text-slate-500">Friendship:</span> <span className="font-bold text-sky-700">{activeNPCVector.friendship}%</span></div>
              <div><span className="text-slate-500">Sync:</span> <span className="font-bold text-purple-700">{activeNPCVector.sync}%</span></div>
            </div>
          )}

          {/* Message List */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {(messages[activeChannelId] || []).map((m: any) => (
              <div key={m.id} className="max-w-[88%] rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs">
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-slate-900">{m.user} <span className="text-slate-400 font-normal">({m.team})</span></span>
                  <span className="text-slate-400">{m.time}</span>
                </div>
                <div className={`leading-relaxed ${isCorrupted ? 'text-amber-800 line-through decoration-amber-500/50' : 'text-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Direct Link Dialogue Options */}
          {isDirectLink && activeNPCVector && (
            <div className="p-3 border-t border-slate-200 bg-white space-y-2">
              <div className="text-[10px] font-bold text-purple-900 uppercase tracking-widest">Select Dialogue Response:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleNPCDialogue(activeChannel.npcKey, {
                    text: 'I agree, let us coordinate security protocols.',
                    npcResponse: 'Excellent choice. I have logged your authorization.',
                    trust: 10,
                    sync: 10
                  })}
                  className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 text-left text-[11px] transition shadow-xs"
                >
                  🤝 Cooperative Response (+Trust, +Sync)
                </button>
                <button
                  onClick={() => handleNPCDialogue(activeChannel.npcKey, {
                    text: 'I am running independent diagnostic scans.',
                    npcResponse: 'Proceed with caution. The lower conduits are erratic.',
                    rivalry: 10,
                    trust: 5
                  })}
                  className="p-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/70 text-amber-900 text-left text-[11px] transition shadow-xs"
                >
                  ⚡ Independent Approach (+Rivalry)
                </button>
              </div>
            </div>
          )}

          {/* Terminal Input Bar */}
          {!isReadOnly && (
            <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={chatDraft}
                  onChange={(e: any) => setChatDraft(e.target.value)}
                  placeholder={`Message ${activeChannel.name}...`}
                  className="flex-1 bg-slate-50 border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-lg px-3 py-2"
                />
                <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs">
                  <Send size={13} /> Send
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
