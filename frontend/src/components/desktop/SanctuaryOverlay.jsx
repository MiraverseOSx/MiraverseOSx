import React from 'react';
import PublicIcon from '../ui/PublicIcon';

export default function SanctuaryOverlay() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="border border-[#1b254f]/30 bg-white/58 px-8 py-5 text-center backdrop-blur-[18px] shadow-none">
        <PublicIcon src="/icons/Icon set 1/0.5x/Star 256 px.png" size={22} className="mx-auto" />
        <p className="mt-2 font-display text-xl text-[#1b254f]">Sanctuary Active</p>
        <p className="mt-1 text-[10px] tracking-wider text-[#303b67] uppercase font-ui">
          THE DESKTOP HAS BEEN CLEARED
        </p>
      </div>
    </div>
  );
}
