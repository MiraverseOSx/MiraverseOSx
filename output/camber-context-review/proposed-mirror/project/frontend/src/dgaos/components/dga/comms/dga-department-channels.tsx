'use client';

import React, { useState } from 'react';
import {
  Hash,
  Send,
  Paperclip,
  Bell,
  Radio,
  Users,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  AgencyChannelDef,
  ChannelMessage
} from '@/lib/comms-channels-data';
import { loadComms, saveComms } from '@/lib/comms-client';
import { playRadioChirp } from '@/lib/phone-audio';

interface DgaDepartmentChannelsProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DgaDepartmentChannels: React.FC<DgaDepartmentChannelsProps> = ({
  onOpenCase,
  onNavigateTab
}) => {
  const [channels, setChannels] = useState<AgencyChannelDef[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-homicide');
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [inputContent, setInputContent] = useState<string>('');

  const applySnapshot = (snapshot: Awaited<ReturnType<typeof loadComms>>) => {
    setChannels(snapshot.channels.map((channel) => ({ ...channel, unreadCount: 0 })));
    setMessages(snapshot.messages.filter((item) => item.kind === 'channel').map((item) => ({
      id: item.id,
      channelId: item.channelId || '',
      senderId: item.contactId || 'PLAYER',
      senderName: item.senderName,
      senderTitle: item.recipient,
      senderDepartment: 'Operations',
      senderAvatar: item.senderName.slice(0, 2).toUpperCase(),
      content: item.body,
      timestamp: item.createdAt,
      caseId: item.caseId
    })));
  };

  React.useEffect(() => {
    void loadComms().then(applySnapshot).catch(() => undefined);
    const timer = setInterval(() => { void loadComms().then(applySnapshot).catch(() => undefined); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  if (!activeChannel) {
    return <div className="p-6 text-[13px] text-[#5c5a74]">Loading department channels from the directory.</div>;
  }
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    playRadioChirp();

    const newMsg: ChannelMessage = {
      id: `MSG-${Date.now()}`,
      channelId: activeChannelId,
      senderId: 'PLAYER',
      senderName: 'Special Agent Miracle Jerome',
      senderTitle: 'Lead Case Investigator [HQ-04]',
      senderDepartment: 'Investigation',
      senderAvatar: 'MJ',
      content: inputContent.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    const sentText = inputContent.trim();
    setInputContent('');
    const channel = channels.find((item) => item.id === activeChannelId);
    void saveComms('send', {
      message: {
        kind: 'channel',
        channelId: activeChannelId,
        threadId: activeChannelId,
        recipient: channel?.name || activeChannelId,
        subject: 'Channel post',
        body: sentText,
        senderName: 'Special Agent Miracle Jerome'
      }
    }).then(applySnapshot);
  };

  return (
    <div className="flex-1 flex h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* LEFT CHANNEL DIRECTORY */}
      <div className="w-64 border-r border-[#cfcddb] bg-[#f8f7fc] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#cfcddb] flex items-center justify-between bg-[#f0eef6]">
          <div className="text-xs font-bold text-[#1f1e30] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#5d5a86]" />
            <span>DEPARTMENT CHANNELS</span>
          </div>
          <span className="text-[10px] font-mono text-[#4b4372] font-semibold bg-white px-1.5 py-0.2 rounded border border-[#cfcddb]">5 LIVE</span>
        </div>

        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          {channels.map((chan) => {
            const isActive = chan.id === activeChannelId;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannelId(chan.id)}
                className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1f1e30] font-bold shadow-xs border border-[#cfcddb]'
                    : 'text-[#555370] hover:bg-[#eae8f2] hover:text-[#1f1e30]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-[#5d5a86] shrink-0" />
                  <span className="truncate">{chan.name}</span>
                </div>
                {chan.unreadCount > 0 && !isActive && (
                  <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded border border-purple-300">
                    {chan.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Channel Info Footer */}
        <div className="p-3 border-t border-[#cfcddb] bg-[#f0eef6] text-[10.5px] text-[#5e5c7a]">
          <span className="font-bold text-[#1f1e30] block mb-0.5">{activeChannel.name}</span>
          <span className="leading-tight block">{activeChannel.topic}</span>
        </div>
      </div>

      {/* RIGHT MESSAGING CANVAS */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top Channel Header */}
        <div className="h-10 border-b border-[#cfcddb] bg-[#faf9fd] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#5d5a86]" />
            <span className="text-xs font-bold text-[#1f1e30]">{activeChannel.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-[#5e5c7a]">{activeChannel.topic}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            TYPE-1 ENCRYPTED STREAM
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f7fc]">
          {channelMessages.map((msg) => {
            const isPlayer = msg.senderId === 'PLAYER';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 p-3 rounded border transition-colors shadow-2xs ${
                  isPlayer
                    ? 'bg-[#f4f1fa] border-[#cfc7e8]'
                    : msg.isUrgent
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-white border-[#cfcddb]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#4b4372] border border-[#646187] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {msg.senderAvatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1f1e30]">{msg.senderName}</span>
                      <span className="text-[10px] text-[#5e5c7a] font-mono">[{msg.senderTitle}]</span>
                      {msg.isUrgent && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          URGENT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#797799]">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#2a293c] leading-relaxed">{msg.content}</p>

                  {/* Attachment Pill */}
                  {msg.attachmentName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-[#f0eef6] border border-[#cfcddb] px-2 py-1 rounded text-[11px] text-[#4b4372] font-medium">
                      <Paperclip className="w-3 h-3 text-[#5d5a86]" />
                      <span>{msg.attachmentName}</span>
                    </div>
                  )}

                  {/* Linked Case Button */}
                  {msg.caseId && onOpenCase && (
                    <div className="mt-1.5">
                      <button
                        onClick={() => onOpenCase(msg.caseId!)}
                        className="text-[10px] font-mono font-bold text-[#4b4372] hover:text-[#2b2640] underline cursor-pointer"
                      >
                        Jump to Linked Docket: {msg.caseId} →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#cfcddb] flex items-center gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={`Send tactical directive to ${activeChannel.name}...`}
            className="flex-1 bg-[#f8f7fc] border border-[#cfcddb] rounded px-3 py-2 text-xs text-[#1f1e30] placeholder-[#797799] focus:outline-none focus:border-[#4b4372] font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#4b4372] hover:bg-[#3b355d] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>DISPATCH</span>
          </button>
        </form>
      </div>
    </div>
  );
};
