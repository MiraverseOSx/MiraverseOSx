'use client';

import React, { useState } from 'react';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { CaseDecision } from '@/lib/dga-types';
import { executeCaseDecision } from '@/lib/dga-store';

interface DgaDecisionModalProps {
  decision: CaseDecision;
  isOpen: boolean;
  onClose: () => void;
}

export function DgaDecisionModal({
  decision,
  isOpen,
  onClose
}: DgaDecisionModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(decision.options[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeOption = decision.options.find((o) => o.id === selectedOptionId) || decision.options[0];

  const handleCommitDecision = async () => {
    if (!selectedOptionId) return;
    setIsSubmitting(true);
    await executeCaseDecision(decision.id, selectedOptionId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
      <div className="bg-[#1f1e2c] border border-[#3f3d57] text-[#e3e1ed] rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35334a] pb-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              CONSEQUENTIAL OPERATIONAL DIRECTIVE
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">{decision.title}</h2>
            <div className="text-[11px] text-[#9a98ba] mt-0.5">
              Case Ref: <strong className="font-mono text-white">{decision.caseId}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#7c7a9b] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Context */}
        <p className="text-[11px] text-[#b8b6cf] bg-[#272638] border border-[#39374e] p-3 rounded leading-relaxed">
          {decision.description}
        </p>

        {/* Decision Options */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9598c4]">
            AVAILABLE EXECUTIVE COURSES OF ACTION
          </div>

          <div className="space-y-1.5">
            {decision.options.map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#323049] border-[#9598c4] shadow-xs'
                      : 'bg-[#222131] border-[#37354c] hover:border-[#524f70]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs text-white mb-1">
                    <span>{opt.label}</span>
                    <span className="text-[9px] font-mono text-[#9598c4] uppercase">
                      {isSelected ? 'SELECTED' : 'SELECT'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#b4b2cb] leading-relaxed">
                    {opt.description}
                  </div>

                  {opt.consequences.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#3b3a50] space-y-0.5 text-[10px] text-[#8684a2]">
                      <span className="font-bold text-[#9d9bbd] uppercase block">Anticipated Operational Repercussions:</span>
                      {opt.consequences.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[#b2b0ca]">
                          <ChevronRight className="w-2.5 h-2.5 text-[#9598c4]" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#313045] text-[10px] text-[#787698]">
          <span>RECORDED TO PERMANENT CASE TIMELINE</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#3f3d57] text-[#a9a7c6] hover:bg-[#2c2a3e] rounded text-xs cursor-pointer"
            >
              Defer
            </button>
            <button
              onClick={handleCommitDecision}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#524f77] hover:bg-[#63608d] text-white rounded text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMMIT DIRECTIVE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
