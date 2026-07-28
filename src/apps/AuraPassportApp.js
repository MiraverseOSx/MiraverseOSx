import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

export default function AuraPassportApp() {
  const [isFlipped, setIsFlipped] = useState(false);
  const player = useOSStore((s) => s.gameplay.player);

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-[#FAF8FF] to-[#F0E9FC] p-6 text-slate-800 text-xs select-none overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-200/80 pb-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-purple-950">💳 Aura Passport & Student Registry</h2>
          <p className="text-[11px] text-slate-600">Cyacademy Student & Lineage Identification Card</p>
        </div>
        <button
          onClick={() => setIsFlipped((prev) => !prev)}
          className="rounded-xl border border-purple-300 bg-purple-100/80 px-4 py-2 text-xs font-bold text-purple-950 hover:bg-purple-200 transition shadow-sm"
        >
          🔄 Flip ID Card
        </button>
      </div>

      {/* 3D Flippable Card Area */}
      <div className="flex flex-col items-center justify-center my-4">
        <div
          className="relative w-[420px] h-[260px] cursor-pointer group"
          style={{ perspective: '1200px' }}
          onClick={() => setIsFlipped((prev) => !prev)}
          title="Click to flip ID Card"
        >
          <div
            className="w-full h-full relative transition-transform duration-700 rounded-2xl shadow-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front Side */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-200 bg-white shadow-xl flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img
                src="/front_id_card.svg"
                alt="Front ID Card"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Back Side */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-200 bg-white shadow-xl flex items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <img
                src="/back_id_card.svg"
                alt="Back ID Card"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-purple-800 font-semibold">
          {isFlipped ? '◀ Showing BACK View (Click card to Flip Front)' : '▶ Showing FRONT View (Click card to Flip Back)'}
        </div>
      </div>

      {/* Identity & Clearance Details Panel */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 space-y-2 shadow-sm">
          <div className="text-purple-900 font-bold text-xs uppercase tracking-wider">Student Profile</div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">Name:</span>
            <span className="font-bold text-slate-900">PLAYERNAME</span>
          </div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">ID Serial:</span>
            <span className="font-mono text-purple-800 font-semibold">CY-9021-X9</span>
          </div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">Level:</span>
            <span className="font-bold text-emerald-700">Level {player.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Credits:</span>
            <span className="font-bold text-emerald-700">₡{player.credits}</span>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 space-y-2 shadow-sm">
          <div className="text-purple-900 font-bold text-xs uppercase tracking-wider">Clearance Status</div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">Aura Synced:</span>
            <span className="text-emerald-700 font-bold">● ACTIVE</span>
          </div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">Faith Medical:</span>
            <span className="text-purple-900 font-semibold">VERIFIED</span>
          </div>
          <div className="flex justify-between border-b border-purple-100 pb-1">
            <span className="text-slate-500">Lineage:</span>
            <span className="text-slate-800">Cyacademy Netrunner</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Rift Access:</span>
            <span className="text-purple-700 font-bold">AUTHORIZED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
