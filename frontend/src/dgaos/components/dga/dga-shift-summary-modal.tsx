'use client';

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Briefcase,
  CheckCircle2,
  Send,
  Scale,
  X,
  Award
} from 'lucide-react';
import { DgaSession, DGAAgentProfile } from '@/lib/dga-types';
import { endCurrentShift } from '@/lib/dga-store';

interface DgaShiftSummaryModalProps {
  session: DgaSession;
  profile: DGAAgentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function DgaShiftSummaryModal({
  session,
  profile,
  isOpen,
  onClose
}: DgaShiftSummaryModalProps) {
  const [shiftNotes, setShiftNotes] = useState('');
  const [isConcluded, setIsConcluded] = useState(false);

  if (!isOpen) return null;

  const startTime = new Date(session.startTime);
  const now = new Date();
  const elapsedMinutes = Math.max(1, Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60)));
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMins = elapsedMinutes % 60;
  const durationStr = elapsedHours > 0 ? `${elapsedHours}h ${remainingMins}m` : `${elapsedMinutes}m`;

  const handleEndShift = async () => {
    await endCurrentShift(shiftNotes);
    setIsConcluded(true);
    setTimeout(() => {
      setIsConcluded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#1f1e2c] border border-[#3f3d57] text-[#e3e1ed] rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35334a] pb-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#9598c4]">
              OPERATIONAL WORKSTATION LOG
            </div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>OFFICIAL DGA SHIFT SUMMARY</span>
            </h2>
            <div className="text-[11px] text-[#a9a7c6] mt-0.5">
              Operator: <strong className="text-white">{profile.name}</strong> ({profile.badgeNumber}) • {profile.station}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8482a4] hover:text-white hover:bg-[#2c2b3d] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">SHIFT DURATION</span>
            <span className="text-sm font-bold font-mono text-white">{durationStr}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">CASES WORKED</span>
            <span className="text-sm font-bold font-mono text-white">{session.casesWorked}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">DIRECTIVES COMPLETED</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{session.actionsTaken}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">EVIDENCE SUBMITTED</span>
            <span className="text-sm font-bold font-mono text-white">{session.evidenceSubmitted}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">CABLES DISPATCHED</span>
            <span className="text-sm font-bold font-mono text-white">{session.messagesSent}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded">
            <span className="text-[10px] text-[#8482a2] uppercase block font-semibold">MAJOR DECISIONS</span>
            <span className="text-sm font-bold font-mono text-amber-300">{session.decisionsMade}</span>
          </div>
        </div>

        {/* Shift Notes Input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9598c4]">
            OPERATOR SHIFT HANDOVER REMARKS
          </label>
          <textarea
            rows={3}
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="Record pending investigative leads, laboratory requisitions awaiting delivery, or diplomatic surveillance caveats..."
            className="w-full bg-[#181722] border border-[#39374e] rounded p-2 text-xs text-[#e0deeb] focus:outline-none focus:border-[#7c79a8] font-mono leading-relaxed"
          />
        </div>

        {/* Footer & Submission */}
        <div className="flex items-center justify-between pt-2 border-t border-[#313045] text-[10px]">
          <span className="text-[#787698]">RECORDED TO DIRECTORATE ARCHIVE ENCLAVE</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#3f3d57] text-[#a9a7c6] hover:bg-[#2c2a3e] rounded text-xs cursor-pointer"
            >
              Resume Shift
            </button>
            <button
              onClick={handleEndShift}
              disabled={isConcluded}
              className="px-4 py-1.5 bg-[#524f77] hover:bg-[#63608d] text-white rounded text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isConcluded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHIFT CONCLUDED</span>
                </>
              ) : (
                <span>CONCLUDE SHIFT</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
