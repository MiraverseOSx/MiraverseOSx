import React from 'react';

export default function GlassContainer({ children, variant = 'dark', className = '' }) {
  const baseStyles = "rounded-xl transition-all duration-300 shadow-xl";
  const variants = {
    dark: "border border-slate-700 bg-slate-900 text-white shadow-2xl",
    light: "border border-slate-300 bg-white text-slate-900 shadow-lg",
    neon: "border border-cyan-500 bg-slate-950 text-cyan-200 shadow-cyan-950/40",
  };

  return (
    <div className={`${baseStyles} ${variants[variant] || variants.dark} ${className}`}>
      {children}
    </div>
  );
}
