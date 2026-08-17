import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  UserX,
  Volume2,
  Play,
  Pause,
  Shield,
  Fingerprint,
  Send,
  AlertTriangle,
  Radio,
  ExternalLink,
  Target,
  Sparkles,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

interface InvestigationModuleProps {
  onResolveSuccess?: (result: any) => void;
}

export const InvestigationModule: React.FC<InvestigationModuleProps> = ({ onResolveSuccess }) => {
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

  const invEvents = activeEvents.filter((e) => e.module === 'investigation');
  const activeEvent =
    invEvents.find((e) => e.id === selectedEventId) || invEvents[0] || null;

  const [customDirective, setCustomDirective] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const handleToggleAudio = () => {
    if (!isPlayingAudio && soundEnabled) {
      SoundFX.playInvestigationClick();
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleExecuteDirective = async (actionText: string) => {
    if (!activeEvent || isResolvingAction) return;

    if (soundEnabled) {
      const lower = actionText.toLowerCase();
      if (lower.includes('cctv') || lower.includes('camera') || lower.includes('photo') || lower.includes('surveillance') || lower.includes('video')) {
        SoundFX.playInvestigationClick();
      } else if (lower.includes('audio') || lower.includes('wiretap') || lower.includes('phone') || lower.includes('intercept') || lower.includes('acoustic')) {
        SoundFX.playDispatchRadioStatic();
      } else if (lower.includes('warrant') || lower.includes('subpoena') || lower.includes('apb') || lower.includes('arrest') || lower.includes('freeze')) {
        SoundFX.playInvestigationStamp();
      } else if (lower.includes('forensic') || lower.includes('dna') || lower.includes('fingerprint') || lower.includes('scan') || lower.includes('trace')) {
        SoundFX.playInvestigationScan();
      } else {
        SoundFX.playButtonTap();
      }
    }

    const res = await resolveEventAction(activeEvent.id, actionText);
    if (res && onResolveSuccess) {
      onResolveSuccess(res);
    }
    setCustomDirective('');
  };

  if (!activeEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border-2 border-dashed border-slate-400">
        <div className="p-4 bg-slate-100 rounded-full text-slate-700 mb-3">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 font-alice">
          Metropolitan Investigative Bureau: Active Cases Logged
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 font-commissioner">
          No urgent case dossiers awaiting detective directives. The forensic wiretap sweeps are running in background.
        </p>
        <button
          id="btn-request-investigation-event"
          onClick={() => {
            if (soundEnabled) SoundFX.playPulse();
            fetchProactiveEvents(1, 'Cyber & Forensics Breakthrough');
          }}
          disabled={isGeneratingEvent}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Fingerprint className="w-3.5 h-3.5" />
          {isGeneratingEvent ? 'Supervisor Intercepting...' : 'Request Forensic Lead'}
        </button>
      </div>
    );
  }

  const payload = activeEvent.payload;
  const isCritical = activeEvent.urgency === 'critical';

  return (
    <div className="flex flex-col gap-4 font-commissioner">
      {/* Case Files Queue Selector */}
      {invEvents.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <span className="text-[11px] font-mono uppercase text-slate-600 font-bold whitespace-nowrap">
            Open Dossiers ({invEvents.length}):
          </span>
          {invEvents.map((evt) => (
            <button
              key={evt.id}
              id={`inv-case-tab-${evt.id}`}
              onClick={() => {
                if (soundEnabled) SoundFX.playInvestigationClick();
                setSelectedEvent(evt.id);
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeEvent.id === evt.id
                  ? 'bg-slate-900 text-white border-slate-950 shadow-xs font-semibold'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
              }`}
            >
              <FileText className="w-3 h-3 text-blue-400" />
              <span className="font-alice font-medium">
                {evt.payload.case_file_id || evt.payload.suspect_name || 'Case File'}
              </span>
              <span className="text-[10px] opacity-75 font-mono">[{evt.id}]</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Investigation Card with Deep Navy Blue Accents */}
      <div className="bg-white rounded-lg border-2 border-slate-800 shadow-sm overflow-hidden">
        {/* Formal Institutional Case Header (Alice Font) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/80 border border-blue-800/60 rounded-md text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  CLASSIFIED // LEVEL 3
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  CASE NO: <strong className="text-white">{payload.case_file_id || 'CF-994'}</strong>
                </span>
              </div>
              <h2 className="text-lg font-alice tracking-wide text-white font-medium mt-0.5">
                Suspect: {payload.suspect_name || 'Subject Unidentified'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wide border ${
                isCritical
                  ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                  : 'bg-blue-950 text-blue-300 border-blue-800'
              }`}
            >
              PRIORITY: {activeEvent.urgency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Sender & Bureau Metadata Bar */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Originating Division:</span>
            <span className="font-semibold text-slate-800 font-alice">{activeEvent.sender}</span>
          </div>
          <div>
            <span>Confidence Match: </span>
            <strong className="text-blue-900 font-bold">{payload.confidence_level || '92.4%'}</strong>
          </div>
        </div>

        {/* Evidence Analysis Board */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
          {/* Clue Summary & Transcript */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
              <h4 className="text-xs font-alice font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Target className="w-3.5 h-3.5 text-blue-900" />
                Forensic Intelligence & Clue Summary
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-commissioner">
                {payload.evidence_summary || 'Evidence analysis in progress.'}
              </p>
            </div>

            {/* Simulated Acoustic / Telemetry Spectrum Player */}
            <div className="p-3 bg-slate-950 text-white rounded-lg border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  AUDIO SPECTRUM HARMONICS SCANNER
                </span>
                <span>Bandwidth: 44.1 kHz • PCM Mono</span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <button
                  id="btn-play-audio-clue"
                  onClick={handleToggleAudio}
                  className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full transition-colors shrink-0"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-6 flex items-end gap-1 bg-slate-900 p-1 rounded overflow-hidden">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const height = isPlayingAudio
                        ? Math.max(15, Math.sin((i + audioProgress) * 0.5) * 80 + 30)
                        : Math.max(10, Math.sin(i * 0.4) * 50 + 20);
                      return (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={`flex-1 rounded-xs transition-all duration-100 ${
                            i < (audioProgress / 100) * 28 ? 'bg-blue-400' : 'bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>00:14.28</span>
                    <span className="text-blue-300">4th Street Subway Junction Resonance Detected</span>
                    <span>00:30.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suspect Profile Dossier Sidebar */}
          <div className="p-3 bg-slate-100/80 rounded-lg border border-slate-300 flex flex-col justify-between">
            <div>
              <div className="w-full aspect-4/3 bg-slate-900 rounded border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-2 mb-2.5 relative overflow-hidden">
                <UserX className="w-12 h-12 text-slate-600 mb-1" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  SURVEILLANCE COMPOSITE
                </span>
                <div className="absolute top-1 right-1 text-[9px] font-mono bg-red-900/80 text-red-300 px-1 py-0.2 rounded border border-red-700">
                  FLAGGED
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-commissioner">
                <div>
                  <span className="text-slate-500 text-[11px] block">Primary Alias:</span>
                  <strong className="text-slate-900 font-alice text-sm">
                    {payload.suspect_name || 'Subject Unidentified'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Evidence Classification:</span>
                  <span className="font-mono text-xs text-blue-900 font-semibold">
                    {payload.clue_type || 'Digital & Acoustic Spectrum'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              Status: Active Surveillance Warrant Under Review
            </div>
          </div>
        </div>

        {/* Detective Directives & Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-alice flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-blue-900" />
              Detective Action Orders & Investigative Commands
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluated by Supervisor AI
            </span>
          </div>

          {/* Recommended Action Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {(payload.actions_available && payload.actions_available.length > 0
              ? payload.actions_available
              : [
                  'Pull CCTV Feeds for 4th St Subway Station (08:00 - 08:30)',
                  'Issue Subpoena for Cellular Tower Dumps',
                  'Cross-reference Audio with City Rail Acoustic Logs',
                  'Deploy Tactical Surveillance Team to 4th St Depot',
                ]
            ).map((action, idx) => (
              <button
                key={idx}
                id={`btn-inv-action-${idx}`}
                disabled={isResolvingAction}
                onClick={() => handleExecuteDirective(action)}
                className="text-left px-3 py-2.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-950 border border-slate-300 hover:border-blue-900 rounded-md text-xs font-medium transition-all shadow-2xs flex items-center justify-between group disabled:opacity-60"
              >
                <span className="pr-2">{action}</span>
                <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900 shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom Directive Input */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              id="input-custom-detective-directive"
              type="text"
              placeholder="Issue custom detective directive (e.g. 'Issue emergency APB and freeze shell accounts')..."
              value={customDirective}
              onChange={(e) => setCustomDirective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDirective.trim()) {
                  handleExecuteDirective(customDirective);
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-900 font-commissioner"
            />
            <button
              id="btn-submit-custom-directive"
              disabled={!customDirective.trim() || isResolvingAction}
              onClick={() => handleExecuteDirective(customDirective)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isResolvingAction ? 'Dispatching...' : 'Transmit Directive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
