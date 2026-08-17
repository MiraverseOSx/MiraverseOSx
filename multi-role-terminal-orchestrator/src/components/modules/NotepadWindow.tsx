import React, { useState } from 'react';
import { FileText, Save, Check, Trash2 } from 'lucide-react';

export const NotepadWindow: React.FC = () => {
  const [notes, setNotes] = useState(
    `=== METRO OPERATOR SHIFT NOTES ===
[08:42] Medical: Patient Jenkins BP stabilized with IV bolus. Keep OR on standby.
[08:43] Forensics: Track 4th St Subway acoustic logs (matches ransom tape audio signature).
[08:45] Dispatch: Hazmat perimeter 500m on Harbor Pier 14 conflagration.

REMINDERS:
- Cross-match blood samples for ER Triage.
- Subpoena cellular tower logs for Specter suspect.`
  );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-2 font-commissioner">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <span className="text-xs font-mono text-slate-500 font-medium">
          Shift Scratchpad & Investigative Working Memory
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
          >
            {saved ? <Check className="w-3 h-3 text-emerald-400" /> : <Save className="w-3 h-3" />}
            {saved ? 'Saved' : 'Save Notes'}
          </button>
          <button
            onClick={() => setNotes('')}
            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 w-full min-h-[300px] p-3 text-xs font-mono bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-500 leading-relaxed text-slate-800 resize-none"
        placeholder="Type shift notes, suspect timestamps, vitals notes, or coordinate reminders..."
      />
    </div>
  );
};
