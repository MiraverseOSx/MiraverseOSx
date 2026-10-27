import { savedMailFiles } from '../mail/savedMailFiles';
export const FILES_DATA = [
  // /documents
  { id: 'f-1', name: 'DGA_REGISTRATION_DIRECTIVE_14B.osform', type: 'osform', size: '4.2 KB', desc: 'Civic Registration Form (Directive 14-B)', dir: '/documents', mockKey: 'dga-registration' },
  { id: 'f-2', name: 'Personal_Log_88.txt', type: 'txt', size: '1.8 KB', desc: 'Resident Personal Diary Log', dir: '/documents', mockKey: 'personal-log' },
  { id: 'f-3', name: 'System_Audit.log', type: 'log', size: '14.5 KB', desc: 'Process Monitor Audit History', dir: '/documents', mockKey: 'system-audit' },
  { id: 'f-4', name: 'Purge_Record_01.arch', type: 'arch', size: '32.0 KB', desc: 'Encrypted Historical Manuscript', dir: '/documents', mockKey: 'purge-archive' },

  // /spells
  { id: 'f-5', name: 'Firewall_v2.mod', type: 'mod', size: '8.4 KB', desc: 'SpellForge Defense Module', dir: '/spells', mockKey: 'firewall-mod' },
  { id: 'f-6', name: 'CryoFreeze.mod', type: 'mod', size: '7.2 KB', desc: 'SpellForge Freeze Logic Module', dir: '/spells', mockKey: 'cryofreeze-mod' },
  { id: 'f-7', name: 'Void_Shield.spell', type: 'spell', size: '12.0 KB', desc: 'Compiled Protocol Spell Recipe', dir: '/spells', mockKey: 'void-shield' },
  { id: 'f-8', name: 'Bleed_Manipulation.veil', type: 'veil', size: '15.6 KB', desc: 'Unstable Veil Reality Fragment', dir: '/spells', mockKey: 'bleed-manipulation' },

  // /diagnostics
  { id: 'f-9', name: 'Patient_Aura_09.diag', type: 'diag', size: '6.1 KB', desc: 'Faith Medical Intake Aura Scan', dir: '/diagnostics', mockKey: 'aura-scan' },
  { id: 'f-10', name: 'Aura_Lean_Biometrics.aura', type: 'aura', size: '10.2 KB', desc: 'Elemental Lean & Biometric Heat Scan', dir: '/diagnostics', mockKey: 'aura-lean' },

  // /system
  { id: 'f-11', name: 'net_relay.sys', type: 'sys', size: '94.0 KB', desc: 'Network Relay Service Driver', dir: '/system', mockKey: 'net-relay' },
  { id: 'f-12', name: 'AETHERCORE.sys', type: 'sys', size: '120.4 KB', desc: 'AetherCore Subterranean Driver', dir: '/system', mockKey: 'aethercore-sys' },
  { id: 'f-13', name: 'Malware_Infection.prism', type: 'prism', size: '64.2 KB', desc: 'PRISM Rogue Malware Node', dir: '/system', mockKey: 'prism-bleed' },
  { id: 'f-14', name: 'Corrupted_Bleed.corrupt', type: 'corrupt', size: '48.0 KB', desc: 'Glitch Corrupted System File', dir: '/system', mockKey: 'corrupted-bleed' },

  // /root
  { id: 'f-15', name: 'Aureline_Glassline.map', type: 'map', size: '12.8 KB', desc: 'Glassline District Vector Grid & Nodes', dir: '/root', mockKey: 'glassline-map' },
  { id: 'f-16', name: 'Transmission_Intercept.sig', type: 'sig', size: '18.5 KB', desc: 'Sub-Conduit Encrypted Voice Log', dir: '/root', mockKey: 'intercept-sig' }
];
export function visibleFileCatalog(state:any, emails:any[],savedIds:string[]) {
 const files=[...FILES_DATA,...Object.values(state.gameplay.player.assignmentJournal?.files||{}),...Object.values(state.versenetContent.savedFiles||{}),...savedMailFiles(emails,savedIds)] as any[];
 return files.filter(file=>file.assignmentId!=='ms-case-002'||state.broadStreetEligible());
}
export const fileDestination=(id:string)=>`file:${encodeURIComponent(id)}`;
export const folderDestination=(dir:string)=>`directory:${encodeURIComponent(dir)}`;
