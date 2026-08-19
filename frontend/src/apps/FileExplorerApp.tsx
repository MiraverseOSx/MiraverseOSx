// src/apps/FileExplorerApp.jsx
import React, { useState } from 'react';
import {
  Folder, FileText, Map, ShieldAlert, Activity, Radio, Zap, ChevronRight, Cpu, MapPin, Search, LayoutGrid, List, Paperclip, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/button';
import DocumentModal from '../components/widgets/DocumentModal';
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
      case 'osform': return <FileText size={16} className="text-amber-700" />;
      case 'txt':
      case 'doc': return <FileText size={16} className="text-indigo-700" />;
      case 'log': return <FileText size={16} className="text-amber-800" />;
      case 'map': return <Map size={16} className="text-amber-700" />;
      case 'node':
      case 'grid': return <MapPin size={16} className="text-rose-700" />;
      case 'mod': return <Zap size={16} className="text-amber-700" />;
      case 'spell': return <Zap size={16} className="text-rose-700" />;
      case 'veil': return <Zap size={16} className="text-purple-700" />;
      case 'diag': return <Activity size={16} className="text-emerald-700" />;
      case 'aura': return <Activity size={16} className="text-rose-700" />;
      case 'sig':
      case 'wav': return <Radio size={16} className="text-purple-700" />;
      case 'sys': return <Cpu size={16} className="text-slate-700" />;
      case 'prism':
      case 'corrupt': return <ShieldAlert size={16} className="text-rose-700" />;
      default: return <FileText size={16} className="text-slate-700" />;
    }
  };

  const getAttachmentCount = (mockKey) => {
    if (!mockKey || !MOCK_DOCUMENTS[mockKey]) return 0;
    return MOCK_DOCUMENTS[mockKey].attachments?.length || 0;
  };

  return (
    <div className="file-explorer-container font-sans select-none overflow-hidden text-xs">
      {/* Top Address & Action Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-700">
          <Folder size={16} className="text-amber-700" />
          <span className="font-bold">miraverse://storage</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-indigo-950 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {activeDirectory}
          </span>
        </div>

        {/* Right: Search & View Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 transition w-36 sm:w-48 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-indigo-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md transition ${viewMode === 'list' ? 'bg-white text-indigo-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">{filteredFiles.length} items</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left Directory Tree */}
        <div className="w-[21%] min-w-40 max-w-48 shrink-0 border-r border-slate-200 bg-slate-50 p-3 space-y-1.5 font-mono text-[11px]">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Directories</div>
          {['/root', '/documents', '/spells', '/diagnostics', '/system'].map((dir) => (
            <button
              key={dir}
              onClick={() => {
                setActiveDirectory(dir);
                setSelectedFile(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 transition text-left ${
                activeDirectory === dir
                  ? 'bg-amber-100/80 text-amber-950 font-bold border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Folder size={14} className={activeDirectory === dir ? 'text-amber-700' : 'text-slate-400'} />
              <span>{dir}</span>
            </button>
          ))}
        </div>

        {/* Center File Workspace */}
        <div className="flex-1 p-4 overflow-auto space-y-3 bg-[#FAFBFD]">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 font-mono text-xs">
              <Folder size={32} className="text-slate-300 mb-2" />
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
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2 truncate">
                          <span>{file.name}</span>
                          {attCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-normal text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                              <Paperclip size={10} /> {attCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{file.desc}</div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">{file.size}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Compact Tabular List View */
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 uppercase">
                    <th className="py-2 px-3 font-semibold">Name</th>
                    <th className="py-2 px-3 font-semibold">Description</th>
                    <th className="py-2 px-3 font-semibold">Attachments</th>
                    <th className="py-2 px-3 font-semibold text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredFiles.map((file) => {
                    const attCount = getAttachmentCount(file.mockKey);
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <tr
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        onDoubleClick={() => handleFileDoubleClick(file)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-amber-50 text-slate-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-3 flex items-center gap-2 font-mono">
                          {getFileIcon(file.type)}
                          <span className="font-bold text-slate-900">{file.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{file.desc}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          {attCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                              <Paperclip size={10} /> {attCount} attached
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-right text-slate-400">{file.size}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected File Action Footer */}
          {selectedFile && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 flex items-center justify-between font-mono text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-amber-800 font-semibold">Selected:</span>
                <span className="font-bold text-slate-900">{selectedFile.name}</span>
                <span className="text-slate-400">({selectedFile.size})</span>
              </div>
              <Button
                onClick={() => executeFile(selectedFile)}
                size="sm"
                variant="solid"
                className="bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition shadow-xs"
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
