// src/components/SignalPlayerModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, X, Play, Pause, Volume2, ShieldAlert, Activity } from 'lucide-react';
import Button from '../ui/button';

export default function SignalPlayerModal({ title = 'Transmission_Intercept.sig', onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md select-none font-sans text-purple-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-2xl border border-purple-400/40 bg-[#0d0724]/95 p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-purple-400 animate-pulse" />
            <h2 className="font-mono text-xs font-bold text-purple-200 uppercase">{title}</h2>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Audio Waveform Signal Graph Animation */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/60 p-5 space-y-4 text-center">
          <div className="flex items-center justify-center gap-1.5 h-16">
            {[40, 70, 30, 90, 50, 80, 45, 95, 60, 35, 75, 55, 85, 40, 65, 90, 30].map((h, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] } : { height: '15%' }}
                transition={{ repeat: Infinity, duration: 1 + (i % 5) * 0.2, ease: 'easeInOut' }}
                className="w-1.5 bg-gradient-to-t from-purple-600 via-indigo-400 to-cyan-300 rounded-full"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
            <span>FREQ: 142.85 MHz</span>
            <span>STATUS: {isPlaying ? 'DECODING SIGNAL...' : 'PAUSED'}</span>
            <span>00:14 / 01:30</span>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="rounded-xl border border-purple-500/20 bg-black/40 p-3.5 font-mono text-[11px] leading-relaxed text-purple-200 space-y-1">
          <div className="text-[9px] text-purple-400 uppercase tracking-widest flex items-center gap-1">
            <Activity size={12} /> Decoded Transmission Log:
          </div>
          <p className="text-purple-100">
            "Voss here. Do not broadcast this frequency. The PRISM corruption pulse under Sector 4 is spiking. Maintain veil observation."
          </p>
        </div>

        {/* Play Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="sm"
            variant="solid"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Decoder' : 'Resume Decoder'}</span>
          </Button>
          <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
            <Volume2 size={13} /> Signal Audio Active
          </span>
        </div>
      </motion.div>
    </div>
  );
}
