import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useOSStore } from '../store/useOSStore';
import {
  User, Users, Shield, Sparkles, BookOpen, Package, Home, Award, CheckCircle2,
  Code, Network, Cpu, MessageSquare, Palette, Search, ShieldAlert, Key, Zap, Lock, Mail, AlertTriangle, Fingerprint, Camera, Activity, Check, ArrowRight, RefreshCw,
  Globe, Flame, Folder, Layers, Phone, Radio, Eye, FileText, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/button';
import { subscribeCitizenUpdates } from '../integration/citizenEvents';
import { resolvePersonalCitizen, personalIssuanceHistory } from '../integration/personalCitizen';
import CitizenServices from './CitizenServices';
import { MaidIdentityService, type CanonicalPerson } from '../services/maidIdentityService';

const SKILL_ICONS = {
  Programming: Code,
  Networking: Network,
  Spellcasting: Sparkles,
  Engineering: Cpu,
  Communication: MessageSquare,
  Creativity: Palette,
  Research: Search,
  CyberSecurity: ShieldAlert,
  Cryptography: Key,
};

const SKILL_DESCRIPTIONS = {
  Programming: { unlocks: 'New terminal commands, developer tools, NPC apps', raised: 'Coding 101, Programming Club, terminal usage' },
  Networking: { unlocks: 'New network locations, connection speeds, hidden servers', raised: 'Network Architecture class, Cyber Defense Team' },
  Spellcasting: { unlocks: 'Advanced protocol spells, improved spell accuracy and range', raised: 'Spell Society, Cyacademy magic practice, Spell Theory class' },
  Engineering: { unlocks: 'Hardware upgrades, Robotics Club content, system modification', raised: 'Engineering elective, Robotics Club' },
  Communication: { unlocks: 'Richer NPC dialogue options, gift mechanics, persuasion paths', raised: 'Comms Portal use, social DMs, relationship deepening' },
  Creativity: { unlocks: 'Theme creation, in-OS software development, widget creation', raised: 'Art Club, Interface Weaving class, Publish tab' },
  Research: { unlocks: 'Library archives, investigative quests, historical lore discovery', raised: 'History elective, Journalism Club, browser research' },
  CyberSecurity: { unlocks: 'Firewall management, threat detection, virus quarantine', raised: 'Cyber Defense Team, Data Hygiene class, combat experience' },
  Cryptography: { unlocks: 'File decryption, code-breaking, cipher puzzles', raised: 'Decrypting archives, terminal cipher commands, Research synergy' },
};

const REGIONS = [
  'Aureline Central',
  'Fross Sub-Conduit',
  'Lumia Sprawl',
  'Marlowe Springs',
  'Brisland Docks',
  'Kaji High Grounds',
  'Orynvell Upper Sanctum'
];

const PROFILE_TAG_OPTIONS = [
  '#Netrunner', '#Spellweaver', '#Scholar', '#Tactical', '#Drifter',
  '#Alchemist', '#CyberMedic', '#Archivist', '#LineageSeeker'
];

const SIGNATURE_PATTERNS = [
  'Aura-Code-Alpha (Resonant)',
  'Sub-Conduit-Beta (Encrypted)',
  'Seraph-Resonance-Gamma (Harmonic)',
  'Obsidian-Cipher-Delta (Hardened)'
];

export default function CivicProfileApp() {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'inventory' | 'skills' | 'clubs' | 'housing' | 'loops'
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedMaidPerson, setSelectedMaidPerson] = useState<CanonicalPerson | null>(null);
  const [recordStatus, setRecordStatus] = useState('');
  const [personalDocuments, setPersonalDocuments] = useState<Record<string, string>[]>([]);

  // Onboarding Scan Wizard States
  const [scanStep, setScanStep] = useState(1); // 1: Fingerprint Multi-Node, 2: Face & Iris, 3: Aura Telemetry, 4: Civic Persona, 5: Holographic ID Issuance
  const [isScanningFinger, setIsScanningFinger] = useState(false);
  const [fingerProgress, setFingerProgress] = useState(0);
  const [activeFingerNode, setActiveFingerNode] = useState('Thumb');

  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceProgress, setFaceProgress] = useState(0);

  const [isScanningAura, setIsScanningAura] = useState(false);
  const [auraProgress, setAuraProgress] = useState(0);

  // Customization choices
  const [citizenName, setCitizenName] = useState(() => useOSStore.getState().gameplay.identity.profileDisplayName || useOSStore.getState().gameplay.player.name || 'Provisional Citizen');
  const [chosenSignature, setChosenSignature] = useState('Aura-Code-Alpha (Resonant)');
  const [chosenTags, setChosenTags] = useState(['#Netrunner', '#Scholar']);
  const [chosenRegion, setChosenRegion] = useState('Aureline Central');

  const player = useOSStore((s) => s.gameplay.player);
  const identity = useOSStore((s) => s.gameplay.identity);
  const dgaVerified = player?.dgaVerified || player?.isAdmin || false;
  const completeIdentityScan = useOSStore((s) => s.completeIdentityScan);
  const restInDorm = useOSStore((s) => s.restInDorm);
  const advanceAppRank = useOSStore((s) => s.advanceAppRank);
  const completeStarterLoop = useOSStore((s) => s.completeStarterLoop);

  const workspaceRequest = useOSStore(s => s.workspaceRequests.passport);
  useEffect(() => {
    if (!workspaceRequest) return;
    const section = workspaceRequest.section;
    const allowed = dgaVerified ? ['record', 'inventory', 'skills', 'clubs', 'housing', 'loops', 'documents', 'services'] : ['record', 'documents', 'services'];
    setActiveTab(allowed.includes(section) ? section : 'record');
    useOSStore.getState().consumeWorkspaceRequest('passport', workspaceRequest.revision);
  }, [workspaceRequest]);

  useEffect(() => {
    let mounted = true;
    let revision = 0;
    const loadPersonalRecord = async () => {
      const current = ++revision;
      try {
        const persons = await MaidIdentityService.readExistingPersons();
        if (!mounted || revision !== current) return;
        const person = resolvePersonalCitizen(persons, identity);
        setSelectedMaidPerson(person);
        setRecordStatus(person ? '' : 'Your gameplay identity is preserved. An AURA record has not been linked to this player.');
        try { setPersonalDocuments(personalIssuanceHistory(JSON.parse(localStorage.getItem('miraverse-issued-documents') || '[]'), person)); }
        catch { setPersonalDocuments([]); }
      } catch {
        if (mounted && revision === current) { setSelectedMaidPerson(null); setPersonalDocuments([]); setRecordStatus('AURA is unavailable. Your personal progress remains on this device.'); }
      }
    };
    void loadPersonalRecord();
    const unsubscribe = subscribeCitizenUpdates(() => { void loadPersonalRecord(); });
    const onDocuments = (event: StorageEvent) => { if (event.key === 'miraverse-issued-documents' || event.key === null) void loadPersonalRecord(); };
    window.addEventListener('storage', onDocuments);
    window.addEventListener('miraverse-documents-issued', loadPersonalRecord);
    return () => { mounted = false; ++revision; unsubscribe(); window.removeEventListener('storage', onDocuments); window.removeEventListener('miraverse-documents-issued', loadPersonalRecord); };
  }, [identity.citizenId, identity.canonicalPersonId]);

  // Handlers for Scanner Steps
  const handleFingerScan = () => {
    if (isScanningFinger || fingerProgress >= 100) return;
    setIsScanningFinger(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setFingerProgress(p);
      if (p === 40) setActiveFingerNode('Index Node');
      if (p === 80) setActiveFingerNode('Palm Matrix');
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningFinger(false);
        setTimeout(() => setScanStep(2), 500);
      }
    }, 200);
  };

  const handleFaceScan = () => {
    if (isScanningFace || faceProgress >= 100) return;
    setIsScanningFace(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setFaceProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningFace(false);
        setTimeout(() => setScanStep(3), 500);
      }
    }, 200);
  };

  const handleAuraScan = () => {
    if (isScanningAura || auraProgress >= 100) return;
    setIsScanningAura(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setAuraProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningAura(false);
        setTimeout(() => setScanStep(4), 500);
      }
    }, 200);
  };

  const toggleTag = (tag) => {
    setChosenTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinalSubmit = () => {
    completeIdentityScan({
      profileDisplayName: citizenName,
      fingerprint: true,
      facial: true,
      auraBaseline: true,
      signalSignature: chosenSignature,
      profileTags: chosenTags,
      declaredRegion: chosenRegion,
    });
  };

  const clubs = [
    { id: 'c-robotics', name: 'Robotics & Hardware Club', req: 'Engineering Lv.1', desc: 'Build autonomous cyber-drones and hardware firmware.', skills: 'Engineering & Programming' },
    { id: 'c-cyberdef', name: 'Cyber Defense Team', req: 'Networking Lv.1', desc: 'Compete in regional CTF hackathons and firewall defense.', skills: 'Networking & CyberSecurity' },
    { id: 'c-spellsoc', name: 'Spell Society', req: 'Spellcasting Lv.1', desc: 'Research protocol spellcrafting and Veil resonance.', skills: 'Spellcasting & Cryptography' },
    { id: 'c-art', name: 'Interface Weaving & Art', req: 'Creativity Lv.1', desc: 'Synthesize custom themes and OS desktop widgets.', skills: 'Creativity & Communication' },
  ];

  const recordSections = [
    { id: 'record', label: 'My profile', icon: User }, { id: 'services', label: 'Citizen services', icon: Globe },
    { id: 'documents', label: 'Personal documents', icon: FileText }, { id: 'inventory', label: 'Personal vault', icon: Package },
    { id: 'skills', label: 'Skills & experience', icon: Activity }, { id: 'clubs', label: 'Associations', icon: Users },
    { id: 'housing', label: 'Residence', icon: Home }, { id: 'loops', label: 'World connections', icon: Network },
  ];
  return (
    <div className="civic-workspace">
      <aside className="civic-index" aria-label="Personal record navigation">
        <span className="workspace-kicker">Citizen Hub / personal workspace</span><div className="civic-monogram">{(identity.profileDisplayName || player?.name || 'Citizen').slice(0, 1)}</div><strong>{identity.profileDisplayName || player?.name || 'Provisional citizen'}</strong><span className="civic-record-status">{dgaVerified ? 'Profile ready' : 'Profile setup available'}</span>
        <nav>{recordSections.filter(item => dgaVerified || ['record', 'documents', 'services'].includes(item.id)).map(item => { const Icon = item.icon; return <button key={item.id} aria-label={item.label} aria-pressed={activeTab === item.id} onClick={() => setActiveTab(item.id as typeof activeTab)}><Icon size={15} />{item.label}</button>; })}</nav>
        <p className="civic-index-note">Your life and civic services. AURA keeps the official identity record.</p>
      </aside>
      <main className="civic-content">
        <header className="civic-heading"><span className="workspace-kicker">Citizen Hub</span><h1>{!dgaVerified && activeTab === 'record' ? 'Set up your profile' : recordSections.find(item => item.id === activeTab)?.label}</h1></header>
      {/* ── STEP-BY-STEP DEEPENED BIOMETRIC IDENTITY SETUP SCANNER ── */}
      {!dgaVerified && activeTab === 'record' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-300/80 bg-white p-8 shadow-xl space-y-6">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="text-left">
                <h3 className="text-sm font-bold text-[#1d2650] font-serif uppercase tracking-wider flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" /> Personal profile calibration
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete the simulated scans to initialize your gameplay profile. Official identity records remain in AURA.
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 font-mono text-[10px] font-bold text-indigo-800">
                Step {scanStep} of 5
              </span>
            </div>

            {/* STEP 1: MULTI-NODE FINGERPRINT RESONANCE SCAN */}
            {scanStep === 1 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-indigo-50 border-2 border-indigo-300 shadow-inner">
                  <Fingerprint size={54} className={isScanningFinger ? 'text-indigo-600 animate-pulse' : 'text-indigo-400'} />
                  {isScanningFinger && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-indigo-600 animate-ping opacity-30" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Multi-Node Biometric Dermal Scanner</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Calibrating dermal pressure node: <strong className="text-indigo-700 font-mono">[{activeFingerNode}]</strong>
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-200" style={{ width: `${fingerProgress}%` }} />
                </div>

                <div className="flex justify-center gap-3 text-[10px] font-mono text-slate-500">
                  <span className={fingerProgress >= 40 ? 'text-emerald-700 font-bold' : ''}>• Thumb Dermal</span>
                  <span className={fingerProgress >= 80 ? 'text-emerald-700 font-bold' : ''}>• Index Node</span>
                  <span className={fingerProgress >= 100 ? 'text-emerald-700 font-bold' : ''}>• Palm Resonance</span>
                </div>

                <Button
                  onClick={handleFingerScan}
                  disabled={isScanningFinger || fingerProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs"
                >
                  {fingerProgress >= 100 ? '✓ Biometric Dermal Captured' : isScanningFinger ? 'Calibrating Nodes...' : 'Touch Sensor to Scan'}
                </Button>
              </div>
            )}

            {/* STEP 2: OPTICAL FACIAL GEOMETRY & IRIS LANDMARKS */}
            {scanStep === 2 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-3xl bg-slate-950 border-2 border-cyan-400 overflow-hidden shadow-lg">
                  <Camera size={44} className="text-cyan-400 opacity-60" />
                  <div className="absolute inset-0 border border-cyan-400/40 grid grid-cols-3 grid-rows-3" />
                  {isScanningFace && (
                    <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce top-0" />
                  )}
                  <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-300">
                    X: 142.3 Y: 88.9 Z: 12.0
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Optical Geometry & Retinal Iris Mapping</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Corneal Reflection Index: <strong className="text-cyan-700 font-mono">99.4% (Verified)</strong>
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-cyan-500 h-full transition-all duration-200" style={{ width: `${faceProgress}%` }} />
                </div>

                <Button
                  onClick={handleFaceScan}
                  disabled={isScanningFace || faceProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs bg-cyan-700 hover:bg-cyan-600 text-white"
                >
                  {faceProgress >= 100 ? '✓ Facial Geometry Captured' : isScanningFace ? 'Aligning Optical Grid...' : 'Capture Facial Vector'}
                </Button>
              </div>
            )}

            {/* STEP 3: AURA TELEMETRY BASELINE & SERAPH RESONANCE */}
            {scanStep === 3 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-purple-50 border-2 border-purple-300 shadow-inner">
                  <Activity size={54} className={isScanningAura ? 'text-purple-600 animate-pulse' : 'text-purple-400'} />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Faith Medical Aura Telemetry Baseline</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Lumen Output: <strong className="text-purple-700 font-mono">94.2%</strong> • Veil Resistance: <strong className="text-purple-700 font-mono">98.6%</strong>
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-purple-600 h-full transition-all duration-200" style={{ width: `${auraProgress}%` }} />
                </div>

                <Button
                  onClick={handleAuraScan}
                  disabled={isScanningAura || auraProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs bg-purple-700 hover:bg-purple-600 text-white"
                >
                  {auraProgress >= 100 ? '✓ Aura Baseline Calibrated' : isScanningAura ? 'Measuring Frequency...' : 'Record Aura Baseline'}
                </Button>
              </div>
            )}

            {/* STEP 4: CIVIC PERSONA & DISTRICT DECLARATION */}
            {scanStep === 4 && (
              <div className="space-y-4 text-left">
                {/* Legal Name */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650] mb-1 block">Profile display name:</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs font-semibold"
                  />
                </div>

                {/* Signal Signature */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650] mb-1 block">Signal Signature Pattern:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIGNATURE_PATTERNS.map((sig) => (
                      <button
                        key={sig}
                        onClick={() => setChosenSignature(sig)}
                        className={`rounded-xl border p-2.5 text-xs text-left transition ${
                          chosenSignature === sig ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-900 shadow-xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sig}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Tags */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650] mb-1 block">Lifestyle & Network Tags:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROFILE_TAG_OPTIONS.map((tag) => {
                      const isSel = chosenTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                            isSel ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Declared Region */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650] mb-1 block">Declared Origin District:</label>
                  <Form.Select
                    aria-label="Declared Origin District"
                    value={chosenRegion}
                    onChange={(e) => setChosenRegion(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Select>
                </div>

                <Button
                  onClick={() => setScanStep(5)}
                  size="sm"
                  variant="solid"
                  className="w-full py-3 bg-[#17213f] hover:bg-[#25335f] text-white font-bold text-xs shadow-md mt-4 flex items-center justify-center gap-2 rounded-xl"
                >
                  <span>Preview Holographic Citizen Card</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            )}

            {/* STEP 5: OFFICIAL HOLOGRAPHIC MUNICIPAL CITIZEN ID ISSUANCE */}
            {scanStep === 5 && (
              <div className="space-y-5 py-2">
                <div className="rounded-3xl border border-indigo-200 bg-gradient-to-tr from-white via-indigo-50/40 to-purple-50 p-6 shadow-md text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-sm">
                        {citizenName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1d2650]">{citizenName}</div>
                        <div className="text-[10px] text-indigo-700 font-mono">{identity.citizenId || 'Local identifier assigned when saved'}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-[10px] font-bold text-emerald-800 flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 size={12} /> VERIFIED CITIZEN
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Declared District:</span>{' '}
                      <span className="font-bold text-[#1d2650]">{chosenRegion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Signal Cipher:</span>{' '}
                      <span className="font-bold text-indigo-700">{chosenSignature}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {chosenTags.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-md bg-white border border-indigo-100 text-indigo-800 text-[10px] font-mono font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-slate-200 text-center font-mono text-xs text-slate-700 tracking-widest">
                    ||| |||| || ||| 902148-AURELINE-PASSPORT
                  </div>
                </div>

                <Button
                  onClick={handleFinalSubmit}
                  size="sm"
                  variant="solid"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 rounded-xl"
                >
                  <Check size={16} />
                  <span>Save personal calibration & activate OS</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── UNLOCKED CIVIC PROFILE DASHBOARD ── */
        <>
          {/* TAB 1: CITIZEN RECORD */}
          {activeTab === 'record' && (
            <div className="space-y-4">
              <div className="citizen-record-source">
                <Shield size={20}/>
                <div><strong>{selectedMaidPerson ? 'Linked to your AURA record' : 'Personal gameplay profile'}</strong>
                  <p>{selectedMaidPerson ? `${selectedMaidPerson.name} · ${selectedMaidPerson.maid || selectedMaidPerson.legacyRecord}` : recordStatus}</p>
                  <p>Official identity details are read-only here. Browsing another citizen in AURA or DGAOS does not change your profile.</p>
                </div>
                {player.isAdmin && <button onClick={() => useOSStore.getState().openAppWorkspace('meridionRegistry')}>Open AURA administration <ExternalLink size={13}/></button>}
              </div>

              {/* Interactive Front & Back Citizen ID Card */}
              <div className="flex justify-center">
                <div className="w-full max-w-md cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  {!isFlipped ? (
                    <div className="relative overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-6 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#8c97d6] to-[#5f6ab0] flex items-center justify-center font-bold text-white text-xl shadow-xs">
                            {(selectedMaidPerson?.name || identity.profileDisplayName || player?.name || 'P').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1d2650]">{selectedMaidPerson?.name || identity.profileDisplayName || player?.name || 'Provisional Citizen'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {selectedMaidPerson?.maid ? 'MAID' : 'Citizen ID'}: {selectedMaidPerson?.maid || selectedMaidPerson?.legacyRecord || identity?.citizenId || 'Not issued'}
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={12} /> PROFILE VERIFIED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Declared Region:</span>{' '}
                          <span className="font-bold text-[#1d2650]">{selectedMaidPerson?.home || identity?.declaredRegion || 'Aureline, Orynvell'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Signal Pattern:</span>{' '}
                          <span className="font-bold text-indigo-700">{identity?.signalSignature || 'Aura-Code-Alpha'}</span>
                        </div>
                      </div>

                      {/* Barcode Visualization */}
                      <div className="rounded-xl bg-[#FAFAFC] p-3 border border-slate-200 text-center font-mono text-xs text-slate-700 tracking-widest">
                        {selectedMaidPerson?.maid || identity?.barcode || 'Not issued'}
                      </div>

                      <div className="text-center text-[10px] text-slate-400 italic">
                        Click ID card to flip to reverse clearance details 🔄
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/90 bg-[#17213f] p-6 shadow-lg space-y-4 text-white">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="font-serif text-sm font-bold text-indigo-200">CITIZEN REVERSE CLEARANCE RECORD</div>
                        <span className="text-[10px] font-mono text-indigo-300">{selectedMaidPerson?.maid || selectedMaidPerson?.legacyRecord || identity?.citizenId || 'Not issued'}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-slate-400">Clearance Tier:</span>
                          <span className="font-bold text-amber-300">{selectedMaidPerson?.clearance || 'No AURA clearance linked'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-slate-400">Lineage Status:</span>
                          <span className="font-bold text-purple-300">{selectedMaidPerson?.ancestry || player?.lineageClass || 'Not recorded'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-slate-400">Primary Economy:</span>
                          <span className="font-bold text-amber-400 font-mono">{player?.credits ?? 0} ₢ CREDITS</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-slate-400">Secondary Rare:</span>
                          <span className="font-bold text-cyan-400 font-mono">{player?.bits ?? 0} ◈ BITS</span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-400 italic pt-2">
                        Click ID card to flip back to front 🔄
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && <CitizenServices/>}
          {activeTab === 'documents' && <section className="citizen-documents" aria-label="Personal document history">
            <p className="citizen-boundary">Issued document history from your linked AURA identity. These entries keep the name, date, and authority recorded at issuance.</p>
            {!selectedMaidPerson ? <p>No AURA identity is linked. Other citizens' documents are not shown.</p> : personalDocuments.length === 0 ? <p>No personal document issuances are recorded for this identity.</p> : personalDocuments.map(item => <article key={item.id}>
              <FileText size={22}/><div><h2>{item.documentType}</h2><strong>{item.citizenName}</strong><p>{item.issuingAuthority} · {item.issuedAt}</p><code>{item.id} · {item.hash}</code></div>
            </article>)}
            <p className="citizen-boundary">This is an issuance log. Stored entries do not contain the original document file; this view does not regenerate or reissue it.</p>
          </section>}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#1d2650] uppercase tracking-wider flex items-center gap-2">
                    <Package size={15} className="text-[#5f6ab0]" /> VAULT / Inventory Backpack ({(player?.rewardItems || []).length} Items)
                  </h3>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="font-bold text-amber-600">{player?.credits || 0} ₢ Credits</span>
                    <span>•</span>
                    <span className="font-bold text-cyan-600">{player?.bits || 0} ◈ Bits</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(player?.rewardItems || ['Provisional Netrunner Deck', 'Faith Medical Telemetry Patch']).map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-[#FAFAFC] p-3 space-y-1 shadow-2xs">
                      <div className="font-bold text-xs text-[#1d2650] flex items-center gap-1.5">
                        <Award size={14} className="text-indigo-600" /> {item}
                      </div>
                      <p className="text-[10px] text-slate-500">Official Municipal Item</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-[#1d2650] uppercase tracking-wider flex items-center gap-2">
                  <Zap size={15} className="text-[#5f6ab0]" /> Core Citizen Skills & Proficiencies
                </h3>
                <p className="text-[11px] text-slate-500">Advance your core academic, technical, and resonance skills across Cyacademy and WORKNET.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(player?.skills || {}).map(([skillName, rawSkill]) => { const skillData = rawSkill as { level: number; xp: number };
                  const IconComp = SKILL_ICONS[skillName] || Code;
                  const desc = SKILL_DESCRIPTIONS[skillName] || { unlocks: 'Higher system efficiency', raised: 'System actions' };
                  return (
                    <div key={skillName} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-[#1d2650]">
                          <IconComp size={15} className="text-[#5f6ab0]" /> {skillName}
                        </div>
                        <span className="font-mono text-xs font-bold text-indigo-700">LVL {skillData.level}</span>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#5f6ab0] h-full" style={{ width: `${(skillData.xp % 100)}%` }} />
                      </div>

                      <div className="text-[10px] text-slate-500 leading-tight">
                        <span className="font-semibold text-slate-700">Unlocks:</span> {desc.unlocks}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CYCADEMY CLUBS */}
          {activeTab === 'clubs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clubs.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center font-bold text-xs text-[#1d2650]">
                    <span>{c.name}</span>
                    <span className="text-[10px] font-mono text-indigo-700">{c.req}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{c.desc}</p>
                  <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between items-center">
                    <span>Skills: {c.skills}</span>
                    <Button size="sm" variant="outline" className="text-[10px]">
                      Enroll Club
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: HOUSING */}
          {(activeTab === 'housing' || activeTab === 'dorm') && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                    <Home size={15} className="text-[#5f6ab0]" /> Housing: {selectedMaidPerson?.household || (player?.houseAffiliation ? 'Cyacademy Vector Housing Suite 4B' : 'Provisional Citizen Housing')}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Housing Comfort Rating: <span className="font-bold text-emerald-700">{player?.roomComfort ?? player?.dormComfort ?? 50}% (+15% XP Multiplier)</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => useOSStore.getState().openAppWorkspace('housing')}
                    size="sm"
                    variant="outline"
                    className="px-3.5 py-2 font-bold"
                  >
                    🏠 Open HOMECRAFT Housing
                  </Button>
                  <Button onClick={() => restInDorm()} size="sm" variant="solid" className="px-4 py-2 font-bold">
                    🌙 Rest in Housing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: APP LOOPS */}
          {activeTab === 'loops' && (
            <div className="space-y-6">
              {/* SECTION A: EARLY CITIZEN GAMEPLAY LOOPS */}
              <div className="space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-[#1d2650] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={15} className="text-[#5f6ab0]" /> Early Citizen Gameplay Loops
                  </h3>
                  <p className="text-[11px] text-slate-500">Core onboarding pathways that shape your early life in Aureline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'phone_comms',
                      title: 'Phone & Comms Loop',
                      icon: Phone,
                      desc: 'Activate phone number, add contacts, reply to messages, join first channels, answer missed calls, and follow social prompts.',
                      unlocks: 'Contacts, relationship vectors, rumor leads, first hangouts, emergency routing.',
                      color: 'border-purple-200 bg-purple-50/50'
                    },
                    {
                      id: 'faith_medical',
                      title: 'Faith Medical Loop',
                      icon: Activity,
                      desc: 'Open Faith Medical portal, complete intake, schedule scans, review aura results, follow treatment tasks, and monitor symptoms.',
                      unlocks: 'Basic medical record, aura baseline, recovery options, Faith Medical reputation, lineage hints.',
                      color: 'border-emerald-200 bg-emerald-50/50'
                    },
                    {
                      id: 'mai_space',
                      title: 'Mai.space Loop',
                      icon: Globe,
                      desc: 'Create a profile, follow citizens, react to posts, share safe updates, track trends, and notice suspicious social anomalies.',
                      unlocks: 'Followers, Reputation, rumor visibility, social event invites, early PRISM foreshadowing.',
                      color: 'border-pink-200 bg-pink-50/50'
                    },
                    {
                      id: 'first_quest',
                      title: 'First Quest Loop',
                      icon: Award,
                      desc: 'Choose a lead, investigate files or locations, talk to NPCs, use an app mechanic, resolve the objective, and receive follow-up hooks.',
                      unlocks: 'Quest XP, lore clues, relationship progress, app practice, credits, branching early-life direction.',
                      color: 'border-blue-200 bg-blue-50/50'
                    },
                  ].map((loop) => {
                    const LoopIcon = loop.icon;
                    const isDone = (useOSStore.getState().gameplay.starterCompletedLoops || []).includes(loop.id);
                    return (
                      <div key={loop.id} className={`rounded-3xl border ${loop.color} p-4 space-y-2 shadow-xs`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs text-[#1d2650]">
                            <LoopIcon size={16} className="text-[#5f6ab0]" /> {loop.title}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isDone ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isDone ? '✓ Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{loop.desc}</p>
                        <div className="text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5 font-mono">
                          <strong className="text-slate-700">Unlocks:</strong> {loop.unlocks}
                        </div>
                        {!isDone && (
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                completeStarterLoop(loop.id);
                              }}
                              className="px-3 py-1 bg-[#17213f] hover:bg-[#25335f] text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                            >
                              Resolve Loop (+150 ₡ & +100 XP)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION B: APP PROGRESSION LOOPS & APP RANKS */}
              <div className="space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-[#1d2650] uppercase tracking-wider flex items-center gap-2">
                    <Layers size={15} className="text-[#5f6ab0]" /> App Progression Loops
                  </h3>
                  <p className="text-[11px] text-slate-500">Every major application deepens through use, unlocking features, hidden files, and story access.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      key: 'explorer',
                      app: 'File Explorer',
                      icon: Folder,
                      growth: 'Exploration depth',
                      loop: 'Find files, decrypt folders, restore corrupted records, collect evidence.',
                      unlocks: 'Hidden folders, encrypted drives, ghost files, AETHERCORE sectors.',
                    },
                    {
                      key: 'weaver',
                      app: 'SpellForge',
                      icon: Sparkles,
                      growth: 'Weaving familiarity',
                      loop: 'Collect modules, test builds, stabilize spells, apply them in quests.',
                      unlocks: 'Advanced recipes, regional modules, celestial repairs, forbidden protocols.',
                    },
                    {
                      key: 'investigator',
                      app: 'Process Monitor',
                      icon: ShieldAlert,
                      growth: 'Investigation depth',
                      loop: 'Scan processes, trace origins, isolate malware, uncover hidden services.',
                      unlocks: 'Trace, Mirror, Deep Scan, Inject, Recovery, PRISM behavior clues.',
                    },
                    {
                      key: 'research',
                      app: 'Net Browser',
                      icon: Globe,
                      growth: 'Research access',
                      loop: 'Search sites, follow leads, access portals, compare public and hidden records.',
                      unlocks: 'Hidden websites, deep archives, Faith Medical portal access, Orynvell records.',
                    },
                    {
                      key: 'influence',
                      app: 'Mai.space',
                      icon: Flame,
                      growth: 'Public visibility',
                      loop: 'Post, reply, follow trends, manage public reputation, detect social anomalies.',
                      unlocks: 'Followers, broadcasts, trend control, faction attention, PRISM hijack events.',
                    },
                    {
                      key: 'clearance',
                      app: 'Citizen Record',
                      icon: User,
                      growth: 'Civic status',
                      loop: 'Track identity, aura status, reputation, medical records, and locked lineage data.',
                      unlocks: 'Lightborn markers, Seraphima registry, Orynvell clearance, royal lineage reveal.',
                    },
                  ].map((prog) => {
                    const ProgIcon = prog.icon;
                    const appRanks = useOSStore.getState().gameplay.appRanks || { explorer: 1, weaver: 1, investigator: 1, research: 1, influence: 1, clearance: 1 };
                    const currentRank = appRanks[prog.key] || 1;
                    return (
                      <div key={prog.key} className="rounded-3xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs text-[#1d2650]">
                            <ProgIcon size={16} className="text-[#5f6ab0]" /> {prog.app}
                          </div>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                            Rank {currentRank} / 5
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Growth Focus: <strong className="text-slate-800">{prog.growth}</strong></span>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#5f6ab0] h-full transition-all duration-300" style={{ width: `${(currentRank / 5) * 100}%` }} />
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{prog.loop}</p>

                        <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 font-mono">
                          <strong className="text-slate-700">Unlocks:</strong> {prog.unlocks}
                        </div>

                        {currentRank < 5 && (
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                advanceAppRank(prog.key);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                            >
                              + Advance Rank {currentRank + 1} (+{(currentRank + 1) * 50} XP)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </main>
    </div>
  );
}
