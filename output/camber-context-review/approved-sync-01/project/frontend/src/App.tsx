import React from 'react';
import Desktop from './components/desktop/Desktop';
import { useInterfaceAppearance } from './components/ui/useInterfaceAppearance';

function App() {
  useInterfaceAppearance();
  return (
    <div className="mira-display-host text-slate-100 font-sans selection:bg-sky-500/30">
      <div
        id="mira-screen-frame"
        className="mira-display-frame"
      >
        <Desktop />
      </div>
    </div>
  );
}

export default App;
