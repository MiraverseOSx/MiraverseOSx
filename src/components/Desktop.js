import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, FileSearch, Gem, LayoutGrid, Mail, Moon, Power,
  Search, Settings, ShieldCheck, Sparkles, Wifi
} from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Window from './Window';
import SparklesCanvas from './SparklesCanvas';

const formatClock = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const formatDate = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

const Panel = ({ children, className = '' }) => (
  <section className={'border border-slate-300/80 bg-white/72 shadow-[0_18px_45px_rgba(43,55,98,0.12)] backdrop-blur-xl ' + className}>
    {children}
  </section>
);

export default function Desktop() {
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSanctuary, setIsSanctuary] = useState(false);

  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);
  const player = useOSStore((s) => s.gameplay.player);
  const corruption = useOSStore((s) => s.gameplay.prismCorruptionLevel);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const launch = (app) => toggleApp(app);

  return (
    <main
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#eef0f7] text-[#17213f]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          clearActive();
          setIsLauncherOpen(false);
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.98),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(211,205,255,.55),transparent_30%),linear-gradient(145deg,#e9ecf5_0%,#fafbff_48%,#e4e6f2_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[.10] [background-image:linear-gradient(rgba(24,34,69,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(24,34,69,.17)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[.12]">
        <img src="/logo_icon.png" alt="" className="h-[520px] w-[520px] object-contain mix-blend-multiply" />
      </div>
      <SparklesCanvas />

      <header
        className="relative z-30 mx-6 mt-5 flex h-14 cursor-pointer touch-manipulation items-center justify-between border-y border-white/80 bg-white/55 px-5 shadow-[0_10px_35px_rgba(43,55,98,.09)] backdrop-blur-xl transition-colors hover:bg-white/70"
        onClick={() => launch(APPS.find((app) => app.id === 'comms'))}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            launch(APPS.find((app) => app.id === 'comms'));
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open Comms"
        title="Open Comms"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-8 w-8 place-items-center border border-[#bcc6ea] bg-[#17213f] text-[#e5e2ff]"><Sparkles size={14} /></div>
          <div>
            <p className="font-serif-y2k text-lg font-bold leading-none tracking-wide text-[#202851]">MIRAVERSE</p>
            <p className="mt-1 text-[8px] font-semibold tracking-[.22em] text-slate-500">CELESTIAL OPERATING SYSTEM</p>
          </div>
          <span className="ml-3 hidden border-l border-slate-300 pl-4 text-[10px] font-medium tracking-[.16em] text-slate-500 md:block">ARCHIVE / 028.07</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold tracking-[.12em] text-slate-600">
          <span className="hidden sm:block">PLAYERNAME</span>
          <span className="h-1 w-1 rounded-full bg-[#7e70d5]" />
          <span>{formatDate(now)}</span>
          <span className="font-mono text-[#182245]">{formatClock(now)}</span>
          <Wifi size={15} className="text-[#4a5591]" />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 gap-5 px-6 py-5">
        <aside className="hidden w-44 shrink-0 border-r border-slate-300/75 pr-4 lg:block">
          <p className="mb-3 text-[9px] font-bold tracking-[.2em] text-slate-500">WORKSPACE</p>
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 border-l-2 border-[#5b63aa] bg-white/60 px-3 py-2.5 text-left text-xs font-semibold text-[#222d58]"><FileSearch size={15} /> Caseboard</button>
            <button className="flex w-full items-center gap-3 border-l-2 border-[#5b63aa] bg-white/60 px-3 py-2.5 text-left text-xs font-semibold text-[#222d58]"><Mail size={15} /> Comms</button>
            <button className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-white/55"><CalendarDays size={15} /> Schedule</button>
            <button className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-white/55"><Gem size={15} /> Personal archive</button>
          </nav>
          <div className="mt-8 border-t border-slate-300 pt-4">
            <p className="text-[9px] font-bold tracking-[.2em] text-slate-500">NETWORK</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-[#70b999]" /> Secure relay active</div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-[#938be0]" /> Veil observation</div>
          </div>
        </aside>

        <AnimatePresence>
          {!isSanctuary && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto pb-2 xl:grid-cols-[1.45fr_.8fr]">
              <div className="flex min-w-0 flex-col gap-4">
                <Panel className="relative overflow-hidden p-6">
                  <div className="absolute right-0 top-0 h-28 w-56 bg-[radial-gradient(ellipse_at_top_right,rgba(166,157,234,.34),transparent_68%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold tracking-[.24em] text-[#6971a4]">ACTIVE INVESTIGATION</p>
                      <h1 className="mt-2 font-serif-y2k text-3xl font-bold text-[#202851]">The Factory Signal</h1>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">A dormant transmission has resurfaced under the old factory. Its source remains unverified.</p>
                    </div>
                    <div className="border border-[#c9c3ee] bg-[#f5f3ff] px-3 py-2 text-right"><p className="text-[8px] font-bold tracking-[.16em] text-[#6b63a5]">CLEARANCE</p><p className="mt-1 font-mono text-xs font-bold text-[#29345f]">LEVEL 01</p></div>
                  </div>
                  <div className="relative mt-6 grid grid-cols-3 border-t border-slate-200 pt-4 text-xs">
                    <div><p className="text-[9px] uppercase tracking-widest text-slate-500">Leads</p><p className="mt-1 font-serif-y2k text-xl font-bold">04</p></div>
                    <div className="border-x border-slate-200 px-4"><p className="text-[9px] uppercase tracking-widest text-slate-500">Evidence</p><p className="mt-1 font-serif-y2k text-xl font-bold">12</p></div>
                    <div className="pl-4"><p className="text-[9px] uppercase tracking-widest text-slate-500">Status</p><p className="mt-1 text-[11px] font-bold text-[#6460a8]">OBSERVING</p></div>
                  </div>
                </Panel>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Panel className="p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">ENCRYPTED COMMS</p><Mail size={15} className="text-[#626db3]" /></div><div className="mt-5 border-l-2 border-[#8b82d1] pl-3"><p className="text-xs font-bold text-[#26305b]">Voss / secure line</p><p className="mt-1 text-xs text-slate-600">Do not broadcast this.</p><button className="mt-3 text-[10px] font-bold tracking-wider text-[#5952a1] cursor-default">OPEN TRANSMISSION!�</button></div></Panel>
                  <Panel className="p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">TODAY'S RITUALS</p><CalendarDays size={15} className="text-[#626db3]" /></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between border-b border-slate-200 pb-2"><span>Orientation archive</span><span className="font-mono text-slate-500">20:00</span></div><div className="flex justify-between"><span>Veil observance</span><span className="font-mono text-slate-500">22:30</span></div></div></Panel>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                <Panel className="p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">PLAYER RECORD</p><ShieldCheck size={16} className="text-[#606ab2]" /></div><p className="mt-5 font-serif-y2k text-2xl font-bold text-[#202851]">PLAYERNAME</p><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="border-t border-slate-200 pt-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Level</p><p className="mt-1 font-mono font-bold">{player.level}</p></div><div className="border-t border-slate-200 pt-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Credits</p><p className="mt-1 font-mono font-bold">{player.credits}</p></div></div></Panel>
                <Panel className="p-5"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">VEIL CONDITION</p><div className="mt-4 flex items-end justify-between"><div><p className="font-serif-y2k text-2xl font-bold text-[#202851]">Flicker</p><p className="mt-1 text-[11px] text-slate-600">PRISM activity detected</p></div><p className="font-mono text-xl text-[#6a62ac]">{corruption}%</p></div><div className="mt-4 h-1 bg-[#e4e2f1]"><div className="h-full bg-[#7270bb]" style={{ width: corruption + '%' }} /></div></Panel>
                <Panel className="p-5"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">CASE NOTE</p><p className="mt-3 text-xs leading-relaxed text-slate-600">The network has started using names that do not exist in the public archive.</p><button className="mt-4 text-[10px] font-bold tracking-wider text-[#5952a1]">VIEW EVIDENCE!�</button></Panel>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {isSanctuary && <div className="flex flex-1 items-center justify-center"><div className="border-y border-white/70 bg-white/35 px-8 py-5 text-center backdrop-blur-sm"><Moon className="mx-auto text-[#5e68ad]" size={18} /><p className="mt-2 font-serif-y2k text-xl font-bold text-[#28315f]">Sanctuary active</p><p className="mt-1 text-[10px] tracking-wider text-slate-600">THE DESKTOP HAS BEEN CLEARED</p></div></div>}

        <AnimatePresence>{windows.filter((win) => !win.isMinimized).map((win) => <Window key={win.id} win={win} />)}</AnimatePresence>
      </div>

      <div className="relative z-30 mx-6 mb-5 flex h-12 items-center justify-between border border-white/80 bg-white/65 px-3 shadow-[0_10px_35px_rgba(43,55,98,.1)] backdrop-blur-xl">
        <div className="relative">
          <AnimatePresence>{isLauncherOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-12 left-0 grid w-[340px] grid-cols-4 gap-px border border-[#bec6e1] bg-[#bec6e1] p-px shadow-xl"><div className="col-span-4 bg-[#eef0f9] px-3 py-2 text-[9px] font-bold tracking-[.18em] text-[#4b568e]">APPLICATION ARCHIVE</div>{APPS.filter((app) => app.id !== 'comms').map((app) => { const Icon = app.icon; return <button key={app.id} onClick={() => launch(app)} className="flex min-h-20 flex-col items-start gap-2 bg-white px-3 py-3 text-left text-[10px] font-semibold text-slate-700 hover:bg-[#f0f0fb]"><Icon size={16} className="text-[#5f67ab]" /><span>{app.title}</span></button>; })}</motion.div>}</AnimatePresence>
          <button onClick={() => setIsLauncherOpen((open) => !open)} className="flex items-center gap-2 border-r border-slate-300 pr-4 text-[10px] font-bold tracking-[.14em] text-[#26315c]"><LayoutGrid size={16} /> ARCHIVE</button>
        </div>
        <div className="flex items-center gap-2"><div className="hidden w-64 items-center border border-slate-300 bg-white/65 px-3 py-1.5 sm:flex"><Search size={13} className="mr-2 text-slate-500" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search archive" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" /></div><button onClick={() => setIsSanctuary((active) => !active)} className={'flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[.12em] transition ' + (isSanctuary ? 'bg-[#28325f] text-white' : 'text-[#4e5792] hover:bg-[#ecebf7]')}><Moon size={14} /> SANCTUARY</button><button onClick={() => launch({ id: 'settings', title: 'Settings', contentKey: 'settings' })} className="p-2 text-slate-500 hover:text-[#293360]"><Settings size={16} /></button><button onClick={() => alert('Power options')} className="p-2 text-slate-500 hover:text-[#293360]"><Power size={16} /></button></div>
      </div>
    </main>
  );
}


