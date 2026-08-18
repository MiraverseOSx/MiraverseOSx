// src/components/LoginScreen.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, User, ShieldAlert, LogIn, Lock, ArrowRight, Video, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import Button from './button';
import Input from './input';

import videoAnomaly from '../../assets/videos/everything_is_great_but_do_not.mp4';
import videoSurveillance from '../../assets/videos/mixkit-a-woman-monitoring-close-circuit-surveillance-23673-hd-ready.mp4';
import videoInk from '../../assets/videos/mixkit-black-ink-splashing-505-hd-ready.mp4';
import videoLandscape from '../../assets/videos/mixkit-flying-over-a-relaxing-creek-full-of-rock-on-the-51585-hd-ready.mp4';
import videoGlitter from '../../assets/videos/mixkit-glitter-stars-and-snowflakes-19007-hd-ready.mp4';

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
    const isAdminUser = username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'administrator' || username.trim().toLowerCase() === 'root';
    
    setStatusMsg(isAdminUser ? '⚡ ROOT ADMINISTRATOR AUTHENTICATING...' : '⚡ INITIALIZING CITIZEN LOGIN BOOT SEQUENCE...');

    setTimeout(() => {
      setStatusMsg(isAdminUser ? '✓ ROOT BIOMETRICS & MASTER KEYS VERIFIED' : '✓ BIOMETRICS & ASSET CREDENTIALS VERIFIED');
    }, 800);

    setTimeout(() => {
      onLoginSuccess({
        name: isAdminUser ? 'ADMINISTRATOR' : username.trim(),
        isAdmin: isAdminUser,
        clearance: isAdminUser ? 5 : 1,
        credits: isAdminUser ? 99999 : 500,
        bits: isAdminUser ? 9999 : 25,
        level: isAdminUser ? 99 : 1,
      });
    }, 1500);
  };

  const handleAdminBypass = () => {
    setIsBooting(true);
    setStatusMsg('⚡ ROOT ADMIN BYPASS ENGAGED — Master Clearance Level 05 Unlocked');
    setTimeout(() => {
      onLoginSuccess({
        name: 'ADMINISTRATOR',
        isAdmin: true,
        clearance: 5,
        credits: 99999,
        bits: 9999,
        level: 99,
      });
    }, 800);
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(49,93,158,0.35)_0%,rgba(20,40,80,0.85)_85%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-25 holo-grid" />
      </div>

      {/* ── MAIN HOLOGRAPHIC LOGIN & BOOT CONTAINER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 w-full max-w-md rounded-3xl bg-[#1E3D75]/92 backdrop-blur-2xl p-8 shadow-[0_24px_80px_rgba(12,25,54,0.75),0_0_35px_rgba(229,195,112,0.25)] text-white border border-white/30 font-ui"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#315D9E]/60 border border-[#E5C370]/50 text-[#E5C370] shadow-[0_0_20px_rgba(229,195,112,0.35)]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-wide text-[#FFFFFF] drop-shadow-[0_0_12px_rgba(229,195,112,0.35)]">
              MIRAVERSE OS
            </h1>
            <p className="text-[10px] font-ui tracking-[0.25em] text-[#FBE6AB] mt-1 uppercase font-bold">
              CELESTIAL OPERATING SYSTEM • BOOT VER 5.3
            </p>
          </div>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#142850]/80 p-1 border border-white/15 mb-6 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition ${mode === 'login' ? 'bg-[#E5C370] text-[#0E1A33] font-bold shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition ${mode === 'register' ? 'bg-[#E5C370] text-[#0E1A33] font-bold shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            Register Asset
          </button>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-ui text-[#FBE6AB] uppercase tracking-wider flex items-center gap-1 font-bold">
              <User size={12} /> Asset Handle / Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CY-9021-PLAYER or admin"
              required
              className="bg-[#142850]/85 border-[#315D9E] text-white placeholder-[#D5E2F5]/60 font-ui"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-ui text-[#FBE6AB] uppercase tracking-wider flex items-center gap-1 font-bold">
              <Key size={12} /> Cipher Passkey
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#142850]/85 border-[#315D9E] text-white placeholder-[#D5E2F5]/60 font-ui"
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
