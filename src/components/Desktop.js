import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Window from './Window';
import PhoneWidget from './PhoneWidget';
import SparklesCanvas from './SparklesCanvas';
import BulletinWidget from './BulletinWidget';
import { Search, Mic, Power, Settings, LayoutGrid, Wifi } from 'lucide-react';

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
  const [isLauncherOpen, setIsLauncherOpen] = useState(true);

  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleLaunchApp = (app) => {
    toggleApp(app);
    setIsLauncherOpen(false);
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-marble-y2k flex flex-col justify-between"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          clearActive();
          setIsLauncherOpen(false);
        }
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
      {/* LAYER 1: FALLING GLITTER SPARKLES & STARS                           */}
      {/* ------------------------------------------------------------------ */}
      <SparklesCanvas />

      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER BAR (Profile Banner, "PLAYERNAME", Top Search Bar)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-[9999] flex items-center justify-between px-6 pt-4">
        {/* Left Section: Rich Plum Profile Banner & PLAYERNAME Pill */}
        <div className="flex items-center gap-6">
          {/* Rich Plum Avatar Banner Badge matching mockup */}
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-28 bg-[#4A2054] rounded-b-3xl shadow-md flex items-center justify-center border-b-2 border-pink-300/50">
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
        <div className="w-80">
          <div className="relative flex items-center rounded-full border border-pink-300/40 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-md">
            <Search size={16} className="text-slate-800 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-medium"
            />
            <Mic size={16} className="text-slate-800 ml-2 cursor-pointer hover:text-black" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONNECTED COLLAPSIBLE START PANEL UNIT                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute left-0 bottom-0 z-30 flex flex-col items-stretch w-44 rounded-tr-2xl border-t border-r border-pink-300/40 bg-[#3B1D45]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Collapsible Vertical App Grid Drawer */}
        <AnimatePresence>
          {isLauncherOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3 max-h-[380px] overflow-auto">
                <div className="grid grid-cols-2 gap-3">
                  {APPS.map((app, idx) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleLaunchApp(app)}
                        className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl transition shadow-sm ${
                          idx === 0
                            ? 'bg-[#FFD4E5] border border-pink-300' // Pink tile for Bulletin Node matching mockup
                            : 'bg-[#5B2C6F]/80 border border-pink-300/30 hover:bg-[#6C3483]/90 text-white'
                        }`}
                        title={app.title}
                      >
                        <Icon size={22} className={idx === 0 ? 'text-purple-950' : 'text-pink-100'} />
                        <span className={`mt-1 text-[9px] font-semibold truncate max-w-[50px] ${idx === 0 ? 'text-purple-950' : 'text-pink-100'}`}>
                          {app.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Integrated Bottom Launcher Control Strip (Start Button + Power & Settings) */}
        <div className="flex h-14 items-center justify-around bg-[#4A2054]/90 border-t border-pink-300/30 px-3 shrink-0">
          <button
            onClick={() => setIsLauncherOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition ${
              isLauncherOpen ? 'bg-purple-950 text-white' : 'text-slate-800 hover:text-black hover:bg-white/40'
            }`}
            title={isLauncherOpen ? 'Put Down App Launcher' : 'Bring Up App Launcher'}
          >
            <LayoutGrid size={20} />
          </button>

          <button
            onClick={() => alert('Power options')}
            className="text-slate-800 hover:text-black transition p-1.5"
            title="Power"
          >
            <Power size={20} />
          </button>
          
          <button
            onClick={() => handleLaunchApp({ id: 'settings', title: 'Settings', contentKey: 'settings' })}
            className="text-slate-800 hover:text-black transition p-1.5"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP BODY CANVAS (Persistent Bulletin Widget, Windows, Phone)   */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex-1 flex items-center justify-center px-52 py-2">
        {/* Persistent Cyacademy Bulletin Node Glass Desktop Widget */}
        <BulletinWidget />

        {/* Center Canvas: Floating OS Windows */}
        <AnimatePresence>
          {windows
            .filter((w) => !w.isMinimized)
            .map((win) => (
              <Window key={win.id} win={win} />
            ))}
        </AnimatePresence>

        {/* Right Side: Draggable Smartphone Companion Widget matching mockup */}
        <motion.div drag dragMomentum={false} className="z-10 absolute right-8 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
          <PhoneWidget />
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM TASKBAR (Center Strip, Window Tabs, Status Clock Pill)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 flex h-14 w-full items-center">
        {/* Center Mauve Taskbar Strip with Open Window Tabs */}
        <div className="flex-1 h-full bg-[#DECFCF] border-t border-white/40 ml-44 flex items-center px-4 gap-2 overflow-x-auto">
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => useOSStore.getState().focusWindow(win.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shadow-sm border ${
                win.id === useOSStore.getState().activeWindowId && !win.isMinimized
                  ? 'bg-purple-950 text-white border-purple-900'
                  : 'bg-white/70 text-slate-800 border-white/80 hover:bg-white'
              }`}
            >
              <span className="truncate max-w-[100px]">{win.title}</span>
              {win.isMinimized && <span className="text-[10px] text-amber-600 font-bold">•</span>}
            </button>
          ))}
        </div>

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
