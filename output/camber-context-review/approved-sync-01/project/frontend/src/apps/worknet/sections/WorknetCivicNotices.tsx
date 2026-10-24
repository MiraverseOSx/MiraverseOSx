import React from 'react';
import NoticeBoardApp from '../../NoticeBoardApp';

export default function WorknetCivicNotices() {
  return (
    <div className="flex-1 h-full w-full overflow-hidden flex flex-col bg-[#faf8f5]">
      <div className="px-5 py-2.5 bg-[#f0f4f2] border-b border-[#dfe5e2] flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-800">Aureline Civic Notice Board & QUESTNOTICE Dispatch</span>
          <span className="text-slate-500 ml-2">Public community requests, rapid civic assistance, and neighborhood odd jobs.</span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
          Public Domain Access
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <NoticeBoardApp />
      </div>
    </div>
  );
}
