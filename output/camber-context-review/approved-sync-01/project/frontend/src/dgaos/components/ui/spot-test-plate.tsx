'use client';
import { useState, useEffect } from 'react';
import { FlaskConical, Droplet, Timer, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface SpotTestPlateProps {
  targetLabel?: string;
  onLogReaction?: (log: {
    reagent: string;
    well: string;
    colorChange: string;
    reactionTime: string;
    qcVerified: boolean;
    presumptiveResult: string;
    observationText: string;
  }) => void;
}

interface WellState {
  id: number;
  label: string;
  isQcBlank?: boolean;
  isPositiveStandard?: boolean;
  drops: { reagent: string; atTime: number }[];
  currentColor: string;
  reactionPhase: 'idle' | 'reacting' | 'completed';
  resultText?: string;
}

const REAGENTS = [
  {
    id: 'marquis',
    name: 'Marquis Reagent',
    color: '#9333ea', // Purple theme
    target: 'Alkaloids / Amphetamines / Opiates',
    positiveColor: '#c2410c', // Orange-brown
    blankColor: '#f1f5f9', // Clear
  },
  {
    id: 'cobalt',
    name: 'Cobalt Thiocyanate',
    color: '#2563eb', // Blue theme
    target: 'Cocaine Base / HCl Screen',
    positiveColor: '#1d4ed8', // Deep cobalt blue precipitate
    blankColor: '#f8fafc',
  },
  {
    id: 'duquenois',
    name: 'Duquenois-Levine',
    color: '#059669', // Emerald
    target: 'Cannabinoids / THC Screening',
    positiveColor: '#7e22ce', // Deep violet
    blankColor: '#f8fafc',
  },
  {
    id: 'kastle-meyer',
    name: 'Kastle-Meyer',
    color: '#e11d48', // Crimson
    target: 'Presumptive Blood / Peroxidase',
    positiveColor: '#f43f5e', // Vibrant pink
    blankColor: '#f8fafc',
  },
  {
    id: 'griess',
    name: 'Modified Griess Test',
    color: '#ea580c', // Orange
    target: 'Gunshot Residue (GSR) / Nitrites',
    positiveColor: '#dc2626', // Orange-red azo dye
    blankColor: '#f8fafc',
  },
  {
    id: 'rhodizonate',
    name: 'Sodium Rhodizonate',
    color: '#be185d', // Deep pink
    target: 'Lead Residue / Primer Wipe',
    positiveColor: '#701a75', // Scarlet to dark violet complex
    blankColor: '#f8fafc',
  },
  {
    id: 'dille-koppanyi',
    name: 'Dille-Koppanyi',
    color: '#4f46e5', // Indigo
    target: 'Barbiturates Screening',
    positiveColor: '#4338ca', // Violet-blue complex
    blankColor: '#f8fafc',
  },
  {
    id: 'acid-phosphatase',
    name: 'Acid Phosphatase',
    color: '#7c3aed', // Violet
    target: 'Seminal Fluid / AP Enzyme',
    positiveColor: '#581c87', // Deep purple chromogen
    blankColor: '#f8fafc',
  },
];

const COLOR_DESCRIPTORS: Record<string, string> = {
  '#c2410c': 'orange-brown precipitate',
  '#1d4ed8': 'cobalt blue precipitate',
  '#7e22ce': 'deep violet/purple',
  '#f43f5e': 'vibrant catalytic pink',
  '#dc2626': 'vivid orange-red azo dye (nitrite positive)',
  '#701a75': 'scarlet-to-dark violet complex (lead positive)',
  '#4338ca': 'distinctive violet-blue complex',
  '#581c87': 'deep purple/violet chromogen (AP active)',
};

export function SpotTestPlate({ targetLabel = 'Worksheet', onLogReaction }: SpotTestPlateProps) {
  const [selectedReagent, setSelectedReagent] = useState(REAGENTS[0]);
  const [activeTimer, setActiveTimer] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logged, setLogged] = useState(false);

  const [wells, setWells] = useState<WellState[]>([
    {
      id: 1,
      label: 'Sample A (Primary Residue)',
      drops: [],
      currentColor: '#f8fafc',
      reactionPhase: 'idle',
    },
    {
      id: 2,
      label: 'Negative Control (Blank / H₂O)',
      isQcBlank: true,
      drops: [],
      currentColor: '#f8fafc',
      reactionPhase: 'idle',
    },
    {
      id: 3,
      label: 'Positive Reference Standard',
      isPositiveStandard: true,
      drops: [],
      currentColor: '#f8fafc',
      reactionPhase: 'idle',
    },
    {
      id: 4,
      label: 'Sample B (Confirmatory Aliquot)',
      drops: [],
      currentColor: '#f8fafc',
      reactionPhase: 'idle',
    },
  ]);

  // Reaction timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsed((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const addDropToWell = (wellId: number) => {
    const reagent = selectedReagent;
    setActiveTimer(true);
    setElapsed(0);

    setWells((prev) =>
      prev.map((w) => {
        if (w.id !== wellId) return w;

        const isBlank = w.isQcBlank;
        const targetColor = isBlank ? reagent.blankColor : reagent.positiveColor;
        const result = isBlank
          ? 'Negative (No color change — QC Blank verified)'
          : `Presumptive Positive with ${reagent.name}`;

        return {
          ...w,
          drops: [...w.drops, { reagent: reagent.name, atTime: w.drops.length + 1 }],
          reactionPhase: 'reacting',
          resultText: result,
          currentColor: targetColor,
        };
      })
    );

    // After 2.5 seconds, finalize reaction phase
    setTimeout(() => {
      setWells((prev) =>
        prev.map((w) => (w.id === wellId ? { ...w, reactionPhase: 'completed' } : w))
      );
      setActiveTimer(false);
    }, 2500);
  };

  const resetPlate = () => {
    setWells([
      { id: 1, label: 'Sample A (Primary Residue)', drops: [], currentColor: '#f8fafc', reactionPhase: 'idle' },
      { id: 2, label: 'Negative Control (Blank / H₂O)', isQcBlank: true, drops: [], currentColor: '#f8fafc', reactionPhase: 'idle' },
      { id: 3, label: 'Positive Reference Standard', isPositiveStandard: true, drops: [], currentColor: '#f8fafc', reactionPhase: 'idle' },
      { id: 4, label: 'Sample B (Confirmatory Aliquot)', drops: [], currentColor: '#f8fafc', reactionPhase: 'idle' },
    ]);
    setActiveTimer(false);
    setElapsed(0);
  };

  const handleLogReaction = () => {
    // Collect all sample wells with drops (not just well 1)
    const testedSamples = wells.filter((w) => !w.isQcBlank && w.drops.length > 0);
    const qcBlank = wells.find((w) => w.isQcBlank && w.drops.length > 0);

    if (testedSamples.length === 0) return;

    const qcPassed = !!qcBlank && qcBlank.currentColor === '#f8fafc';
    const reactionSeconds = elapsed > 0 ? `${elapsed}s` : '2.4s';
    const primarySample = testedSamples[0];
    const reagentName = primarySample.drops[primarySample.drops.length - 1]?.reagent || selectedReagent.name;

    const wellSummaries = testedSamples
      .map((w) => {
        const colDesc = COLOR_DESCRIPTORS[w.currentColor] || 'chromogenic indicator shift';
        return `${w.label}: rapid color shift to ${colDesc} (${w.resultText || 'Presumptive Positive'})`;
      })
      .join('; ');

    const text = `Presumptive chemical spot test performed using ${reagentName}. Tested aliquot findings: [${wellSummaries}] within ${reactionSeconds}. Negative control blank: ${
      qcPassed
        ? 'remained clear/colorless (QC verified intact, no reagent contamination)'
        : qcBlank
        ? 'anomalous response'
        : 'not tested'
    }. Confirmatory instrumental testing recommended prior to final attribution.`;

    if (onLogReaction) {
      onLogReaction({
        reagent: reagentName,
        well: testedSamples.map((w) => w.label).join(', '),
        colorChange: primarySample.currentColor,
        reactionTime: reactionSeconds,
        qcVerified: qcPassed,
        presumptiveResult: primarySample.resultText || 'Presumptive Positive',
        observationText: text,
      });
    }
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  const hasSampleTested = wells.some((w) => !w.isQcBlank && w.drops.length > 0);
  const hasBlankTested = wells.some((w) => w.isQcBlank && w.drops.length > 0);

  return (
    <div className="spot-test-plate-box">
      {/* Top Reagent Selector Bar */}
      <div className="spot-test-toolbar">
        <div className="flex items-center gap-2">
          <FlaskConical size={17} className="text-purple-600" />
          <span className="font-semibold text-xs text-gray-800 tracking-wide">
            PRESUMPTIVE SPOT TEST TILE
          </span>
        </div>

        {/* Reagent Dropper Bottles */}
        <div className="reagent-dropper-rack">
          {REAGENTS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedReagent(r)}
              className={`reagent-bottle-btn ${
                selectedReagent.id === r.id ? 'active-reagent' : ''
              }`}
              title={r.target}
            >
              <Droplet size={13} style={{ color: r.color }} />
              <div className="text-left">
                <div className="font-bold text-[11px] leading-tight">{r.name}</div>
                <div className="text-[9px] opacity-75">{r.target.split('/')[0]}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Plate Reset */}
        <button
          type="button"
          onClick={resetPlate}
          title="Clean and reset spot plate"
          className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 border px-2 py-1 rounded bg-white"
        >
          <RotateCcw size={12} /> Reset Plate
        </button>
      </div>

      {/* Ceramic Depression Tile (Wells) */}
      <div className="ceramic-tile-surface">
        <div className="tile-header-instruction flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>
            Selected Dropper: <strong>{selectedReagent.name}</strong> · Click any well to dispense 1 drop
          </span>
          {activeTimer !== null && (
            <span className="timer-badge flex items-center gap-1 text-purple-700 font-mono font-semibold">
              <Timer size={13} /> {elapsed}s
            </span>
          )}
        </div>

        <div className="wells-grid">
          {wells.map((w) => {
            const isReacting = w.reactionPhase === 'reacting';
            return (
              <button
                type="button"
                key={w.id}
                onClick={() => addDropToWell(w.id)}
                className={`well-card text-left ${w.isQcBlank ? 'qc-blank-well' : ''}`}
                title="Click to add reagent drop"
              >
                <div className="well-label-strip">
                  <span className="well-name">{w.label}</span>
                  {w.isQcBlank && <span className="qc-tag">QC BLANK</span>}
                  {w.isPositiveStandard && <span className="std-tag">STANDARD</span>}
                </div>

                <div className="well-depression">
                  <div
                    className={`well-liquid ${isReacting ? 'animating-reaction' : ''}`}
                    style={{
                      backgroundColor: w.currentColor,
                      boxShadow: w.drops.length ? `inset 0 0 12px ${w.currentColor}aa` : undefined,
                    }}
                  >
                    {w.drops.length === 0 ? (
                      <span className="empty-well-hint text-gray-400 text-[10px]">Add drop</span>
                    ) : (
                      <div className="drop-indicator">
                        <Droplet size={14} className="text-gray-900/60" />
                        <span className="drop-count text-[9px] font-bold">{w.drops.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {w.resultText && (
                  <div className="well-result-pill text-[10px] text-gray-700 mt-1.5 font-medium truncate">
                    {w.resultText}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quality Control Alert Banner */}
        <div className="qc-status-bar mt-3 flex items-center justify-between p-2 rounded text-xs">
          <div className="flex items-center gap-2">
            {!hasBlankTested ? (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle size={14} /> ISO 17025 Reminder: Run Negative Control (Well 2) to rule out reagent contamination.
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <CheckCircle2 size={14} /> Negative Control Validated: Reagent purity confirmed.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!hasSampleTested}
            onClick={handleLogReaction}
            title={!hasSampleTested ? 'Dispense reagent drops onto Sample A or B first to test' : `Record reaction findings in ${targetLabel}`}
            className="px-3 py-1.5 rounded bg-purple-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {logged ? <CheckCircle2 size={13} className="text-green-300" /> : <FlaskConical size={13} />}
            {logged ? 'Reaction Logged!' : `Log Reaction to ${targetLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
