// src/apps/FileExplorerApp.jsx
import React, { useState } from 'react';
import {
  Folder, FileText, Map, ShieldAlert, Activity, Radio, Lock, Zap, ChevronRight, CornerDownRight, X
} from 'lucide-react';
import Button from '../components/ui/button';
import DocumentModal from '../components/DocumentModal';
import SignalPlayerModal from '../components/SignalPlayerModal';

const FILES_DATA = [
  { id: 'f-1', name: 'DGA_REGISTRATION.osform', type: 'osform', size: '4.2 KB', desc: 'Civic Registration Form (Directive 14-B)' },
  { id: 'f-2', name: 'Aureline_Glassline.map', type: 'map', size: '12.8 KB', desc: 'Glassline District Vector Grid & Nodes' },
  { id: 'f-3', name: 'Firewall_v2.mod', type: 'mod', size: '8.4 KB', desc: 'SpellForge Defense Module' },
  { id: 'f-4', name: 'Patient_Aura_09.diag', type: 'diag', size: '6.1 KB', desc: 'Faith Medical Intake Aura Scan' },
  { id: 'f-5', name: 'Transmission_Intercept.sig', type: 'sig', size: '18.5 KB', desc: 'Sub-Conduit Encrypted Voice Log' },
  { id: 'f-6', name: 'Purge_Record_01.arch', type: 'arch', size: '32.0 KB', desc: 'Encrypted Historical Manuscript' },
  { id: 'f-7', name: 'Malware_Infection.prism', type: 'prism', size: '64.2 KB', desc: 'PRISM Rogue Malware Node' },
];

export default function FileExplorerApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'osform' | 'sig' | 'preview'
  const [activeDirectory, setActiveDirectory] = useState('/root');
  const [glitchActive, setGlitchActive] = useState(false);

  const handleFileClick = (file) => {
    setSelectedFile(file);
    if (file.type === 'osform') {
      setActiveModal('osform');
    } else if (file.type === 'sig') {
      setActiveModal('sig');
    } else if (file.type === 'prism') {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 2000);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'osform': return <FileText size={18} className="text-purple-400" />;
      case 'map': return <Map size={18} className="text-cyan-400" />;
      case 'mod': return <Zap size={18} className="text-amber-400" />;
      case 'diag': return <Activity size={18} className="text-emerald-400" />;
      case 'sig': return <Radio size={18} className="text-indigo-400" />;
      case 'arch': return <Lock size={18} className="text-[#8c97d6]" />;
      case 'prism': return <ShieldAlert size={18} className="text-rose-400 animate-pulse" />;
      default: return <FileText size={18} className="text-purple-300" />;
    }
  };

  return (
    <div className={`relative flex h-full w-full flex-col bg-[#0b071e] text-purple-100 font-sans text-xs select-none ${glitchActive ? 'animate-holo-flicker border-2 border-rose-500' : ''}`}>
      {/* Top Address Bar */}
      <div className="flex h-11 items-center justify-between border-b border-purple-500/20 bg-purple-950/40 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
          <Folder size={16} className="text-purple-400" />
          <span>MIRAVERSEOSX // File Explorer</span>
          <span className="text-purple-500">/</span>
          <span className="text-white font-bold">{activeDirectory}</span>
        </div>
        <span className="font-mono text-[10px] text-purple-400">7 File Objects</span>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left Directory Tree */}
        <div className="w-48 shrink-0 border-r border-purple-500/20 bg-black/40 p-3 space-y-1 font-mono text-[11px]">
          <div className="text-[9px] font-bold text-purple-400/80 uppercase tracking-widest mb-2">Directories</div>
          {['/root', '/documents', '/spells', '/diagnostics', '/system'].map((dir) => (
            <button
              key={dir}
              onClick={() => setActiveDirectory(dir)}
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FILES_DATA.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
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

          {/* Selected File Action Footer */}
          {selectedFile && (
            <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/60 p-3 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-purple-400">Selected:</span> <span className="font-bold text-white">{selectedFile.name}</span>
              </div>
              <Button
                onClick={() => handleFileClick(selectedFile)}
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
      {activeModal === 'osform' && <DocumentModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'sig' && <SignalPlayerModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
