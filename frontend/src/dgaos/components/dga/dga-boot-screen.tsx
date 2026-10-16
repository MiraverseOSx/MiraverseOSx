'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Terminal, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { DGAAgentProfile } from '@/lib/dga-types';

interface DgaBootScreenProps {
  profile: DGAAgentProfile;
  onAuthenticated: () => void;
}

export function DgaBootScreen({ profile, onAuthenticated }: DgaBootScreenProps) {
  const [bootStep, setBootStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [securityToken, setSecurityToken] = useState<string>('••••••••••••');

  const bootLogs = [
    'ESTABLISHING HARDWARE CRYPTO-ROOT (TPM 2.4)... SECURE',
    'CONNECTING TO DGA DIPLOMATIC SATELLITE LINK [SAT-LINK-ALPHA]... SYNCED (14ms)',
    'CHECKING INTEGRITY OF CLASSIFIED RECORD ENCLAVES (CASES, WIRETAPS, AGENTS)... VERIFIED',
    'MOUNTING TRACE FORENSIC LABORATORY SUITE API... ACTIVE (PIPE /api/records)',
    'READY FOR OPERATOR HANDSHAKE. CLEARANCE LEVEL 5 REQUIRED.'
  ];

  useEffect(() => {
    if (bootStep < bootLogs.length) {
      const timer = setTimeout(() => {
        setBootStep((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bootStep, bootLogs.length]);

  const handleAuthenticate = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onAuthenticated();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e28] text-[#e2e1ec] flex flex-col justify-between p-8 font-mono select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#3b3a4a] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#4f4d6d] flex items-center justify-center text-white shadow-sm border border-[#6f6c99]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#a8a6c8]">United States Government</div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              DEPARTMENT OF GLOBAL AFFAIRS
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-[#333246] text-[#b6b4d6] border border-[#4e4c6a]">
                DGAOS v4.2-SEC
              </span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-[#a8a6c8] space-y-0.5">
          <div>NODE: <span className="text-white font-semibold">HQ-ENCLAVE-04</span></div>
          <div>CIPHER SUITE: <span className="text-emerald-400">AES-256-GCM / POST-QUANTUM 3</span></div>
          <div>STATUS: <span className="text-amber-300">AUTHENTICATION CHALLENGE</span></div>
        </div>
      </div>

      {/* Main Terminal & Credential Box */}
      <div className="max-w-2xl w-full mx-auto my-auto space-y-6">
        {/* Terminal Boot Sequence */}
        <div className="bg-[#171720] border border-[#3b3a4a] rounded-lg p-5 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#2d2c3c] pb-2 mb-3 text-[#8785a8]">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#a8a6c8]" />
              SYSTEM BOOT & SUBSYSTEM ENUMERATION
            </span>
            <span>SECURE BOOT PASS</span>
          </div>

          <div className="space-y-1.5 font-mono text-[#c5c3e0]">
            {bootLogs.slice(0, bootStep).map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#6d6b8f] select-none">[{idx + 1}]</span>
                <span className={idx === bootStep - 1 ? 'text-white font-medium' : ''}>{log}</span>
              </div>
            ))}
            {bootStep < bootLogs.length && (
              <div className="flex items-center gap-2 text-[#8785a8]">
                <Cpu className="w-3 h-3 animate-spin text-[#a8a6c8]" />
                <span className="animate-pulse">Loading core subroutines...</span>
              </div>
            )}
          </div>
        </div>

        {/* Operator Authentication Form */}
        {bootStep >= bootLogs.length && (
          <div className="bg-[#242331] border border-[#4c4a63] rounded-lg p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between border-b border-[#3b3a4a] pb-4">
              <div>
                <div className="text-xs uppercase text-[#9f9dc0] font-semibold tracking-wider">Identified Workstation Operator</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {profile.name}
                </div>
                <div className="text-xs text-[#a8a6c8] mt-0.5">
                  Badge: <span className="text-white font-medium">{profile.badgeNumber}</span> • {profile.title}
                </div>
                <div className="text-[11px] text-[#807e9f] mt-0.5">
                  Assignment: {profile.division}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60 text-xs font-semibold">
                  <Lock className="w-3 h-3" />
                  LEVEL {profile.clearanceLevel}
                </span>
                <div className="text-[10px] text-[#8e8cae] mt-1">{profile.callsign}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#a8a6c8] mb-1">
                  SECURITY TOKEN / SMART-CARD PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled={isVerifying}
                    value={securityToken}
                    onChange={(e) => setSecurityToken(e.target.value)}
                    className="w-full bg-[#171720] border border-[#3b3a4a] rounded px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#7c79a8]"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    HW TOKEN DETECTED
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAuthenticate}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 bg-[#5d5a86] hover:bg-[#6e6a9c] active:bg-[#4f4c74] text-white font-bold py-2.5 px-4 rounded text-sm transition-all shadow hover:shadow-lg disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      INITIALIZING WORKSTATION ENCLAVE...
                    </>
                  ) : (
                    <>
                      <span>UNLOCK DGA COMMAND SHELL</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#78769c] pt-2 border-t border-[#313042]">
              <span>UNAUTHORIZED ACCESS STRICTLY PROHIBITED (18 U.S.C. § 1030)</span>
              <span>NODE: LATENCY 14MS</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-[#716f94] border-t border-[#2e2d3d] pt-3">
        <div>DGAOS VERSION 4.2.1-RELEASE • BUILD 2026.09</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            TRACE LAB DAEMON RUNNING
          </span>
          <span>STATION HQ-04</span>
        </div>
      </div>
    </div>
  );
}
