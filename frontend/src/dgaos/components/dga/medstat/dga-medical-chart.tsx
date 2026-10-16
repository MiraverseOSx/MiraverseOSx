'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  FileText,
  Pill,
  Syringe,
  Stethoscope,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Thermometer,
  Zap,
  PhoneCall,
  ChevronRight,
  Download,
  Share2,
  FolderLock,
  Plus,
  X,
  User,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import {
  INITIAL_MEDICAL_CHART,
  ALL_PRESET_CHARTS,
  MedicalCaseChart,
  MedicationOrder,
  ClinicalNote,
  LabPanel,
  PatientVitals
} from '@/lib/medical-data';
import { DGACase } from '@/lib/dga-types';
import { playCardiacBeep } from '@/lib/phone-audio';
import { escalateMedicalCaseToInvestigation } from '@/lib/dga-crosslink-engine';
import { DgaMedicalRequestQueue } from './dga-medical-request-queue';

interface DgaMedicalChartProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
  cases?: DGACase[];
  activeCaseId?: string | null;
}

export function DgaMedicalChart({ onOpenCase, onNavigateTab, cases = [], activeCaseId }: DgaMedicalChartProps) {
  const [charts, setCharts] = useState<MedicalCaseChart[]>(ALL_PRESET_CHARTS);
  const [activeChartId, setActiveChartId] = useState<string>(INITIAL_MEDICAL_CHART.caseId);
  const [activeTab, setActiveTab] = useState<'vitals' | 'labs' | 'imaging' | 'meds' | 'notes' | 'differential' | 'treatment'>('vitals');
  const [audioBeepEnabled, setAudioBeepEnabled] = useState(false);
  const [escalateToast, setEscalateToast] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New Clinical Order / Note Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLabOrderModalOpen, setIsLabOrderModalOpen] = useState(false);

  // Modal form states
  const [newMedDrug, setNewMedDrug] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedRoute, setNewMedRoute] = useState('Intravenous');
  const [newMedIndication, setNewMedIndication] = useState('');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Dr. Miracle Jerome, MD');
  const [newNoteSubjective, setNewNoteSubjective] = useState('');
  const [newNoteObjective, setNewNoteObjective] = useState('');
  const [newNoteAssessment, setNewNoteAssessment] = useState('');
  const [newNotePlan, setNewNotePlan] = useState('');

  const [newLabCategory, setNewLabCategory] = useState<'Complete Blood Count (CBC)' | 'Comprehensive Metabolic Panel (CMP)' | 'Arterial Blood Gas (ABG)' | 'Cardiac & Coagulation' | 'Toxicology & Enzyme Kinetics'>('Toxicology & Enzyme Kinetics');
  const [newLabTestName, setNewLabTestName] = useState('');
  const [newLabObservedVal, setNewLabObservedVal] = useState('');
  const [newLabRefRange, setNewLabRefRange] = useState('');
  const [newLabStatus, setNewLabStatus] = useState<'normal' | 'abnormal' | 'critical'>('critical');
  const [newLabNotes, setNewLabNotes] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const chart = charts.find((c) => c.caseId === activeChartId) || charts[0];
  const [selectedImageId, setSelectedImageId] = useState<string>(chart.imaging[0]?.id || '');

  // Keep selected image valid when switching patients
  useEffect(() => {
    setSelectedImageId(chart.imaging[0]?.id || '');
  }, [activeChartId]);

  // Animated ECG canvas waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    let beatCounter = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(x, 0, 4, height);

      beatCounter++;
      let y = midY;

      // Rate depends on patient condition
      const rateMod = chart.clinicalStatus === 'Decompensating' ? 65 : chart.clinicalStatus === 'Critical ICU' ? 40 : 35;
      const cyclePos = beatCounter % rateMod;
      if (cyclePos === 10) y = midY - 6; // P wave
      else if (cyclePos === 15) y = midY + 4; // Q wave
      else if (cyclePos === 18) {
        y = midY - 32; // R peak
        if (audioBeepEnabled) playCardiacBeep(chart.clinicalStatus === 'Decompensating');
      } else if (cyclePos === 21) y = midY + 12; // S dip
      else if (cyclePos === 28) y = midY - 10; // T wave
      else {
        y = midY + (Math.random() - 0.5) * 2; // Baseline noise
      }

      ctx.fillStyle = chart.clinicalStatus === 'Decompensating' ? '#ef4444' : '#22c55e';
      ctx.fillRect(x, y, 2.5, 2.5);

      x = (x + 2) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioBeepEnabled, chart.clinicalStatus]);

  const latestVitals = chart.vitalsHistory[chart.vitalsHistory.length - 1] || {
    heartRate: 72,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    temperatureCelsius: 37.0,
    glasgowComaScale: 15,
    pupils: '3mm equal and reactive',
    cardiacRhythm: 'Normal Sinus Rhythm',
    timestamp: 'STAT'
  };

  const updateCurrentChart = (updater: (prev: MedicalCaseChart) => MedicalCaseChart) => {
    setCharts((prevCharts) =>
      prevCharts.map((c) => (c.caseId === chart.caseId ? updater(c) : c))
    );
  };

  // INTERVENTION 1: ADMINISTER PROTOCOL DRUG
  const handleAdministerEmergencyDrug = (drugName: string, dose: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let newHr = latestVitals.heartRate;
    let newBpSys = latestVitals.bloodPressureSystolic;
    let responseText = '';

    if (drugName.toLowerCase().includes('atropine')) {
      newHr = Math.min(100, latestVitals.heartRate + 16);
      responseText = 'Transient elevation in chronotropy. Airway secretions slightly reduced.';
    } else if (drugName.toLowerCase().includes('narcan') || drugName.toLowerCase().includes('naloxone')) {
      newHr = 95;
      newBpSys = 125;
      responseText = 'Opioid mu-receptor blockade achieved. Spontaneous ventilation resumed.';
    } else if (drugName.toLowerCase().includes('txa')) {
      responseText = 'Antifibrinolytic bolus complete. Coagulation cascade stabilized.';
    } else if (drugName.toLowerCase().includes('blood') || drugName.toLowerCase().includes('prbc')) {
      newBpSys = Math.min(120, latestVitals.bloodPressureSystolic + 15);
      responseText = 'Volume resuscitation expanding intravascular pressure. MAP elevated.';
    } else {
      responseText = 'Medication bolus delivered via IV infusion line. Telemetry response monitored.';
    }

    updateCurrentChart((prev) => ({
      ...prev,
      vitalsHistory: [
        ...prev.vitalsHistory,
        {
          ...latestVitals,
          heartRate: newHr,
          bloodPressureSystolic: newBpSys,
          timestamp: `${now} UTC`
        }
      ],
      treatmentLog: [
        ...prev.treatmentLog,
        {
          id: `TR-${Date.now()}`,
          time: `${now} UTC`,
          action: `STAT ${drugName} (${dose}) IV Bolus`,
          operator: 'Dr. Miracle Jerome, MD',
          response: responseText
        }
      ]
    }));

    setActionFeedback(`STAT ${drugName} ${dose} administered successfully. Vitals update logged.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // INTERVENTION 2: DEFIBRILLATE / CARDIOVERT
  const handleDefibrillate = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateCurrentChart((prev) => ({
      ...prev,
      clinicalStatus: 'Stabilized',
      vitalsHistory: [
        ...prev.vitalsHistory,
        {
          ...latestVitals,
          heartRate: 78,
          bloodPressureSystolic: 112,
          bloodPressureDiastolic: 72,
          oxygenSaturation: 96,
          cardiacRhythm: 'Sinus Rhythm post-shock',
          timestamp: `${now} UTC`
        }
      ],
      treatmentLog: [
        ...prev.treatmentLog,
        {
          id: `TR-${Date.now()}`,
          time: `${now} UTC`,
          action: 'Biphasic Defibrillation 200 Joules Synchronized Shock',
          operator: 'Code Blue Team',
          response: 'Rhythm successfully cardioverted to sinus mechanism with palpable carotid pulse.'
        }
      ]
    }));
    setActionFeedback('DEFIBRILLATION SUCCESSFUL: 200J shock delivered. Sinus rhythm restored.');
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // INTERVENTION 3: DECOMPENSATE
  const handleSimulateDecompensation = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateCurrentChart((prev) => ({
      ...prev,
      clinicalStatus: 'Decompensating',
      vitalsHistory: [
        ...prev.vitalsHistory,
        {
          heartRate: 32,
          bloodPressureSystolic: 58,
          bloodPressureDiastolic: 28,
          oxygenSaturation: 72,
          respiratoryRate: 6,
          temperatureCelsius: 34.8,
          glasgowComaScale: 3,
          pupils: 'Fixed and dilated',
          cardiacRhythm: 'Agonal Bradycardia / Extreme ST Elevation',
          timestamp: `${now} UTC`
        }
      ]
    }));
    setActionFeedback('CRITICAL ALERT: Patient decompensating rapidly. Severe bradycardia & hypoperfusion.');
    setTimeout(() => setActionFeedback(null), 6000);
  };

  // ESCALATE TO INVESTIGATION
  const handleEscalateToHomicide = async () => {
    setIsEscalating(true);
    try {
      const res = await escalateMedicalCaseToInvestigation(chart.caseId);
      if (res.success) {
        updateCurrentChart((prev) => ({
          ...prev,
          clinicalStatus: 'Pronounced Deceased',
          isEscalatedToInvestigation: true,
          linkedInvestigationCaseId: 'INV-2026-0417'
        }));
        setEscalateToast(res.message);
      }
    } finally {
      setIsEscalating(false);
    }
  };

  // SUBMIT NEW MEDICATION ORDER
  const handleSaveMedicationOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedDrug.trim() || !newMedDose.trim()) return;

    const newMed: MedicationOrder = {
      id: `MED-${Date.now()}`,
      drug: newMedDrug.trim(),
      dose: newMedDose.trim(),
      route: newMedRoute,
      frequency: 'STAT Continuous',
      indication: newMedIndication.trim() || 'Clinical stabilization',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active Infusion'
    };

    updateCurrentChart((prev) => ({
      ...prev,
      medications: [newMed, ...prev.medications]
    }));

    setIsMedModalOpen(false);
    setNewMedDrug('');
    setNewMedDose('');
    setNewMedIndication('');
    setActionFeedback(`New medication order ${newMed.drug} added to patient active profile.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // SUBMIT NEW CLINICAL NOTE
  const handleSaveClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: ClinicalNote = {
      id: `NOTE-${Date.now()}`,
      title: newNoteTitle.trim(),
      author: newNoteAuthor.trim(),
      role: 'Attending Physician',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      soap: {
        subjective: newNoteSubjective.trim() || 'No acute subjective complaints recorded.',
        objective: newNoteObjective.trim() || 'Telemetry and vitals monitored.',
        assessment: newNoteAssessment.trim() || 'Patient under continuous intensive monitoring.',
        plan: newNotePlan.trim() || 'Continue current clinical regimen.'
      }
    };

    updateCurrentChart((prev) => ({
      ...prev,
      progressNotes: [newNote, ...prev.progressNotes]
    }));

    setIsNoteModalOpen(false);
    setNewNoteTitle('');
    setNewNoteSubjective('');
    setNewNoteObjective('');
    setNewNoteAssessment('');
    setNewNotePlan('');
    setActionFeedback(`Clinical note "${newNote.title}" filed in patient official health record.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // SUBMIT NEW LAB RESULT
  const handleSaveLabResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTestName.trim() || !newLabObservedVal.trim()) return;

    updateCurrentChart((prev) => {
      const existingPanel = prev.labPanels.find((p) => p.category === newLabCategory);
      const newItem = {
        id: `ITEM-${Date.now()}`,
        name: newLabTestName.trim(),
        value: newLabObservedVal.trim(),
        referenceRange: newLabRefRange.trim() || 'Standard Reference',
        unit: 'mg/dL',
        status: newLabStatus,
        notes: newLabNotes.trim() || undefined
      };

      if (existingPanel) {
        return {
          ...prev,
          labPanels: prev.labPanels.map((p) =>
            p.category === newLabCategory
              ? { ...p, items: [newItem, ...p.items] }
              : p
          )
        };
      } else {
        const newPanel: LabPanel = {
          id: `LAB-${Date.now()}`,
          category: newLabCategory,
          orderTime: 'STAT',
          resultTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          specimenType: 'Whole Blood',
          technician: 'Central Pathology Laboratory',
          items: [newItem]
        };
        return {
          ...prev,
          labPanels: [newPanel, ...prev.labPanels]
        };
      }
    });

    setIsLabOrderModalOpen(false);
    setNewLabTestName('');
    setNewLabObservedVal('');
    setNewLabRefRange('');
    setNewLabNotes('');
    setActionFeedback(`Laboratory test result "${newLabTestName}" verified and logged.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const selectedImage = chart.imaging.find((img) => img.id === selectedImageId) || chart.imaging[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 text-slate-900 overflow-hidden select-none font-sans">
      {/* 1. TOP CLINICAL HEADER BAR */}
      <div className="h-14 bg-white border-b border-slate-300 px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <HeartPulse className="w-5 h-5 text-red-600 animate-pulse" />
          </div>

          {/* PATIENT SELECTOR DROPDOWN */}
          <div className="min-w-0 flex items-center gap-2">
            <select
              value={activeChartId}
              onChange={(e) => setActiveChartId(e.target.value)}
              className="bg-slate-50 border border-slate-300 hover:border-slate-800 text-slate-900 font-bold text-xs rounded px-2.5 py-1.5 outline-none cursor-pointer shadow-2xs"
            >
              {charts.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.patientName} ({c.mrn} • {c.caseId})
                </option>
              ))}
            </select>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wide ${
              chart.clinicalStatus === 'Critical ICU' ? 'bg-red-100 text-red-900 border border-red-300' :
              chart.clinicalStatus === 'Decompensating' ? 'bg-red-600 text-white animate-pulse' :
              chart.clinicalStatus === 'Pronounced Deceased' ? 'bg-slate-900 text-white' :
              'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {chart.clinicalStatus}
            </span>

            <span className="text-xs text-slate-600 font-medium hidden md:inline truncate">
              {chart.roomBay} · Attending: <strong className="text-slate-900">{chart.attendingPhysician}</strong>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAudioBeepEnabled(!audioBeepEnabled)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              audioBeepEnabled
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle audible cardiac telemetry chirp"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>ECG SOUND: {audioBeepEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Resuscitation Actions */}
          <button
            onClick={() => handleAdministerEmergencyDrug('Atropine Sulfate', '4mg')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Administer Atropine to raise heart rate"
          >
            <Syringe className="w-3.5 h-3.5 text-slate-700" />
            <span>ATROPINE 4MG</span>
          </button>

          <button
            onClick={() => handleAdministerEmergencyDrug('Naloxone (Narcan)', '4mg')}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Administer Narcan for opioid depression"
          >
            <Pill className="w-3.5 h-3.5 text-slate-700" />
            <span>NARCAN 4MG</span>
          </button>

          <button
            onClick={handleDefibrillate}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Deliver 200J defibrillation shock"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>DEFIB 200J</span>
          </button>

          <button
            onClick={handleSimulateDecompensation}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>SIMULATE ARREST</span>
          </button>

          {/* ESCALATE TO CRIMINAL HOMICIDE INVESTIGATION BUTTON */}
          <button
            onClick={handleEscalateToHomicide}
            disabled={isEscalating || chart.isEscalatedToInvestigation}
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
              chart.isEscalatedToInvestigation
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                : 'bg-red-800 hover:bg-red-900 border-red-900 text-white'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>
              {chart.isEscalatedToInvestigation
                ? 'LINKED TO CRIMINAL INVESTIGATION'
                : 'ESCALATE TO CRIMINAL DOSSIER'}
            </span>
          </button>
        </div>
      </div>

      <DgaMedicalRequestQueue cases={cases} activeCaseId={activeCaseId} onOpenCase={onOpenCase} />

      {/* FEEDBACK TOAST */}
      {(escalateToast || actionFeedback) && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{escalateToast || actionFeedback}</span>
          </div>
          {escalateToast && onOpenCase && (
            <button
              onClick={() => onOpenCase('INV-2026-0417')}
              className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-900 rounded text-xs font-bold cursor-pointer"
            >
              Open Criminal Investigation Docket →
            </button>
          )}
        </div>
      )}

      {/* 2. REAL-TIME TELEMETRY MONITOR STRIP */}
      <div className="h-28 bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center gap-4 shrink-0">
        {/* ECG Waveform Canvas */}
        <div className="flex-1 h-full bg-slate-950 border border-slate-700 rounded relative overflow-hidden flex items-center shadow-inner">
          <canvas ref={canvasRef} width={640} height={96} className="w-full h-full block" />
          <div className="absolute top-1.5 left-2.5 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-3">
            <span>LEAD II • 25 mm/s • 10 mm/mV</span>
            <span className="text-slate-300">Rhythm: {latestVitals.cardiacRhythm}</span>
          </div>
        </div>

        {/* Digital Telemetry Readouts */}
        <div className="grid grid-cols-4 gap-2.5 w-96 shrink-0 h-full">
          <div className="bg-slate-800 border border-slate-700 rounded p-2 flex flex-col justify-between shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>HEART RATE</span>
              <HeartPulse className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-mono font-bold ${latestVitals.heartRate < 50 || latestVitals.heartRate > 130 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {latestVitals.heartRate}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">BPM</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-2 flex flex-col justify-between shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>BP (ART)</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-bold text-white">
                {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-2 flex flex-col justify-between shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>SPO2</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-mono font-bold ${latestVitals.oxygenSaturation < 90 ? 'text-red-400' : 'text-sky-400'}`}>
                {latestVitals.oxygenSaturation}%
              </span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-2 flex flex-col justify-between shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>GCS COMA</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-red-400">
                {latestVitals.glasgowComaScale}/15
              </span>
              <span className="text-[9px] text-red-300 font-bold uppercase">
                {latestVitals.glasgowComaScale <= 8 ? 'SEVERE' : latestVitals.glasgowComaScale <= 12 ? 'MOD' : 'MILD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLINICAL NAVIGATION TABS & ACTION BUTTONS */}
      <div className="h-10 bg-white border-b border-slate-300 px-3 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          {[
            { id: 'vitals', label: 'Vitals & Toxidrome', icon: Activity },
            { id: 'labs', label: 'Labs & Spectroscopy', icon: Syringe, count: chart.labPanels.length },
            { id: 'imaging', label: 'Diagnostic Imaging', icon: Eye, count: chart.imaging.length },
            { id: 'meds', label: 'Medications & Orders', icon: Pill, count: chart.medications.length },
            { id: 'notes', label: 'Clinical Progress Notes', icon: FileText, count: chart.progressNotes.length },
            { id: 'differential', label: 'Differential Diagnosis', icon: Stethoscope },
            { id: 'treatment', label: 'EMS & Resuscitation Log', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-7 px-3 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && <span className="text-[10px] opacity-75">({tab.count})</span>}
              </button>
            );
          })}
        </div>

        {/* Clinical Entry Quick Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <button
            onClick={() => setIsMedModalOpen(true)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Order Medication</span>
          </button>
          <button
            onClick={() => setIsLabOrderModalOpen(true)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Lab</span>
          </button>
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Clinical Note</span>
          </button>
        </div>
      </div>



      {/* 4. MAIN CLINICAL TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f0eff5]">
        {/* TAB: VITALS & TOXIDROME */}
        {activeTab === 'vitals' && (
          <div className="space-y-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* History of Present Illness */}
              <div className="bg-white border border-[#cfcddb] rounded p-3 space-y-2 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#4b4372]" />
                  <span>HISTORY OF PRESENT ILLNESS (HPI)</span>
                </div>
                <p className="text-xs text-[#2c2a3e] leading-relaxed">
                  {chart.historyOfPresentIllness}
                </p>
                <div className="pt-2 border-t border-[#e4e2ee] flex items-center justify-between text-[11px] text-[#5e5c7a]">
                  <span>Admit Time: {chart.admitTime}</span>
                  <span className="text-rose-700 font-bold">Code: {chart.codeStatus}</span>
                </div>
              </div>

              {/* Acute Cholinergic Symptoms */}
              <div className="bg-white border border-[#cfcddb] rounded p-3 space-y-2 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>ACUTE CHOLINERGIC TOXIDROME SIGNS</span>
                </div>
                <div className="space-y-1.5">
                  {chart.symptoms.map((symptom, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#2c2a3e] bg-[#f8f7fc] p-1.5 rounded border border-[#cfcddb]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vitals Telemetry Log */}
            <div className="bg-white border border-[#cfcddb] rounded overflow-hidden shadow-2xs">
              <div className="p-3 bg-[#f8f7fc] border-b border-[#cfcddb] text-[11px] font-bold uppercase tracking-wider text-[#1f1e30]">
                CHRONOLOGICAL ICU VITALS TREND
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0eff5] text-[#5e5c7a] text-[10px] font-bold uppercase border-b border-[#cfcddb]">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">HR (BPM)</th>
                    <th className="p-2.5">BP (mmHg)</th>
                    <th className="p-2.5">SpO2</th>
                    <th className="p-2.5">RR</th>
                    <th className="p-2.5">Temp (°C)</th>
                    <th className="p-2.5">GCS</th>
                    <th className="p-2.5">Pupillary Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2ee] text-[#1f1e30] font-mono">
                  {chart.vitalsHistory.map((vit, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f7fc]">
                      <td className="p-2.5 font-bold text-[#4b4372]">{vit.timestamp}</td>
                      <td className="p-2.5 text-rose-600 font-bold">{vit.heartRate}</td>
                      <td className="p-2.5 text-[#1f1e30]">{vit.bloodPressureSystolic}/{vit.bloodPressureDiastolic}</td>
                      <td className="p-2.5 text-sky-700 font-bold">{vit.oxygenSaturation}%</td>
                      <td className="p-2.5 text-[#1f1e30]">{vit.respiratoryRate}</td>
                      <td className="p-2.5 text-[#1f1e30]">{vit.temperatureCelsius}°C</td>
                      <td className="p-2.5 text-rose-700 font-bold">{vit.glasgowComaScale}</td>
                      <td className="p-2.5 text-[#5e5c7a] font-sans">{vit.pupils}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: LABS & SPECTROSCOPY */}
        {activeTab === 'labs' && (
          <div className="space-y-4 max-w-5xl">
            {chart.labPanels.map((panel) => (
              <div key={panel.id} className="bg-white border border-[#cfcddb] rounded overflow-hidden shadow-2xs">
                <div className="p-3 bg-[#f8f7fc] border-b border-[#cfcddb] flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold text-[#1f1e30] flex items-center gap-2">
                      <span>{panel.category}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb]">
                        {panel.id}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5e5c7a]">
                      Specimen: {panel.specimenType} • Ordered: {panel.orderTime} • Verified: {panel.resultTime} by {panel.technician}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-800">
                    CRITICAL FLAGS PRESENT
                  </span>
                </div>

                <div className="p-2">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] font-bold text-[#5e5c7a] uppercase border-b border-[#cfcddb] bg-[#f0eff5]">
                      <tr>
                        <th className="p-2">Analyte Test</th>
                        <th className="p-2">Observed Value</th>
                        <th className="p-2">Reference Range</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Clinical / Forensic Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e2ee]">
                      {panel.items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#f8f7fc]">
                          <td className="p-2 font-semibold text-[#1f1e30]">{item.name}</td>
                          <td className="p-2 font-mono font-bold text-rose-700 text-[13px]">
                            {item.value} {item.unit}
                          </td>
                          <td className="p-2 text-[#5e5c7a] font-mono">{item.referenceRange}</td>
                          <td className="p-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.status === 'critical'
                                ? 'bg-rose-50 text-rose-800 border border-rose-300'
                                : item.status === 'abnormal'
                                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2 text-[#5e5c7a] text-[11px]">{item.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: DIAGNOSTIC IMAGING */}
        {activeTab === 'imaging' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            {/* Left list of scans */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a] mb-1">
                AVAILABLE RADIOLOGY STUDIES
              </div>
              {chart.imaging.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  className={`w-full p-2.5 rounded text-left border transition-all cursor-pointer ${
                    selectedImage.id === img.id
                      ? 'bg-[#edeaf6] border-[#4b4372] text-[#1f1e30] shadow-2xs font-semibold'
                      : 'bg-white border-[#cfcddb] text-[#3d3b54] hover:bg-[#f8f7fc]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{img.modality}</span>
                    <span className="text-[10px] font-mono text-[#4b4372]">{img.timestamp}</span>
                  </div>
                  <div className="text-[10px] text-[#5e5c7a] mt-1">{img.bodyRegion}</div>
                  <div className="text-[9.5px] text-rose-700 font-semibold mt-1">Status: {img.status}</div>
                </button>
              ))}
            </div>

            {/* Right detailed radiology inspection */}
            <div className="md:col-span-2 bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e30]">{selectedImage.modality}</h3>
                  <div className="text-[11px] text-[#5e5c7a]">
                    Interpreted by {selectedImage.radiologist} • Verified {selectedImage.timestamp}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-800">
                  {selectedImage.status}
                </span>
              </div>

              {/* Simulated scan display canvas */}
              <div className="h-56 bg-[#0a0a10] border border-[#3e3c54] rounded relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="text-center space-y-2 text-slate-400">
                  <div className="w-12 h-12 mx-auto rounded-full border border-dashed border-slate-500 flex items-center justify-center text-slate-300">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-300">
                    DICOM PACS SLICE #48 / AXIAL HIGH-RESOLUTION
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Window: Lung Parenchyma (W: 1500, L: -600) • Matrix: 512x512
                  </div>
                </div>

                {/* Key anatomical overlay markers */}
                {selectedImage.keyMarkers.map((marker, i) => (
                  <div
                    key={i}
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-rose-900 border border-rose-400 text-rose-100 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    <span>{marker.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372]">
                  RADIOLOGIST IMPRESSION
                </div>
                <div className="text-xs text-[#2c2a3e] leading-relaxed bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb]">
                  {selectedImage.impression}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a]">
                  DETAILED FINDINGS
                </div>
                {selectedImage.findings.map((f, i) => (
                  <div key={i} className="text-xs text-[#2c2a3e] flex items-start gap-2">
                    <span className="text-[#4b4372]">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEDICATIONS & ALLERGIES */}
        {activeTab === 'meds' && (
          <div className="space-y-4 max-w-5xl">
            {/* Allergies banner */}
            <div className="bg-rose-50 border border-rose-300 rounded p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-900">PATIENT ALLERGY ALERTS</div>
                  <div className="text-xs text-rose-800">{chart.allergies.join(' • ')}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold border border-rose-300">
                STRICT CONTRAINDICATION
              </span>
            </div>

            {/* Active infusions table */}
            <div className="bg-white border border-[#cfcddb] rounded overflow-hidden shadow-2xs">
              <div className="p-3 bg-[#f8f7fc] border-b border-[#cfcddb] text-[11px] font-bold uppercase tracking-wider text-[#1f1e30]">
                CURRENT RESUSCITATIVE INFUSIONS & ORDERS
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0eff5] text-[#5e5c7a] text-[10px] font-bold uppercase border-b border-[#cfcddb]">
                  <tr>
                    <th className="p-2.5">Medication</th>
                    <th className="p-2.5">Dosage / Rate</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Indication</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2ee] text-[#1f1e30]">
                  {chart.medications.map((med) => (
                    <tr key={med.id} className="hover:bg-[#f8f7fc]">
                      <td className="p-2.5 font-bold text-[#1f1e30] flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-[#4b4372]" />
                        <span>{med.drug}</span>
                      </td>
                      <td className="p-2.5 font-mono text-[#4b4372] font-semibold">{med.dose}</td>
                      <td className="p-2.5">{med.route}</td>
                      <td className="p-2.5">{med.frequency}</td>
                      <td className="p-2.5 text-[#5e5c7a] text-[11px]">{med.indication}</td>
                      <td className="p-2.5">
                        <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PHYSICIAN PROGRESS NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4 max-w-5xl">
            {chart.progressNotes.map((note) => (
              <div key={note.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1f1e30]">{note.title}</h3>
                    <div className="text-[11px] text-[#4b4372] font-medium">
                      Author: {note.author} ({note.role})
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#5e5c7a]">{note.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb] space-y-1">
                    <div className="font-bold text-[#4b4372] text-[10px] uppercase">SUBJECTIVE</div>
                    <p className="text-[#2c2a3e] leading-relaxed">{note.soap.subjective}</p>
                  </div>
                  <div className="bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb] space-y-1">
                    <div className="font-bold text-[#4b4372] text-[10px] uppercase">OBJECTIVE</div>
                    <p className="text-[#2c2a3e] leading-relaxed">{note.soap.objective}</p>
                  </div>
                  <div className="bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb] space-y-1">
                    <div className="font-bold text-[#4b4372] text-[10px] uppercase">ASSESSMENT</div>
                    <p className="text-[#2c2a3e] leading-relaxed font-semibold text-rose-800">{note.soap.assessment}</p>
                  </div>
                  <div className="bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb] space-y-1">
                    <div className="font-bold text-[#4b4372] text-[10px] uppercase">PLAN</div>
                    <p className="text-[#2c2a3e] leading-relaxed">{note.soap.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: DIFFERENTIAL DIAGNOSIS */}
        {activeTab === 'differential' && (
          <div className="space-y-4 max-w-5xl">
            <div className="text-xs text-[#5e5c7a]">
              Ranked algorithmic differential diagnosis based on reported toxidrome, blood spectroscopy, and imaging.
            </div>
            {chart.differentialDiagnosis.map((item) => (
              <div key={item.id} className="bg-white border border-[#cfcddb] rounded p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1f1e30]">{item.condition}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.status === 'Leading Suspect'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : item.status === 'Under Consideration'
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'bg-[#f0eff5] text-[#5e5c7a] border border-[#cfcddb]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#4b4372]">
                    <span>Likelihood: {item.probability}%</span>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="w-full h-1.5 bg-[#e4e2ee] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.probability > 75 ? 'bg-rose-600' : item.probability > 30 ? 'bg-amber-500' : 'bg-slate-400'}`}
                    style={{ width: `${item.probability}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-emerald-50/50 p-2 rounded border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Supporting Findings</div>
                    <ul className="list-disc list-inside text-[#2c2a3e] space-y-0.5 mt-1 text-[11px]">
                      {item.supportingFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50/50 p-2 rounded border border-rose-200">
                    <div className="text-[10px] font-bold text-rose-800 uppercase">Refuting / Counter-Evidence</div>
                    <ul className="list-disc list-inside text-[#2c2a3e] space-y-0.5 mt-1 text-[11px]">
                      {item.refutingFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: EMS & TREATMENT LOG */}
        {activeTab === 'treatment' && (
          <div className="space-y-4 max-w-5xl">
            {/* EMS Run Report */}
            <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                <div className="text-sm font-bold text-[#1f1e30] flex items-center gap-2">
                  <span>PARAMEDIC RUN REPORT</span>
                  <span className="text-xs font-mono text-[#4b4372] font-semibold">[{chart.emsReport.medicUnit}]</span>
                </div>
                <div className="text-xs text-[#5e5c7a]">
                  Dispatched: {chart.emsReport.dispatchTime} • Arrival: {chart.emsReport.hospitalArrivalTime}
                </div>
              </div>

              <p className="text-xs text-[#2c2a3e] leading-relaxed">
                {chart.emsReport.fieldNarrative}
              </p>

              <div className="pt-2 border-t border-[#e4e2ee]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4b4372] mb-1">
                  FIELD INTERVENTIONS ADMINISTERED
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {chart.emsReport.fieldInterventions.map((int, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#2c2a3e] bg-[#f8f7fc] p-1.5 rounded border border-[#cfcddb]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{int}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Treatment log */}
            <div className="bg-white border border-[#cfcddb] rounded overflow-hidden shadow-2xs">
              <div className="p-3 bg-[#f8f7fc] border-b border-[#cfcddb] text-[11px] font-bold uppercase tracking-wider text-[#1f1e30]">
                CHRONOLOGICAL CLINICAL INTERVENTION TIMELINE
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0eff5] text-[#5e5c7a] text-[10px] font-bold uppercase border-b border-[#cfcddb]">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Action Administered</th>
                    <th className="p-2.5">Provider</th>
                    <th className="p-2.5">Observed Patient Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2ee] text-[#1f1e30]">
                  {chart.treatmentLog.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8f7fc]">
                      <td className="p-2.5 font-mono font-bold text-[#4b4372]">{log.time}</td>
                      <td className="p-2.5 font-semibold text-[#1f1e30]">{log.action}</td>
                      <td className="p-2.5 text-[#5e5c7a]">{log.operator}</td>
                      <td className="p-2.5 text-[#2c2a3e] text-[11px]">{log.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ORDER MEDICATION */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMedicationOrder}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <Pill className="w-4 h-4 text-slate-700" />
                ENTER CLINICAL MEDICATION ORDER
              </span>
              <button type="button" onClick={() => setIsMedModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Medication / Substance *</label>
              <input
                type="text"
                required
                value={newMedDrug}
                onChange={(e) => setNewMedDrug(e.target.value)}
                placeholder="e.g. Norepinephrine (Levophed) or Tranexamic Acid"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dosage / Rate *</label>
                <input
                  type="text"
                  required
                  value={newMedDose}
                  onChange={(e) => setNewMedDose(e.target.value)}
                  placeholder="e.g. 16 mcg/min or 1g IV Push"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Route</label>
                <select
                  value={newMedRoute}
                  onChange={(e) => setNewMedRoute(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
                >
                  <option value="Intravenous">Intravenous (IV)</option>
                  <option value="Central Line">Central Line (CVC)</option>
                  <option value="Intramuscular">Intramuscular (IM)</option>
                  <option value="Intraosseous">Intraosseous (IO)</option>
                  <option value="Oral / Enteral">Oral / Enteral</option>
                  <option value="Inhalation Nebulizer">Inhalation Nebulizer</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Indication</label>
              <input
                type="text"
                value={newMedIndication}
                onChange={(e) => setNewMedIndication(e.target.value)}
                placeholder="e.g. Refractory hypotension / Massive hemorrhage"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsMedModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Authorize Medication
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD CLINICAL NOTE */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveClinicalNote}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-xl w-full p-5 space-y-3.5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <FileText className="w-4 h-4 text-slate-700" />
                DRAFT CLINICAL PROGRESS NOTE (SOAP)
              </span>
              <button type="button" onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Critical Care Consult / Trauma Re-evaluation"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Author / Clinician</label>
                <input
                  type="text"
                  value={newNoteAuthor}
                  onChange={(e) => setNewNoteAuthor(e.target.value)}
                  placeholder="Physician Name"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Subjective (S)</label>
              <textarea
                rows={2}
                value={newNoteSubjective}
                onChange={(e) => setNewNoteSubjective(e.target.value)}
                placeholder="Patient symptoms, bystander accounts, or triage history..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Objective (O)</label>
              <textarea
                rows={2}
                value={newNoteObjective}
                onChange={(e) => setNewNoteObjective(e.target.value)}
                placeholder="Physical examination, vitals review, telemetry rhythm..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Assessment (A)</label>
              <textarea
                rows={2}
                value={newNoteAssessment}
                onChange={(e) => setNewNoteAssessment(e.target.value)}
                placeholder="Diagnostic impressions, toxicology status, trauma severity..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Plan (P)</label>
              <textarea
                rows={2}
                value={newNotePlan}
                onChange={(e) => setNewNotePlan(e.target.value)}
                placeholder="Surgical interventions, ICU drip titrations, legal holds..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Sign & File Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: RECORD LAB TEST */}
      {isLabOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveLabResult}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs tracking-wider">
                <Syringe className="w-4 h-4 text-slate-700" />
                RECORD LABORATORY TEST DETERMINATION
              </span>
              <button type="button" onClick={() => setIsLabOrderModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Laboratory Panel</label>
              <select
                value={newLabCategory}
                onChange={(e) => setNewLabCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
              >
                <option value="Toxicology & Enzyme Kinetics">Toxicology & Enzyme Kinetics</option>
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</option>
                <option value="Arterial Blood Gas (ABG)">Arterial Blood Gas (ABG)</option>
                <option value="Cardiac & Coagulation">Cardiac & Coagulation</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Analyte Test Name *</label>
                <input
                  type="text"
                  required
                  value={newLabTestName}
                  onChange={(e) => setNewLabTestName(e.target.value)}
                  placeholder="e.g. Troponin-I or Blood Alcohol"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Observed Value *</label>
                <input
                  type="text"
                  required
                  value={newLabObservedVal}
                  onChange={(e) => setNewLabObservedVal(e.target.value)}
                  placeholder="e.g. 0.42 ng/mL or 14.8"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Reference Range</label>
                <input
                  type="text"
                  value={newLabRefRange}
                  onChange={(e) => setNewLabRefRange(e.target.value)}
                  placeholder="e.g. 0.00 - 0.04 ng/mL"
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Result Status</label>
                <select
                  value={newLabStatus}
                  onChange={(e) => setNewLabStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 outline-none focus:border-slate-800 focus:bg-white text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal Flag</option>
                  <option value="critical">Critical Panic Value</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Interpretation / Notes</label>
              <textarea
                rows={2}
                value={newLabNotes}
                onChange={(e) => setNewLabNotes(e.target.value)}
                placeholder="Interpretation of observed values, confirmatory GC-MS notes..."
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-900 placeholder-slate-400 outline-none resize-none focus:border-slate-800 focus:bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLabOrderModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer text-xs shadow-xs"
              >
                Verify & Log Lab Result
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
