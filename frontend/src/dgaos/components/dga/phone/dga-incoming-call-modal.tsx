'use client';

import React, { useEffect } from 'react';
import { Phone, PhoneOff, PhoneCall, Volume2, Shield } from 'lucide-react';
import { playPhoneRingTone } from '@/lib/phone-audio';

interface DgaIncomingCallModalProps {
  callerName: string;
  callerTitle: string;
  callerDepartment: string;
  callerAvatar: string;
  headlineMessage: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function DgaIncomingCallModal({
  callerName,
  callerTitle,
  callerDepartment,
  callerAvatar,
  headlineMessage,
  onAccept,
  onDecline,
}: DgaIncomingCallModalProps) {
  useEffect(() => {
    // Start synthesizing government dual-frequency ringtone
    const stopRing = playPhoneRingTone();
    return () => {
      stopRing();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#1f1e30]/60 flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white border-2 border-[#4b4372] rounded-xl max-w-md w-full p-6 text-[#1f1e30] shadow-2xl space-y-6 relative overflow-hidden">
        {/* Animated glowing border banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4b4372] via-rose-500 to-[#4b4372] animate-pulse" />

        {/* Incoming Telephony Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#4b4372] uppercase">
              INCOMING SECURE PRIORITY CALL
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f0eff5] text-[#4b4372] border border-[#cfcddb] font-semibold">
            TYPE-1 CRYPTO
          </span>
        </div>

        {/* Caller Avatar & Bio */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-20 h-20 rounded-full bg-[#edeaf6] border-2 border-[#4b4372] flex items-center justify-center text-2xl font-bold text-[#362f59] shadow-md animate-bounce">
            {callerAvatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1f1e30] tracking-wide">{callerName}</h2>
            <div className="text-xs text-[#4b4372] font-semibold">{callerTitle}</div>
            <div className="text-[11px] text-[#5e5c7a] mt-0.5">{callerDepartment}</div>
          </div>
        </div>

        {/* Pre-recorded spoken soundbite or hook */}
        <div className="bg-[#f8f7fc] border border-[#cfcddb] rounded-lg p-3.5 text-center">
          <div className="text-xs text-[#2c2a3e] italic font-medium leading-relaxed">
            “{headlineMessage}”
          </div>
        </div>

        {/* Action Buttons: Accept / Decline */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onDecline}
            className="py-3 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneOff className="w-4 h-4 text-rose-600" />
            <span>SEND TO VM</span>
          </button>

          <button
            onClick={onAccept}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 border border-emerald-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg animate-pulse"
          >
            <PhoneCall className="w-4 h-4 text-white" />
            <span>ACCEPT CALL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
