import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Activity,
  AlertCircle,
  Stethoscope,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  User,
  Zap,
  ShieldAlert,
  Droplet,
  Pill,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { OrchestratorEvent } from '../../types/orchestrator';
import { SoundFX } from '../../utils/audio';

interface MedicalModuleProps {
  onResolveSuccess?: (result: any) => void;
}

export const MedicalModule: React.FC<MedicalModuleProps> = ({ onResolveSuccess }) => {
  const {
    activeEvents,
    selectedEventId,
    setSelectedEvent,
    resolveEventAction,
    isResolvingAction,
    fetchProactiveEvents,
    isGeneratingEvent,
    soundEnabled,
  } = useSystemStore();

  const medicalEvents = activeEvents.filter((e) => e.module === 'medical');
  const activeEvent =
    medicalEvents.find((e) => e.id === selectedEventId) || medicalEvents[0] || null;

  const [customAction, setCustomAction] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isEcqBeating, setIsEcgBeating] = useState(true);

  // SVG animated ECG wave path
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let offset = 0;

    const renderECG = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ECG Line
      ctx.strokeStyle = '#059669'; // Jade green
      ctx.lineWidth = 2;
      ctx.beginPath();

      offset = (offset + 2) % width;

      for (let x = 0; x < width; x++) {
        const adjustedX = (x + offset) % width;
        let y = mid;

        // P-Q-R-S-T wave pattern every 120 pixels
        const period = 120;
        const pos = adjustedX % period;

        if (pos > 20 && pos < 35) {
          // P wave
          y = mid - 6 * Math.sin(((pos - 20) / 15) * Math.PI);
        } else if (pos >= 40 && pos < 44) {
          // Q drop
          y = mid + 8;
        } else if (pos >= 44 && pos < 52) {
          // R spike
          y = mid - 32;
        } else if (pos >= 52 && pos < 58) {
          // S plunge
          y = mid + 16;
        } else if (pos > 68 && pos < 90) {
          // T wave
          y = mid - 10 * Math.sin(((pos - 68) / 22) * Math.PI);
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Lead cursor glow
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(width - 5, mid, 3, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(renderECG);
    };

    renderECG();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeEvent]);

  const handleExecuteAction = async (actionText: string) => {
    if (!activeEvent || isResolvingAction) return;

    if (soundEnabled) {
      const lower = actionText.toLowerCase();
      if (lower.includes('defib') || lower.includes('shock') || lower.includes('cardiover') || lower.includes('cpr')) {
        SoundFX.playMedicalDefib();
      } else if (lower.includes('iv') || lower.includes('saline') || lower.includes('bolus') || lower.includes('antibiotic') || lower.includes('epinephrine') || lower.includes('dose') || lower.includes('push')) {
        SoundFX.playMedicalSyringe();
      } else if (lower.includes('ecg') || lower.includes('vitals') || lower.includes('fast') || lower.includes('ultrasound') || lower.includes('scan') || lower.includes('ct')) {
        SoundFX.playMedicalBeep(true);
      } else {
        SoundFX.playButtonTap();
      }
    }

    const res = await resolveEventAction(activeEvent.id, actionText, doctorNotes);
    if (res && onResolveSuccess) {
      onResolveSuccess(res);
    }
    setCustomAction('');
    setDoctorNotes('');
  };

  if (!activeEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border-2 border-dashed border-emerald-300">
        <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 mb-3">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 font-commissioner">
          Saint Jude ER Triage: All Patients Stabilized
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 font-commissioner">
          No urgent medical admissions currently in the intake queue. The Multi-Agent Supervisor is monitoring municipal telemetry.
        </p>
        <button
          id="btn-request-medical-event"
          onClick={() => {
            if (soundEnabled) SoundFX.playPulse();
            fetchProactiveEvents(1, 'ER Multi-Casualty Inflow');
          }}
          disabled={isGeneratingEvent}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          {isGeneratingEvent ? 'Supervisor Transmitting...' : 'Request Intake Telemetry'}
        </button>
      </div>
    );
  }

  const payload = activeEvent.payload;
  const isCritical = activeEvent.urgency === 'critical';

  return (
    <div className="flex flex-col gap-4 font-commissioner">
      {/* Patient Queue Switcher Header */}
      {medicalEvents.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-bold whitespace-nowrap">
            Active Patients ({medicalEvents.length}):
          </span>
          {medicalEvents.map((evt) => (
            <button
              key={evt.id}
              id={`med-patient-tab-${evt.id}`}
              onClick={() => {
                if (soundEnabled) SoundFX.playMedicalBeep(false);
                setSelectedEvent(evt.id);
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeEvent.id === evt.id
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  evt.urgency === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span>{evt.payload.patient_name || 'Emergency Intake'}</span>
              <span className="text-[10px] opacity-80 font-mono">[{evt.id}]</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Clinical Card with Crisp Jade Green Border */}
      <div className="bg-white rounded-lg border-2 border-emerald-600/90 shadow-sm overflow-hidden">
        {/* Patient Profile & Triage Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-md shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {payload.patient_name || 'Patient Unidentified'}
                </h2>
                {payload.age && (
                  <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    Age: {payload.age}
                  </span>
                )}
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded font-bold border border-emerald-300">
                  {activeEvent.sender}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Intake: {activeEvent.timestamp || 'Real-time'}</span>
                <span>•</span>
                <span>Event ID: <code className="font-mono text-emerald-900 font-semibold">{activeEvent.id}</code></span>
              </p>
            </div>
          </div>

          {/* Triage Priority Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 border shadow-xs ${
                isCritical
                  ? 'bg-red-600 text-white border-red-700 animate-pulse'
                  : 'bg-amber-500 text-white border-amber-600'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              TRIAGE: {payload.triage_category || (isCritical ? 'IMMEDIATE / RED' : 'URGENT / ORANGE')}
            </span>
          </div>
        </div>

        {/* Clinical Telemetry Bar (ECG Monitor + Vitals) */}
        <div className="p-4 bg-slate-900 text-emerald-400 border-b border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Real-time ECG Wave Canvas */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-emerald-300/80">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                LEAD II TELEMETRY REAL-TIME
              </span>
              <span>25mm/s • 10mm/mV</span>
            </div>
            <div className="w-full bg-slate-950 rounded border border-emerald-800/60 p-1 relative overflow-hidden h-20">
              <canvas
                ref={canvasRef}
                width={360}
                height={72}
                className="w-full h-full block"
              />
            </div>
          </div>

          {/* Vitals Metric Cards */}
          <div className="w-full md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-slate-950/80 p-2 rounded border border-emerald-700/40">
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                PULSE / HR
              </div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {payload.vitals?.includes('HR')
                  ? payload.vitals.split('HR')[1]?.split(',')[0]?.trim() || '134 bpm'
                  : '138 bpm'}
              </div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-emerald-700/40">
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                BLOOD PRESSURE
              </div>
              <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
                {payload.vitals?.includes('BP')
                  ? payload.vitals.split('BP')[1]?.split(',')[0]?.trim() || '85/50'
                  : '85/50'}
              </div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-emerald-700/40 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-sky-400" />
                SpO2 / SAT
              </div>
              <div className="text-lg font-bold text-sky-300 font-mono mt-0.5">
                {payload.vitals?.includes('SpO2')
                  ? payload.vitals.split('SpO2')[1]?.split(',')[0]?.trim() || '92%'
                  : '92%'}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Presentation & History */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
          <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
              Presenting Symptoms & Clinical Findings
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed">
              {payload.symptoms || 'Awaiting attending bedside examination.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              Patient Anamnesis & Medical History
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {payload.history || 'No prior chart found in St. Jude Health Database. Trauma intake protocol active.'}
            </p>
          </div>
        </div>

        {/* Physician Order & Intervention Action Panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-700" />
              Immediate Physician Directives & Treatment Orders
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluated by Supervisor AI
            </span>
          </div>

          {/* Recommended Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {(payload.actions_available && payload.actions_available.length > 0
              ? payload.actions_available
              : [
                  'Push 2L IV Normal Saline Bolus STAT',
                  'Order Bedside FAST Ultrasound & 4 Units Blood',
                  'Prepare Emergency Diagnostic Laparotomy in OR 2',
                  'Administer Broad-Spectrum IV Antibiotics',
                ]
            ).map((action, idx) => (
              <button
                key={idx}
                id={`btn-med-action-${idx}`}
                disabled={isResolvingAction}
                onClick={() => handleExecuteAction(action)}
                className="text-left px-3 py-2.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-300 hover:border-emerald-500 rounded-md text-xs font-medium transition-all shadow-2xs flex items-center justify-between group disabled:opacity-60"
              >
                <span className="pr-2">{action}</span>
                <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom Physician Directive Input */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              id="input-custom-doctor-order"
              type="text"
              placeholder="Enter custom clinical order (e.g. 'Intubate with Etomidate + STAT Head CT')..."
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customAction.trim()) {
                  handleExecuteAction(customAction);
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-emerald-600 font-commissioner"
            />
            <button
              id="btn-submit-custom-order"
              disabled={!customAction.trim() || isResolvingAction}
              onClick={() => handleExecuteAction(customAction)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isResolvingAction ? 'Transmitting...' : 'Issue Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
