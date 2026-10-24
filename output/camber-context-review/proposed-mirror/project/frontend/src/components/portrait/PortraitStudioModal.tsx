import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Camera, Upload, Sliders, RefreshCw, CheckCircle2, 
  Cpu, Copy, Check, Eye, HelpCircle, X, Shield, ArrowRight
} from 'lucide-react';
import { 
  buildPortraitPrompt, 
  detectLocalEngine, 
  generateProceduralPortrait, 
  persistCitizenPortrait, 
  type CitizenAppearance, 
  type PortraitMode, 
  type LocalEngineStatus 
} from '../../services/portraitService';

interface PortraitStudioModalProps {
  citizen: CitizenAppearance & { record: string; portraitData?: string };
  isOpen: boolean;
  onClose: () => void;
  onPortraitSaved?: (newPortraitUri: string) => void;
}

export default function PortraitStudioModal({ citizen, isOpen, onClose, onPortraitSaved }: PortraitStudioModalProps) {
  const [mode, setMode] = useState<PortraitMode>('id');
  const [engineStatus, setEngineStatus] = useState<LocalEngineStatus>({
    type: 'none',
    online: false,
    endpoint: '',
    details: 'Scanning local environment...'
  });
  const [isScanningEngine, setIsScanningEngine] = useState(false);
  const [currentPortraitUri, setCurrentPortraitUri] = useState<string>(citizen.portraitData || '');
  const [seed, setSeed] = useState<number>(101);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // Image adjustment controls
  const [zoom, setZoom] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan local AI engine on mount
  useEffect(() => {
    if (isOpen) {
      checkEngine();
      if (!currentPortraitUri) {
        // Generate initial procedural portrait based on citizen traits
        const initial = generateProceduralPortrait(citizen, seed);
        setCurrentPortraitUri(initial);
      }
    }
  }, [isOpen, citizen]);

  const checkEngine = async () => {
    setIsScanningEngine(true);
    const status = await detectLocalEngine();
    setEngineStatus(status);
    setIsScanningEngine(false);
  };

  const prompts = buildPortraitPrompt(citizen, mode);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompts.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleGenerateProcedural = (newSeed = seed + 1) => {
    setSeed(newSeed);
    const generated = generateProceduralPortrait(citizen, newSeed);
    setCurrentPortraitUri(generated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCurrentPortraitUri(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetName: string) => {
    const mockCitizen: CitizenAppearance = {
      ...citizen,
      species: presetName,
      hair: presetName.includes('Frost') ? 'Icy blue' : presetName.includes('Solar') ? 'Platinum gold' : presetName.includes('Siren') ? 'Sea green' : 'Silver-black',
      eyes: presetName.includes('Solar') ? 'Luminous gold' : presetName.includes('Frost') ? 'Pale blue' : 'Amber'
    };
    const generated = generateProceduralPortrait(mockCitizen, Math.floor(Math.random() * 9999));
    setCurrentPortraitUri(generated);
  };

  const handleSaveToMasterRecord = () => {
    if (!currentPortraitUri) return;
    const ok = persistCitizenPortrait(citizen.record, currentPortraitUri);
    if (ok) {
      setIsSaved(true);
      if (onPortraitSaved) onPortraitSaved(currentPortraitUri);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 900);
    } else {
      alert('Could not write to local registry. Ensure browser storage is enabled.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-sans">
      <div className="relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-5xl rounded-2xl border border-[#443869] bg-[#161326] text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#2C2648] bg-[#1C1833] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9883C8] to-[#3C3268] text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white">PORTRAIT STUDIO</h2>
                <span className="rounded-full bg-[#9883C8]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#C4B5FD] border border-[#9883C8]/30">
                  Phase 5 Integrated Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stylized fantasy realism portraits for <strong className="text-slate-200">{citizen.name}</strong> ({citizen.record})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex flex-1 min-h-0 divide-x divide-[#2C2648] overflow-hidden">
          
          {/* Left Column: Portrait Canvas & Real-time ID Crop Frame */}
          <div className="flex flex-col flex-1 items-center justify-center bg-[#100D1C] p-6 overflow-y-auto">
            
            {/* Mode Selector */}
            <div className="mb-4 flex rounded-lg border border-[#3C3268] bg-[#1C1833] p-1 text-xs font-semibold">
              <button
                onClick={() => setMode('id')}
                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
                  mode === 'id' ? 'bg-[#9883C8] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield size={13} />
                ID Identification Headshot
              </button>
              <button
                onClick={() => setMode('expressive')}
                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${
                  mode === 'expressive' ? 'bg-[#9883C8] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                Expressive Character Art
              </button>
            </div>

            {/* Canvas Portrait Box with Identification Guides */}
            <div className="relative h-[380px] w-[310px] rounded-xl border-2 border-[#9883C8]/40 bg-[#1A162B] shadow-2xl overflow-hidden flex items-center justify-center">
              {currentPortraitUri ? (
                <div 
                  className="h-full w-full flex items-center justify-center overflow-hidden"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`
                  }}
                >
                  <img
                    src={currentPortraitUri}
                    alt="Citizen portrait"
                    className="h-full w-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs">
                  <Camera size={36} className="mx-auto mb-2 opacity-40" />
                  Generating portrait...
                </div>
              )}

              {/* ID Card Safe Crop Overlay Guides */}
              <div className="pointer-events-none absolute inset-0 border border-white/10 m-2 rounded-lg">
                <div className="absolute top-2 left-2 text-[9px] font-mono tracking-widest text-white/40 uppercase">
                  AURA · 35×45mm ISO SPEC
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-mono text-[#C5AB78]">
                  <span>✦ MERIDION</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons under Canvas */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => handleGenerateProcedural()}
                className="flex items-center gap-2 rounded-lg bg-[#3C3268] hover:bg-[#4E4185] border border-[#6B5A9E] px-4 py-2 text-xs font-semibold text-white shadow transition"
              >
                <RefreshCw size={14} />
                Generate New Celestial Variant
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-[#251F3D] hover:bg-[#342B55] border border-[#483B70] px-4 py-2 text-xs font-medium text-slate-200 transition"
              >
                <Upload size={14} />
                Upload Photo File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Preset Archetype Gallery Bar */}
            <div className="mt-4 flex items-center gap-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 mr-1">Archetype Presets:</span>
              <button onClick={() => handleApplyPreset('Frostborn')} className="rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-sky-300">Frostborn</button>
              <button onClick={() => handleApplyPreset('Luminari')} className="rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-amber-300">Luminari</button>
              <button onClick={() => handleApplyPreset('Merfolk Siren')} className="rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-emerald-300">Merfolk</button>
              <button onClick={() => handleApplyPreset('Lightborn Angel')} className="rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-purple-300">Lightborn</button>
            </div>
          </div>

          {/* Right Column: Prompts, Engine Status, Image Controls & Persistence */}
          <div className="flex flex-col w-[380px] bg-[#18142A] p-5 overflow-y-auto space-y-4">
            
            {/* Local Engine Status Panel */}
            <div className="rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[#C4B5FD] uppercase flex items-center gap-1.5">
                  <Cpu size={14} />
                  Local AI Backend
                </span>
                <button
                  onClick={checkEngine}
                  disabled={isScanningEngine}
                  className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <RefreshCw size={11} className={isScanningEngine ? 'animate-spin' : ''} />
                  Scan
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2.5 w-2.5 rounded-full ${engineStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-semibold text-slate-200">
                  {engineStatus.online ? engineStatus.details : 'Zero-Config Procedural Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {engineStatus.online 
                  ? `Connected to local pipeline at ${engineStatus.endpoint}. You can pass the synthesized prompt directly into your local queue.`
                  : 'Procedural Celestial Engine active. Generates accurate fantasy portraits instantly offline without external servers.'}
              </p>
            </div>

            {/* Synthesized Prompt Card */}
            <div className="rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                  Synthesized Prompt
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#C4B5FD] hover:text-white transition"
                >
                  {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedPrompt ? 'Copied' : 'Copy for ComfyUI'}
                </button>
              </div>

              <div className="max-h-28 overflow-y-auto rounded-lg border border-[#342B55] bg-[#141124] p-2.5 text-[11px] text-slate-300 leading-relaxed font-mono">
                {prompts.prompt}
              </div>

              <details className="text-[11px] text-slate-400 cursor-pointer pt-1">
                <summary className="hover:text-slate-200">View Negative Prompt</summary>
                <div className="mt-1.5 rounded-md bg-[#141124] p-2 text-[10px] text-slate-400 font-mono">
                  {prompts.negativePrompt}
                </div>
              </details>
            </div>

            {/* Image Adjustments (Zoom / Brightness / Contrast) */}
            <div className="rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-3">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Sliders size={13} />
                Image Adjustments
              </span>

              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Zoom / Crop Scale</span>
                  <span className="font-mono text-slate-200">{zoom}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="160"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"
                />
              </div>

              {/* Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Brightness</span>
                  <span className="font-mono text-slate-200">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Contrast</span>
                  <span className="font-mono text-slate-200">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Master Record Persistence Action */}
            <div className="pt-2">
              <button
                onClick={handleSaveToMasterRecord}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition shadow-lg ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#9883C8] to-[#6C5FAC] hover:from-[#A896D8] hover:to-[#7D6FBF] text-white'
                }`}
              >
                {isSaved ? <CheckCircle2 size={16} /> : <Check size={16} />}
                {isSaved ? 'Applied to Citizen Profile!' : 'Apply to Master Citizen Profile'}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                Updates Aura ID, Passport, Registry, and TRACE records across all open OS workspaces.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
