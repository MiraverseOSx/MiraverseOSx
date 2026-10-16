'use client';

import React from 'react';
import {
  Shield,
  Lock,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  X,
  User,
  Cpu,
  FileCheck
} from 'lucide-react';
import { DGAAgentProfile } from '@/lib/dga-types';

interface DgaAgentProfileModalProps {
  profile: DGAAgentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function DgaAgentProfileModal({
  profile,
  isOpen,
  onClose
}: DgaAgentProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#1f1e2c] border border-[#3f3d57] text-[#e3e1ed] rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35334a] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4f4c75] to-[#2c2a44] border border-[#6d6a9a] flex items-center justify-center text-white font-mono font-bold text-base shadow-sm">
              MJ
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#9598c4]">
                FEDERAL OPERATOR CREDENTIAL
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">{profile.name}</h2>
              <div className="text-[11px] text-[#a9a7c6]">
                {profile.title} • <span className="font-mono text-white">{profile.badgeNumber}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8482a4] hover:text-white hover:bg-[#2c2b3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clearance Card */}
        <div className="bg-[#29283b] border border-[#43415c] rounded p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9391b1] font-semibold uppercase">SECURITY CLEARANCE LEVEL</div>
            <div className="text-sm font-extrabold text-amber-300 font-mono flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
              <span>LEVEL {profile.clearanceLevel} {'//'} TOP SECRET / NOFORN</span>
            </div>
            <div className="text-[10px] text-[#8684a2] mt-0.5">Special Access Required (SAR) Authorization Active</div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">
            HW TOKEN DETECTED
          </span>
        </div>

        {/* Operational Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded space-y-0.5">
            <span className="text-[10px] text-[#8381a1] uppercase block">ASSIGNMENT DIVISION</span>
            <span className="font-bold text-white">{profile.division}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded space-y-0.5">
            <span className="text-[10px] text-[#8381a1] uppercase block">CURRENT STATION</span>
            <span className="font-bold text-white">{profile.station}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded space-y-0.5">
            <span className="text-[10px] text-[#8381a1] uppercase block">CALLSIGN</span>
            <span className="font-bold font-mono text-[#c1b4d9]">{profile.callsign}</span>
          </div>
          <div className="bg-[#262537] border border-[#39374e] p-2.5 rounded space-y-0.5">
            <span className="text-[10px] text-[#8381a1] uppercase block">DATE COMMISSIONED</span>
            <span className="font-bold font-mono text-white">{profile.dateAssigned}</span>
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9598c4] flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-[#9598c4]" />
            <span>OPERATIONAL SPECIALIZATIONS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.specializations.map((spec, i) => (
              <span
                key={i}
                className="text-[10px] bg-[#2d2b3f] border border-[#43415e] text-[#d6d4ea] px-2 py-0.5 rounded font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Commendations */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9598c4] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#9598c4]" />
            <span>DIRECTORATE COMMENDATIONS & MEDALS</span>
          </div>
          <div className="space-y-1">
            {profile.commendations.map((comm, i) => (
              <div
                key={i}
                className="text-[11px] text-[#b9b7d3] bg-[#262537] border border-[#37354b] p-1.5 rounded flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{comm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#313045] text-[10px] text-[#787698]">
          <span>DGA EXECUTIVE SECURITY PROTOCOL § 1030</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#524f77] hover:bg-[#63608d] text-white rounded text-xs font-semibold"
          >
            Close Credential
          </button>
        </div>
      </div>
    </div>
  );
}
