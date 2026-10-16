'use client';

import React from 'react';
import {
  Activity,
  X,
  Radio,
  Clock,
  Shield,
  Beaker,
  Globe,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { AgencyActivityItem } from '@/lib/dga-types';

interface DgaAgencyFeedDrawerProps {
  activityFeed: AgencyActivityItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
  unacknowledgedCount?: number;
  onAcknowledgeAll?: () => void;
}

export function DgaAgencyFeedDrawer({
  activityFeed,
  isOpen,
  onClose,
  onSelectCase,
  unacknowledgedCount = 0,
  onAcknowledgeAll
}: DgaAgencyFeedDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-[#1a1925] border-l border-[#2d2c3e] text-[#e0deeb] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-xs font-sans">
        {/* Header */}
        <div className="p-4 border-b border-[#2d2c3e] flex items-center justify-between bg-[#151420]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#9598c4]" />
            <div>
              <div className="font-bold text-sm text-white font-mono tracking-tight flex items-center gap-2">
                <span>GLOBAL AGENCY ACTIVITY FEED</span>
                {unacknowledgedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    {unacknowledgedCount} NEW
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#7d7b9d]">Department of Global Affairs // Real-Time Log</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unacknowledgedCount > 0 && onAcknowledgeAll && (
              <button
                onClick={onAcknowledgeAll}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] font-mono font-bold border border-amber-500/50 transition-colors cursor-pointer"
              >
                ACKNOWLEDGE ALL
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-[#7d7b9d] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#262537]">
          {activityFeed.map((item) => (
            <div key={item.id} className="pt-2.5 first:pt-0 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono px-1.5 py-0.2 rounded bg-[#2b2a3c] text-[#c1b4d9] border border-[#3e3c55]">
                    {item.system}
                  </span>
                  {item.caseId && (
                    <button
                      onClick={() => onSelectCase && onSelectCase(item.caseId!)}
                      className="font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      {item.caseId}
                    </button>
                  )}
                </div>
                <span className="text-[#737190] font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="font-bold text-white text-xs leading-snug">
                {item.headline}
              </div>

              <div className="text-[11px] text-[#9a98ba] leading-relaxed">
                {item.details}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2d2c3e] bg-[#151420] text-[10px] text-[#787698] flex items-center justify-between">
          <span>MONITORING ALL 9 DGA SUBSYSTEMS</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#37354c] hover:bg-[#484664] text-white rounded text-xs cursor-pointer"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
}
