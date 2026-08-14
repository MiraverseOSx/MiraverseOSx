// src/apps/FileExplorerApp.jsx
import React, { useState } from 'react';
import {
  Folder, FileText, Map, ShieldAlert, Activity, Radio, Zap, ChevronRight, Cpu, MapPin, Search, LayoutGrid, List, Paperclip, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/button';
import DocumentModal from '../components/DocumentModal';
import SignalPlayerModal from '../components/widgets/SignalPlayerModal';
import { MOCK_DOCUMENTS } from '../data/mockDocuments';
import '../styles/apps/FileExplorer.css';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const filteredFiles = FILES_DATA.filter((file) => {
    const matchesDir = file.dir === activeDirectory;
    const matchesSearch = !searchQuery.trim() || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDir && matchesSearch;
  });

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileDoubleClick = (file) => {
    executeFile(file);
  };

  const executeFile = (file) => {
    if (!file) return;

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
      attachments: [],
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
      case 'osform': return <FileText size={16} className="text-[#f4d35e]" />;
      case 'txt':
      case 'doc': return <FileText size={16} className="text-purple-200" />;
      case 'log': return <FileText size={16} className="text-[#e29578]" />;
      case 'map': return <Map size={16} className="text-amber-300" />;
      case 'node':
      case 'grid': return <MapPin size={16} className="text-rose-300" />;
      case 'mod': return <Zap size={16} className="text-[#f4d35e]" />;
      case 'spell': return <Zap size={16} className="text-rose-400" />;
      case 'veil': return <Zap size={16} className="text-pink-300" />;
      case 'diag': return <Activity size={16} className="text-amber-400" />;
      case 'aura': return <Activity size={16} className="text-rose-300" />;
      case 'sig':
      case 'wav': return <Radio size={16} className="text-purple-300" />;
      case 'sys': return <Cpu size={16} className="text-slate-300" />;
      case 'prism':
      case 'corrupt': return <ShieldAlert size={16} className="text-rose-400" />;
      default: return <FileText size={16} className="text-[#e29578]" />;
    }
  };

  const getAttachmentCount = (mockKey) => {
    const doc = MOCK_DOCUMENTS[mockKey];
    return doc?.attachments?.length || 0;
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#141021] text-purple-100 font-sans text-xs select-none transition-all">
      {/* Top Address & Filter Header */}
      <div className="flex h-12 items-center justify-between border-b border-[#2a233d] bg-[#1a152b] px-4 backdrop-blur-md gap-4">
        <div className="flex items-center gap-2.5 font-mono text-xs text-white/80 shrink-0">
          <Folder size={16} className="text-[#f4d35e]" />
          <span className="text-[#f4d35e] font-semibold">File Explorer</span>
          <span className="text-white/40">/</span>
          <span className="text-white font-bold">{activeDirectory}</span>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f0c1a] border border-[#332b49] rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-rose-400/60 transition w-36 sm:w-48 placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center rounded-lg border border-[#332b49] bg-[#0f0c1a] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition ${viewMode === 'grid' ? 'bg-rose-500/20 text-[#f4d35e] font-bold' : 'text-white/40 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md transition ${viewMode === 'list' ? 'bg-rose-500/20 text-[#f4d35e] font-bold' : 'text-white/40 hover:text-white'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          <span className="font-mono text-[10px] text-white/50 hidden sm:inline">{filteredFiles.length} items</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left Directory Tree */}
        <div className="w-[21%] min-w-40 max-w-48 shrink-0 border-r border-[#2a233d] bg-[#1a152b] p-3 space-y-1.5 font-mono text-[11px]">
          <div className="text-[9px] font-bold text-rose-300/70 uppercase tracking-widest px-2 mb-2">Directories</div>
          {['/root', '/documents', '/spells', '/diagnostics', '/system'].map((dir) => (
            <button
              key={dir}
              onClick={() => {
                setActiveDirectory(dir);
                setSelectedFile(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 transition text-left ${
                activeDirectory === dir
                  ? 'bg-rose-500/15 text-[#f4d35e] font-bold border border-rose-400/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Folder size={14} className={activeDirectory === dir ? 'text-[#f4d35e]' : 'text-white/40'} />
              <span>{dir}</span>
            </button>
          ))}
        </div>

        {/* Center File Workspace */}
        <div className="flex-1 p-4 overflow-auto space-y-3 bg-[#141021]">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/40 font-mono text-xs">
              <Folder size={32} className="text-white/20 mb-2" />
              <span>No matching files found</span>
            </div>
          ) : viewMode === 'grid' ? (
            /* 1. Grid View Tiles */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredFiles.map((file) => {
                const attCount = getAttachmentCount(file.mockKey);
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                    className={`file-grid-card ${
                      selectedFile?.id === file.id ? 'selected' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-[#201936] border border-[#352c4e] shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-bold text-white flex items-center gap-2 truncate">
                          <span>{file.name}</span>
                          {attCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-normal text-[#f4d35e] bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              <Paperclip size={10} /> {attCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/60 truncate mt-0.5">{file.desc}</div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-white/40 shrink-0 ml-2">{file.size}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Compact Tabular List View */
            <div className="rounded-xl border border-[#2a233d] bg-[#1a152b] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2a233d] bg-[#141021] text-[10px] font-mono text-white/40 uppercase">
                    <th className="py-2 px-3 font-semibold">Name</th>
                    <th className="py-2 px-3 font-semibold">Description</th>
                    <th className="py-2 px-3 font-semibold">Attachments</th>
                    <th className="py-2 px-3 font-semibold text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#261f38] text-xs">
                  {filteredFiles.map((file) => {
                    const attCount = getAttachmentCount(file.mockKey);
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <tr
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        onDoubleClick={() => handleFileDoubleClick(file)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-rose-500/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                        }`}
                      >
                        <td className="py-2.5 px-3 flex items-center gap-2 font-mono">
                          {getFileIcon(file.type)}
                          <span className="font-bold">{file.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-white/60">{file.desc}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          {attCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#f4d35e] bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              <Paperclip size={10} /> {attCount} attached
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-right text-white/50">{file.size}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected File Action Footer */}
          {selectedFile && (
            <div className="mt-4 rounded-xl border border-rose-400/30 bg-[#1e1730] p-3 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-rose-300">Selected:</span>
                <span className="font-bold text-white">{selectedFile.name}</span>
                <span className="text-white/40">({selectedFile.size})</span>
              </div>
              <Button
                onClick={() => executeFile(selectedFile)}
                size="sm"
                variant="solid"
                className="bg-[#f4d35e] hover:bg-[#ffe6a7] text-black font-bold text-xs flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition"
              >
                Inspect / View File <ExternalLink size={13} />
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
