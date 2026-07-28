import React from 'react';

export default function CRTMonitorWidget() {
  return (
    <div className="w-[340px] rounded-lg border-2 border-[#4A7B82] bg-[#1E383C] p-2 shadow-2xl y2k-panel-shadow select-none">
      {/* Sci-Fi Header bar */}
      <div className="mb-2 flex items-center justify-between border-b border-[#3E656B] pb-1 text-[11px] font-mono text-[#94D1D8]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span>FEED: ORACLE-9 / AELITA</span>
        </div>
        <span>REC ●</span>
      </div>

      {/* CRT Display Screen */}
      <div className="relative h-[210px] w-full overflow-hidden rounded border border-[#3A6065] bg-[#0E1A1C]">
        <div className="absolute inset-0 crt-scanlines pointer-events-none z-10 opacity-30" />
        
        {/* Animated Visual Feed */}
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop"
            alt="AI Visual Feed"
            className="h-full w-full object-cover filter contrast-125 brightness-90 saturate-150"
          />
          {/* Cyberpunk Grid Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A1C] via-transparent to-transparent opacity-80" />
          
          {/* Holographic Avatar Overlay Card (Bottom Left) */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded border border-[#4A7B82] bg-[#0E1A1C]/80 p-1.5 backdrop-blur-sm text-[10px] text-[#A6E3EB]">
            <div className="h-8 w-8 rounded overflow-hidden border border-[#5CA0AA]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-white">AELITA_v4</div>
              <div className="text-[9px] text-[#71B5C0]">SECURE LINK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Control Bar */}
      <div className="mt-2 flex items-center justify-between border-t border-[#3E656B] pt-1.5 px-2 text-[#94D1D8] text-[11px] font-mono">
        <span>CH 04</span>
        <div className="flex items-center gap-3">
          <button className="hover:text-white">⏮</button>
          <button className="hover:text-white">◀</button>
          <button className="hover:text-white">⏸</button>
          <button className="hover:text-white">▶</button>
          <button className="hover:text-white">⏭</button>
        </div>
        <span>1080p</span>
      </div>
    </div>
  );
}
