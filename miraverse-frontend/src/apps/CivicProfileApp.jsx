import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useOSStore } from '../store/useOSStore';
import {
  User, Shield, Sparkles, BookOpen, Package, Home, Award, CheckCircle2,
  Code, Network, Cpu, MessageSquare, Palette, Search, ShieldAlert, Key, Zap, Lock, Mail, AlertTriangle, Fingerprint, Camera, Activity, Check, ArrowRight, RefreshCw
} from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

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
  Spellcasting: { unlocks: 'Advanced protocol spells, improved spell accuracy and range', raised: 'Spell Society, SpellForge use, Spell Theory class' },
  Engineering: { unlocks: 'Hardware upgrades, Robotics Club content, system modification', raised: 'Engineering elective, Robotics Club' },
  Communication: { unlocks: 'Richer NPC dialogue options, gift mechanics, persuasion paths', raised: 'Comms Portal use, social DMs, relationship deepening' },
  Creativity: { unlocks: 'Theme creation, in-OS software development, widget creation', raised: 'Art Club, Interface Weaving class, Publish tab' },
  Research: { unlocks: 'Library archives, investigative quests, historical lore discovery', raised: 'History elective, Journalism Club, browser research' },
  CyberSecurity: { unlocks: 'Firewall management, threat detection, virus quarantine', raised: 'Cyber Defense Team, Data Hygiene class, combat experience' },
  Cryptography: { unlocks: 'File decryption, code-breaking, cipher puzzles', raised: 'Decrypting archives, terminal cipher commands, Research synergy' },
};

const REGIONS = ['Aureline Central', 'Fross Sub-Conduit', 'Lumia Sprawl', 'Marlowe Springs', 'Brisland Docks', 'Kaji High Grounds'];
const PROFILE_TAG_OPTIONS = ['#Netrunner', '#Spellweaver', '#Scholar', '#Tactical', '#Drifter', '#Alchemist', '#CyberMedic'];
const SIGNATURE_PATTERNS = ['Aura-Code-Alpha', 'Sub-Conduit-Beta', 'Seraph-Resonance-Gamma', 'Obsidian-Cipher-Delta'];

export default function CivicProfileApp() {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'inventory' | 'skills' | 'clubs' | 'dorm'
  const [isFlipped, setIsFlipped] = useState(false);
  const [appliedCycademy, setAppliedCycademy] = useState(false);

  // Onboarding Scan Wizard States
  const [scanStep, setScanStep] = useState(1); // 1: Fingerprint, 2: Face, 3: Aura, 4: Customization, 5: Generated ID
  const [isScanningFinger, setIsScanningFinger] = useState(false);
  const [fingerProgress, setFingerProgress] = useState(0);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceProgress, setFaceProgress] = useState(0);
  const [isScanningAura, setIsScanningAura] = useState(false);
  const [auraProgress, setAuraProgress] = useState(0);

  // Customization choices
  const [chosenSignature, setChosenSignature] = useState('Aura-Code-Alpha');
  const [chosenTags, setChosenTags] = useState(['#Netrunner', '#Scholar']);
  const [chosenRegion, setChosenRegion] = useState('Aureline Central');

  const player = useOSStore((s) => s.gameplay.player);
  const identity = useOSStore((s) => s.gameplay.identity);
  const dgaVerified = player.dgaVerified || false;
  const completeIdentityScan = useOSStore((s) => s.completeIdentityScan);
  const setHouseAffiliation = useOSStore((s) => s.setHouseAffiliation);
  const healAura = useOSStore((s) => s.healAura);

  // Handlers for Scanner Steps
  const handleFingerScan = () => {
    if (isScanningFinger || fingerProgress >= 100) return;
    setIsScanningFinger(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setFingerProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningFinger(false);
        setTimeout(() => setScanStep(2), 600);
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
        setTimeout(() => setScanStep(3), 600);
      }
    }, 250);
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
        setTimeout(() => setScanStep(4), 600);
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
      fingerprint: true,
      facial: true,
      auraBaseline: true,
      signalSignature: chosenSignature,
      profileTags: chosenTags,
      declaredRegion: chosenRegion,
    });
  };

  const houses = [
    { name: 'Seraphima', desc: 'Noble lineage focused on diplomacy and aura purity.', color: 'from-[#FAF8FF] to-[#F0E9FC] border-purple-300' },
    { name: 'Obsidian', desc: 'Tech-focused house dedicated to cybernetics and hacking.', color: 'from-[#F0F8FF] to-[#E6F2FF] border-[#8c97d6]' },
    { name: 'Voss', desc: 'Military strategy, security protocols, and tactical warfare.', color: 'from-[#FFF0F2] to-[#FFE6E9] border-rose-300' },
    { name: 'Lightborn', desc: 'Ancient pre-Collapse affinity with high Veil & Spell capacity.', color: 'from-[#FAF6FF] to-[#EFF0FF] border-indigo-300' },
  ];

  const clubs = [
    { id: 'c-robotics', name: 'Robotics & Hardware Club', req: 'Engineering Lv.1', desc: 'Build autonomous cyber-drones and hardware firmware.', skills: 'Engineering & Programming' },
    { id: 'c-cyberdef', name: 'Cyber Defense Team', req: 'Networking Lv.1', desc: 'Compete in regional CTF hackathons and firewall defense.', skills: 'Networking & CyberSecurity' },
    { id: 'c-spellsoc', name: 'Spell Society', req: 'Spellcasting Lv.1', desc: 'Research protocol spellcrafting and Veil resonance.', skills: 'Spellcasting & Cryptography' },
    { id: 'c-art', name: 'Interface Weaving & Art', req: 'Creativity Lv.1', desc: 'Synthesize custom themes and OS desktop widgets.', skills: 'Creativity & Communication' },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241] p-5 text-xs select-none overflow-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-300/80 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1d2650] font-serif flex items-center gap-2">
            <User size={18} className="text-[#5f6ab0]" /> CIVIC PROFILE & CITIZEN RECORD
          </h2>
          <p className="text-[11px] text-slate-500">Official Identity Record, Inventory Backpack & Student Registry</p>
        </div>

        {/* Sub-Tabs Navigation */}
        {dgaVerified && (
          <div className="flex items-center gap-1 bg-white/70 border border-slate-300/80 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('record')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'record' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              🆔 Record
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'inventory' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              🎒 Inventory
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'skills' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              ⚡ Skills (9)
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'clubs' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              🏛️ Clubs
            </button>
            <button
              onClick={() => setActiveTab('dorm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dorm' ? 'bg-[#17213f] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eef0fb]'
              }`}
            >
              🏠 Dorm
            </button>
          </div>
        )}
      </div>

      {/* ── STEP-BY-STEP INTERACTIVE IDENTITY SETUP SCANNER ── */}
      {!dgaVerified ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-xl rounded-3xl border border-slate-300/80 bg-white p-8 shadow-xl space-y-6">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1d2650] font-serif text-left">
                  DGA DIRECTIVE 14-B: IDENTITY VERIFICATION
                </h3>
                <p className="text-[11px] text-slate-500 text-left">
                  Complete all biometric scans to generate your Citizen Record and unlock the Pulse Network.
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 font-mono text-[10px] font-bold text-indigo-800">
                Step {scanStep} of 4
              </span>
            </div>

            {/* STEP 1: FINGERPRINT SCAN */}
            {scanStep === 1 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-50 border-2 border-indigo-300 shadow-inner">
                  <Fingerprint size={48} className={isScanningFinger ? 'text-indigo-600 animate-pulse' : 'text-indigo-400'} />
                  {isScanningFinger && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-indigo-600 animate-ping opacity-30" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Biometric Fingerprint Scanner</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Press and hold the sensor below to record your primary dermal print.
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${fingerProgress}%` }} />
                </div>

                <Button
                  onClick={handleFingerScan}
                  disabled={isScanningFinger || fingerProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs"
                >
                  {fingerProgress >= 100 ? '✓ Fingerprint Recorded' : isScanningFinger ? 'Scanning Biometrics...' : 'Touch Sensor to Scan'}
                </Button>
              </div>
            )}

            {/* STEP 2: FACIAL CAPTURE */}
            {scanStep === 2 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-950 border-2 border-cyan-400 overflow-hidden shadow-lg">
                  <Camera size={40} className="text-cyan-400 opacity-60" />
                  <div className="absolute inset-0 border border-cyan-400/40 grid grid-cols-3 grid-rows-3" />
                  {isScanningFace && (
                    <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce top-0" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Facial Feature Landmarks</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Align your portrait with the camera grid to calibrate your facial node matrix.
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-cyan-500 h-full transition-all duration-200" style={{ width: `${faceProgress}%` }} />
                </div>

                <Button
                  onClick={handleFaceScan}
                  disabled={isScanningFace || faceProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs bg-cyan-700 hover:bg-cyan-600 text-white"
                >
                  {faceProgress >= 100 ? '✓ Facial Profile Captured' : isScanningFace ? 'Calibrating Camera...' : 'Capture Facial Scan'}
                </Button>
              </div>
            )}

            {/* STEP 3: AURA BASELINE READING */}
            {scanStep === 3 && (
              <div className="space-y-5 py-4">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-purple-50 border-2 border-purple-300 shadow-inner">
                  <Activity size={48} className={isScanningAura ? 'text-purple-600 animate-pulse' : 'text-purple-400'} />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1d2650]">Faith Medical Aura Telemetry Baseline</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Measuring Veil exposure, spring resonance, and baseline celestial aura stability.
                  </p>
                </div>

                <div className="w-full max-w-xs mx-auto bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-purple-600 h-full transition-all duration-200" style={{ width: `${auraProgress}%` }} />
                </div>

                <Button
                  onClick={handleAuraScan}
                  disabled={isScanningAura || auraProgress >= 100}
                  size="sm"
                  variant="solid"
                  className="px-6 py-2.5 font-bold text-xs bg-purple-700 hover:bg-purple-600 text-white"
                >
                  {auraProgress >= 100 ? '✓ Aura Baseline Verified' : isScanningAura ? 'Measuring Aura Frequency...' : 'Record Aura Baseline'}
                </Button>
              </div>
            )}

            {/* STEP 4: CUSTOMIZATION OPTIONS */}
            {scanStep === 4 && (
              <div className="space-y-4 text-left">
                {/* Signal Signature */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650]">Signal Signature Pattern:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {SIGNATURE_PATTERNS.map((sig) => (
                      <button
                        key={sig}
                        onClick={() => setChosenSignature(sig)}
                        className={`rounded-xl border p-2 text-xs text-left transition ${
                          chosenSignature === sig ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-900' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {sig}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Tags */}
                <div>
                  <label className="font-bold text-xs text-[#1d2650]">Profile Signal Tags (Select 2-3):</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {PROFILE_TAG_OPTIONS.map((tag) => {
                      const isSel = chosenTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                            isSel ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  <label className="font-bold text-xs text-[#1d2650] mb-1 block">Declared Origin Region:</label>
                  <Form.Select
                    aria-label="Declared Origin Region"
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
                  onClick={handleFinalSubmit}
                  size="sm"
                  variant="solid"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md mt-4 flex items-center justify-center gap-2 rounded-xl"
                >
                  <span>Generate Citizen Record & Unlock Pulse Network</span>
                  <ArrowRight size={15} />
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
              {/* Interactive Front & Back Citizen ID Card */}
              <div className="flex justify-center">
                <div className="w-full max-w-md cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  {!isFlipped ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/90 bg-white/95 p-6 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8c97d6] to-[#5f6ab0] flex items-center justify-center font-bold text-white text-xl shadow-sm">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1d2650]">{player.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {identity.citizenId || 'CY-9021-CITIZEN'}
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={12} /> DGA VERIFIED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Declared Region:</span>{' '}
                          <span className="font-bold text-[#1d2650]">{identity.declaredRegion || 'Aureline Central'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Signal Pattern:</span>{' '}
                          <span className="font-bold text-indigo-700">{identity.signalSignature}</span>
                        </div>
                      </div>

                      {/* Barcode Visualization */}
                      <div className="rounded-xl bg-[#FAFAFC] p-3 border border-slate-200 text-center font-mono text-xs text-slate-700 tracking-widest">
                        {identity.barcode || '||| |||| || ||| 902148'}
                      </div>

                      <div className="text-center text-[10px] text-slate-400 italic">
                        Click ID card to flip to reverse details 🔄
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/90 bg-[#17213f] p-6 shadow-lg space-y-4 text-white">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="font-serif text-sm font-bold text-indigo-200">CITIZEN REVERSE CLEARANCE RECORD</div>
                        <span className="text-[10px] font-mono text-indigo-300">{identity.citizenId}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400">Profile Tags:</span>{' '}
                          <span className="font-bold text-indigo-200">{(identity.profileTags || []).join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">House Placement:</span>{' '}
                          <span className="font-bold text-indigo-300">{player.houseAffiliation || 'None (Independent)'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Aura Health Status:</span>{' '}
                          <span className="font-bold text-emerald-300">100% Baseline Stable</span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-indigo-300 italic pt-2">
                        Click card to flip back 🔄
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Cycademy Student Application Section */}
              <div className="rounded-2xl border border-slate-300/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1d2650]">🎓 Cycademy Student Entrance Application</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Applying to Cycademy is optional! If accepted, you gain access to Student Houses and Student Clubs.
                    </p>
                  </div>
                  {player.houseAffiliation ? (
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold text-indigo-800">Enrolled Student</span>
                  ) : appliedCycademy ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800">Application Submitted</span>
                  ) : null}
                </div>

                {!player.houseAffiliation && (
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-semibold text-slate-700">Choose House Placement Preference:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {houses.map((h) => (
                        <button
                          key={h.name}
                          onClick={() => {
                            setHouseAffiliation(h.name);
                            setAppliedCycademy(true);
                          }}
                          className={`rounded-xl border p-3 text-left transition ${h.color} hover:shadow-md`}
                        >
                          <div className="font-bold text-xs text-[#1d2650]">{h.name} House</div>
                          <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">{h.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & BACKPACK */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>COLLECTED BACKPACK ITEMS</span>
                <span>3 / 20 Slots Used</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🔑</span>
                    <span className="text-[9px] font-mono bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800 font-bold">KEY ITEM</span>
                  </div>
                  <div className="font-bold text-xs text-[#1d2650]">Orynvell Archives Key</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">Unlocks pre-Collapse manuscript vaults in Central Library.</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🧪</span>
                    <span className="text-[9px] font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">POTION</span>
                  </div>
                  <div className="font-bold text-xs text-[#1d2650]">Aura Restoration Elixir</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">Restores +30 Aura Health immediately.</div>
                  <Button onClick={() => healAura(30)} size="sm" variant="outline" className="w-full mt-1 text-[10px]">
                    Consume Elixir
                  </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">💡</span>
                    <span className="text-[9px] font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-bold">DECOR</span>
                  </div>
                  <div className="font-bold text-xs text-[#1d2650]">Celestial Holo-Lamp</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">Place in Dorm Room for +15 Comfort Level.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CORE SKILL SYSTEM */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(player.skills || {}).map(([skillName, skillData]) => {
                const IconComp = SKILL_ICONS[skillName] || Code;
                const desc = SKILL_DESCRIPTIONS[skillName] || { unlocks: 'Higher system efficiency', raised: 'System actions' };
                return (
                  <div key={skillName} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
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
          )}

          {/* TAB 4: CYCADEMY CLUBS & ELECTIVES */}
          {activeTab === 'clubs' && (
            <div className="space-y-3">
              {!player.houseAffiliation && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-center gap-2">
                  <Lock size={16} className="text-amber-700 shrink-0" />
                  <span>Cycademy Clubs & Elective Classes are exclusive to enrolled Cycademy Students. Submit application in Record tab to join!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {clubs.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center font-bold text-xs text-[#1d2650]">
                      <span>{c.name}</span>
                      <span className="text-[10px] font-mono text-indigo-700">{c.req}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{c.desc}</p>
                    <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between items-center">
                      <span>Skills: {c.skills}</span>
                      <Button disabled={!player.houseAffiliation} size="sm" variant="outline" className="text-[10px]">
                        Enroll Club
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DORM ROOM & HOUSING */}
          {activeTab === 'dorm' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#1d2650] flex items-center gap-1.5">
                    <Home size={15} className="text-[#5f6ab0]" /> Current Housing: {player.houseAffiliation ? 'Cycademy Student Suite 4B' : 'Provisional Citizen Quarters'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Comfort Rating: <span className="font-bold text-emerald-700">{player.dormComfort || 50}% (+15% XP Multiplier)</span></p>
                </div>

                <Button onClick={() => useOSStore.getState().restInDorm()} size="sm" variant="solid" className="px-4 py-2 font-bold">
                  🌙 Rest in Dorm Bed
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
