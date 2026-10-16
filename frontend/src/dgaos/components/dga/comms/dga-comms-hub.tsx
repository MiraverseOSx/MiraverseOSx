'use client';

import React, { useState } from 'react';
import {
  Mail,
  Radio,
  PhoneCall,
  Users,
  Shield,
  Sparkles,
  Phone,
  Voicemail
} from 'lucide-react';
import { DgaDepartmentChannels } from './dga-department-channels';
import { DgaPhoneConsole } from '../phone/dga-phone-console';
import { ContactManager } from './contact-manager';
import { MessageEventBuilder } from './message-builder';
import { MailDesk } from './mail-desk';
import { INITIAL_NPC_ROSTER } from '@/lib/simulation/npc-agency-engine';
import { DGACommunication, DGACase } from '@/lib/dga-types';

interface DgaCommsHubProps {
  messages: DGACommunication[];
  cases: DGACase[];
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
  initialMode?: 'mail' | 'channels' | 'phone' | 'roster' | 'contacts' | 'builder';
}

export function DgaCommsHub({
  messages,
  cases,
  onOpenCase,
  onNavigateTab,
  initialMode = 'mail'
}: DgaCommsHubProps) {
  const [activeMode, setActiveMode] = useState<'mail' | 'channels' | 'phone' | 'roster' | 'contacts' | 'builder'>(initialMode);
  const unreadMails = messages.filter((m) => !m.read).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* TOP COMMUNICATIONS MASTER NAVIGATION STRIP */}
      <div className="h-11 bg-white border-b border-[#cfcddb] px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#5d5a86]" />
          <span className="text-[12px] font-bold text-[#1f1e30] tracking-wide uppercase">
            AGENCY COMMUNICATIONS SUITE
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f0eef6] text-[#4b4372] border border-[#cfcddb] font-semibold">
            NODE COMMS-HQ
          </span>
        </div>

        {/* Pillar Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#f0eef6] p-1 rounded border border-[#cfcddb]">
          <button
            onClick={() => setActiveMode('mail')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'mail'
                ? 'bg-[#4b4372] text-white shadow-2xs font-bold'
                : 'text-[#555370] hover:text-[#1f1e30] hover:bg-[#e4e2ee]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Secure Cables</span>
            {unreadMails > 0 && (
              <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-900 px-1 py-0.2 rounded border border-purple-300">
                {unreadMails}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMode('channels')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'channels'
                ? 'bg-[#4b4372] text-white shadow-2xs font-bold'
                : 'text-[#555370] hover:text-[#1f1e30] hover:bg-[#e4e2ee]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Department Channels</span>
          </button>

          <button
            onClick={() => setActiveMode('phone')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'phone'
                ? 'bg-[#4b4372] text-white shadow-2xs font-bold'
                : 'text-[#555370] hover:text-[#1f1e30] hover:bg-[#e4e2ee]'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Phone & Voicemail</span>
          </button>

          <button
            onClick={() => setActiveMode('roster')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeMode === 'roster'
                ? 'bg-[#4b4372] text-white shadow-2xs font-bold'
                : 'text-[#555370] hover:text-[#1f1e30] hover:bg-[#e4e2ee]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agent Coworker Roster</span>
          </button>
          <button type="button" onClick={() => setActiveMode('contacts')} className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${activeMode === 'contacts' ? 'bg-[#4b4372] text-white' : 'text-[#555370]'}`}>Contacts</button>
          <button type="button" onClick={() => setActiveMode('builder')} className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${activeMode === 'builder' ? 'bg-[#4b4372] text-white' : 'text-[#555370]'}`}>Builder</button>
        </div>
      </div>

      {/* PILLAR CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeMode === 'mail' && <MailDesk />}

        {activeMode === 'channels' && (
          <DgaDepartmentChannels onOpenCase={onOpenCase} onNavigateTab={onNavigateTab} />
        )}

        {activeMode === 'phone' && (
          <DgaPhoneConsole onOpenCase={onOpenCase} onNavigateTab={onNavigateTab} />
        )}

        {activeMode === 'contacts' && <ContactManager />}
        {activeMode === 'builder' && <MessageEventBuilder />}

        {activeMode === 'roster' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
              <div>
                <h3 className="text-base font-bold text-[#1f1e30]">ACTIVE INVESTIGATING AGENT COWORKERS</h3>
                <div className="text-xs text-[#5e5c7a]">
                  Simulated autonomous NPC agents with dynamic stress levels, on-duty locations, and assigned casework.
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#4b4372] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                5 Active Operators
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_NPC_ROSTER.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-xs hover:border-[#5d5a86] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4b4372] border border-[#646187] flex items-center justify-center font-bold text-sm text-white">
                        {agent.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1f1e30]">{agent.name}</h4>
                        <div className="text-xs text-[#5e5c7a] font-medium">{agent.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {agent.status}
                    </span>
                  </div>

                  <div className="text-xs bg-[#f8f7fc] p-2.5 rounded border border-[#e4e2ee] space-y-1">
                    <div>
                      <span className="text-[10px] font-bold text-[#5e5c7a] uppercase">CURRENT ASSIGNED TASK:</span>
                      <span className="text-[#1f1e30] ml-1 font-medium block">{agent.currentTaskTitle}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#5e5c7a]">
                      <span>Department: {agent.department}</span>
                      <span>Extension: {agent.phoneExtension}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#5e5c7a]">Stress:</span>
                      <span className={`font-mono font-bold ${
                        agent.stressLevel === 'Critical'
                          ? 'text-rose-700'
                          : agent.stressLevel === 'Elevated'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}>
                        {agent.stressLevel}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveMode('phone')}
                      className="px-2.5 py-1 bg-[#4b4372] hover:bg-[#3b355d] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-purple-200" />
                      <span>Direct Voice Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
