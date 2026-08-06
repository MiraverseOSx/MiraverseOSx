// src/apps/FileExplorerApp.jsx
import React, { useState } from 'react';
import {
  Folder, FileText, Map, ShieldAlert, Activity, Radio, Lock, Zap, ChevronRight, Cpu, MapPin
} from 'lucide-react';
import Button from '../components/ui/button';
import DocumentModal from '../components/DocumentModal';
import SignalPlayerModal from '../components/SignalPlayerModal';
import { MOCK_DOCUMENTS } from '../data/mockDocuments';

const FILES_DATA = [
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

export default function FileExplorerApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'document' | 'sig'
  const [activeDirectory, setActiveDirectory] = useState('/root');
  const [glitchActive, setGlitchActive] = useState(false);

  const filteredFiles = FILES_DATA.filter((file) => file.dir === activeDirectory);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileDoubleClick = (file) => {
    executeFile(file);
  };

  const executeFile = (file) => {
    if (!file) return;
    
    // Glitch animation for threat files
    if (file.type === 'prism' || file.type === 'corrupt') {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 2500);
    }
    
    // Resolve Document Schema structure from MOCK_DOCUMENTS or fallback
    const resolvedDoc = MOCK_DOCUMENTS[file.mockKey] || {
      id: file.id,
      name: file.name,
      filename: file.name,
      extension: '.' + file.type,
      category: file.type === 'sys' ? 'System' : 'Document',
      meta: {
        classification: 'RESTRICTED OS COMPONENT',
        author: 'SYSTEM DAEMON',
        timestamp: 'WINTER',
        fileSize: file.size
      },
      security: { isEncrypted: false },
      content: {
        title: file.name.replace(/_/g, ' ').toUpperCase(),
        subtitle: file.desc,
        bodyText: `${file.desc}\n\nFile Location: ${activeDirectory}/${file.name}\nFile Size: ${file.size}`
      }
    };
    
    setSelectedDoc(resolvedDoc);

    if (file.type === 'sig' || file.type === 'wav') {
      setActiveModal('sig');
    } else {
      setActiveModal('document');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'osform': return <FileText size={18} className="text-purple-400" />;
      case 'txt':
      case 'doc': return <FileText size={18} className="text-slate-300" />;
      case 'log': return <FileText size={18} className="text-purple-500 font-mono" />;
      case 'map': return <Map size={18} className="text-cyan-400" />;
      case 'node':
      case 'grid': return <MapPin size={18} className="text-teal-400" />;
      case 'mod': return <Zap size={18} className="text-amber-400 animate-pulse" />;
      case 'spell': return <Zap size={18} className="text-indigo-400" />;
      case 'veil': return <Zap size={18} className="text-pink-400 animate-bounce" />;
      case 'diag': return <Activity size={18} className="text-emerald-400" />;
      case 'aura': return <Activity size={18} className="text-green-400" />;
      case 'sig':
      case 'wav': return <Radio size={18} className="text-indigo-400 animate-pulse" />;
      case 'sys': return <Cpu size={18} className="text-slate-400" />;
      case 'prism':
      case 'corrupt': return <ShieldAlert size={18} className="text-rose-500 animate-pulse" />;
      default: return <FileText size={18} className="text-purple-300" />;
    }
  };

  return (
    <div className={`relative flex h-full w-full flex-col bg-[#0b071e] text-purple-100 font-sans text-xs select-none transition-all duration-300 ${glitchActive ? 'animate-holo-flicker border-2 border-rose-500' : ''}`}>
      {/* Top Address Bar */}
      <div className="flex h-11 items-center justify-between border-b border-purple-500/20 bg-purple-950/40 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
          <Folder size={16} className="text-purple-400" />
          <span>MIRAVERSEOSX // File Explorer</span>
          <span className="text-purple-500">/</span>
          <span className="text-white font-bold">{activeDirectory}</span>
        </div>
        <span className="font-mono text-[10px] text-purple-400">{filteredFiles.length} File Objects</span>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left Directory Tree */}
        <div className="w-48 shrink-0 border-r border-purple-500/20 bg-black/40 p-3 space-y-1 font-mono text-[11px]">
          <div className="text-[9px] font-bold text-purple-400/80 uppercase tracking-widest mb-2">Directories</div>
          {['/root', '/documents', '/spells', '/diagnostics', '/system'].map((dir) => (
            <button
              key={dir}
              onClick={() => {
                setActiveDirectory(dir);
                setSelectedFile(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 transition ${
                activeDirectory === dir ? 'bg-purple-900/60 text-white font-bold border border-purple-400/30' : 'text-purple-300/70 hover:bg-purple-900/20'
              }`}
            >
              <Folder size={14} className="text-purple-400" />
              <span>{dir}</span>
            </button>
          ))}
        </div>

        {/* Center File Grid */}
        <div className="flex-1 p-4 overflow-auto space-y-2">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-purple-400/60 font-mono text-xs">
              <Folder size={28} className="text-purple-400/30 mb-2" />
              <span>Directory is empty</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                    selectedFile?.id === file.id
                      ? 'border-purple-400 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'border-purple-500/20 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-400/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/30">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-purple-300/70 leading-snug">{file.desc}</div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-purple-400/80">{file.size}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected File Action Footer */}
          {selectedFile && (
            <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/60 p-3 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-purple-400">Selected:</span> <span className="font-bold text-white">{selectedFile.name}</span>
              </div>
              <Button
                onClick={() => executeFile(selectedFile)}
                size="sm"
                variant="solid"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Execute / View File <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'document' && selectedDoc && (
        <DocumentModal file={selectedDoc} onClose={() => { setActiveModal(null); setSelectedDoc(null); }} />
      )}
      {activeModal === 'sig' && selectedFile && (
        <SignalPlayerModal title={selectedFile.name} onClose={() => { setActiveModal(null); setSelectedDoc(null); }} />
      )}
    </div>
  );
}
