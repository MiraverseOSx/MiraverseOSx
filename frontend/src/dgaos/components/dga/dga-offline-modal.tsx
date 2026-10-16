'use client';

import React from 'react';
import {
  Clock,
  Radio,
  Beaker,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SimulationSettings } from '@/lib/dga-types';
import { clearOfflineSummary } from '@/lib/dga-store';

interface DgaOfflineModalProps {
  offlineSummary: NonNullable<SimulationSettings['offlineEventsSummary']>;
  onClose: () => void;
}

export function DgaOfflineModal({
  offlineSummary,
  onClose
}: DgaOfflineModalProps) {
  const handleAcknowledge = async () => {
    await clearOfflineSummary();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1b1a26] border border-[#44425d] text-[#e3e1ed] rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 text-xs font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-[#2d2c3e] pb-3 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#9598c4]">
              WORKSTATION RECONNECTED
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">WELCOME BACK, OPERATOR</h2>
            <div className="text-[11px] text-[#9a98ba] mt-0.5 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#9598c4]" />
              <span>Workstation inactive: <strong className="text-white">{offlineSummary.elapsedFormatted}</strong></span>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            className="p-1 rounded text-[#7c7a9b] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlights List */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9598c4]">
            WHILE YOU WERE OFFLINE
          </div>

          <div className="bg-[#14131d] border border-[#2b2a3c] rounded p-3 space-y-2.5 max-h-56 overflow-y-auto font-mono text-[11px]">
            {offlineSummary.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[#c6c4dd] leading-relaxed">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#29283a] text-[10px] text-[#787698]">
          <span>DGAOS BACKGROUND ENGINE SYNCED</span>
          <button
            onClick={handleAcknowledge}
            className="px-4 py-1.5 bg-[#524f77] hover:bg-[#63608d] text-white rounded text-xs font-bold transition-all shadow cursor-pointer"
          >
            Enter Workstation
          </button>
        </div>
      </div>
    </div>
  );
}
