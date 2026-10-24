'use client';

import React, { useState } from 'react';
import { Cpu, X } from 'lucide-react';
import { CaseComplexity, CaseDomain, generateProceduralCaseWithBlueprint } from '@/lib/simulation/case-generator';
import { createDGACase } from '@/lib/dga-store';

interface DgaSimulationCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated?: (caseId: string) => void;
}

export function DgaSimulationCaseDialog({ isOpen, onClose, onCaseCreated }: DgaSimulationCaseDialogProps) {
  const [complexity, setComplexity] = useState<CaseComplexity>('STANDARD_CASE');
  const [domain, setDomain] = useState<CaseDomain>('HYBRID');
  const [enableCrossSystem, setEnableCrossSystem] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { dgaCase, blueprint } = generateProceduralCaseWithBlueprint({
        complexity,
        domain,
        enableCrossSystem
      });
      dgaCase.creationSource = 'simulation';
      await createDGACase(dgaCase, blueprint);
      onCaseCreated?.(dgaCase.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The scenario could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#181724] border border-[#3b3852] text-[#e3e1ed] rounded-lg max-w-xl w-full p-5 space-y-3 text-xs">
        <div className="flex items-start justify-between border-b border-[#2d2a40] pb-2">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#a19ec9] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Training and agency simulation
            </div>
            <h2 className="text-sm font-bold text-white mt-1">Compile a procedural scenario</h2>
            <p className="text-[11px] text-[#8e8ba8] mt-1">
              Generated assignments keep their simulation blueprint. This is separate from a manual incident report.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#8b88a8] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="border border-rose-700 bg-rose-950/40 text-rose-100 rounded px-2 py-1.5">{error}</div>}
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['QUICK_INCIDENT', 'Quick'],
              ['STANDARD_CASE', 'Standard'],
              ['MAJOR_OPERATION', 'Major']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setComplexity(id)}
              className={`p-2 rounded border cursor-pointer ${complexity === id ? 'border-[#9598c4] bg-[#323049]' : 'border-[#39374e] bg-[#252437]'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['HYBRID', 'VEHICULAR', 'INVESTIGATIVE', 'MEDICAL', 'CYBER', 'INTELLIGENCE'] as CaseDomain[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDomain(item)}
              className={`p-1.5 rounded border cursor-pointer ${domain === item ? 'border-[#9598c4] bg-[#323049]' : 'border-[#39374e]'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-3 border border-[#343247] rounded p-2">
          <span>Link supporting agency systems in the generated scenario</span>
          <input type="checkbox" checked={enableCrossSystem} onChange={(event) => setEnableCrossSystem(event.target.checked)} />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-[#8b88a8] cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded bg-[#543eb3] text-white font-bold cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Compiling...' : 'Compile scenario'}
          </button>
        </div>
      </div>
    </div>
  );
}
