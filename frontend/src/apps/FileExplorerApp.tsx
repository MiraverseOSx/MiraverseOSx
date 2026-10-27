// src/apps/FileExplorerApp.jsx
import React, { useEffect, useState } from 'react';
import {
  Folder, FileText, Map, ShieldAlert, Activity, Radio, Zap, ChevronRight, Cpu, MapPin, Search, LayoutGrid, List, Paperclip, ExternalLink, Home, HardDrive
} from 'lucide-react';
import Button from '../components/ui/button';
import DocumentModal from '../components/widgets/DocumentModal';
import SignalPlayerModal from '../components/widgets/SignalPlayerModal';
import { MOCK_DOCUMENTS } from '../data/mockDocuments';
import { useOSStore } from '../store/useOSStore';
import { useCommsStore } from '../store/useCommsStore';
import { savedMailFiles } from './mail/savedMailFiles';
import { launchDesktopApp } from '../components/desktop/appDirectory';
import '../styles/apps/FileExplorer.css';
import { CaseSourceView } from './investigation/BroadStreetCasePanel';

import { FILES_DATA, visibleFileCatalog } from './files/fileCatalog';


export default function FileExplorerApp() {
  const [caseSourceId, setCaseSourceId] = useState<string | null>(null);
  const caseRequest = useOSStore(s => s.workspaceRequests.files);
  const casePlayer = useOSStore(s => s.gameplay.player);
  useOSStore(s => s.isLoggedIn);
  const caseEligible = useOSStore.getState().broadStreetEligible();
  useEffect(() => {
    if (!caseRequest?.section.startsWith('broadstreet:')) return;
    setCaseSourceId(caseRequest.section.split(':')[1]);
    useOSStore.getState().consumeWorkspaceRequest('files', caseRequest.revision);
  }, [caseRequest]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'document' | 'sig'
  const [activeDirectory, setActiveDirectory] = useState('/home');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const recordFileInspection = useOSStore((s) => s.recordFileInspection);
  const journal = useOSStore(state => state.gameplay.player.assignmentJournal);
  const savedWebFiles = useOSStore(state => state.versenetContent.savedFiles);
  const webFiles = Object.values(savedWebFiles);
  const emails = useCommsStore(state => state.emails);
  const savedAttachmentIds = useCommsStore(state => state.savedAttachmentIds);
  const mailFiles = savedMailFiles(emails, savedAttachmentIds);
  const assignmentFiles = Object.values(journal?.files || {}) as any[];
  const directories = ['/root', '/documents', '/spells', '/diagnostics', '/system', '/assignments', ...new Set(assignmentFiles.map(file => file.dir)), ...(mailFiles.length ? ['/downloads/auremail'] : []), ...(webFiles.length ? ['/downloads/versenet', ...new Set(webFiles.filter(file => file.type !== 'folder').map(file => file.dir))] : [])];
  useEffect(() => {
    if (journal?.fileDirectory) { setActiveDirectory(journal.fileDirectory); setSelectedFile(null); if (!caseRequest?.section.startsWith('broadstreet:')) setCaseSourceId(null); }
  }, [journal?.fileRequest]);

  const allFiles = visibleFileCatalog(useOSStore.getState(),emails,savedAttachmentIds);
  const filteredFiles = allFiles.filter((file) => {
    if ((file as any).assignmentId === 'ms-case-002' && !caseEligible) return false;
    const matchesDir = activeDirectory === '/home' || file.dir === activeDirectory || (activeDirectory === '/assignments' && file.dir.startsWith('/assignments/'));
    const matchesSearch = !searchQuery.trim() || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDir && matchesSearch;
  });

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };
  const goToDirectory = (dir: string) => { setActiveDirectory(dir); setSelectedFile(null); setSearchQuery(''); };
  const directoryName = (dir: string) => dir === '/home' ? 'Home' : dir === '/root' ? 'My files' : (dir.split('/').filter(Boolean).pop() || 'Files').replace(/^./, letter => letter.toUpperCase());

  const handleFileDoubleClick = (file) => {
    executeFile(file);
  };

  const executeFile = (file) => {
    if (!file) return;
    if(file.type !== 'folder') useOSStore.getState().desktopAction({type:'recent',file:{id:file.id,name:file.name}});
    if (file.caseSourceId) {
      const source = ['access-audit', 'thermal-log'].includes(file.caseSourceId);
      if (source) setCaseSourceId(file.caseSourceId);
      else useOSStore.getState().openCaseSource(file.caseSourceId);
      return;
    }
    if (file.webUrl && file.type === 'folder') {
      setActiveDirectory(`/downloads/versenet/${file.id.slice(4).split(':')[0]}`);
      setSelectedFile(null);
      return;
    }

    // Resolve Document Schema structure from MOCK_DOCUMENTS or fallback
    const catalogDoc = MOCK_DOCUMENTS[file.mockKey];
    const resolvedDoc = file.document || (catalogDoc ? { ...catalogDoc, id: file.id, name: file.name, filename: file.name, size: file.size, type: file.type, inspectionKey: file.mockKey } : {
      id: file.id,
      name: file.name,
      filename: file.name,
      extension: '.' + file.type,
      category: file.type === 'sys' ? 'System' : 'Document',
      meta: {
        classification: file.mailId ? 'SAVED MAIL ATTACHMENT' : file.webUrl ? 'PUBLIC WEB DOCUMENT' : file.assignmentId ? 'PERSONAL ASSIGNMENT RECORD' : 'RESTRICTED OS COMPONENT',
        author: file.publisher || (file.assignmentId ? 'WORKNET DISPATCH' : 'SYSTEM DAEMON'),
        timestamp: 'WINTER',
        fileSize: file.size
      },
      security: { isEncrypted: false },
      attachments: [],
      content: {
        title: file.name.replace(/_/g, ' ').toUpperCase(),
        subtitle: file.desc,
        bodyText: file.body || `${file.desc}\n\nFile Location: ${activeDirectory}/${file.name}\nFile Size: ${file.size}`
      }
    });

    setSelectedDoc(resolvedDoc);

    if (file.type === 'sig' || file.type === 'wav') {
      if (file.mockKey) recordFileInspection(file.mockKey);
      setActiveModal('sig');
    } else {
      setActiveModal('document');
    }
  };

  const [fileOpenNotice,setFileOpenNotice]=useState('');
  useEffect(()=>{
    const section=caseRequest?.section||'';
    if(!section.startsWith('file:')&&!section.startsWith('directory:'))return;
    useOSStore.getState().consumeWorkspaceRequest('files',caseRequest!.revision);
    try {
      const value=decodeURIComponent(section.slice(section.indexOf(':')+1));
      if(section.startsWith('directory:')) { if(value==='/home'||directories.includes(value)){goToDirectory(value);setFileOpenNotice('');}else setFileOpenNotice('This folder is no longer available.'); }
      else {const file=allFiles.find(f=>f.id===value);if(file){setActiveDirectory(file.dir);setSearchQuery('');setFileOpenNotice('');executeFile(file);}else setFileOpenNotice('This file is no longer available or accessible.');}
    } catch {setFileOpenNotice('This file link could not be opened.');}
  },[caseRequest?.revision]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'osform': return <FileText size={16} className="text-amber-700" />;
      case 'txt':
      case 'doc': return <FileText size={16} className="text-indigo-700" />;
      case 'folder': return <Folder size={16} className="text-violet-700" />;
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

  if (caseSourceId) return <CaseSourceView id={caseSourceId} app="files" onBack={() => setCaseSourceId(null)} />;
  return (
    <div className="file-explorer-container font-sans select-none overflow-hidden text-xs">
      {fileOpenNotice && <p role="status" className="p-3 text-sm">{fileOpenNotice}</p>}
      {/* Top Address & Action Bar */}
      <div className="files-toolbar flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        {/* Left: Breadcrumbs */}
        <div className="files-breadcrumb flex items-center gap-2 text-xs text-slate-700">
          <button aria-label="Go to file home" title="Home" onClick={() => goToDirectory('/home')}><Home size={16}/></button>
          <span>My workspace</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-indigo-950 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {directoryName(activeDirectory)}
          </span>
        </div>

        {/* Right: Search & View Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search files"
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
      <div className="files-layout flex min-h-0 flex-1">
        {/* Left Directory Tree */}
        <nav aria-label="File directories" className="files-sidebar w-[21%] min-w-40 max-w-48 shrink-0 border-r border-slate-200 bg-slate-50 p-3 space-y-1.5 text-[11px] overflow-y-auto">
          <button className="files-home-link" aria-current={activeDirectory === '/home' ? 'page' : undefined} onClick={() => goToDirectory('/home')}><Home size={16}/>Home</button>
          <div className="files-sidebar-label">YOUR WORKSPACE</div>
          {directories.map((dir) => (
            <button
              key={dir}
              title={dir}
              onClick={() => goToDirectory(dir)}
              aria-current={activeDirectory === dir ? 'page' : undefined}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 transition text-left ${
                activeDirectory === dir
                  ? 'bg-amber-100/80 text-amber-950 font-bold border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Folder size={14} className={activeDirectory === dir ? 'text-amber-700' : 'text-slate-400'} />
              <span className="break-all">{directoryName(dir)}</span>
            </button>
          ))}
          <div className="files-device"><HardDrive size={19}/><div><strong>Miraverse storage</strong><small>Saved on your device</small></div></div>
        </nav>

        {/* Center File Workspace */}
        <div className="files-canvas flex-1 p-4 overflow-auto space-y-3 bg-[#FAFBFD]">
          <header className="files-page-heading"><span>YOUR PERSONAL VAULT</span><h1>{activeDirectory === '/home' ? 'A home for your files.' : directoryName(activeDirectory)}</h1><p>{activeDirectory === '/home' ? 'Notes, discoveries, and the things you keep along the way.' : `${activeDirectory} · ${filteredFiles.length} items`}</p></header>
          {activeDirectory === '/home' && !searchQuery && <section className="files-quick-access" aria-label="Quick access folders"><h2>Quick access</h2><div>{['/root', '/documents', '/spells', '/diagnostics', '/assignments'].map((dir, index) => <button key={dir} data-folder-tone={index} onClick={() => goToDirectory(dir)}><span className="files-folder-art"><Folder size={38} strokeWidth={1.3}/></span><strong>{directoryName(dir)}</strong><small>{[...FILES_DATA, ...assignmentFiles, ...webFiles, ...mailFiles].filter(file => file.dir === dir || (dir === '/assignments' && file.dir.startsWith('/assignments/'))).length} items</small></button>)}</div></section>}
          <div className="files-section-heading"><h2>{activeDirectory === '/home' ? 'Your collection' : 'Files'}</h2><span>{filteredFiles.length} items · {viewMode === 'grid' ? 'Grid view' : 'List view'}</span></div>
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 font-mono text-xs">
              <Folder size={32} className="text-slate-300 mb-2" />
              <span>No matching files found</span>
            </div>
          ) : viewMode === 'grid' ? (
            /* 1. Grid View Tiles */
            <div className="files-card-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredFiles.map((file) => {
                const attCount = getAttachmentCount(file.mockKey);
                return (
                  <div
                    key={file.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); executeFile(file); } else if (event.key === ' ') { event.preventDefault(); handleFileSelect(file); } }}
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
                        <span className="files-type-label">.{file.type}</span>
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
                      <tr tabIndex={0} aria-label={`Open ${file.name}`} onKeyDown={event => { if (event.key === 'Enter') executeFile(file); }}
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
              {selectedFile.assignmentId && <Button size="sm" variant="ghost" onClick={() => useOSStore.getState().openAssignment(selectedFile.assignmentId)}>Continue in WorkNet</Button>}
              {selectedFile.mailId && <Button size="sm" variant="ghost" onClick={() => { useCommsStore.getState().requestMailMessage(selectedFile.mailId); launchDesktopApp('mail'); }}>Open source email</Button>}
              {selectedFile.webUrl && <Button size="sm" variant="ghost" onClick={() => {
                const store = useOSStore.getState();
                store.setBrowserUrl(selectedFile.webUrl);
                if (store.windows.some(win => win.id === 'browser')) store.focusWindow('browser');
                else store.toggleApp({ id: 'browser', title: 'Web Terminal', contentKey: 'browser' });
              }}>Open source in Versenet</Button>}
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

