// src/components/MeridionLandingPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UserPlus, LogIn, Compass, Shield, BookOpen, HeartPulse, Video, Eye } from 'lucide-react';
import SparklesCanvas from './SparklesCanvas';
import meridionWorld from '../assets/images/meridion_world.jpg';
import videoLandscape from '../assets/videos/mixkit-flying-over-a-relaxing-creek-full-of-rock-on-the-51585-hd-ready.mp4';
import videoGlitter from '../assets/videos/mixkit-glitter-stars-and-snowflakes-19007-hd-ready.mp4';

export default function MeridionLandingPage({ onSignIn, onEnroll }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [useVideoMode, setUseVideoMode] = useState(true);

  return (
    <div className="relative min-h-screen w-full bg-[#05030d] text-white font-sans overflow-x-hidden select-none">
      {/* Dynamic Starfield Background Canvas */}
      <SparklesCanvas />

      {/* ── TOP IMMERSIVE HEADER BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-8 border-b border-purple-500/20 bg-[#070514]/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-serif-y2k text-xl font-bold tracking-widest text-purple-200">MERIDION</span>
            <span className="ml-2 text-[9px] font-mono tracking-[0.25em] text-purple-400/80 uppercase">CELESTIAL REALM</span>
          </div>
        </div>

        {/* Top Quick Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-200 hover:text-white hover:bg-purple-900/30 transition border border-purple-500/30"
          >
            Sign In
          </button>
          <button
            onClick={onEnroll}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Enroll into Citizen Registry
          </button>
        </div>
      </header>

      {/* ── HERO SECTION: MAC-STYLE PURPLE WORLD OF MERIDION ── */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center pt-20 pb-16 px-6">
        {/* Ambient Purple Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-[400px] w-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* macOS-style Celestial World Framing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-purple-400/30 bg-[#090518]/80 shadow-[0_25px_70px_rgba(112,26,204,0.25)] backdrop-blur-2xl"
        >
          {/* World Hero Background: Image or Video */}
          <div className="relative h-[440px] sm:h-[500px] w-full overflow-hidden">
            {useVideoMode ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
              >
                <source src={videoLandscape} type="video/mp4" />
              </video>
            ) : (
              <img
                src={meridionWorld}
                alt="World of Meridion"
                className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
              />
            )}

            {/* Dark Purple Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090518] via-[#090518]/40 to-transparent" />

            {/* Floating Top Badge */}
            <div className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-950/60 px-3.5 py-1.5 backdrop-blur-md text-[10px] font-mono tracking-wider text-purple-200">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span>LIVE WORLD • MERIDION VIDEO FEED</span>
            </div>
          </div>

          {/* Hero Content Overlay & CTA Block */}
          <div className="relative -mt-36 p-8 sm:p-12 text-center space-y-6">
            <div className="space-y-3">
              <h1 className="font-serif-y2k text-4xl sm:text-6xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-300 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                WELCOME TO MERIDION
              </h1>
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-purple-200/80 font-light leading-relaxed">
                Step into a living celestial realm. Register your citizen record, claim your housing quarters, and access the MIRAVERSE network.
              </p>
            </div>

            {/* IMMERSIVE CTA BUTTONS: ONLY SIGN IN AND ENROLL */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onEnroll}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-90 font-bold text-sm text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300 flex items-center justify-center gap-3 border border-purple-300/40 group"
              >
                <UserPlus size={18} className="text-purple-200 group-hover:scale-110 transition-transform" />
                <span>Enroll into Citizen Registry</span>
                <ArrowRight size={16} className="text-purple-200 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 font-semibold text-sm text-purple-200 border border-purple-400/40 hover:border-purple-300 transition-all duration-200 backdrop-blur-md flex items-center justify-center gap-3"
              >
                <LogIn size={18} className="text-purple-300" />
                <span>Sign In / Login Boot</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── DARK STARRY VOID SECTION: REALM PILLARS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-20 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono tracking-[0.3em] text-purple-400 uppercase">CITIZEN INFRASTRUCTURE</span>
          <h2 className="font-serif-y2k text-3xl sm:text-4xl font-bold text-purple-100">
            THE PILLARS OF MERIDION
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/70 max-w-xl mx-auto">
            Everything in Meridion operates under connected real-time protocols for identity, study, health, and governance.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 'cycademy',
              title: 'Cycademy Student Houses',
              icon: BookOpen,
              desc: 'Four historic student houses (Seraphima, Obsidian, Voss, Lightborn) dedicated to spellcraft, cybernetics, and strategy.',
            },
            {
              id: 'dga',
              title: 'Digital Governance Agency',
              icon: Shield,
              desc: 'Directive 14-B citizen biometric verification, housing deeds, and official clearance level updates.',
            },
            {
              id: 'faithmed',
              title: 'Faith Medical Portal',
              icon: HeartPulse,
              desc: 'Baseline aura telemetry, diagnostic scans, and spring energy restoration centers across Aureline.',
            },
            {
              id: 'spells',
              title: 'SpellForge Protocol Engine',
              icon: Compass,
              desc: 'Synthesize custom Y2K desktop spells, cipher routines, and netrunner exploits.',
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onMouseEnter={() => setHoveredCard(pillar.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative rounded-2xl border border-purple-500/20 bg-purple-950/30 p-6 space-y-4 backdrop-blur-md transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-900/40 hover:-translate-y-1 shadow-lg"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-500/30 group-hover:text-white transition">
                  <Icon size={22} />
                </div>
                <h3 className="font-serif-y2k text-base font-bold text-purple-100 group-hover:text-white transition">
                  {pillar.title}
                </h3>
                <p className="text-xs text-purple-300/70 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-purple-500/20 py-8 px-8 text-center text-xs text-purple-400/60 font-mono">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={14} className="text-purple-400" />
          <span className="font-serif-y2k font-bold text-purple-200">MIRAVERSE OS</span>
        </div>
        <p>© MERIDION REALM • ALL CITIZEN RIGHTS RESERVED</p>
      </footer>
    </div>
  );
}
