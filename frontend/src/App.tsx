import React from 'react';
import Desktop from './components/desktop/Desktop';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#060913] flex items-center justify-center text-slate-100 font-sans selection:bg-sky-500/30">
      <div
        id="mira-screen-frame"
        className="relative w-full h-full max-w-[1920px] max-h-[1080px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)]"
      >
        <Desktop />
      </div>
    </div>
  );
}

export default App;
