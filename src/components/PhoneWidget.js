import React from 'react';

export default function PhoneWidget() {
  return (
    <div className="relative w-[180px] h-[350px] rounded-[36px] border-[10px] border-[#1C1C1E] bg-[#1C1C1E] shadow-2xl y2k-window-shadow select-none">
      {/* Top Speaker Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-24 bg-[#1C1C1E] rounded-b-xl z-30 flex justify-center items-center">
        <div className="h-1 w-10 bg-white/20 rounded-full" />
      </div>

      {/* Screen Frame with Starry Night Wallpaper matching Mockup */}
      <div
        className="relative h-full w-full rounded-[26px] overflow-hidden bg-cover bg-center flex flex-col justify-between p-3 pt-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop')`,
        }}
      >
        {/* Dark Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* Screen Top Status */}
        <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-white px-1">
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Home Screen Icons */}
        <div className="relative z-10 my-auto grid grid-cols-2 gap-3 px-2">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow flex items-center justify-center text-lg hover:bg-white/30 transition">
              💬
            </div>
            <span className="text-[9px] font-medium text-white/90 mt-1">Comms</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow flex items-center justify-center text-lg hover:bg-white/30 transition">
              🎵
            </div>
            <span className="text-[9px] font-medium text-white/90 mt-1">Music</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow flex items-center justify-center text-lg hover:bg-white/30 transition">
              📷
            </div>
            <span className="text-[9px] font-medium text-white/90 mt-1">Camera</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow flex items-center justify-center text-lg hover:bg-white/30 transition">
              🎮
            </div>
            <span className="text-[9px] font-medium text-white/90 mt-1">Games</span>
          </div>
        </div>

        {/* Home Bar Indicator */}
        <div className="relative z-10 flex justify-center pb-1">
          <div className="h-1 w-16 bg-white/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
