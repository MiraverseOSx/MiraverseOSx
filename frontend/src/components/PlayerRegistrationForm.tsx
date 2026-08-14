import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { UserCheck, Shield, Sparkles, Cpu } from 'lucide-react';

export default function PlayerRegistrationForm({ onClose }) {
  const { player, registerPlayer } = useGameStore();
  const [handle, setHandle] = useState(player.handle || '');
  const [className, setClassName] = useState(player.class || 'Aether Scholar');
  const [dermalStatus, setDermalStatus] = useState('Synchronized');

  const handleSubmit = (e) => {
    e.preventDefault();
    registerPlayer({
      handle: handle.trim() || 'Cipher-01',
      class: className,
      biometrics: {
        dermalNodes: dermalStatus,
        opticalGeometry: 'Verified (1080p Hologram)',
        auraTelemetry: 'Stable Resonance'
      }
    });
    if (onClose) onClose();
  };

  return (
    <div className="p-5 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-2xl max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-sky-500/20">
        <UserCheck className="w-6 h-6 text-sky-400" />
        <h2 className="text-xl font-bold tracking-wide text-sky-300">Biometric Civic Calibration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
            Netrunner Handle
          </label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. Cipher-9"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-sky-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
            Specialization Class
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-sky-400"
          >
            <option value="Aether Scholar">Aether Scholar (SpellForge Specialist)</option>
            <option value="Shadow Infiltrator">Shadow Infiltrator (Versenet Netrunner)</option>
            <option value="PRISM Defender">PRISM Defender (System Guardian)</option>
            <option value="Civic Overseer">Civic Overseer (Governance & Archives)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
            Dermal Node Calibration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Synchronized', 'Overclocked', 'Harmonized', 'Shielded'].map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setDermalStatus(mode)}
                className={`py-1.5 px-2 rounded text-xs text-center border transition-all ${
                  dermalStatus === mode
                    ? 'bg-sky-600/40 border-sky-400 text-sky-200 font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 text-white rounded font-medium hover:bg-sky-500 shadow-md shadow-sky-500/20 flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            Calibrate Identity
          </button>
        </div>
      </form>
    </div>
  );
}
