"use client";

import React, { useEffect } from "react";
import {
  PhoneSurface,
  PhonePanel,
  PhoneButton,
} from "../../../../components/phone/PhonePrimitives";
import { Phone, PhoneOff, PhoneCall, Volume2, Shield } from "lucide-react";
import { playPhoneRingTone } from "@/lib/phone-audio";

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
    <PhoneSurface
      className="agency-incoming-overlay"
      aria-label="Incoming agency call"
    >
      <PhonePanel className="agency-incoming-panel space-y-6">
        {/* Animated glowing border banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--phone-accent)] via-[var(--phone-danger)] to-[var(--phone-accent)] animate-pulse" />

        {/* Incoming Telephony Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--phone-danger)] animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[color:var(--phone-accent)] uppercase">
              INCOMING SECURE PRIORITY CALL
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--phone-canvas)] text-[color:var(--phone-accent)] border border-[var(--phone-border)] font-semibold">
            TYPE-1 CRYPTO
          </span>
        </div>

        {/* Caller Avatar & Bio */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-20 h-20 rounded-full bg-[var(--phone-surface-raised)] border-2 border-[var(--phone-accent)] flex items-center justify-center text-2xl font-bold text-[color:var(--phone-accent)] shadow-md animate-bounce">
            {callerAvatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[color:var(--phone-text)] tracking-wide">
              {callerName}
            </h2>
            <div className="text-xs text-[color:var(--phone-accent)] font-semibold">
              {callerTitle}
            </div>
            <div className="text-[11px] text-[color:var(--phone-muted)] mt-0.5">
              {callerDepartment}
            </div>
          </div>
        </div>

        {/* Pre-recorded spoken soundbite or hook */}
        <div className="bg-[var(--phone-canvas)] border border-[var(--phone-border)] rounded-lg p-3.5 text-center">
          <div className="text-xs text-[color:var(--phone-text)] italic font-medium leading-relaxed">
            “{headlineMessage}”
          </div>
        </div>

        {/* Action Buttons: Accept / Decline */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <PhoneButton
            onClick={onDecline}
            tone="danger"
            className="py-3 px-4 bg-[var(--phone-danger)] hover:bg-[var(--phone-danger)] border border-[var(--phone-danger)] text-[color:var(--phone-danger)] rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>SEND TO VM</span>
          </PhoneButton>

          <PhoneButton
            onClick={onAccept}
            tone="success"
            className="py-3 px-4 bg-[var(--phone-success)] hover:bg-[var(--phone-success)] border border-[var(--phone-success)] text-[color:var(--phone-on-accent)] rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>ACCEPT CALL</span>
          </PhoneButton>
        </div>
      </PhonePanel>
    </PhoneSurface>
  );
}
