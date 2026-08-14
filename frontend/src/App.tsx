import React, { useState } from 'react';
import Desktop from './components/Desktop';
import HUD from './components/HUD';
import PlayerRegistrationForm from './components/PlayerRegistrationForm';
import { UserCheck } from 'lucide-react';

function App() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Real-time Photino/Python Game Logic HUD Header */}
      <HUD />

      {/* Main Desktop Container */}
      <div className="flex-1 relative overflow-hidden">
        <Desktop />

        {/* Quick Calibration FAB */}
        <button
          onClick={() => setShowRegistration(true)}
          className="fixed bottom-14 right-4 z-50 p-2.5 bg-sky-600/80 hover:bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/30 backdrop-blur border border-sky-400/40 transition-transform active:scale-95"
          title="Civic Biometric Calibration"
        >
          <UserCheck className="w-5 h-5" />
        </button>

        {/* Biometric Calibration Registration Modal */}
        {showRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <PlayerRegistrationForm onClose={() => setShowRegistration(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
