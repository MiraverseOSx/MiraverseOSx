// src/components/LoginScreen.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, User, ShieldAlert, LogIn, Lock, ArrowRight, Video, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import Button from './ui/button';
import Input from './ui/input';

import videoAnomaly from '../assets/videos/everything_is_great_but_do_not.mp4';
import videoSurveillance from '../assets/videos/mixkit-a-woman-monitoring-close-circuit-surveillance-23673-hd-ready.mp4';
import videoInk from '../assets/videos/mixkit-black-ink-splashing-505-hd-ready.mp4';
import videoLandscape from '../assets/videos/mixkit-flying-over-a-relaxing-creek-full-of-rock-on-the-51585-hd-ready.mp4';
import videoGlitter from '../assets/videos/mixkit-glitter-stars-and-snowflakes-19007-hd-ready.mp4';

const VIDEO_FEEDS = [
  { id: 'glitter', name: 'Aether Glitter Stars', src: videoGlitter, label: 'Celestial Aura Feed' },
  { id: 'surveillance', name: 'DGA Surveillance Monitor', src: videoSurveillance, label: 'Security Feed #09' },
  { id: 'ink', name: 'Veil Ink Splash', src: videoInk, label: 'PRISM Anomaly' },
  { id: 'anomaly', name: 'System Anomaly Intercept', src: videoAnomaly, label: 'Sub-Conduit Signal' },
  { id: 'landscape', name: 'Meridion High-Realm', src: videoLandscape, label: 'Celestial Landscape' },
];

export default function LoginScreen({ onLoginSuccess, initialMode = 'login', onBackToLanding }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [username, setUsername] = useState('CY-9021-PLAYER');
  const [password, setPassword] = useState('••••••••');
  const [assetKey, setAssetKey] = useState('ASSET-AURELINE-88');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('glitter');
  const [isMuted, setIsMuted] = useState(true);
  const [isBooting, setIsBooting] = useState(false);

  const activeVideo = VIDEO_FEEDS.find((v) => v.id === activeVideoId) || VIDEO_FEEDS[0];

  const handleStandardLogin = (e) => {
    e?.preventDefault();
    if (!username.trim() || isBooting) return;
    setIsBooting(true);
    setStatusMsg('⚡ INITIALIZING STARTING LOGIN BOOT SEQUENCE...');

    setTimeout(() => {
      setStatusMsg('✓ BIOMETRICS & ASSET CREDENTIALS VERIFIED');
    }, 1200);

    setTimeout(() => {
      onLoginSuccess({
        name: username.trim(),
        clearance: 1,
        credits: 200,
        level: 1,
      });
    }, 2200);
  };

  const handleAdminBypass = () => {
    setIsBooting(true);
    setStatusMsg('⚡ ADMIN BYPASS ENGAGED — Clearance Level 04 Unlocked');
    setTimeout(() => {
      onLoginSuccess({
        name: 'ADMINISTRATOR',
        clearance: 4,
        credits: 9999,
        level: 50,
      });
    }, 1200);
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#070514] overflow-hidden select-none font-sans">
      
      {/* ── BACKGROUND LIVE VIDEO FEED (ASSET FOLDER VIDEOS) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          key={activeVideo.id}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="h-full w-full object-cover opacity-35 scale-105 transition-opacity duration-1000 blur-[1px]"
        >
          <source src={activeVideo.src} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,7,30,0.5)_0%,rgba(4,2,12,0.92)_85%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-20 holo-grid" />
      </div>

      {/* Top Controls: Return Button & Video Feed Switcher */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        {onBackToLanding ? (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 rounded-xl border border-purple-500/50 bg-[#160d33] px-4 py-2 text-xs font-semibold text-purple-200 hover:text-white hover:bg-purple-900 transition shadow-md"
          >
            ← Return to Meridion Realm
          </button>
        ) : <div />}

        {/* Video Feed Switcher Controls */}
        <div className="flex items-center gap-2 bg-[#090e1a] p-1.5 rounded-2xl border border-white/20 shadow-md">
          <div className="text-[10px] font-mono text-cyan-300 px-2 flex items-center gap-1.5">
            <Eye size={13} className="text-cyan-400 animate-pulse" />
            <span>Feed:</span>
          </div>
          {VIDEO_FEEDS.map((vf) => (
            <button
              key={vf.id}
              onClick={() => setActiveVideoId(vf.id)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition ${
                activeVideoId === vf.id
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={vf.name}
            >
              {vf.id.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded-xl text-white/60 hover:text-white transition ml-1"
            title={isMuted ? 'Unmute Background Audio' : 'Mute Background Audio'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* ── MAIN HOLOGRAPHIC LOGIN & BOOT CONTAINER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 w-full max-w-md rounded-3xl hologram-panel p-8 shadow-2xl animate-holo-flicker text-white border border-cyan-400/30"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="font-serif-y2k text-3xl font-bold tracking-wide text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              MIRAVERSE OS
            </h1>
            <p className="text-[10px] font-mono tracking-[0.25em] text-cyan-200/70 mt-1 uppercase">
              CELESTIAL OPERATING SYSTEM • BOOT VER 5.2
            </p>
          </div>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/50 p-1 border border-white/10 mb-6 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition ${mode === 'login' ? 'bg-cyan-500 text-black font-bold shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition ${mode === 'register' ? 'bg-cyan-500 text-black font-bold shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Register Asset
          </button>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-wider flex items-center gap-1">
              <User size={12} /> Asset Handle / Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your student/citizen ID..."
              className="bg-black/60 border-cyan-500/30 text-cyan-200 placeholder:text-white/30 text-xs focus:border-cyan-400"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-wider flex items-center gap-1">
                <Key size={12} /> Registration Key
              </label>
              <Input
                type="text"
                value={assetKey}
                onChange={(e) => setAssetKey(e.target.value)}
                placeholder="Enter provisional registration key..."
                className="bg-black/60 border-cyan-500/30 text-cyan-200 placeholder:text-white/30 text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-wider flex items-center gap-1">
              <Lock size={12} /> Access Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/60 border-cyan-500/30 text-cyan-200 text-xs"
              required
            />
          </div>

          {statusMsg && (
            <div className="rounded-xl bg-cyan-500/20 border border-cyan-400/50 p-3 text-center text-xs text-cyan-300 font-mono animate-pulse">
              {statusMsg}
            </div>
          )}

          <Button
            type="submit"
            disabled={isBooting}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-black hover:from-cyan-400 hover:to-indigo-500 transition shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
          >
            <LogIn size={15} /> {mode === 'login' ? 'START LOGIN BOOT' : 'Initialize Asset Record'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cyan-500/20" /></div>
          <span className="relative bg-[#0b0c1e] px-3 text-[9px] font-mono text-cyan-300/50 uppercase tracking-widest">OR</span>
        </div>

        {/* ⚡ INSTANT ADMIN ACCESS BUTTON (Prominent at Bottom) */}
        <button
          onClick={handleAdminBypass}
          disabled={isBooting}
          className="w-full rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 p-3.5 text-amber-300 font-bold text-xs hover:bg-amber-400/30 hover:border-amber-300 transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2 group"
          title="Bypass login and open MIRAVERSE OS with Administrator Level 4 Clearance"
        >
          <ShieldAlert size={16} className="text-amber-400 group-hover:animate-bounce" />
          <span>⚡ ADMIN INSTANT ACCESS (BYPASS)</span>
          <ArrowRight size={14} className="text-amber-400 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
