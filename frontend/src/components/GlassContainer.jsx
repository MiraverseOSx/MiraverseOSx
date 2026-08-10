// src/components/GlassContainer.jsx
import React from 'react';

export default function GlassContainer({ children, variant = 'dark', className = '' }) {
  const baseStyles = "backdrop-blur-xl rounded-xl transition-all duration-300";
  const variants = {
    dark: "border border-white/15 bg-slate-950/80 shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-white",
    light: "border border-white/80 bg-white/60 shadow-[0_10px_35px_rgba(43,55,98,0.09)] text-[#17213f]",
    neon: "border border-cyan-500/30 bg-black/85 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-cyan-200",
  };

  return (
    <div className={`${baseStyles} ${variants[variant] || variants.dark} ${className}`}>
      {children}
    </div>
  );
}
