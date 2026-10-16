import React, { useEffect, useState } from 'react';
import { loadCitizenRefs, type CitizenRecordRef } from '../integration/citizenBridge';
import { useOSStore } from '../store/useOSStore';
import { FileText, Sparkles, RefreshCw } from 'lucide-react';

export default function RegistryWorkspaceApp() {
  const [citizens, setCitizens] = useState<CitizenRecordRef[]>([]);
  const toggleApp = useOSStore((s) => s.toggleApp);

  const refresh = () => setCitizens(loadCitizenRefs());

  useEffect(() => {
    const message = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.source === 'meridion-registry' && e.data?.type === 'citizens-changed') {
        refresh();
      }
    };
    refresh();
    window.addEventListener('message', message);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('message', message);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8F6FC] text-[#25283C] font-sans">
      <div className="flex items-center justify-between bg-white border-b border-[#E2E8F0] px-4 py-2 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <strong className="text-[#2C2849] font-serif font-bold tracking-wide">AURA · Citizen Registry</strong>
          <span className="rounded-full bg-[#EAE6F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C5FAC]">
            {citizens.length} registered citizens
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleApp('documentStudio')}
            className="flex items-center gap-1.5 rounded-md bg-[#2C2849] hover:bg-[#3D3766] px-3 py-1 text-xs font-semibold text-white shadow-sm transition"
            title="Open Document Studio for Nine-Document Packet generation"
          >
            <FileText size={13} className="text-[#C5AB78]" />
            Document Studio (9 Documents)
          </button>
        </div>
      </div>

      <iframe
        title="Citizen Registry"
        src="/registry.html"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}
