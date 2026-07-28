import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { GripHorizontal, Sparkles, ShieldCheck, Share2, Award, Zap, Database, CheckCircle2, Scan } from 'lucide-react';
import { CAMPUS_ANNOUNCEMENTS, DGA_OPS_BULLETINS, LORE_ECHOES } from '../data/bulletinData';

export default function BulletinWidget() {
  const [isGlitched, setIsGlitched] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [terminalFeedback, setTerminalFeedback] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const dragControls = useDragControls();

  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);
  const prismCorruptionLevel = useOSStore((s) => s.gameplay.prismCorruptionLevel);

  const startDrag = (e) => {
    if (e.target.closest('button')) return;
    dragControls.start(e);
  };

  const triggerGlitch = () => {
    setIsGlitched(true);
    setTerminalFeedback('[VEIL FREQUENCY] ANOMALY SCANNING... PRISM CORRUPTION INTERFERENCE SPIKE DETECTED.');
    setTimeout(() => setIsGlitched(false), 1800);
  };

  const handleCheckIn = () => {
    if (checkedIn) {
      setTerminalFeedback(`[AURA ID: CY-9021-X9] DAILY RECORD ALREADY ACTIVE (${checkInTime || 'STAMP 13:25'}). NEXT SCAN AVAILABLE IN NEXT CYCLE.`);
      return;
    }

    setIsScanning(true);
    setTerminalFeedback('[AURA ID: CY-9021-X9] LASER SCANNER INITIALIZING...');

    setTimeout(() => {
      setIsScanning(false);
      setCheckedIn(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckInTime(timeStr);
      addCredits(100);
      addXP(50);
      setTerminalFeedback(`[AURA ID: CY-9021-X9] SCANNED & VERIFIED. ATTENDANCE LOGGED AT ${timeStr} FOR CYCLE 28.07.`);
    }, 1000);
  };

  const handleSyncSquad = () => {
    setTerminalFeedback('[MESH SQUAD] FREQUENCY SYNCED: 4/4 OPERATIVES LINKED TO SQUAD MATRIX.');
  };

  const handlePulseShare = () => {
    setTerminalFeedback('[VECTOR MESH] BROADCAST ENCRYPTED AND DISPATCHED TO HOUSE FEED.');
  };

  const handleArchiveLogs = () => {
    setTerminalFeedback('[CENTRAL ARCHIVE] 12 NODE RECORDS ENCRYPTED AND LOGGED TO DATABASE.');
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      className={`relative z-20 w-full max-w-4xl rounded-3xl border-2 transition-shadow duration-200 select-none overflow-hidden shadow-[0_20px_50px_rgba(157,140,210,0.35)] ${
        isGlitched
          ? 'border-pink-500 bg-pink-950/90 text-white filter invert contrast-200 hue-rotate-180 animate-pulse'
          : 'border-purple-300/80 bg-white/85 text-slate-900 backdrop-blur-xl'
      }`}
    >
      {/* Background Soft Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-white/20 to-cyan-100/40 pointer-events-none" />

      {/* Laser ID Scan Animation Overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
          <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#4DF3FF] animate-bounce" />
          <div className="bg-cyan-500/10 inset-0 absolute flex items-center justify-center font-mono font-bold text-cyan-700 text-sm tracking-widest uppercase animate-pulse">
            <Scan size={24} className="mr-2 animate-spin text-cyan-600" /> Scanning Aura ID...
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HEADER DRAG BAR                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div
        onPointerDown={startDrag}
        className="relative z-10 flex items-center justify-between border-b border-purple-200/60 bg-[#ECE5F9]/90 px-4 py-2.5 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2.5 font-bold text-purple-950 tracking-wider text-xs">
          <GripHorizontal size={18} className="text-purple-600/80" />
          <Sparkles size={15} className="text-purple-600 animate-spin" />
          <span className="font-serif-y2k text-sm font-extrabold tracking-wide">CYACADEMY BULLETIN NODE</span>
        </div>

        {/* Real-time Status Pill & Window Controls */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 border border-purple-200 shadow-sm">
            <span>Time: <strong className="text-purple-950 font-bold">Evening</strong></span>
            <span className="text-slate-300">•</span>
            <span>Veil: <strong className={isGlitched ? 'text-pink-600 animate-bounce' : 'text-cyan-700'}>Flicker</strong></span>
            <span className="text-slate-300">•</span>
            <span>House: <strong className="text-purple-700">Vector</strong></span>
            <span className="text-slate-300">•</span>
            <span>Role: <strong className="text-pink-600">Anti</strong></span>
          </div>

          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200/70 hover:bg-purple-300 text-purple-950 font-bold transition shadow-sm"
            title={isMinimized ? 'Expand Board' : 'Minimize Board'}
          >
            {isMinimized ? '＋' : '−'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3.5">
          {/* Diegetic In-World Terminal Output Bar */}
          {terminalFeedback && (
            <div className="rounded-xl border border-purple-300 bg-slate-900 p-2.5 font-mono text-[11px] font-semibold text-cyan-300 shadow-inner flex items-center justify-between animate-fade-in">
              <span className="truncate">{terminalFeedback}</span>
              <span className="text-purple-400 text-[10px] ml-2 shrink-0">STAMP: 28.07</span>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* ASYMMETRIC BULLETIN GRID LAYOUT (MATCHING REFERENCE MOCKUP IMAGE)   */}
          {/* ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* LEFT SECTION (Columns 1 to 7): Split Vertically into 2 Blocks */}
            <div className="md:col-span-7 flex flex-col gap-3.5">
              {/* TOP-LEFT BLOCK: Wide Horizontal Card (Campus Feed) */}
              <div className="flex flex-col space-y-2 rounded-2xl border border-purple-200/90 bg-[#F4EFFF]/90 p-3.5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between border-b border-purple-200 pb-1.5 font-bold text-purple-950 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    CAMPUS ANNOUNCEMENTS & FEED
                  </span>
                  <span className="rounded-full bg-purple-200/80 px-2 py-0.5 text-[9px] text-purple-800 font-semibold">
                    Wide Notice
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Campus Announcements from bulletinData.js */}
                  {CAMPUS_ANNOUNCEMENTS.map((item) => (
                    <div key={item.id} className="rounded-xl border border-purple-200 bg-white/95 p-2.5 space-y-1 shadow-sm">
                      <div className="font-bold text-purple-950 text-[11px] flex items-center gap-1">
                        <Award size={12} className="text-purple-600 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="text-slate-800 font-semibold text-[10px] line-clamp-2">{item.body}</div>
                      <div className="text-slate-500 text-[9px] truncate">{item.author} • {item.date}</div>
                    </div>
                  ))}
                </div>

                {/* Pulse Trending Bar */}
                <div className="rounded-xl border border-purple-200 bg-white/95 p-2 flex items-center justify-between shadow-sm mt-1">
                  <div className="font-bold text-purple-950 text-[10px] flex items-center gap-1">
                    <Zap size={12} className="text-amber-500" /> Trending:
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700">#DormDrama</span>
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold text-cyan-700">#OddSighting</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM-LEFT BLOCK: Large Square Card (Missions & DGA Ops) */}
              <div className="flex flex-col space-y-2.5 rounded-2xl border border-emerald-200/90 bg-[#E6F9F5]/90 p-3.5 shadow-sm hover:shadow-md transition flex-1 justify-between">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5 font-bold text-emerald-950 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    MISSIONS & DGA OPS
                  </span>
                  <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[9px] text-emerald-800 font-semibold">
                    Square Notice
                  </span>
                </div>

                {/* DGA Ops from bulletinData.js */}
                <div className="space-y-2">
                  {DGA_OPS_BULLETINS.map((op) => (
                    <div key={op.id} className="rounded-xl border border-emerald-200 bg-white/95 p-2.5 space-y-1 shadow-sm">
                      <div className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={13} className="text-emerald-600 shrink-0" /> {op.title}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700">{op.reward}</span>
                      </div>
                      <div className="text-slate-700 text-[10px]">{op.desc}</div>
                    </div>
                  ))}
                </div>

                {/* PRISM Activity */}
                <div className="rounded-xl border border-pink-300 bg-pink-50/95 p-2.5 space-y-1 shadow-sm">
                  <div className="font-bold text-pink-950 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                      PRISM Activity
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-pink-200 text-pink-800 font-bold">
                      Corrupted
                    </span>
                  </div>
                  <div className="text-pink-700 font-bold font-mono text-[11px]">Corruption Level ↑ {prismCorruptionLevel}%</div>
                  <div className="text-slate-600 text-[10px]">App Lockdown: Sector 9 Mesh</div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION (Columns 8 to 12): Tall Full-Height Vertical Card */}
            <div className="md:col-span-5 flex flex-col">
              <div className="flex flex-col space-y-3 rounded-2xl border border-pink-200/90 bg-[#FDF0F6]/90 p-3.5 shadow-sm hover:shadow-md transition h-full justify-between">
                <div className="flex items-center justify-between border-b border-pink-200 pb-1.5 font-bold text-pink-950 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    SIGNALS & LORE ECHOES
                  </span>
                  <span className="rounded-full bg-pink-200/80 px-2 py-0.5 text-[9px] text-pink-800 font-semibold">
                    Tall Notice
                  </span>
                </div>

                {/* Lore Echoes from bulletinData.js */}
                <div className="space-y-2 flex-1 overflow-auto my-1">
                  {LORE_ECHOES.map((echo) => (
                    <div key={echo.id} className="rounded-xl border border-pink-200 bg-white/95 p-2.5 space-y-1 shadow-sm">
                      <div className="font-bold text-pink-950 text-[10px]">{echo.source}</div>
                      <div className="text-slate-700 italic text-[10px]">{echo.text}</div>
                    </div>
                  ))}

                  {/* Aethercore Echoes (Redacted Text) */}
                  <div className="rounded-xl border border-pink-200 bg-white/95 p-2.5 space-y-1.5 shadow-sm">
                    <div className="font-bold text-pink-950 text-xs flex items-center gap-1.5">
                      <Share2 size={13} className="text-pink-600" /> Aethercore Echoes
                    </div>
                    <div className="text-purple-900 font-semibold font-mono text-[10px]">Fragment #07: "Protocol Unread"</div>
                    <div className="rounded-lg bg-slate-900 p-2 font-mono text-pink-400 text-[10px] tracking-widest text-center shadow-inner">
                      [ ████████████████ ]
                    </div>
                  </div>

                  {/* Lineage Keys */}
                  <div className="rounded-xl border border-purple-200 bg-white/95 p-2.5 space-y-1 shadow-sm">
                    <div className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                      <Award size={13} className="text-amber-500" /> Lineage Keys
                    </div>
                    <div className="text-slate-800 font-semibold text-[10px]">Celestial Glyph Activated</div>
                    <div className="text-purple-800 font-bold text-[9px]">Mark: "Seraphima Lineage"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* ACTION BUTTON FOOTER BAR                                           */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-purple-200/80 bg-[#ECE5F9]/90 p-2.5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Diegetic Check In Button with Scan State */}
              <button
                onClick={handleCheckIn}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-bold transition shadow-sm ${
                  checkedIn
                    ? 'border-emerald-400 bg-emerald-200 text-emerald-950'
                    : 'border-emerald-300 bg-emerald-100/90 text-emerald-950 hover:bg-emerald-200'
                }`}
              >
                {checkedIn ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-700" /> [ ID LOGGED ]
                  </>
                ) : (
                  <>
                    <Database size={14} className="text-emerald-700" /> Daily Attendance Stamp (+100 ₡)
                  </>
                )}
              </button>

              <button
                onClick={triggerGlitch}
                className="flex items-center gap-1 rounded-xl border border-purple-300 bg-purple-100/90 px-3 py-1.5 font-bold text-purple-950 hover:bg-purple-200 transition shadow-sm"
              >
                <Zap size={14} className="text-purple-600" /> Veil Frequency Scan
              </button>

              <button
                onClick={handleSyncSquad}
                className="flex items-center gap-1 rounded-xl border border-purple-300 bg-purple-100/90 px-3 py-1.5 font-bold text-purple-950 hover:bg-purple-200 transition shadow-sm"
              >
                <ShieldCheck size={14} className="text-purple-600" /> Sync Squad
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePulseShare}
                className="flex items-center gap-1 rounded-xl border border-purple-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <Share2 size={13} className="text-purple-600" /> Share Pulse
              </button>

              <button
                onClick={handleArchiveLogs}
                className="flex items-center gap-1 rounded-xl border border-purple-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white transition"
              >
                <Database size={13} className="text-purple-600" /> Archive Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
