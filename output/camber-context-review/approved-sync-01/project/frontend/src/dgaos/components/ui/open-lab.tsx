'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Microscope,
  FlaskConical,
  Sun,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  FileText,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';
import { ComparisonMicroscope } from '@/components/ui/comparison-microscope';
import { SpotTestPlate } from '@/components/ui/spot-test-plate';
import type { LabRecord } from '@/lib/records';

interface OpenLabProps {
  records: LabRecord[];
  initialMountedEvidenceId?: string;
  onSave: (body: Record<string, unknown>) => Promise<LabRecord | undefined>;
  onOpenExamine: (record: LabRecord) => void;
  onOpenBenchSheet?: (record: LabRecord) => void;
  navigate: (view: string) => void;
}

interface SpecimenPreset {
  id: string;
  name: string;
  type: string;
  category: 'glass' | 'fiber' | 'powder' | 'biological' | 'qc';
  description: string;
  recommendedInstrument: 'microscope' | 'spot_plate' | 'als_uv';
}

const SPECIMEN_PRESETS: SpecimenPreset[] = [
  {
    id: 'preset-glass',
    name: 'Standard Architectural Float Glass Shard',
    type: 'Glass',
    category: 'glass',
    description: 'Flat float glass sample (RI ~1.517) exhibiting sharp conchoidal fracture lines and uniform thickness.',
    recommendedInstrument: 'microscope',
  },
  {
    id: 'preset-fiber',
    name: 'Blue Acrylic / Polyester Textile Fiber',
    type: 'Fiber',
    category: 'fiber',
    description: 'Trilobal synthetic fiber with strong second-order birefringence under cross-polarized illumination.',
    recommendedInstrument: 'microscope',
  },
  {
    id: 'preset-powder',
    name: 'Unknown Off-White Crystalline Powder',
    type: 'Powder / Chemical',
    category: 'powder',
    description: 'Recovered scene residue for presumptive screening. Marquis, Cobalt & Dille-Koppanyi targets.',
    recommendedInstrument: 'spot_plate',
  },
  {
    id: 'preset-gsr',
    name: "Shooter's Hand Swab (Primer & GSR Residue)",
    type: 'Gunshot Residue (GSR)',
    category: 'powder',
    description: 'Cotton swab of web of hand with heavy metallic discharge. Modified Griess & Sodium Rhodizonate test target.',
    recommendedInstrument: 'spot_plate',
  },
  {
    id: 'preset-paint',
    name: 'Automotive Multi-Layer Paint Chip (Hit-and-Run)',
    type: 'Paint / Polymer',
    category: 'glass',
    description: 'Vehicle body paint cross-section with 4 distinct stratified layers (clearcoat, basecoat, primer-surfacer, e-coat).',
    recommendedInstrument: 'microscope',
  },
  {
    id: 'preset-document',
    name: 'Questioned Document Ink Line / Alteration',
    type: 'Document / Ink',
    category: 'qc',
    description: 'Handwritten inscription suspected of alteration with differential ink luminescence under 365nm/450nm ALS.',
    recommendedInstrument: 'als_uv',
  },
  {
    id: 'preset-blood',
    name: 'Suspected Biological Stain Swab (Blood)',
    type: 'Biological Stain',
    category: 'biological',
    description: 'Dried reddish-brown swab aliquot. Kastle-Meyer catalytic peroxidase target.',
    recommendedInstrument: 'spot_plate',
  },
  {
    id: 'preset-semen',
    name: 'Sexual Assault Evidence Swab (Serology)',
    type: 'Biological Fluid',
    category: 'biological',
    description: 'Cotton swab aliquot tested for seminal acid phosphatase (AP) enzyme activity with fast blue B.',
    recommendedInstrument: 'spot_plate',
  },
  {
    id: 'preset-qc-water',
    name: 'Reagent-Grade Deionized Water (Negative Blank)',
    type: 'QC Blank',
    category: 'qc',
    description: 'Distilled water control standard used for baseline quality control and reagent contamination checks.',
    recommendedInstrument: 'spot_plate',
  },
];

function getInstrumentForRecord(record?: LabRecord | null): 'microscope' | 'spot_plate' | 'als_uv' {
  if (!record) return 'microscope';
  const t = (record.data?.type || '').toLowerCase();
  if (
    t.includes('powder') ||
    t.includes('toxicology') ||
    t.includes('chemical') ||
    t.includes('blood') ||
    t.includes('biological') ||
    t.includes('swab') ||
    t.includes('gsr')
  ) {
    return 'spot_plate';
  }
  if (t.includes('document') || t.includes('ink')) {
    return 'als_uv';
  }
  return 'microscope';
}

export function OpenLab({
  records,
  initialMountedEvidenceId,
  onSave,
  onOpenExamine,
  onOpenBenchSheet,
  navigate,
}: OpenLabProps) {
  const initialMountedRecord = initialMountedEvidenceId
    ? records.find((r) => r.id === initialMountedEvidenceId && r.kind === 'evidence')
    : undefined;

  const [activeInstrument, setActiveInstrument] = useState<'microscope' | 'spot_plate' | 'als_uv'>(() =>
    getInstrumentForRecord(initialMountedRecord)
  );
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>(
    () => initialMountedRecord?.id || 'preset-glass'
  );
  const [customEvidenceId, setCustomEvidenceId] = useState<string>(
    () => initialMountedRecord?.id || ''
  );

  const [prevInitialId, setPrevInitialId] = useState<string | undefined>(initialMountedEvidenceId);

  // Synchronize state if initialMountedEvidenceId prop changes during session
  if (initialMountedEvidenceId !== prevInitialId) {
    setPrevInitialId(initialMountedEvidenceId);
    if (initialMountedRecord) {
      setCustomEvidenceId(initialMountedRecord.id);
      setSelectedSpecimenId(initialMountedRecord.id);
      setActiveInstrument(getInstrumentForRecord(initialMountedRecord));
    }
  }

  const [benchNotes, setBenchNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('trace_open_lab_notes') || '';
      } catch {}
    }
    return '';
  });
  const [benchLogs, setBenchLogs] = useState<{ id: string; timestamp: string; instrument: string; summary: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('trace_open_lab_logs');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [copied, setCopied] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [transferring, setTransferring] = useState(false);
  const [transferNotice, setTransferNotice] = useState('');

  // Persist bench notes and logs to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('trace_open_lab_notes', benchNotes);
        localStorage.setItem('trace_open_lab_logs', JSON.stringify(benchLogs));
      } catch {}
    }
  }, [benchNotes, benchLogs]);

  // ALS (Alternate Light Source) UV Stage State
  const [alsWavelength, setAlsWavelength] = useState<'365nm' | '450nm' | 'white'>('365nm');
  const [alsBarrierFilter, setAlsBarrierFilter] = useState<'none' | 'orange' | 'yellow'>('orange');
  const [alsIntensity, setAlsIntensity] = useState(80);
  const [alsLogged, setAlsLogged] = useState(false);
  const alsCanvasRef = useRef<HTMLCanvasElement>(null);

  const evidenceRecords = records.filter((r) => r.kind === 'evidence');
  const examRecords = records.filter((r) => r.kind === 'examination' && r.data.status !== 'Completed');

  // Determine current active specimen details
  const isCustom = selectedSpecimenId === 'custom';
  const customEvidence = isCustom ? evidenceRecords.find((e) => e.id === customEvidenceId) : null;
  const currentPreset = !isCustom ? SPECIMEN_PRESETS.find((p) => p.id === selectedSpecimenId) || SPECIMEN_PRESETS[0] : null;

  // Filter transfer examination targets strictly to mounted evidence and case
  const eligibleExams = isCustom && customEvidence
    ? examRecords.filter((e) => e.data.evidenceId === customEvidence.id || e.caseId === customEvidence.caseId)
    : examRecords;

  const effectiveExamId = selectedExamId && eligibleExams.some((e) => e.id === selectedExamId)
    ? selectedExamId
    : eligibleExams[0]?.id || '';

  const currentSpecimenName = isCustom
    ? customEvidence ? `${customEvidence.id} · ${customEvidence.data.title}` : 'Select Evidence Item'
    : currentPreset?.name || 'Questioned Specimen';

  const currentSpecimenType = isCustom
    ? (customEvidence?.data.type || 'General').toLowerCase()
    : currentPreset?.category || 'glass';

  // Handle Mount Preset
  const handleSelectPreset = (preset: SpecimenPreset) => {
    setSelectedSpecimenId(preset.id);
    setActiveInstrument(preset.recommendedInstrument);
  };

  // Handle Mount Case Evidence
  const handleSelectCustomEvidence = (evId: string) => {
    setSelectedSpecimenId('custom');
    setCustomEvidenceId(evId);
    const ev = evidenceRecords.find((e) => e.id === evId);
    if (ev) {
      const t = (ev.data.type || '').toLowerCase();
      if (t.includes('powder') || t.includes('chemical') || t.includes('toxicology') || t.includes('blood') || t.includes('biological')) {
        setActiveInstrument('spot_plate');
      } else if (t.includes('document') || t.includes('ink')) {
        setActiveInstrument('als_uv');
      } else {
        setActiveInstrument('microscope');
      }
    }
  };

  // Append new entry to bench notes & logs
  const appendLog = (instrumentTitle: string, entryText: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const formatted = `[${timestamp} ${instrumentTitle} · Specimen: ${currentSpecimenName}]\n${entryText}`;
    
    setBenchNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${formatted}` : formatted));
    setBenchLogs((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp,
        instrument: instrumentTitle,
        summary: entryText.split('\n')[0],
      },
      ...prev,
    ]);
  };

  // Copy notes to clipboard
  const handleCopyNotes = async () => {
    if (!benchNotes.trim()) return;
    try {
      await navigator.clipboard.writeText(
        `TRACE OPEN LABORATORY BENCH NOTES\nSession Date: ${new Date().toISOString()}\nTarget Specimen: ${currentSpecimenName}\n\n${benchNotes}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Transfer notes to selected active case examination
  const handleTransferToExam = async () => {
    const targetId = effectiveExamId;
    if (!targetId || !benchNotes.trim()) return;
    const targetExam = records.find((r) => r.id === targetId);
    if (!targetExam) return;

    setTransferring(true);
    try {
      const prevObs = (targetExam.data.observations || '').trim();
      const updatedObs = prevObs
        ? `${prevObs}\n\n--- OPEN BENCH FINDINGS IMPORTED (${new Date().toLocaleTimeString()}) ---\n${benchNotes}`
        : `--- OPEN BENCH FINDINGS IMPORTED (${new Date().toLocaleTimeString()}) ---\n${benchNotes}`;

      await onSave({
        action: 'examine',
        id: targetExam.id,
        revision: targetExam.revision,
        data: {
          ...targetExam.data,
          observations: updatedObs,
          status: 'In progress',
        },
      });

      setTransferNotice(`Bench findings appended to ${targetExam.id} (${targetExam.data.title}).`);
      setTimeout(() => setTransferNotice(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setTransferring(false);
    }
  };

  // Render ALS / UV Canvas
  useEffect(() => {
    if (activeInstrument !== 'als_uv') return;
    const canvas = alsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background base illumination
    if (alsWavelength === '365nm') {
      ctx.fillStyle = '#090514'; // Near-UV deep violet/black
    } else if (alsWavelength === '450nm') {
      ctx.fillStyle = alsBarrierFilter === 'orange' ? '#271202' : '#03112c'; // Dark amber with orange filter or intense blue
    } else {
      ctx.fillStyle = '#f1f5f9'; // Daylight white
    }
    ctx.fillRect(0, 0, w, h);

    // Light beam cone overlay
    const beamGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.7);
    if (alsWavelength === '365nm') {
      beamGrad.addColorStop(0, `rgba(147, 51, 234, ${alsIntensity * 0.0035})`);
      beamGrad.addColorStop(1, 'rgba(15, 7, 34, 0)');
    } else if (alsWavelength === '450nm') {
      if (alsBarrierFilter === 'orange') {
        beamGrad.addColorStop(0, `rgba(245, 158, 11, ${alsIntensity * 0.003})`);
        beamGrad.addColorStop(1, 'rgba(39, 18, 2, 0)');
      } else {
        beamGrad.addColorStop(0, `rgba(37, 99, 235, ${alsIntensity * 0.004})`);
        beamGrad.addColorStop(1, 'rgba(3, 17, 44, 0)');
      }
    } else {
      beamGrad.addColorStop(0, `rgba(255, 255, 255, ${alsIntensity * 0.005})`);
      beamGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');
    }
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, w, h);

    // Specimen representation & Fluorescence Reaction
    ctx.save();
    ctx.translate(w / 2, h / 2);

    const type = currentSpecimenType;

    if (type.includes('fiber')) {
      // Synthetic fiber fluoresces brightly under 365nm UV (optical brighteners)
      const glow = alsWavelength === '365nm' || (alsWavelength === '450nm' && alsBarrierFilter === 'orange');
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      if (glow) {
        ctx.shadowColor = alsWavelength === '365nm' ? '#38bdf8' : '#22c55e';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = alsWavelength === '365nm' ? '#e0f2fe' : '#86efac';
      } else {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#1e3a8a';
      }
      ctx.beginPath();
      ctx.moveTo(-70, -50);
      ctx.bezierCurveTo(-20, 20, 30, -30, 80, 50);
      ctx.stroke();
    } else if (type.includes('blood') || type.includes('biological')) {
      // Latent biological stain: absorbs under UV (dark quench), but secondary secretions fluoresce yellow/orange under 450nm + barrier
      if (alsWavelength === '450nm' && alsBarrierFilter === 'orange') {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#fbbf24';
      } else if (alsWavelength === '365nm') {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e1b4b'; // Quenches/dark absorbance
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#991b1b'; // Reddish brown under white light
      }
      ctx.beginPath();
      ctx.ellipse(-10, 5, 45, 30, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();

      // Satellite micro-spatter droplets
      ctx.beginPath();
      ctx.arc(55, -25, 5, 0, 2 * Math.PI);
      ctx.arc(42, 35, 4, 0, 2 * Math.PI);
      ctx.arc(-55, -30, 6, 0, 2 * Math.PI);
      ctx.fill();
    } else if (type.includes('powder') || type.includes('chemical')) {
      // Crystalline powder clusters
      const glow = alsWavelength === '365nm';
      if (glow) {
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#f3e8ff';
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = alsWavelength === '450nm' ? '#64748b' : '#cbd5e1';
      }
      for (let i = -40; i <= 40; i += 18) {
        for (let j = -30; j <= 30; j += 15) {
          ctx.beginPath();
          ctx.arc(i + Math.sin(j) * 8, j + Math.cos(i) * 6, 3 + (i % 4), 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (type.includes('paint')) {
      // Automotive Paint Chip: clearcoat luminescence under UV (365nm)
      const clearcoatGlow = alsWavelength === '365nm';
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = clearcoatGlow ? '#38bdf8' : '#64748b';
      ctx.shadowColor = clearcoatGlow ? '#38bdf8' : 'transparent';
      ctx.shadowBlur = clearcoatGlow ? 16 : 0;
      ctx.fillStyle = clearcoatGlow ? '#e0f2fe' : '#334155';
      ctx.fillRect(-60, -35, 120, 70);
      ctx.strokeRect(-60, -35, 120, 70);

      // Stratified boundary line
      ctx.strokeStyle = clearcoatGlow ? '#93c5fd' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.lineTo(60, 0);
      ctx.stroke();
    } else if (type.includes('gsr') || type.includes('gunshot')) {
      // Gunshot residue / primer discharge spatter particles
      const isGriessReaction = alsWavelength === '450nm' && alsBarrierFilter === 'orange';
      for (let i = -50; i <= 50; i += 16) {
        for (let j = -40; j <= 40; j += 14) {
          ctx.beginPath();
          const r = 2 + (Math.abs(i * j) % 4);
          ctx.arc(i + Math.sin(j * 3) * 5, j + Math.cos(i * 2) * 5, r, 0, 2 * Math.PI);
          ctx.fillStyle = isGriessReaction ? '#ef4444' : '#475569';
          ctx.shadowColor = isGriessReaction ? '#dc2626' : 'transparent';
          ctx.shadowBlur = isGriessReaction ? 8 : 0;
          ctx.fill();
        }
      }
    } else if (type.includes('document') || type.includes('ink')) {
      // Differential ink luminescence: underlying stroke vs alteration
      const altersGlow = alsWavelength === '365nm' || (alsWavelength === '450nm' && alsBarrierFilter === 'yellow');
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(-70, -30);
      ctx.lineTo(10, -30);
      ctx.stroke();

      // Altered portion fluoresces under 365nm / 450nm
      ctx.strokeStyle = altersGlow ? '#4ade80' : '#1e293b';
      ctx.shadowColor = altersGlow ? '#22c55e' : 'transparent';
      ctx.shadowBlur = altersGlow ? 18 : 0;
      ctx.beginPath();
      ctx.moveTo(10, -30);
      ctx.lineTo(75, -30);
      ctx.stroke();
    } else if (type.includes('semen')) {
      // Seminal fluid / flavin native fluorescence
      const semenGlow = alsWavelength === '450nm' && (alsBarrierFilter === 'orange' || alsBarrierFilter === 'yellow');
      ctx.fillStyle = semenGlow ? '#fef08a' : alsWavelength === '365nm' ? '#cbd5e1' : '#e2e8f0';
      ctx.shadowColor = semenGlow ? '#eab308' : 'transparent';
      ctx.shadowBlur = semenGlow ? 22 : 0;
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 35, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Glass Shard: Transparent with surface reflection & faint edge luminescence
      ctx.lineWidth = 2;
      if (alsWavelength === '365nm') {
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      } else if (alsWavelength === '450nm' && alsBarrierFilter === 'orange') {
        ctx.strokeStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(226, 232, 240, 0.2)';
      }

      ctx.beginPath();
      ctx.moveTo(-50, -45);
      ctx.lineTo(40, -60);
      ctx.lineTo(65, 30);
      ctx.lineTo(15, 60);
      ctx.lineTo(-45, 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, [activeInstrument, alsWavelength, alsBarrierFilter, alsIntensity, currentSpecimenType]);

  // Log ALS / UV Findings
  const handleLogAls = () => {
    const isFluorescent =
      (currentSpecimenType.includes('fiber') && alsWavelength === '365nm') ||
      (currentSpecimenType.includes('biological') && alsWavelength === '450nm' && alsBarrierFilter === 'orange') ||
      (currentSpecimenType.includes('powder') && alsWavelength === '365nm');

    const entry = `Alternate Light Source (ALS) multispectral examination conducted using ${alsWavelength} excitation wavelength with ${
      alsBarrierFilter === 'none' ? 'direct viewing (no barrier filter)' : `${alsBarrierFilter} optical barrier filter (550nm cutoff)`
    }. Illumination beam intensity: ${alsIntensity}%.
Observed luminescence response: ${
      isFluorescent
        ? 'Positive distinctive fluorescence observed. Characteristic emission profile recorded.'
        : 'Negative / baseline luminescence. Quenching or non-fluorescent response observed.'
    }`;

    appendLog('Alternate Light Source (ALS)', entry);
    setAlsLogged(true);
    setTimeout(() => setAlsLogged(false), 2000);
  };

  return (
    <div className="open-lab-container">
      {/* Top Banner & Quick Controls */}
      <div className="open-lab-header">
        <div className="open-lab-header-left">
          <div className="open-lab-badge">
            <span className="live-dot" />
            <span>UNCONSTRAINED FORENSIC BENCH</span>
          </div>
          <h2>Open Laboratory & Virtual Instrumentation</h2>
          <p>
            Freely mount reference standards or registered case evidence, operate analytical instruments, and log observations directly to your laboratory record.
          </p>
        </div>

        <div className="open-lab-header-actions">
          <button
            type="button"
            className="secondary flex items-center gap-1.5"
            onClick={() => {
              setBenchNotes('');
              setBenchLogs([]);
            }}
            title="Reset bench scratchpad and logs"
          >
            <RotateCcw size={14} /> Clear Bench
          </button>

          <button
            type="button"
            className="secondary flex items-center gap-1.5"
            onClick={handleCopyNotes}
            disabled={!benchNotes.trim()}
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Bench Notes'}
          </button>
        </div>
      </div>

      {transferNotice && (
        <output className="notice">
          <Check size={16} /> {transferNotice}
          <button type="button" aria-label="Dismiss notification" onClick={() => setTransferNotice('')}>
            ×
          </button>
        </output>
      )}

      {/* Main Grid: Left Stage (Instrument) + Right Bench Rack (Specimens & Scratchpad) */}
      <div className="open-lab-grid">
        {/* Left Column: Virtual Instrumentation */}
        <div className="instrument-stage-column">
          {/* Instrument Selector Tabs */}
          <div className="instrument-nav-pills">
            <button
              type="button"
              className={`instrument-pill ${activeInstrument === 'microscope' ? 'active' : ''}`}
              onClick={() => setActiveInstrument('microscope')}
            >
              <Microscope size={16} />
              <div>
                <strong>Comparison Microscope</strong>
                <small>Optical Split-Bridge (40x–400x)</small>
              </div>
            </button>

            <button
              type="button"
              className={`instrument-pill ${activeInstrument === 'spot_plate' ? 'active' : ''}`}
              onClick={() => setActiveInstrument('spot_plate')}
            >
              <FlaskConical size={16} />
              <div>
                <strong>Chemical Spot Plate</strong>
                <small>Porcelain 4-Well Color Tests</small>
              </div>
            </button>

            <button
              type="button"
              className={`instrument-pill ${activeInstrument === 'als_uv' ? 'active' : ''}`}
              onClick={() => setActiveInstrument('als_uv')}
            >
              <Sun size={16} />
              <div>
                <strong>Forensic ALS / UV Light</strong>
                <small>Multispectral 365/450nm & Filters</small>
              </div>
            </button>
          </div>

          {/* Active Instrument Display */}
          <div className="instrument-viewport-card">
            <div className="viewport-status-bar">
              <div className="flex items-center gap-2">
                <span className="specimen-tag-badge">
                  <span>MOUNTED: {currentSpecimenName}</span>
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                STAGE ID: {selectedSpecimenId.toUpperCase()}
              </span>
            </div>

            {activeInstrument === 'microscope' ? (
              <div className="instrument-wrapper">
                <ComparisonMicroscope
                  evidenceType={currentSpecimenType}
                  evidenceTitle={currentSpecimenName}
                  onLogFindings={(findings) => {
                    const entry = `Optical Comparison Microscopy (${findings.magnification})
${findings.observationText}
Lighting: ${findings.lighting} | Focus: ${findings.focusStatus} | Reticle reading: ${findings.reticleReading}`;
                    appendLog('Comparison Microscope', entry);
                  }}
                />
              </div>
            ) : activeInstrument === 'spot_plate' ? (
              <div className="instrument-wrapper">
                <SpotTestPlate
                  targetLabel="Bench Notes"
                  onLogReaction={(log) => {
                    const entry = `Chemical Spot Plate (${log.reagent})
${log.observationText}
Reaction time: ${log.reactionTime} | Result: ${log.presumptiveResult} | Negative control: ${log.qcVerified ? 'Verified' : 'Unconfirmed'}`;
                    appendLog('Spot Test Plate', entry);
                  }}
                />
              </div>
            ) : activeInstrument === 'als_uv' ? (
              <div className="instrument-wrapper">
                {/* ALS Controls Bar */}
                <div className="als-controls-bar">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Light Source:</span>
                    {(['white', '365nm', '450nm'] as const).map((wl) => (
                      <button
                        key={wl}
                        type="button"
                        onClick={() => setAlsWavelength(wl)}
                        className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                          alsWavelength === wl
                            ? wl === '365nm'
                              ? 'bg-purple-600 text-white border-purple-700 font-semibold shadow-sm'
                              : wl === '450nm'
                              ? 'bg-blue-600 text-white border-blue-700 font-semibold shadow-sm'
                              : 'bg-gray-800 text-white border-gray-900 font-semibold shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {wl === 'white' ? 'Visible White' : wl === '365nm' ? 'UV-A (365nm)' : 'Blue ALS (450nm)'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Barrier Filter:</span>
                    {(['none', 'yellow', 'orange'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setAlsBarrierFilter(filter)}
                        className={`px-2.5 py-1 text-xs rounded border transition-colors capitalize ${
                          alsBarrierFilter === filter
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ALS Viewport Stage */}
                <div className={`als-stage-viewport ${alsWavelength !== 'white' ? 'luminescent-active' : ''}`}>
                  <canvas ref={alsCanvasRef} width={500} height={320} className="als-canvas" />
                  <div className="als-watermark">
                    <span>
                      EXCITATION: {alsWavelength.toUpperCase()} · FILTER: {alsBarrierFilter.toUpperCase()} · INTENSITY: {alsIntensity}%
                    </span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="als-bottom-bar">
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <span>Beam Intensity:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={alsIntensity}
                      onChange={(e) => setAlsIntensity(Number(e.target.value))}
                      className="focus-slider"
                    />
                    <span className="font-mono text-xs w-8">{alsIntensity}%</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleLogAls}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    {alsLogged ? <Check size={13} className="text-white" /> : <FileText size={13} />}
                    {alsLogged ? 'Logged to Bench!' : 'Log ALS Findings'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Specimen Rack & Bench Scratchpad */}
        <div className="bench-sidebar-column">
          {/* Specimen Mount & Drawer Panel */}
          <section className="panel panel-padding specimen-rack-panel">
            <div className="panel-title">
              <div className="flex items-center gap-2">
                <Layers size={17} className="purple" />
                <h2>Specimen Stage Mount</h2>
              </div>
              <span className="text-xs text-gray-500">Mount active evidence</span>
            </div>

            {/* Standard Forensic Presets */}
            <div className="specimen-preset-list">
              <span className="section-subheading">STANDARD REFERENCE LIBRARY:</span>
              {SPECIMEN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`specimen-card-btn ${selectedSpecimenId === preset.id ? 'active' : ''}`}
                >
                  <div className="specimen-card-header">
                    <strong>{preset.name}</strong>
                    <span className="preset-type-tag">{preset.type}</span>
                  </div>
                  <p>{preset.description}</p>
                </button>
              ))}
            </div>

            {/* Mount Live Evidence from Database */}
            <div className="case-evidence-mount-box">
              <span className="section-subheading">OR MOUNT REGISTERED CASE EVIDENCE:</span>
              <select
                aria-label="Select registered case evidence"
                className="specimen-select-dropdown"
                value={selectedSpecimenId === 'custom' ? customEvidenceId : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectCustomEvidence(e.target.value);
                  }
                }}
              >
                <option value="">-- Choose registered evidence item --</option>
                {evidenceRecords.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.id} · {ev.data.title} ({ev.data.type}) - Case {ev.caseId}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Real-Time Analytical Bench Scratchpad */}
          <section className="panel panel-padding bench-scratchpad-panel">
            <div className="panel-title">
              <div className="flex items-center gap-2">
                <Clock size={17} className="purple" />
                <h2>Analytical Bench Scratchpad</h2>
              </div>
              <span className="text-xs text-gray-500">{benchLogs.length} logged entries</span>
            </div>

            <textarea
              aria-label="Analytical Bench Notes"
              className="bench-scratchpad-textarea"
              rows={8}
              placeholder="Instrument findings, measurements, and analyst observations will be logged here automatically when using instruments. You can also write freeform notes here..."
              value={benchNotes}
              onChange={(e) => setBenchNotes(e.target.value)}
            />

            {/* Transfer to Case Examination Section */}
            <div className="transfer-exam-box">
              <div className="transfer-header">
                <ShieldCheck size={15} className="purple" />
                <strong>Transfer to Case Examination</strong>
              </div>
              <p className="text-xs text-gray-600">
                {isCustom && customEvidence
                  ? `Push bench findings to active examination for evidence ${customEvidence.id} (Case ${customEvidence.caseId}):`
                  : 'Push these open bench findings directly into an active examination record:'}
              </p>

              {isCustom && customEvidence && (
                <div className="mb-2 p-1.5 bg-purple-50/70 border border-purple-200 rounded text-[11px] text-purple-900 font-medium">
                  Filtered to Case {customEvidence.caseId} · {customEvidence.id} ({customEvidence.data.title})
                </div>
              )}

              {eligibleExams.length > 0 ? (
                <div className="transfer-actions-row">
                  <select
                    aria-label="Select active case examination"
                    className="exam-select-dropdown"
                    value={effectiveExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    disabled={transferring || !benchNotes.trim()}
                  >
                    {eligibleExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {isCustom && customEvidence && ex.data.evidenceId === customEvidence.id
                          ? `★ [Target Match] ${ex.id} · ${ex.data.title}`
                          : `[Case ${ex.caseId}] ${ex.id} · ${ex.data.title}`}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="primary text-xs flex items-center gap-1.5 flex-shrink-0"
                    onClick={handleTransferToExam}
                    disabled={transferring || !effectiveExamId || !benchNotes.trim()}
                  >
                    {transferring ? 'Transferring…' : 'Append to Exam'} <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  <p className="mb-1.5 font-medium">
                    No active examinations pending for this evidence item.
                  </p>
                  <button
                    type="button"
                    className="text-button text-xs text-purple-700 font-semibold flex items-center gap-1"
                    onClick={() => navigate('Examinations')}
                  >
                    Plan new examination in Examinations queue <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {effectiveExamId && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="text-button text-xs"
                    onClick={() => {
                      const ex = examRecords.find((r) => r.id === effectiveExamId);
                      if (ex) onOpenExamine(ex);
                    }}
                  >
                    Open examination wizard <ArrowRight size={12} />
                  </button>

                  {onOpenBenchSheet && (
                    <button
                      type="button"
                      className="text-button text-xs"
                      onClick={() => {
                        const ex = examRecords.find((r) => r.id === effectiveExamId);
                        if (ex) onOpenBenchSheet(ex);
                      }}
                    >
                      <FileText size={12} /> View bench sheet
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent Bench Event Log Stream */}
            {benchLogs.length > 0 && (
              <div className="bench-event-stream">
                <span className="section-subheading">SESSION EVENT STREAM:</span>
                <div className="bench-log-list">
                  {benchLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="bench-log-entry">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-gray-800">{log.instrument}</strong>
                        <span className="text-gray-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{log.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
