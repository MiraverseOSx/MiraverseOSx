import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Sparkles, UserCheck, Shield, 
  Building, HeartPulse, GraduationCap, Eye, Layers, Clock, CheckCircle2, ChevronRight, RefreshCw
} from 'lucide-react';
import { 
  type CitizenRecord, 
  buildSingleDocumentHtml, 
  buildFullPacketHtml, 
  triggerHtmlDownload,
  recordIssuedSnapshot,
  renderAuraIdHtml,
  renderAuraPassportHtml,
  renderBirthCertificateHtml,
  renderFingerprintFormHtml,
  renderInvestigativeProfileHtml,
  renderResidencyRecordHtml,
  renderPhysicalSheetHtml,
  renderMedicalSummaryHtml,
  renderEducationEmploymentHtml
} from '../services/documentPacketGenerator';
import PortraitStudioModal from '../components/portrait/PortraitStudioModal';

const DEFAULT_CITIZEN: CitizenRecord = {
  name: 'Elara Vale',
  dob: '2001-04-18',
  place: 'Northwake, Fross',
  record: 'MRD-8492-319',
  passport: 'AUR-782194',
  alias: 'Frostweaver / Silverglass',
  address: '142 Moonwell Way, Glassline District, Aureline Central (fictional)',
  phone: '+1 (202) 555-0142',
  email: 'elara.vale@example.com',
  district: 'Glassline District, Aureline Central',
  height: '174 cm',
  eyes: 'Luminous Violet-Gray',
  hair: 'Silver-Black / Stardust Shimmer',
  build: 'Slender / Resilient Cryo-Adaptation',
  blood: 'A+ (Aura Calibrated)',
  mark: 'Faint crystalline frost markings along left wrist',
  species: 'Frostborn',
  ancestry: 'Lightborn · Ellawen Lineage',
  abilities: 'Cryo-constructs, frost veil stabilization, starlight resonance',
  powerSource: 'PRISM resonance & Aether',
  affinity: 'Violet · knowledge / illusion / memory',
  faction: 'Aureline Civic & Academic Network',
  home: 'Aureline, Orynvell',
  lore: 'Descendant of ancient Northwake cryo-weavers; enrolled in Cyacademy advanced resonance curriculum.',
  category: 'Student / academy',
  affiliation: 'Cyacademy Central Campus',
  occupation: 'Research Apprentice / Resonance Analyst',
  clearance: 'General Civic Access · Academic Clearance II',
  aura: 'Calibrated Harmonic Tier III',
  medical: 'Faith Medical Group · intake verified',
  residency: 'Cyacademy Dormitory 4B · Verified Residence',
  history: 'Routine civil registration completed at intake; transferred from Northwake regional enclave.',
  status: 'ACTIVE / VERIFIED',
  links: 'Coordinates academic study group at Aureline Library; holds valid regional transit pass.',
  relationships: 'Known associate of Cyacademy faculty',
  household: 'Cyacademy Campus Dormitory 4B',
  timeline: 'Origin: Northwake, Fross; residing in Aureline since Year 24',
  biometricSeed: 'MRD-8492-319'
};

const DOCUMENT_TABS = [
  { id: 1, title: 'Aura Citizen ID', subtitle: 'Biometric Wallet Card', icon: UserCheck, color: 'text-indigo-400' },
  { id: 2, title: 'Aura Passport', subtitle: 'Official Travel Booklet', icon: Layers, color: 'text-amber-400' },
  { id: 3, title: 'Birth Certificate', subtitle: 'Crown Archival Record', icon: FileText, color: 'text-purple-400' },
  { id: 4, title: '10-Print Biometrics', subtitle: 'Forensic Dermal Sheet', icon: Shield, color: 'text-blue-400' },
  { id: 5, title: 'Investigative Profile', subtitle: 'DGAOS EYES Dossier', icon: Shield, color: 'text-rose-400' },
  { id: 6, title: 'Residency Record', subtitle: 'Municipal Domicile Form', icon: Building, color: 'text-emerald-400' },
  { id: 7, title: 'Physical ID Sheet', subtitle: 'Forensic Biometrics & Marks', icon: Eye, color: 'text-cyan-400' },
  { id: 8, title: 'Medical Summary', subtitle: 'Faith Medical Group Summary', icon: HeartPulse, color: 'text-teal-400' },
  { id: 9, title: 'Education / Service', subtitle: 'Cyacademy & WORKNET', icon: GraduationCap, color: 'text-yellow-400' },
];

export default function DocumentStudioApp() {
  const [citizens, setCitizens] = useState<CitizenRecord[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenRecord>(DEFAULT_CITIZEN);
  const [activeDocId, setActiveDocId] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [issuanceNotice, setIssuanceNotice] = useState<string | null>(null);

  // Load citizens from master localStorage store
  const loadSavedCitizens = () => {
    try {
      const raw = localStorage.getItem('miraverse-identity-registry-v3');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCitizens(parsed);
          // Preserve currently selected if available, otherwise pick first
          const current = parsed.find((c: any) => c.record === selectedCitizen.record);
          if (current) setSelectedCitizen(current);
          else setSelectedCitizen(parsed[0]);
          return;
        }
      }
    } catch {
      // Fallback to default
    }
    setCitizens([DEFAULT_CITIZEN]);
    setSelectedCitizen(DEFAULT_CITIZEN);
  };

  useEffect(() => {
    loadSavedCitizens();

    // Listen for storage / cross-tab changes
    const onMessage = (e: MessageEvent) => {
      if (e.data?.source === 'meridion-registry' && e.data?.type === 'citizens-changed') {
        loadSavedCitizens();
      }
    };
    window.addEventListener('message', onMessage);
    window.addEventListener('storage', loadSavedCitizens);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('storage', loadSavedCitizens);
    };
  }, []);

  const handleCitizenChange = (recordId: string) => {
    const found = citizens.find(c => c.record === recordId);
    if (found) setSelectedCitizen(found);
  };

  const handlePrintCurrent = () => {
    window.print();
  };

  const handleDownloadCurrentHtml = () => {
    const docInfo = DOCUMENT_TABS.find(t => t.id === activeDocId);
    const slug = (selectedCitizen.name || 'citizen').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${docInfo?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${slug}_${selectedCitizen.record}.html`;
    const html = buildSingleDocumentHtml(activeDocId, selectedCitizen);
    triggerHtmlDownload(html, filename);
  };

  const handleExportFullPacket = () => {
    const slug = (selectedCitizen.name || 'citizen').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `miraverse_nine_document_packet_${slug}_${selectedCitizen.record}.html`;
    const html = buildFullPacketHtml(selectedCitizen);
    triggerHtmlDownload(html, filename);

    // Record formal issuance snapshot
    const record = recordIssuedSnapshot({
      documentType: 'FULL_NINE_DOCUMENT_PACKET',
      citizenRecordId: selectedCitizen.record,
      citizenName: selectedCitizen.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Aureline Civic Identity Administration & Crown Archives',
      version: '1.0'
    });

    setIssuanceNotice(`Exported complete 9-document packet! Snapshot logged: [${record.id}]`);
    setTimeout(() => setIssuanceNotice(null), 4000);
  };

  const handleLogIssuance = () => {
    const docInfo = DOCUMENT_TABS.find(t => t.id === activeDocId);
    const record = recordIssuedSnapshot({
      documentType: docInfo?.title || 'CIVIL_DOCUMENT',
      citizenRecordId: selectedCitizen.record,
      citizenName: selectedCitizen.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Aureline Civic Identity Bureau',
      version: '1.0'
    });

    setIssuanceNotice(`Formal issuance snapshot created: [${record.id}] (Hash: ${record.hash})`);
    setTimeout(() => setIssuanceNotice(null), 4000);
  };

  // Render the active document HTML inline
  const renderActiveDocumentContent = () => {
    switch (activeDocId) {
      case 1:
        return <div dangerouslySetInnerHTML={{ __html: renderAuraIdHtml(selectedCitizen) }} />;
      case 2:
        return <div dangerouslySetInnerHTML={{ __html: renderAuraPassportHtml(selectedCitizen) }} />;
      case 3:
        return <div dangerouslySetInnerHTML={{ __html: renderBirthCertificateHtml(selectedCitizen) }} />;
      case 4:
        return <div dangerouslySetInnerHTML={{ __html: renderFingerprintFormHtml(selectedCitizen) }} />;
      case 5:
        return <div dangerouslySetInnerHTML={{ __html: renderInvestigativeProfileHtml(selectedCitizen) }} />;
      case 6:
        return <div dangerouslySetInnerHTML={{ __html: renderResidencyRecordHtml(selectedCitizen) }} />;
      case 7:
        return <div dangerouslySetInnerHTML={{ __html: renderPhysicalSheetHtml(selectedCitizen) }} />;
      case 8:
        return <div dangerouslySetInnerHTML={{ __html: renderMedicalSummaryHtml(selectedCitizen) }} />;
      case 9:
        return <div dangerouslySetInnerHTML={{ __html: renderEducationEmploymentHtml(selectedCitizen) }} />;
      default:
        return <div dangerouslySetInnerHTML={{ __html: renderAuraIdHtml(selectedCitizen) }} />;
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0F0C1B] text-slate-100 select-none font-sans overflow-hidden">
      
      {/* Top Application Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-[#2C2448] bg-[#161226] px-5 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C5AB78] to-[#6C5FAC] text-white shadow">
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white font-serif">DOCUMENT STUDIO</h1>
              <span className="rounded bg-[#C5AB78]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E5D7B5] border border-[#C5AB78]/30">
                Nine-Document Packet
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Formal civil, forensic, and institutional paperwork for the Sovereign Realm of Meridion
            </p>
          </div>
        </div>

        {/* Citizen Selector & Quick Actions */}
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 bg-[#201A36] border border-[#3C3264] rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Citizen Record:</span>
            <select
              value={selectedCitizen.record}
              onChange={(e) => handleCitizenChange(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {citizens.map((c) => (
                <option key={c.record} value={c.record} className="bg-[#1C1833] text-white">
                  {c.name} ({c.record})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsPortraitModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#3C3268] hover:bg-[#52448C] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition"
            title="Open integrated Portrait Studio"
          >
            <Sparkles size={14} className="text-[#C5AB78]" />
            Portrait Studio
          </button>

          <button
            onClick={handleExportFullPacket}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C5AB78] to-[#9883C8] hover:from-[#D4BC8B] hover:to-[#A896D8] text-[#1E1738] px-3.5 py-1.5 text-xs font-bold shadow transition"
            title="Download all 9 documents as a combined PDF-ready packet"
          >
            <Download size={14} />
            Export 9-Doc Packet
          </button>
        </div>
      </header>

      {/* Issuance Notification Banner if triggered */}
      {issuanceNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-600/40 text-emerald-200 px-5 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{issuanceNotice}</span>
          </div>
          <button onClick={() => setIssuanceNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Document Type Navigation Rail */}
        <aside className="w-64 border-r border-[#272040] bg-[#130F22] flex flex-col justify-between overflow-y-auto">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-[#9883C8] uppercase">
              Document Inventory (§7.1)
            </div>

            {DOCUMENT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDocId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocId(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                    isActive
                      ? 'bg-[#292244] text-white border border-[#524484] shadow-sm'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${isActive ? 'bg-[#3C3268] text-white' : 'bg-[#1C1730] text-slate-400'}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate leading-tight">{tab.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{tab.subtitle}</div>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-[#C5AB78]" />}
                </button>
              );
            })}
          </div>

          {/* Left Footer Summary */}
          <div className="p-3 border-t border-[#272040] bg-[#0E0B1A] text-[11px] text-slate-400 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span>ACTIVE CITIZEN:</span>
              <strong className="text-white truncate max-w-[120px]">{selectedCitizen.name}</strong>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span>CIVIC STATUS:</span>
              <span className="text-emerald-400 font-semibold">{selectedCitizen.status || 'VERIFIED'}</span>
            </div>
            <button
              onClick={handleLogIssuance}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#322A50] border border-[#44386A] py-1.5 text-[11px] font-medium text-slate-200 transition"
            >
              <Clock size={12} />
              Log Snapshot Issuance
            </button>
          </div>
        </aside>

        {/* Right Document Preview Workspace */}
        <main className="flex-1 flex flex-col bg-[#1A162B] overflow-hidden">
          
          {/* Document Toolbar */}
          <div className="flex items-center justify-between border-b border-[#2C2448] bg-[#161226] px-6 py-2.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white tracking-wide">
                {DOCUMENT_TABS.find(t => t.id === activeDocId)?.title}
              </span>
              <span className="text-slate-400 text-[11px]">
                Official Sovereign Document · Specimen View
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-[#201A36] border border-[#3C3264] rounded-md px-2 py-1">
                <span>Scale:</span>
                <button onClick={() => setZoomScale(Math.max(60, zoomScale - 10))} className="px-1 hover:text-white">-</button>
                <span className="text-white font-mono">{zoomScale}%</span>
                <button onClick={() => setZoomScale(Math.min(140, zoomScale + 10))} className="px-1 hover:text-white">+</button>
              </div>

              {/* Print Document */}
              <button
                onClick={handlePrintCurrent}
                className="flex items-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#342A54] border border-[#44386A] px-3 py-1.5 text-xs text-white transition"
              >
                <Printer size={13} />
                Print Document
              </button>

              {/* Download Document HTML */}
              <button
                onClick={handleDownloadCurrentHtml}
                className="flex items-center gap-1.5 rounded-md bg-[#3C3268] hover:bg-[#4E4185] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition"
              >
                <Download size={13} />
                Download HTML
              </button>
            </div>
          </div>

          {/* Interactive Document Paper Container */}
          <div className="flex-1 overflow-auto p-8 flex justify-center bg-[#1F1A33]">
            <div 
              className="transition-transform duration-150 origin-top"
              style={{ transform: `scale(${zoomScale / 100})` }}
            >
              {renderActiveDocumentContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Integrated Portrait Studio Modal */}
      <PortraitStudioModal
        citizen={selectedCitizen}
        isOpen={isPortraitModalOpen}
        onClose={() => setIsPortraitModalOpen(false)}
        onPortraitSaved={(newUri) => {
          setSelectedCitizen(prev => ({ ...prev, portraitData: newUri }));
          loadSavedCitizens();
        }}
      />
    </div>
  );
}
