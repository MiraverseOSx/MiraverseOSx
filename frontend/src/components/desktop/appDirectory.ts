import { Briefcase, Bookmark, Cpu, Home, Sparkles, Globe, Mail, MessageSquare, UserCheck, Radio, Folder, BookOpen, Terminal, Settings, Shield, Activity, Landmark, ContactRound, Fingerprint, FileText, GraduationCap, Grid2X2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { APPS } from '../../apps/contents';
import { useOSStore } from '../../store/useOSStore';

export interface ProtocolItem {
  id: string;
  code: string;
  name: string;
  label?: string;
  sector: string;
  icon?: LucideIcon;
  clearance: string;
  aetherTrace: string;
  flux: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

export const PROTOCOLS: ProtocolItem[] = [
  {
    id: 'dgaos',
    code: 'DGAOS',
    name: 'DGAOS // Agency Command Center',
    label: 'DGAOS // Agency Command Center',
    sector: 'Department of Global Affairs',
    icon: Shield,
    clearance: 'DGA Senior Officer Clearance',
    aetherTrace: 'AT-0x0901',
    flux: '35.4 MHz',
    desc: 'Agency headquarters: strategic operations, divisions (SHIELD/EYES), investigations, forensic dispatches, and comms.',
    color: 'text-purple-950',
    bg: 'bg-purple-100/80',
    border: 'border-purple-400'
  },
  {
    id: 'traceForensics',
    code: 'TRACE',
    name: 'TRACE // Forensic Workstation',
    label: 'TRACE // Forensic Workstation',
    sector: 'DGAOS Investigations (EYES/SHIELD)',
    icon: Fingerprint,
    clearance: 'DGA Special Clearance',
    aetherTrace: 'AT-0x0990',
    flux: '33.8 MHz',
    desc: 'Tactical forensic workstation: registry-linked subject analysis, evidence custody, case staging, and criminalistics.',
    color: 'text-slate-900',
    bg: 'bg-slate-100',
    border: 'border-slate-400'
  },
  {
    id: 'meridionRegistry',
    code: 'AURA',
    name: 'AURA // Citizen Registry',
    label: 'AURA // Citizen Registry',
    sector: 'Meridion Civic Identity',
    icon: ContactRound,
    clearance: 'Civic Authority Standard',
    aetherTrace: 'AT-0x0118',
    flux: '19.2 MHz',
    desc: 'Official citizen identity archive: ancestry, affinities, ten-print biometrics, Aura ID, and document studio issuance.',
    color: 'text-indigo-900',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'documentStudio',
    code: 'STUDIO',
    name: 'STUDIO // Nine-Document Packet',
    label: 'STUDIO // Nine-Document Packet',
    sector: 'Aureline Civic & Crown Archives',
    icon: FileText,
    clearance: 'Civic Records Authority',
    aetherTrace: 'AT-0x0119',
    flux: '24.1 MHz',
    desc: 'Formal nine-document civic and forensic packet generator: passport booklet, birth certificate, biometrics, and local portrait synthesis.',
    color: 'text-purple-900',
    bg: 'bg-purple-50',
    border: 'border-purple-300'
  },
  {
    id: 'passport',
    code: 'MIRROR',
    name: 'MIRROR // Citizen Matrix',
    label: 'MIRROR // Citizen Matrix',
    sector: 'Aureline Civic Registry',
    icon: UserCheck,
    clearance: 'Level 1 Citizen',
    aetherTrace: 'AT-0x0114',
    flux: '18.4 MHz',
    desc: 'Identity initialization, citizen record, bio-aura calibration, pronouns, wardrobe, and passport credentials.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'housing',
    code: 'HOMECRAFT',
    name: 'HOMECRAFT // Residential',
    sector: 'Cycademy Student Quarters',
    icon: Home,
    clearance: 'Resident Clearance',
    aetherTrace: 'AT-0x0289',
    flux: '32.1 MHz',
    desc: 'Residential grid editor, dorm customization, furniture layout, room expansion, and restorative rest hub.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'jobs',
    code: 'WORKNET',
    name: 'WORKNET // Federal Access',
    sector: 'Federal Career Network',
    icon: Briefcase,
    clearance: 'Contractor Level 1',
    aetherTrace: 'AT-0x0340',
    flux: '24.6 MHz',
    desc: 'Centralized federal work access across DGA, Faith Medical Clinic, Sovereign Treasury & Historic Archives.',
    color: 'text-amber-900',
    bg: 'bg-amber-100/60',
    border: 'border-amber-400'
  },
  {
    id: 'comms',
    code: 'COMMS',
    name: 'COMMS // Institutional Network',
    sector: 'Institutional Comms Grid',
    icon: MessageSquare,
    clearance: 'Encrypted Netmesh',
    aetherTrace: 'AT-0x0412',
    flux: '28.0 MHz',
    desc: 'Dual-pane instant messaging mesh, encrypted Cycademy student channels, and priority career dispatches.',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300'
  },
  {
    id: 'finance',
    code: 'ORYN Vault',
    name: 'ORYN // Treasury & Crypto Ledger',
    sector: 'First Orynvell Bank',
    clearance: 'High Council Audited',
    aetherTrace: 'AT-0x0508',
    flux: '21.5 MHz',
    desc: 'Sovereign Treasury vault, dual currency stipend audit, and live Blockchair PoW crypto telemetry feed.',
    color: 'text-amber-950',
    bg: 'bg-amber-200/60',
    border: 'border-amber-400'
  },
  {
    id: 'board',
    code: 'CHRONICLE',
    name: 'CHRONICLE // Notice Board',
    sector: 'Meridion Notice Stream',
    clearance: 'Civic Standard',
    aetherTrace: 'AT-0x0619',
    flux: '19.8 MHz',
    desc: 'Public municipal bulletin board, active quests, community errands, adventure dossiers & lore codices.',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-300'
  },
  {
    id: 'browser',
    code: 'VERSENET',
    name: 'VERSENET // Web Terminal',
    sector: 'Versenet Quantum Web',
    clearance: 'Unrestricted Gateway',
    aetherTrace: 'AT-0x0899',
    flux: '48.2 MHz',
    desc: 'Public quantum web gateway: CIVINET, QUESTNOTICE, Faith Medical Intranet, DGA & Royal Archives.',
    color: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-300'
  },
  {
    id: 'process',
    code: 'SYSTEM',
    name: 'SYSTEM // Kernel & PRISM Monitor',
    sector: 'PRISM Core Kernel',
    clearance: 'Root Shell Privilege',
    aetherTrace: 'AT-0x0001',
    flux: '14.2 MHz',
    desc: 'Deep kernel thread inspector, origin trace diagnostics, resource telemetry, and PRISM corruption isolation.',
    color: 'text-slate-800',
    bg: 'bg-slate-100',
    border: 'border-slate-300'
  },
  {
    id: 'pulse',
    code: 'PULSE',
    name: 'PULSE // Faction Telemetry',
    sector: 'Aureline Broadcast Array',
    clearance: 'Observer Clearance',
    aetherTrace: 'AT-0x0732',
    flux: '22.0 MHz',
    desc: 'Faction matrix tracker, regional announcements, influence vectors, and public broadcast stream.',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-300'
  },
  {
    id: 'vitals',
    code: 'VITALS',
    name: 'VITALS // Bio-Aura Matrix',
    sector: 'Faith Medical Telemetry',
    clearance: 'Patient Baseline',
    aetherTrace: 'AT-0x0910',
    flux: '37.2 MHz',
    desc: 'Real-time bio-aura integrity diagnostics, condition tracking, Veil exposure analysis, and recovery status.',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300'
  },
  {
    id: 'lore',
    code: 'ATLAS',
    name: 'ATLAS // Royal Historic Archive',
    sector: 'Royal Historic Society',
    clearance: 'Public Encyclopedia',
    aetherTrace: 'AT-0x1120',
    flux: '16.5 MHz',
    desc: 'Local encyclopedic lore repository: faction histories, world regions, NPC vectors, and historical treaties.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'files',
    code: 'VAULT',
    name: 'VAULT // Encrypted Storage',
    sector: 'Local Storage Controller',
    clearance: 'File System Standard',
    aetherTrace: 'AT-0x1044',
    flux: '20.1 MHz',
    desc: 'Local file system, confidential Purge documents, canonical file types, audio logs, and map rasters.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'spellforge',
    code: 'NEXLINK',
    name: 'NEXLINK // SpellForge Matrix',
    sector: 'Cycademy Arcane Lab',
    clearance: 'Arcane Weaver',
    aetherTrace: 'AT-0x0921',
    flux: '36.4 MHz',
    desc: 'Elemental protocol synthesis workbench, reality stabilization algorithms, and firewall rune weaving.',
    color: 'text-purple-900',
    bg: 'bg-purple-100/70',
    border: 'border-purple-300'
  },
  {
    id: 'campus',
    code: 'CAMPUS',
    name: 'CAMPUS // Cycademy Network',
    sector: 'Cycademy of Sciences',
    clearance: 'Student Enrollment',
    aetherTrace: 'AT-0x0218',
    flux: '19.4 MHz',
    desc: 'Student registry, academic faculty roster, course syllabus archives, and institutional portals.',
    color: 'text-blue-900',
    bg: 'bg-blue-50',
    border: 'border-blue-300'
  },
];

const GROUPS: Record<string, string> = {
  dgaos: 'Agency', traceForensics: 'Agency', jobs: 'Agency',
  meridionRegistry: 'Civic', documentStudio: 'Civic', board: 'Civic', campus: 'Civic',
  passport: 'Personal', housing: 'Personal', finance: 'Personal', vitals: 'Personal',
  browser: 'Connect', comms: 'Connect', mail: 'Connect', pulse: 'Connect',
  files: 'Tools', process: 'Tools', lore: 'Tools', spellforge: 'Tools', terminal: 'Tools', settings: 'Tools',
};

const additionalApps: ProtocolItem[] = [
  { id: 'mail', code: 'AUREMAIL', name: 'AUREMAIL // Mailbox', sector: 'Aureline Postal Network', icon: Mail, clearance: 'Citizen Access', aetherTrace: 'AT-0x0413', flux: '22.0 MHz', desc: 'Your personal inbox for citizen correspondence, official notices, and new opportunities.', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  { id: 'terminal', code: 'TERMINAL', name: 'TERMINAL // System Console', sector: 'Local System Tools', icon: Terminal, clearance: 'Local Console', aetherTrace: 'AT-0x0002', flux: '14.2 MHz', desc: 'Explore the local system through the command console and SQL workspace.', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-300' },
  { id: 'settings', code: 'SETTINGS', name: 'SETTINGS // Preferences', sector: 'System Preferences', icon: Settings, clearance: 'Citizen Access', aetherTrace: 'AT-0x0003', flux: '14.2 MHz', desc: 'Make your workspace your own. Manage your system preferences and audio settings.', color: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-300' },
];

const FALLBACK_ICONS: Record<string, LucideIcon> = { finance: Landmark, board: Bookmark, browser: Globe, process: Cpu, pulse: Radio, vitals: Activity, lore: BookOpen, files: Folder, spellforge: Sparkles, campus: GraduationCap };

const APP_ORDER = ['browser', 'files', 'mail', 'comms', 'passport', 'board', 'housing', 'finance', 'spellforge', 'pulse', 'vitals', 'campus', 'lore', 'jobs', 'meridionRegistry', 'documentStudio', 'dgaos', 'traceForensics', 'process', 'terminal', 'settings'];

export const APPS_DIRECTORY = [...PROTOCOLS, ...additionalApps].map((app) => ({
  ...app,
  icon: app.icon || FALLBACK_ICONS[app.id] || Grid2X2,
  label: app.name.split(' // ')[1] || app.code,
  category: GROUPS[app.id] || 'Tools',
})).sort((a, b) => APP_ORDER.indexOf(a.id) - APP_ORDER.indexOf(b.id));

// Shortcuts bring existing windows forward instead of minimizing them.
export function launchDesktopApp(id: string) {
  const store = useOSStore.getState();
  if (store.windows.some((window) => window.id === id)) {
    store.focusWindow(id);
    return;
  }
  const app = APPS.find((candidate) => candidate.id === id);
  const metadata = APPS_DIRECTORY.find((candidate) => candidate.id === id);
  store.toggleApp(app || { id, title: metadata?.name || id });
}
