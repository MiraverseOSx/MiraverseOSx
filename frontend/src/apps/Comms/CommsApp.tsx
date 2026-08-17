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
  const [wardenAlert, setWardenAlert] = useState(null);

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

  const activeChannel = useMemo(() => {
    return allActiveChannels.find((c) => c.id === activeChannelId) || { name: activeChannelId, id: activeChannelId };
  }, [allActiveChannels, activeChannelId]);

  const isDirectLink = activeChannelId.startsWith('dm:');
  const isReadOnly = activeChannel.readOnly;
  const isCorrupted = corruptedChannels.includes(activeChannelId);

  // Send Message with DGA Surveillance Monitoring
  const handleSendMessage = (e) => {
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
      user: player.name || 'Provisional Citizen',
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
  const handleNPCDialogue = (npcKey, choice) => {
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

  const activeNPCVector = isDirectLink ? player.npcVectors?.[activeChannel.npcKey] : null;

  return (
    <div className="flex h-full w-full flex-col bg-[#090b14] text-[#d1d5db] font-mono text-xs select-none">
      {/* Top Network Status Bar */}
      <div className="flex h-11 items-center justify-between border-b border-[#222944] bg-[#0d101f] px-4">
        <div className="flex items-center gap-2.5">
          <Radio size={16} className="text-[#38bdf8] animate-pulse" />
          <span className="font-bold text-white tracking-wider uppercase">Comms Terminal</span>
          <span className="text-white/30">|</span>
          <span className="text-[#38bdf8] font-semibold">{activeChannel.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Encryption Toggle Button */}
          <button
            onClick={toggleEncryption}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
              encryptionActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-[#171c33] border-[#2d3659] text-white/50 hover:text-white'
            }`}
          >
            {encryptionActive ? <Lock size={12} /> : <Unlock size={12} />}
            <span>{encryptionActive ? 'ENCRYPTED SUB-CHANNEL' : 'UNENCRYPTED (MONITORED)'}</span>
          </button>

          {/* DGA Investigation Status */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            investigationFlags > 0 ? 'bg-rose-950/60 border-rose-500/60 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            DGA Flags: {investigationFlags}
          </span>
        </div>
      </div>

      {/* Main Terminal Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Tiered Sidebar Navigation */}
        <div className="w-[26%] min-w-48 max-w-64 shrink-0 border-r border-[#222944] bg-[#0c0f1c] p-3 overflow-y-auto space-y-4">
          
          {/* Tier 0: System Alerts */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#38bdf8] mb-1.5 px-2 flex items-center gap-1">
              <Shield size={12} /> Tier 0: System & Civic Alerts
            </div>
            <div className="space-y-1">
              {tier0Channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === c.id ? 'bg-[#1d2645] text-white font-bold border border-[#38bdf8]/40' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded">READ-ONLY</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier 1: Faction & District Rooms */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5 px-2 flex items-center gap-1">
              <Radio size={12} /> Tier 1: District & Faction Rooms
            </div>
            <div className="space-y-1">
              {tier1Channels.map((c) => {
                const hasBleed = corruptedChannels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChannelId(c.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                      activeChannelId === c.id ? 'bg-[#1d2645] text-white font-bold border border-emerald-400/40' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {hasBleed && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded animate-pulse">BLEED</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 2: Squad Coordination */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1.5 px-2 flex items-center gap-1">
              <Cpu size={12} /> Tier 2: Squad & Quest Tactics
            </div>
            <div className="space-y-1">
              {tier2Channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === c.id ? 'bg-[#1d2645] text-white font-bold border border-amber-400/40' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier 3: Direct Citizen Links (NPC Affinity) */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-purple-400 mb-1.5 px-2 flex items-center gap-1">
              <UserCheck size={12} /> Tier 3: Direct Citizen Links
            </div>
            <div className="space-y-1">
              {directs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveChannelId(d.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                    activeChannelId === d.id ? 'bg-[#1d2645] text-white font-bold border border-purple-400/40' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grayed-Out Teasers (Locked Channels) */}
          <div className="pt-2 border-t border-[#222944]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-2">
              🔒 Locked Network Channels
            </div>
            <div className="space-y-1 opacity-50 select-none">
              {lockedChannels.map((l) => (
                <div key={l.id} className="p-2 rounded-lg bg-[#141829] border border-slate-800 text-[10px]">
                  <div className="font-bold text-slate-400 truncate">{l.name}</div>
                  <div className="text-[8px] text-rose-400/80 mt-0.5">{l.req}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Terminal Feed */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#070912]">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-[#222944] bg-[#0d101f] px-4 py-2 text-xs">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>{activeChannel.name}</span>
                {isCorrupted && <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">DATA BLEED DETECTED</span>}
              </div>
              <div className="text-[10px] text-slate-400">{activeChannel.desc || activeChannel.title || 'Official Network Channel'}</div>
            </div>

            {/* Run OS Diagnostic Button if Corrupted */}
            {isCorrupted && (
              <button
                onClick={handlePurgeCorruption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
              >
                <RefreshCw size={13} /> Run Channel Diagnostic
              </button>
            )}
          </div>

          {/* Warden Bot Warning Alert */}
          {wardenAlert && (
            <div className="p-3 bg-rose-950/80 border-b border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>{wardenAlert}</span>
              </div>
              <button onClick={() => setWardenAlert(null)} className="text-rose-400 font-bold hover:text-white">✕</button>
            </div>
          )}

          {/* NPC Vector Meter (Tier 3 Directs) */}
          {activeNPCVector && (
            <div className="p-3 bg-[#111629] border-b border-[#222944] grid grid-cols-4 gap-2 text-[10px]">
              <div><span className="text-slate-400">Trust:</span> <span className="font-bold text-emerald-400">{activeNPCVector.trust}%</span></div>
              <div><span className="text-slate-400">Rivalry:</span> <span className="font-bold text-rose-400">{activeNPCVector.rivalry}%</span></div>
              <div><span className="text-slate-400">Friendship:</span> <span className="font-bold text-cyan-400">{activeNPCVector.friendship}%</span></div>
              <div><span className="text-slate-400">Sync:</span> <span className="font-bold text-purple-400">{activeNPCVector.sync}%</span></div>
            </div>
          )}

          {/* Message List */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {(messages[activeChannelId] || []).map((m) => (
              <div key={m.id} className="max-w-[88%] rounded-xl border border-[#222944] bg-[#0e1224] p-3 text-xs shadow-sm">
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-[#38bdf8]">{m.user} <span className="text-slate-500 font-normal">({m.team})</span></span>
                  <span className="text-slate-500">{m.time}</span>
                </div>
                <div className={`leading-relaxed ${isCorrupted ? 'text-amber-200 line-through decoration-amber-500/50' : 'text-slate-200'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Direct Link Dialogue Options */}
          {isDirectLink && activeNPCVector && (
            <div className="p-3 border-t border-[#222944] bg-[#0e1224] space-y-2">
              <div className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Select Dialogue Response:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleNPCDialogue(activeChannel.npcKey, {
                    text: 'I agree, let us coordinate security protocols.',
                    npcResponse: 'Excellent choice. I have logged your authorization.',
                    trust: 10,
                    sync: 10
                  })}
                  className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-left text-[11px] transition"
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
                  className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-left text-[11px] transition"
                >
                  ⚡ Independent Approach (+Rivalry)
                </button>
              </div>
            </div>
          )}

          {/* Terminal Input Bar */}
          {!isReadOnly && (
            <form onSubmit={handleSendMessage} className="border-t border-[#222944] bg-[#0d101f] p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder={`Message ${activeChannel.name}...`}
                  className="flex-1 bg-[#060810] border-[#222944] text-xs text-white placeholder:text-slate-600 rounded-lg px-3 py-2"
                />
                <Button type="submit" size="sm" variant="solid" className="flex items-center gap-1.5 px-4 py-2 bg-[#38bdf8] text-black font-bold hover:bg-[#7dd3fc]">
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
