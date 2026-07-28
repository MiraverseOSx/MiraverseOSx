import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Window from './Window';
import PhoneWidget from './PhoneWidget';
import SparklesCanvas from './SparklesCanvas';
import { Search, Mic, Power, Settings, Wifi } from 'lucide-react';

const formatClock = (date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatDate = (date) =>
  date.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

export default function Desktop() {
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-marble-y2k flex flex-col justify-between"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) clearActive();
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* LAYER 0: CENTER DESKTOP LOGO WATERMARK                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/logo_icon.png"
          alt="Miraverse Watermark"
          className="w-[480px] h-[480px] object-contain opacity-35 filter brightness-110 contrast-125 select-none"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* LAYER 1: FALLING GLITTER SPARKLES (Above Watermark, Below Windows) */}
      {/* ------------------------------------------------------------------ */}
      <SparklesCanvas />

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER BAR (Profile Banner, "PLAYERNAME", Top Search Bar)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-[9999] flex items-center justify-between px-6 pt-4">
        {/* Left Section: Lavender Profile Banner & PLAYERNAME Pill */}
        <div className="flex items-center gap-6">
          {/* Lavender Avatar Banner Badge matching mockup */}
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-28 bg-[#DED2F9] rounded-b-3xl shadow-md flex items-center justify-center border-b-2 border-white/50">
              <div className="w-16 h-16 rounded-full bg-white shadow-inner border-2 border-white flex items-center justify-center overflow-hidden p-1">
                <img src="/logo_icon.png" alt="Miraverse Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* "PLAYERNAME" Serif Pill Badge matching mockup */}
          <div className="rounded-full bg-white/90 px-8 py-2.5 shadow-md border border-white/60">
            <span className="font-serif-y2k text-2xl font-black uppercase text-slate-900 tracking-wider">
              PLAYERNAME
            </span>
          </div>
        </div>

        {/* Right Section: Sleek Rounded Search Bar matching mockup */}
        <div className="w-96">
          <div className="relative flex items-center rounded-full border border-slate-700 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-md">
            <Search size={16} className="text-slate-700 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="flex-1 bg-transparent text-xs text-slate-800 outline-none font-medium"
            />
            <Mic size={16} className="text-slate-700 ml-2 cursor-pointer hover:text-black" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONNECTED START PANEL UNIT (App Drawer + Bottom Taskbar Base)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute left-0 bottom-0 z-20 flex flex-col items-stretch w-44 rounded-tr-2xl border-t border-r border-white/60 bg-[#E9DFFC] shadow-2xl overflow-hidden">
        {/* App Tiles Grid matching mockup */}
        <div className="p-3 space-y-3 max-h-[380px] overflow-auto">
          <div className="grid grid-cols-2 gap-3">
            {APPS.map((app, idx) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => toggleApp(app)}
                  className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl transition shadow-sm ${
                    idx === 1
                      ? 'bg-[#FFD4E5] border border-pink-300' // Pink heart Notepad tile matching mockup
                      : 'bg-[#DCD0F9] border border-purple-200 hover:bg-[#D4C5FA]'
                  }`}
                  title={app.title}
                >
                  <Icon size={22} className="text-purple-950" />
                  <span className="mt-1 text-[9px] font-semibold text-purple-950 truncate max-w-[50px]">
                    {app.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrated Bottom Power & Settings Base matching mockup */}
        <div className="flex h-14 items-center justify-around bg-[#DCD0F9] border-t border-white/50 px-4 shrink-0">
          <button
            onClick={() => alert('Power options')}
            className="text-slate-800 hover:text-black transition"
            title="Power"
          >
            <Power size={22} />
          </button>
          <button
            onClick={() => toggleApp({ id: 'settings', title: 'Settings', contentKey: 'settings' })}
            className="text-slate-800 hover:text-black transition"
            title="Settings"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP BODY CANVAS (Floating Windows, Phone Widget)               */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex-1 flex items-center justify-between px-6 py-4">
        {/* Center Canvas: Floating Windows */}
        <AnimatePresence>
          {windows
            .filter((w) => !w.isMinimized)
            .map((win) => (
              <Window key={win.id} win={win} />
            ))}
        </AnimatePresence>

        {/* Right Side: Smartphone Companion Widget matching mockup */}
        <div className="z-10 absolute right-8 top-1/2 -translate-y-1/2">
          <PhoneWidget />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM TASKBAR (Center Strip, Status Clock Pill)                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 flex h-14 w-full items-center">
        {/* Center Mauve Taskbar Strip matching mockup */}
        <div className="flex-1 h-full bg-[#DECFCF] border-t border-white/40 ml-44" />

        {/* Right White Status Pill matching mockup (clock 00:00, date 00/00/0000, wifi) */}
        <div className="absolute right-4 bottom-2 rounded-full bg-white/95 px-5 py-1.5 shadow-md border border-white flex items-center gap-3 text-xs font-serif-y2k text-slate-900 z-30">
          <div className="flex flex-col items-center leading-tight">
            <span className="font-bold text-sm">{formatClock(now)}</span>
            <span className="text-[10px] font-sans text-slate-600">{formatDate(now)}</span>
          </div>
          <Wifi size={18} className="text-slate-800" />
        </div>
      </div>
    </div>
  );
}
