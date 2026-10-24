import React, { useState, useEffect, useRef } from 'react';
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
import { MaidIdentityService } from '../services/maidIdentityService';
import { getActiveCitizenContext, openCitizenInApp } from '../integration/citizenBridge';
import { citizenSelection, subscribeCitizenUpdates } from '../integration/citizenEvents';
import { authorizeAuraAction, evaluateAuraRecordPermissions, resolveAuraActor } from '../integration/auraPermissions';
import { useOSStore } from '../store/useOSStore';
import '../styles/apps/DocumentStudio.css';

const DEFAULT_CITIZEN: CitizenRecord = {
  name: 'Elara Vale',
  dob: '2001-04-18',
  place: 'Northwake, Fross',
  record: 'MRD-8492-319',
  maid: 'MAID-OR-00481926',
  registrationRegionCode: 'OR',
  legacyAliases: ['MRD-8492-319'],
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
  residency: 'Cyacademy Vector Housing 4B · Verified Residence',
  history: 'Routine civil registration completed at intake; transferred from Northwake regional enclave.',
  status: 'ACTIVE / VERIFIED',
  links: 'Coordinates academic study group at Aureline Library; holds valid regional transit pass.',
  relationships: 'Known associate of Cyacademy faculty',
  household: 'Cyacademy Vector Housing Suite 4B',
  timeline: 'Origin: Northwake, Fross; residing in Aureline since Year 24',
  biometricSeed: 'MAID-OR-00481926'
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
  const osPlayer = useOSStore(s => s.gameplay.player);
  const osIdentity = useOSStore(s => s.gameplay.identity);
  const isLoggedIn = useOSStore(s => s.isLoggedIn);
  const auraActor = resolveAuraActor({ player: osPlayer, identity: osIdentity, isLoggedIn });
  const recordPermissions = evaluateAuraRecordPermissions(selectedCitizen as any, auraActor);

  const selectedCitizenRef = useRef(selectedCitizen);
  const mountedRef = useRef(false);
  const loadVersionRef = useRef(0);
  useEffect(() => { selectedCitizenRef.current = selectedCitizen; }, [selectedCitizen]);

  const loadSavedCitizens = async (overrideCitizenId?: string, overrideDocId?: number) => {
    const version = ++loadVersionRef.current;
    try {
      const rawList = await MaidIdentityService.ensureDefaultPopulationSeeded();
      if (!mountedRef.current || version !== loadVersionRef.current) return;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const list: CitizenRecord[] = rawList
          .filter(person => evaluateAuraRecordPermissions(person, auraActor).canViewRecord)
          .map(person => ({ ...person, record: person.maid || person.legacyRecord || person.id }));
        const current = selectedCitizenRef.current;
        const targetId = overrideCitizenId || current.maid || current.record;
        const matched = list.find(citizen => citizen.maid === targetId || citizen.record === targetId || (citizen as any).legacyRecord === targetId || (citizen as any).id === targetId);
        setCitizens(list);
        if (matched) {
          selectedCitizenRef.current = matched;
          setSelectedCitizen(matched);
        }
        if (Number.isInteger(overrideDocId) && overrideDocId! >= 1 && overrideDocId! <= 9) setActiveDocId(overrideDocId!);
        return;
      }
    } catch {
      if (!mountedRef.current || version !== loadVersionRef.current) return;
      setIssuanceNotice('Citizen records could not be refreshed. Your current document selection has been kept.');
    }
    setCitizens(current => current.length ? current : [DEFAULT_CITIZEN]);
  };

  useEffect(() => {
    mountedRef.current = true;
    const rawContext = getActiveCitizenContext();
    const context = citizenSelection(rawContext);
    void loadSavedCitizens(context?.citizenId, rawContext && Date.now() - rawContext.timestamp < 15000 ? context?.targetDocId : undefined);
    const unsubscribe = subscribeCitizenUpdates(update => { void loadSavedCitizens(update.citizenId, update.targetDocId); });
    return () => {
      mountedRef.current = false;
      ++loadVersionRef.current;
      unsubscribe();
    };
  }, []);

  const handleCitizenChange = (recordId: string) => {
    const found = citizens.find(citizen => citizen.maid === recordId || citizen.record === recordId || (citizen as any).id === recordId || (citizen as any).legacyRecord === recordId);
    if (found) {
      ++loadVersionRef.current;
      selectedCitizenRef.current = found;
      setSelectedCitizen(found);
    }
  };

  const handlePrintCurrent = () => {
    window.print();
  };

  const handleDownloadCurrentHtml = () => {
    const auth = authorizeAuraAction('issue_document', { actor: auraActor, targetPerson: selectedCitizen as any, documentId: activeDocId });
    if (!auth.authorized) {
      setIssuanceNotice(auth.reason || 'Institutional authorization required to export this document.');
      return;
    }
    const docInfo = DOCUMENT_TABS.find(t => t.id === activeDocId);
    const slug = (selectedCitizen.name || 'citizen').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const idKey = selectedCitizen.maid || selectedCitizen.record;
    const filename = `${docInfo?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${slug}_${idKey}.html`;
    const html = buildSingleDocumentHtml(activeDocId, selectedCitizen);
    triggerHtmlDownload(html, filename);
  };

  const handleExportFullPacket = () => {
    const auth = authorizeAuraAction('issue_full_packet', { actor: auraActor, targetPerson: selectedCitizen as any });
    if (!auth.authorized) {
      setIssuanceNotice(auth.reason || 'Sovereign Administrator or Registrar/DGA authorization required to export the full 9-document packet.');
      return;
    }
    const slug = (selectedCitizen.name || 'citizen').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const idKey = selectedCitizen.maid || selectedCitizen.record;
    const filename = `miraverse_nine_document_packet_${slug}_${idKey}.html`;
    const html = buildFullPacketHtml(selectedCitizen);
    triggerHtmlDownload(html, filename);

    // Record formal issuance snapshot
    const record = recordIssuedSnapshot({
      documentType: 'FULL_NINE_DOCUMENT_PACKET',
      citizenId: idKey,
      citizenName: selectedCitizen.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Aureline Civic Identity Administration & Crown Archives',
      version: '1.0'
    });

    setIssuanceNotice(`Exported complete 9-document packet! Snapshot logged: [${record.id}]`);
    setTimeout(() => setIssuanceNotice(null), 4000);
  };

  const handleLogIssuance = () => {
    const auth = authorizeAuraAction('issue_document', { actor: auraActor, targetPerson: selectedCitizen as any, documentId: activeDocId });
    if (!auth.authorized) {
      setIssuanceNotice(auth.reason || 'Institutional authorization required to log a formal issuance snapshot.');
      return;
    }
    const docInfo = DOCUMENT_TABS.find(t => t.id === activeDocId);
    const idKey = selectedCitizen.maid || selectedCitizen.record;
    const record = recordIssuedSnapshot({
      documentType: docInfo?.title || 'CIVIL_DOCUMENT',
      citizenId: idKey,
      citizenName: selectedCitizen.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Aureline Civic Identity Bureau',
      version: '1.0'
    });

    setIssuanceNotice(`Formal issuance snapshot created for ${idKey}: [${record.id}] (Hash: ${record.hash})`);
    setTimeout(() => setIssuanceNotice(null), 4000);
  };

  // Render the active document HTML inline
  const renderActiveDocumentContent = () => {
    if (!recordPermissions.allowedDocumentIds.includes(activeDocId)) {
      return (
        <div className="p-8 text-center text-slate-300 bg-slate-900/90 rounded-xl border border-amber-500/30">
          <Shield size={28} className="mx-auto mb-2 text-amber-400" />
          <h3 className="text-base font-bold text-white mb-1">Institutional Authorization Required</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {authorizeAuraAction('issue_document', { actor: auraActor, targetPerson: selectedCitizen as any, documentId: activeDocId }).reason}
          </p>
        </div>
      );
    }
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
    <div className="document-studio">
      <aside className="document-library" aria-label="Official document library">
        <header><span className="workspace-kicker">Studio / official documents</span><h1>The civil file.</h1><p>Nine records. One identity.</p></header>
        <label className="document-citizen-label">Prepared for<select id="doc-studio-citizen-select" aria-label="Document citizen" value={selectedCitizen.maid || selectedCitizen.record} onChange={event => handleCitizenChange(event.target.value)}>{citizens.map(citizen => <option key={citizen.maid || citizen.record} value={citizen.maid || citizen.record}>{citizen.name}</option>)}</select></label>
        <nav aria-label="Choose a document">{DOCUMENT_TABS.map(document => <button key={document.id} aria-pressed={activeDocId === document.id} onClick={() => setActiveDocId(document.id)}><span className="document-file-number">{document.id.toString().padStart(2, '0')}</span><span><strong>{document.title}</strong><small>{document.subtitle}</small></span></button>)}</nav>
        <div className="document-library-actions"><button className="document-export" onClick={handleExportFullPacket}><Download size={14} />Export complete packet</button><details><summary>Record actions</summary><button onClick={() => openCitizenInApp(selectedCitizen.maid || selectedCitizen.record, 'meridionRegistry', { sourceApp: 'documentStudio' })}>Open citizen dossier</button><button onClick={() => setIsPortraitModalOpen(true)}>Edit portrait</button><button onClick={handleLogIssuance}>Log issuance snapshot</button></details></div>
      </aside>
      <main className="document-workbench">
        <header className="document-toolbar"><div><span className="workspace-kicker">Document {activeDocId.toString().padStart(2, '0')} / 09</span><h2>{DOCUMENT_TABS.find(document => document.id === activeDocId)?.title}</h2></div><div className="document-toolbar-actions"><div className="document-zoom"><button aria-label="Zoom out" onClick={() => setZoomScale(Math.max(60, zoomScale - 10))}>−</button><span>{zoomScale}%</span><button aria-label="Zoom in" onClick={() => setZoomScale(Math.min(140, zoomScale + 10))}>+</button></div><button onClick={handlePrintCurrent}><Printer size={14} /><span>Print</span></button><button onClick={handleDownloadCurrentHtml}><Download size={14} /><span>Save HTML</span></button></div></header>
        {issuanceNotice && <div className="document-notice" role="status"><CheckCircle2 size={14} /><span>{issuanceNotice}</span><button aria-label="Dismiss issuance notice" onClick={() => setIssuanceNotice(null)}>×</button></div>}
        <div className="document-pasteboard"><div className="document-paper" style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top center' }}>{renderActiveDocumentContent()}</div></div>
        <footer className="document-workbench-footer"><span>{selectedCitizen.maid || selectedCitizen.record}</span><span>Sovereign Realm of Meridion · Specimen view</span></footer>
      </main>
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
