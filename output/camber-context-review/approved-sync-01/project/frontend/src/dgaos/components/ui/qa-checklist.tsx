'use client';
import { ShieldCheck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface QaChecklistProps {
  module: string;
  method: string;
  observations?: string;
  conclusion?: string;
  limitations?: string;
  worksheetValues?: Record<string, string>;
  isReviewVerified?: boolean;
  onToggleReviewVerified?: (verified: boolean) => void;
}

export function QaChecklist({
  module,
  method,
  observations = '',
  conclusion = '',
  limitations = '',
  worksheetValues = {},
  isReviewVerified,
  onToggleReviewVerified,
}: QaChecklistProps) {
  const obsLower = observations.toLowerCase();
  const limitsLower = limitations.toLowerCase();
  const conclusionLower = conclusion.toLowerCase();

  // Check 1: Instrument parameters / magnification documented
  const hasInstrumentParameters =
    module === 'trace' || method.toLowerCase().includes('microscop')
      ? obsLower.includes('40x') ||
        obsLower.includes('100x') ||
        obsLower.includes('200x') ||
        obsLower.includes('400x') ||
        obsLower.includes('magnification') ||
        obsLower.includes('reticle')
      : obsLower.includes('reagent') ||
        obsLower.includes('marquis') ||
        obsLower.includes('control') ||
        obsLower.includes('solvent');

  // Check 2: Quality Control / Negative Control (crucial for toxicology/screening)
  const hasQcControl =
    module === 'toxicology' || method.toLowerCase().includes('screen')
      ? obsLower.includes('negative control') ||
        obsLower.includes('blank') ||
        obsLower.includes('qc')
      : obsLower.includes('reference') ||
        obsLower.includes('control') ||
        obsLower.includes('comparison');

  // Check 3: Structured measurements or morphology logged
  const hasMorphologyOrData =
    Object.keys(worksheetValues).length > 0 ||
    obsLower.includes('color') ||
    obsLower.includes('morphology') ||
    obsLower.includes('fracture') ||
    obsLower.includes('diameter') ||
    obsLower.includes('striation');

  // Check 4: Explicit scientific limitations stated
  const hasLimitations =
    limitations.trim().length > 20 &&
    (limitsLower.includes('limit') ||
      limitsLower.includes('individual') ||
      limitsLower.includes('sample') ||
      limitsLower.includes('presumptive') ||
      limitsLower.includes('unique'));

  // Check 5: Distinction between observation and interpretation
  const hasClearDistinction =
    conclusion.trim().length > 15 ||
    conclusionLower.includes('consistent') ||
    conclusionLower.includes('indicate');

  const checks = [
    {
      id: 'params',
      label:
        module === 'trace'
          ? 'Optical magnification & lighting parameters documented'
          : 'Instrument parameters & reagents recorded',
      passed: hasInstrumentParameters,
      hint: module === 'trace' ? 'Include magnification (e.g. 100x, polarized light)' : 'Record specific reagent and reaction time',
    },
    {
      id: 'qc',
      label:
        module === 'toxicology'
          ? 'Negative control blank tested (reagent integrity verified)'
          : 'Reference standard compared against questioned item',
      passed: hasQcControl,
      hint: module === 'toxicology' ? 'Run negative control in Well 2 to rule out false positives' : 'Compare with known control material',
    },
    {
      id: 'morphology',
      label: 'Objective morphological features or test data logged',
      passed: hasMorphologyOrData,
      hint: 'Record observable color, fracture pattern, or measurements',
    },
    {
      id: 'limits',
      label: 'Scientific limitations & sample boundaries explicit',
      passed: hasLimitations,
      hint: 'Note that class similarities do not prove unique source attribution',
    },
    {
      id: 'conclusion',
      label: 'Separate objective conclusion formulated',
      passed: hasClearDistinction,
      hint: 'Keep physical observations separate from interpretation',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="qa-checklist-card">
      <div className="qa-header flex items-center justify-between border-b pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-purple-600" />
          <div>
            <span className="font-bold text-xs text-gray-800 tracking-wide block">
              QUALITY PRACTICE AUDIT
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              Heuristic scan · Requires peer review verification
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            passedCount === checks.length
              ? 'bg-blue-100 text-blue-900 border border-blue-200'
              : 'bg-purple-50 text-purple-800 border border-purple-200'
          }`}
        >
          {passedCount} / {checks.length} Documentation detected
        </span>
      </div>

      <div className="qa-items-list space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.id}
            className={`qa-item-row flex items-start gap-2 p-1.5 rounded text-xs transition-colors ${
              c.passed ? 'bg-green-50/70 text-green-950' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {c.passed ? (
                <CheckCircle2 size={13} className="text-green-600" />
              ) : (
                <Circle size={13} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className={`font-medium leading-tight ${c.passed ? 'text-green-900' : 'text-gray-700'}`}>
                {c.label}
              </div>
              {!c.passed && <div className="text-[10px] text-gray-500 mt-0.5">{c.hint}</div>}
            </div>
          </div>
        ))}

        {/* Technical Reviewer Verification Check */}
        {onToggleReviewVerified !== undefined && (
          <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs bg-purple-50/50 p-1.5 rounded">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!isReviewVerified}
                onChange={(e) => onToggleReviewVerified(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
              <span className="font-semibold text-gray-800 text-[11px]">
                Technical Reviewer Verification Confirmed
              </span>
            </label>
            <span className="text-[10px] text-gray-500">ISO/IEC 17025 §7.7</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-1.5 border-t text-[10px] text-gray-500 flex items-center gap-1">
        <AlertCircle size={11} className="text-gray-400" />
        <span>Automated keyword scan detects documentation presence, not scientific accuracy.</span>
      </div>
    </div>
  );
}
