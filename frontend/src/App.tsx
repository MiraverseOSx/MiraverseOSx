import React from 'react';
import Desktop from './components/desktop/Desktop';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30">
      <Desktop />
    </div>
  );
}

export default App;
