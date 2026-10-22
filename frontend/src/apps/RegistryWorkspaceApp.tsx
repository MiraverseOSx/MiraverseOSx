import { subscribeCitizenUpdates } from '../integration/citizenEvents';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, UserPlus, Shield, CheckCircle2, AlertTriangle,
  Fingerprint, Sparkles, FileText, Globe, Key, Copy, Check,
  ArrowRight, Users, Database, Lock, RefreshCw, Layers, HeartPulse,
  GraduationCap, Building, Eye, Edit3, Link2, ExternalLink, Download, Camera
} from 'lucide-react';
import {
  MaidIdentityService,
  type CanonicalPerson,
  type LookupResult,
  type NewPersonInput,
  type CharacterArchetype,
  validateMaidFormat,
  generateTenPrintPreview
} from '../services/maidIdentityService';
import {
  getIssuedSnapshots,
  buildFullPacketHtml,
  buildSingleDocumentHtml,
  triggerHtmlDownload,
  recordIssuedSnapshot
} from '../services/documentPacketGenerator';
import {
  getActiveCitizenContext,
  setActiveCitizenContext,
  openCitizenInApp
} from '../integration/citizenBridge';
import { generateProceduralPortrait, persistCitizenPortrait } from '../services/portraitService';
import PortraitStudioModal from '../components/portrait/PortraitStudioModal';
import { useOSStore } from '../store/useOSStore';
import { authorizeAuraAction, evaluateAuraRecordPermissions, resolveAuraActor } from '../integration/auraPermissions';

const ARCHETYPE_OPTIONS: { id: CharacterArchetype; label: string; badge: string; desc: string }[] = [
  {
    id: 'ordinary',
    label: 'Ordinary & Believable',
    badge: 'Civilian',
    desc: 'Everyday Orynvell artisan, transit coordinator, or municipal resident.'
  },
  {
    id: 'cyacademy',
    label: 'Cyacademy Scholar',
    badge: 'Academic',
    desc: 'Student or researcher in SpellForge, PRISM resonance, and Vector Housing.'
  },
  {
    id: 'faithmed',
    label: 'Faith Medical Clinician',
    badge: 'Clinical',
    desc: 'Bio-aura specialist, MEDSTAT triage clinician, or outpatient subject.'
  },
  {
    id: 'dgaos',
    label: 'DGA / TRACE Subject',
    badge: 'Forensic / Intel',
    desc: 'DGAOS agent, TRACE forensic criminalist, or monitored person of interest.'
  },
  {
    id: 'civic',
    label: 'Orynvell Civic & Archives',
    badge: 'Sovereign',
    desc: 'Crown registrar, First Orynvell Treasury auditor, or Royal Archivist.'
  }
];

const OFFICIAL_DOC_CARDS = [
  { id: 1, title: 'Aura Citizen ID', subtitle: 'Biometric Wallet Card', category: 'Civic Identity', color: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300' },
  { id: 2, title: 'Aura Passport', subtitle: 'Official Travel Booklet', category: 'Sovereign Travel', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
  { id: 3, title: 'Birth Certificate', subtitle: 'Crown Archival Record', category: 'Vital Statistics', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
  { id: 4, title: '10-Print Biometrics', subtitle: 'Forensic Dermal Sheet', category: 'TRACE Biometrics', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
  { id: 5, title: 'Investigative Profile', subtitle: 'DGAOS EYES Dossier', category: 'DGA Intelligence', color: 'border-rose-500/40 bg-rose-950/30 text-rose-300' },
  { id: 6, title: 'Residency & Housing', subtitle: 'Municipal Domicile Form', category: 'Housing Authority', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
  { id: 7, title: 'Physical ID Sheet', subtitle: 'Biometrics & Marks', category: 'Forensic Physical', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' },
  { id: 8, title: 'Medical Summary', subtitle: 'Faith Medical Group Chart', category: 'Faith Medical', color: 'border-teal-500/40 bg-teal-950/30 text-teal-300' },
  { id: 9, title: 'Education & Service', subtitle: 'Cyacademy & WORKNET', category: 'Academic / Career', color: 'border-yellow-500/40 bg-yellow-950/30 text-yellow-300' },
];

export default function RegistryWorkspaceApp() {
  const isWorldAdmin = useOSStore(s => Boolean(s.gameplay.player.isAdmin));
  const osPlayer = useOSStore(s => s.gameplay.player);
  const osIdentity = useOSStore(s => s.gameplay.identity);
  const isLoggedIn = useOSStore(s => s.isLoggedIn);
  const auraActor = useMemo(() => resolveAuraActor({ player: osPlayer, identity: osIdentity, isLoggedIn }), [osPlayer, osIdentity, isLoggedIn]);
  const [linkingCitizen, setLinkingCitizen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lookup' | 'add' | 'ecosystem' | 'migration'>('lookup');
  const [dossierSection, setDossierSection] = useState<'overview' | 'ancestry' | 'institutions' | 'relationships' | 'documents' | 'edit'>('overview');

  // Population & Search State
  const [persons, setPersons] = useState<CanonicalPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');
  const [affiliationFilter, setAffiliationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_migration'>('all');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Add Person Studio State
  const [selectedArchetype, setSelectedArchetype] = useState<CharacterArchetype>('cyacademy');
  const [generatorSeed, setGeneratorSeed] = useState<number>(101);
  const [formData, setFormData] = useState<NewPersonInput>(() =>
    MaidIdentityService.generateCharacterDraft('cyacademy', 101)
  );
  const [initialRelTarget, setInitialRelTarget] = useState<string>('');
  const [initialRelType, setInitialRelType] = useState<string>('Colleague');
  const [formError, setFormError] = useState<string | null>(null);

  // Relationship Linker State (in Dossier)
  const [relTargetMaid, setRelTargetMaid] = useState<string>('');
  const [relType, setRelType] = useState<string>('Research Partner');
  const [relNotes, setRelNotes] = useState<string>('');

  // Inline Profile Editor State
  const [editDraft, setEditDraft] = useState<Partial<CanonicalPerson>>({});

  // Portrait Studio Modal State
  const [portraitModalTarget, setPortraitModalTarget] = useState<'add' | 'dossier' | null>(null);

  // Migration stats
  const [migrationStats, setMigrationStats] = useState<{
    migratedCount: number;
    pendingCount: number;
    alreadyMigratedCount: number;
    backupCreated: boolean;
  } | null>(null);

  const showBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4500);
  };

  const lookupResultRef = useRef(lookupResult);
  const mountedRef = useRef(false);
  const loadVersionRef = useRef(0);
  useEffect(() => { lookupResultRef.current = lookupResult; }, [lookupResult]);

  const loadData = async (focusCitizenId?: string) => {
    const version = ++loadVersionRef.current;
    try {
      const migration = await MaidIdentityService.migrateLegacyRegistry();
      const list = await MaidIdentityService.ensureDefaultPopulationSeeded();
      if (!mountedRef.current || version !== loadVersionRef.current) return;
      setMigrationStats(migration);
      setPersons(list);
      const previous = lookupResultRef.current;
      const targetId = focusCitizenId || previous?.person?.id;
      const person = targetId ? list.find(candidate => candidate.id === targetId || candidate.maid === targetId || candidate.legacyRecord === targetId || candidate.legacyAliases.includes(targetId)) : list[0];
      if (person) {
        const next: LookupResult = { status: person.maidStatus === 'pending_migration' ? 'pending_migration' : 'found', person, matchedBy: person.maid ? 'maid' : 'legacy_alias', matchedQuery: person.maid || person.legacyRecord };
        lookupResultRef.current = next;
        setLookupResult(next);
        // Background population updates must not erase an in-progress profile edit.
        if (focusCitizenId || !previous?.person || previous.person.id !== person.id) setEditDraft(person);
        if (focusCitizenId) setSearchQuery(person.maid || person.legacyRecord);
      }
    } catch {
      if (mountedRef.current && version === loadVersionRef.current) setStatusBanner('Citizen records could not be refreshed. Your current dossier has been kept.');
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    void loadData(getActiveCitizenContext()?.citizenId);
    const unsubscribe = subscribeCitizenUpdates(update => { void loadData(update.citizenId); });
    return () => {
      mountedRef.current = false;
      ++loadVersionRef.current;
      unsubscribe();
    };
  }, []);

  // Filtered population list
  const filteredPersons = useMemo(() => {
    return persons.filter(p => {
      if (p.isRestricted && !evaluateAuraRecordPermissions(p, auraActor).canViewRecord) return false;
      if (statusFilter !== 'all' && p.maidStatus !== statusFilter) return false;
      if (speciesFilter !== 'ALL' && !p.species.toLowerCase().includes(speciesFilter.toLowerCase())) return false;
      if (affiliationFilter !== 'ALL') {
        const aff = `${p.affiliation || ''} ${p.faction || ''} ${p.category || ''}`.toLowerCase();
        if (!aff.includes(affiliationFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = [
          p.maid || '',
          p.legacyRecord || '',
          ...(p.legacyAliases || []),
          p.name,
          p.alias || '',
          p.species,
          p.ancestry,
          p.occupation,
          p.affiliation,
          p.home,
          p.place,
          p.abilities
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [persons, statusFilter, speciesFilter, affiliationFilter, searchQuery, auraActor]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      if (persons.length > 0) {
        setLookupResult({ status: 'found', person: persons[0], matchedBy: 'maid', matchedQuery: persons[0].maid || '' });
        setEditDraft(persons[0]);
      }
      return;
    }

    setIsSearching(true);
    const result = await MaidIdentityService.lookupPerson(searchQuery, {
      allowRestricted: evaluateAuraRecordPermissions({ isRestricted: true }, auraActor).canViewRestrictedFields,
      actor: auraActor,
    });
    setLookupResult(result);
    if (result.person) {
      setEditDraft(result.person);
      setActiveCitizenContext({
        citizenId: result.person.maid || result.person.legacyRecord,
        sourceApp: 'meridionRegistry',
        timestamp: Date.now()
      });
    }
    setIsSearching(false);
  };

  const handleSelectPerson = async (person: CanonicalPerson) => {
    const perms = evaluateAuraRecordPermissions(person, auraActor);
    if (!perms.canViewRecord) {
      setLookupResult({
        status: 'restricted',
        person: null,
        matchedBy: person.maid ? 'maid' : 'legacy_alias',
        matchedQuery: person.maid || person.legacyRecord,
        message: perms.restrictionReason || 'Access Restricted: Compartmented classification level required.'
      });
      setActiveTab('lookup');
      return;
    }
    ++loadVersionRef.current;
    setLookupResult({
      status: person.maidStatus === 'pending_migration' ? 'pending_migration' : 'found',
      person,
      matchedBy: person.maid ? 'maid' : 'legacy_alias',
      matchedQuery: person.maid || person.legacyRecord
    });
    setEditDraft(person);
    setActiveCitizenContext({
      citizenId: person.maid || person.legacyRecord,
      sourceApp: 'meridionRegistry',
      timestamp: Date.now()
    });
    setActiveTab('lookup');
  };

  const handleQuickLookup = async (idOrMaid: string) => {
    setSearchQuery(idOrMaid);
    setIsSearching(true);
    const result = await MaidIdentityService.lookupPerson(idOrMaid, {
      allowRestricted: evaluateAuraRecordPermissions({ isRestricted: true }, auraActor).canViewRestrictedFields,
      actor: auraActor,
    });
    setLookupResult(result);
    if (result.person) setEditDraft(result.person);
    setIsSearching(false);
    setActiveTab('lookup');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleArchetypeChange = (arch: CharacterArchetype) => {
    const nextSeed = generatorSeed + 19;
    setSelectedArchetype(arch);
    setGeneratorSeed(nextSeed);
    setFormData(MaidIdentityService.generateCharacterDraft(arch, nextSeed));
    setFormError(null);
  };

  const handleRerollCharacter = () => {
    const nextSeed = generatorSeed + 37;
    setGeneratorSeed(nextSeed);
    setFormData(MaidIdentityService.generateCharacterDraft(selectedArchetype, nextSeed));
    setFormError(null);
  };

  const handleRegenerateDraftPortrait = () => {
    const nextSeed = generatorSeed + 11;
    setGeneratorSeed(nextSeed);
    const uri = generateProceduralPortrait({
      name: formData.name || 'Provisional Citizen',
      species: formData.species,
      ancestry: formData.ancestry,
      eyes: formData.eyes || 'Luminous Hazel',
      hair: formData.hair || 'Silver-Black',
      build: formData.build || 'Medium',
      height: formData.height,
      mark: formData.mark,
      home: formData.home,
      affinity: formData.affinity,
      powerSource: formData.powerSource,
      category: formData.category || 'Citizen',
      dob: formData.dob
    }, nextSeed);
    setFormData(prev => ({ ...prev, portraitData: uri }));
  };

  const handleAddPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Full legal or sovereign name is required before issuing a permanent MAID.');
      return;
    }

    const res = await MaidIdentityService.addPerson(formData);
    if (res.success && res.person) {
      if (initialRelTarget && initialRelType) {
        await MaidIdentityService.linkCitizens(
          res.person.maid || res.person.id,
          initialRelTarget,
          initialRelType,
          'Linked at initial MAID registration',
          true
        );
      }
      await loadData(res.person.maid || res.person.id);
      showBanner(`Official identity registered! Permanent MAID assigned: ${res.person.maid}`);
      setActiveTab('lookup');
      setDossierSection('overview');
    } else {
      setFormError(res.error || 'Failed to register person.');
    }
  };

  const handleConfirmPendingRegion = async (personId: string) => {
    const res = await MaidIdentityService.confirmPendingRegistration(personId, 'Orynvell');
    if (res.error) showBanner(res.error);
    if (res.success && res.person) {
      await loadData(res.person.maid || res.person.id);
      showBanner(`Registration region Orynvell (OR) confirmed! Issued permanent MAID: ${res.person.maid}`);
    }
  };

  const handleLinkRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult?.person || !relTargetMaid) return;
    const sourceId = lookupResult.person.maid || lookupResult.person.id;
    const res = await MaidIdentityService.linkCitizens(sourceId, relTargetMaid, relType, relNotes, true);
    if (res.success && res.source) {
      setRelNotes('');
      await loadData(sourceId);
      showBanner(`Linked ${lookupResult.person.name} with ${res.target?.name || relTargetMaid} (${relType}).`);
    } else {
      showBanner(res.error || 'Could not link citizens.');
    }
  };

  const handleSaveInlineProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult?.person) return;
    const targetIdKey = lookupResult.person.maid || lookupResult.person.id;
    const perms = evaluateAuraRecordPermissions(lookupResult.person, auraActor);
    if (perms.editableFields.length === 0) {
      showBanner(`Role '${auraActor.roleLabel}' is not authorized to modify this citizen record.`);
      return;
    }
    const candidateUpdates: Record<string, any> = {
      occupation: editDraft.occupation,
      affiliation: editDraft.affiliation,
      clearance: editDraft.clearance,
      medical: editDraft.medical,
      residency: editDraft.residency,
      household: editDraft.household,
      status: editDraft.status,
      abilities: editDraft.abilities,
      affinity: editDraft.affinity,
      height: editDraft.height,
      eyes: editDraft.eyes,
      hair: editDraft.hair,
      build: editDraft.build,
      blood: editDraft.blood,
      mark: editDraft.mark,
      address: editDraft.address,
      phone: editDraft.phone,
      email: editDraft.email
    };
    const allowedUpdates: Record<string, any> = {};
    for (const field of perms.editableFields) {
      if (field in candidateUpdates) {
        allowedUpdates[field] = candidateUpdates[field];
      }
    }
    const updateRes = await MaidIdentityService.updatePerson(targetIdKey, allowedUpdates, { actor: auraActor });
    if (updateRes.success && updateRes.person) {
      await loadData(targetIdKey);
      showBanner(`Updated canonical profile for ${updateRes.person.name}. Permanent MAID (${updateRes.person.maid}) verified immutable.`);
      setDossierSection('overview');
    } else if (updateRes.error) {
      showBanner(updateRes.error);
    }
    return;
    e.preventDefault();
    if (!lookupResult?.person) return;
    const idKey = lookupResult.person.maid || lookupResult.person.id;
    const res = await MaidIdentityService.updatePerson(idKey, {
      occupation: editDraft.occupation,
      affiliation: editDraft.affiliation,
      clearance: editDraft.clearance,
      medical: editDraft.medical,
      residency: editDraft.residency,
      household: editDraft.household,
      status: editDraft.status,
      abilities: editDraft.abilities,
      affinity: editDraft.affinity,
      height: editDraft.height,
      eyes: editDraft.eyes,
      hair: editDraft.hair,
      build: editDraft.build,
      blood: editDraft.blood,
      mark: editDraft.mark,
      address: editDraft.address,
      phone: editDraft.phone,
      email: editDraft.email
    });
    if (res.success && res.person) {
      await loadData(idKey);
      showBanner(`Updated canonical profile for ${res.person.name}. Permanent MAID (${res.person.maid}) verified immutable.`);
      setDossierSection('overview');
    }
  };

  const handleQuickIssueDocument = (person: CanonicalPerson, docId: number, docTitle: string) => {
    const auth = authorizeAuraAction('issue_document', { actor: auraActor, targetPerson: person, documentId: docId });
    if (!auth.authorized) {
      showBanner(auth.reason || `Authorization required to issue ${docTitle}.`);
      return;
    }
    const citizenRec: any = { ...person, record: person.maid || person.legacyRecord };
    const slug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const idKey = person.maid || person.legacyRecord;
    const html = buildSingleDocumentHtml(docId, citizenRec);
    triggerHtmlDownload(html, `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${slug}_${idKey}.html`);
    const snap = recordIssuedSnapshot({
      documentType: docTitle,
      citizenId: idKey,
      citizenName: person.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Meridion Sovereign Identity Registry (AURA)',
      version: '2.0'
    });
    showBanner(`Issued & downloaded ${docTitle} for ${person.name} [${snap.id}].`);
  };

  const handleQuickExportAllNine = (person: CanonicalPerson) => {
    const auth = authorizeAuraAction('issue_full_packet', { actor: auraActor, targetPerson: person });
    if (!auth.authorized) {
      showBanner(auth.reason || 'Authorization required to export the complete 9-document sovereign packet.');
      return;
    }
    const citizenRec: any = { ...person, record: person.maid || person.legacyRecord };
    const slug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const idKey = person.maid || person.legacyRecord;
    const html = buildFullPacketHtml(citizenRec);
    triggerHtmlDownload(html, `miraverse_nine_document_packet_${slug}_${idKey}.html`);
    const snap = recordIssuedSnapshot({
      documentType: 'FULL_NINE_DOCUMENT_PACKET',
      citizenId: idKey,
      citizenName: person.name,
      issuedAt: new Date().toISOString(),
      issuingAuthority: 'Meridion Sovereign Identity Registry (AURA)',
      version: '2.0'
    });
    showBanner(`Exported complete 9-Document Official Packet for ${person.name} [${snap.id}].`);
  };

  const activePerson = lookupResult?.person || null;
  const activeTenPrints = useMemo(
    () => generateTenPrintPreview(activePerson?.biometricSeed || activePerson?.maid || 'MAID-OR-00481926'),
    [activePerson?.biometricSeed, activePerson?.maid]
  );
  const draftTenPrints = useMemo(
    () => generateTenPrintPreview(`${formData.name}-${formData.dob}-${generatorSeed}`),
    [formData.name, formData.dob, generatorSeed]
  );
  const activeIssuedDocs = useMemo(
    () => (activePerson ? getIssuedSnapshots(activePerson.maid || undefined, activePerson.legacyRecord) : []),
    [activePerson, statusBanner]
  );

  return (
    <div className="registry-workspace flex h-full w-full flex-col bg-[#111820] text-slate-100 select-none font-sans overflow-hidden">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-[#303C48] bg-[#18212B] px-6 py-3.5 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C0AA7F] to-[#627D91] text-white shadow-lg">
            <Fingerprint size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-wider text-white font-serif">
                Citizen registry
              </h1>
              <span className="rounded-md bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                ORYNVELL / OR · {auraActor.roleLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aureline population records and institutional connections
            </p>
          </div>
        </div>

      </header>

      {/* Polite Live Region for Status Announcements */}
      <div aria-live="polite" className="shrink-0">
        {statusBanner && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span className="font-semibold">{statusBanner}</span>
            </div>
            <button type="button" onClick={() => setStatusBanner(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar: Population Roster & Multi-Criteria Filters */}
        <aside className="w-80 border-r border-[#2C3742] bg-[#141D26] flex flex-col justify-between overflow-hidden shrink-0">
          <nav className="registry-workflows" aria-label="Registry workflows">
            <button aria-pressed={activeTab === 'lookup'} onClick={() => setActiveTab('lookup')}><Search size={15} />Population directory</button>
            <button aria-pressed={activeTab === 'add'} onClick={() => setActiveTab('add')}><UserPlus size={15} />Register a person</button>
            <details><summary>Registry services</summary><button aria-pressed={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')}><Layers size={14} />Institutional connections</button><button aria-pressed={activeTab === 'migration'} onClick={() => setActiveTab('migration')}><Database size={14} />Ledger integrity</button></details>
          </nav>
          <div className="p-3.5 border-b border-[#2C3742] space-y-2.5 bg-[#18232D]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#C0AA7F]">
                Population Database ({filteredPersons.length}/{persons.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSpeciesFilter('ALL');
                  setAffiliationFilter('ALL');
                  setStatusFilter('all');
                }}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Reset population filters"
              >
                <RefreshCw size={11} /> Reset
              </button>
            </div>

            {/* Quick Filter Controls */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <label htmlFor="pop-filter-affiliation" className="block text-[10px] text-slate-400 mb-0.5">Institution</label>
                <select
                  id="pop-filter-affiliation"
                  value={affiliationFilter}
                  onChange={(e) => setAffiliationFilter(e.target.value)}
                  className="w-full rounded-lg bg-[#1D252B] border border-[#34434F] px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#C0AA7F]"
                >
                  <option value="ALL">All Institutions</option>
                  <option value="Cyacademy">Cyacademy</option>
                  <option value="Faith Medical">Faith Medical</option>
                  <option value="DGA">DGAOS / TRACE</option>
                  <option value="Orynvell">Orynvell Archives</option>
                  <option value="Civilian">Civilian / Guild</option>
                </select>
              </div>
              <div>
                <label htmlFor="pop-filter-species" className="block text-[10px] text-slate-400 mb-0.5">Species</label>
                <select
                  id="pop-filter-species"
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="w-full rounded-lg bg-[#1D252B] border border-[#34434F] px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#C0AA7F]"
                >
                  <option value="ALL">All Species</option>
                  <option value="Frostborn">Frostborn</option>
                  <option value="Lightborn">Lightborn</option>
                  <option value="Luminary">Luminary</option>
                  <option value="Emberborn">Emberborn</option>
                  <option value="Shadowborn">Shadowborn</option>
                  <option value="Merfolk">Merfolk</option>
                  <option value="Humanoid">Humanoid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredPersons.map((p) => {
              const isSelected = activePerson?.id === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPerson(p)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#2A353E] border-[#C0AA7F] shadow-md'
                      : 'bg-[#192026] border-[#303C48] hover:border-[#52677B] hover:bg-[#212A32]'
                  }`}
                >
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-[#3A4958] bg-[#12171C] shrink-0">
                    {p.portraitData ? (
                      <img src={p.portraitData} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#C0AA7F]">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white truncate">{p.name}</span>
                      {p.maidStatus === 'active' && p.maid ? (
                        <span className="text-[9px] font-mono bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600/40 shrink-0">
                          OR
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-amber-950/90 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/40 shrink-0">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#C0AA7F] truncate mt-0.5">
                      {p.maid || p.legacyRecord}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {p.species} · {p.occupation}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredPersons.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No citizen records match current filters.
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#2C3742] bg-[#0F1316] text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Active MAIDs:</span>
              <strong className="text-emerald-400 font-mono">{persons.filter(p => p.maidStatus === 'active').length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Pending Migration:</span>
              <strong className="text-amber-400 font-mono">{persons.filter(p => p.maidStatus === 'pending_migration').length}</strong>
            </div>
          </div>
        </aside>

        {/* Right Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#181F25]">
          {/* =====================================================================
              TAB 1: LOOK UP MAID & COMPREHENSIVE CITIZEN DOSSIER
             ===================================================================== */}
          {activeTab === 'lookup' && (
            <div className="max-w-5xl mx-auto space-y-5">
              {/* Search Bar */}
              <div className="bg-[#212A32] border border-[#384754] rounded-2xl p-5 shadow-lg">
                <form onSubmit={handleSearch} className="space-y-2">
                  <label htmlFor="maid-lookup-input" className="block text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                    Authoritative MAID, Legacy MRD Alias, or Citizen Name Search
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="maid-lookup-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-describedby="maid-lookup-helper"
                        placeholder="Enter MAID (MAID-OR-00481926), Legacy ID (MRD-8492-319), Name, or Occupation..."
                        className="w-full rounded-xl bg-[#141D26] border border-[#415361] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C0AA7F]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="rounded-xl bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] hover:from-[#D4BC8B] hover:to-[#A9B8C5] text-[#18212B] px-5 py-2.5 text-xs font-bold shadow transition cursor-pointer"
                    >
                      {isSearching ? 'Querying...' : 'Resolve Identity'}
                    </button>
                  </div>
                  <p id="maid-lookup-helper" className="text-[11px] text-slate-400">
                    Resolves permanent <code className="text-[#D3C9B5]">MAID-OR-XXXXXXXX</code> numbers, historical <code className="text-indigo-300">MRD-...</code> aliases, and partial name/institution queries.
                  </p>
                </form>
              </div>

              {/* Not Found State */}
              {lookupResult?.status === 'not_found' && (
                <div role="alert" className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 flex items-start gap-4">
                  <AlertTriangle size={22} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-200">Identity Record Not Found</h3>
                    <p className="text-xs text-rose-300/90 mt-1">{lookupResult.message}</p>
                  </div>
                </div>
              )}

              {/* Pending Migration Alert */}
              {lookupResult?.status === 'pending_migration' && activePerson && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-amber-200">Pending Registration Region Confirmation</h3>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">
                        Legacy record <strong>{activePerson.legacyRecord}</strong> requires explicit Orynvell (<code className="font-mono">OR</code>) confirmation before permanent MAID allocation.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfirmPendingRegion(activePerson.id)}
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold transition shrink-0"
                  >
                    Confirm Orynvell (OR) & Issue MAID
                  </button>
                </div>
              )}

              {/* Active Citizen Comprehensive Dossier */}
              {activePerson && (
                <div className="bg-[#212A32] border border-[#3A4958] rounded-2xl shadow-xl overflow-hidden">
                  {/* Citizen Master Banner */}
                  <div className="bg-gradient-to-r from-[#29343D] via-[#212A32] to-[#2D3943] p-6 border-b border-[#3A4958] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-[#C0AA7F] bg-[#141D26] shadow-lg shrink-0 group">
                        {activePerson.portraitData ? (
                          <img src={activePerson.portraitData} alt={activePerson.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-[#C0AA7F]">
                            {activePerson.name.charAt(0)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPortraitModalTarget('dossier')}
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold text-[#D3C9B5]"
                          title="Open Portrait Studio for this citizen"
                        >
                          <Camera size={14} className="mb-0.5" />
                          Portrait
                        </button>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-white font-serif">{activePerson.name}</h2>
                          {activePerson.alias && (
                            <span className="text-xs text-[#C0AA7F] font-medium">“{activePerson.alias}”</span>
                          )}
                          <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                            {activePerson.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mt-1">
                          {activePerson.species} ({activePerson.ancestry}) · <span className="text-[#D3C9B5] font-semibold">{activePerson.occupation}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Institution: <strong className="text-slate-200">{activePerson.affiliation}</strong> · Residence: <strong className="text-slate-200">{activePerson.home}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Authoritative MAID & Legacy Alias Box */}
                    <div className="bg-[#151B1F] border border-[#415361] rounded-xl p-3.5 text-right space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        OFFICIAL PERMANENT MAID (IMMUTABLE)
                      </div>
                      {activePerson.maid ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-base font-mono font-bold text-[#D3C9B5] tracking-wider">
                            {activePerson.maid}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(activePerson.maid!)}
                            className="p-1 rounded bg-[#242E37] hover:bg-[#35434F] text-slate-300"
                            title="Copy MAID"
                          >
                            {copiedText === activePerson.maid ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-mono font-bold text-amber-400">PENDING REGION CONFIRMATION</div>
                      )}
                      <div className="text-[10px] font-mono text-indigo-300">
                        Legacy MRD Alias: {activePerson.legacyAliases?.join(', ') || activePerson.legacyRecord} · Passport: {activePerson.passport}
                      </div>
                    </div>
                  </div>

                  {isWorldAdmin && <div className="registry-player-link">
                    <div><strong>Player identity link</strong><p>Use this existing citizen for the current player's Citizen Hub. This does not edit the official identity or replace historical documents.</p></div>
                    <button disabled={linkingCitizen || Boolean(activePerson.isRestricted)} onClick={async () => {
                      setLinkingCitizen(true);
                      try {
                        const result = await useOSStore.getState().linkCitizenHubIdentity(activePerson.id);
                        showBanner(result.message);
                      } catch { showBanner('The player link could not be saved. Try again.'); }
                      finally { setLinkingCitizen(false); }
                    }}>{linkingCitizen ? 'Linking…' : 'Link to current player'}</button>
                  </div>}
                  {/* Dossier Sub-Navigation Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#181E23] px-6 py-2.5 border-b border-[#2F3C46]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'overview', label: 'Identity & Biometrics', icon: Fingerprint },
                        { id: 'ancestry', label: 'Ancestry & Resonance', icon: Sparkles },
                        { id: 'institutions', label: 'Faith Med / Cyacademy / DGA', icon: Building },
                        { id: 'relationships', label: `Relationships (${activePerson.relationshipIds?.length || 0})`, icon: Users },
                        { id: 'documents', label: `Official Documents (9)`, icon: FileText },
                        { id: 'edit', label: 'Edit Profile', icon: Edit3 },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isSel = dossierSection === tab.id;
                        return (
                          <button
                            type="button"
                            key={tab.id}
                            onClick={() => setDossierSection(tab.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              isSel
                                ? 'bg-[#344959] text-white border border-[#C0AA7F]/50 shadow-xs'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon size={13} className={isSel ? 'text-[#C0AA7F]' : 'text-slate-400'} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Open in Document Studio */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPortraitModalTarget('dossier')}
                        className="flex items-center gap-1 rounded-lg bg-[#27323B] hover:bg-[#364450] border border-[#52677B] px-2.5 py-1.5 text-[11px] font-semibold text-[#D3C9B5]"
                      >
                        <Camera size={12} /> Portrait Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { sourceApp: 'meridionRegistry' })}
                        className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] text-[#18212B] px-3 py-1.5 text-[11px] font-bold shadow"
                      >
                        <FileText size={12} /> Open in Document Studio
                      </button>
                    </div>
                  </div>

                  {/* DOSSIER SECTION 1: OVERVIEW & 10-PRINT BIOMETRICS */}
                  {dossierSection === 'overview' && (
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-2.5">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#C0AA7F] border-b border-[#2C3742] pb-1.5">
                            Vital & Domicile Coordinates
                          </h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Date of Birth:</span><strong className="text-white font-mono">{activePerson.dob}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Birthplace:</span><strong className="text-white">{activePerson.place}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Current Home:</span><strong className="text-white">{activePerson.home}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">District:</span><strong className="text-slate-200">{activePerson.district}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Housing Unit:</span><strong className="text-indigo-300">{activePerson.household || activePerson.residency}</strong></div>
                            <div className="pt-1 border-t border-[#2C3742] text-[11px] text-slate-300">{activePerson.address}</div>
                          </div>
                        </div>

                        <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-2.5">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#C0AA7F] border-b border-[#2C3742] pb-1.5">
                            Physical & Biometric Descriptors
                          </h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Height / Build:</span><strong className="text-white">{activePerson.height} · {activePerson.build}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Eye Color:</span><strong className="text-white">{activePerson.eyes}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Hair Color:</span><strong className="text-white">{activePerson.hair}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Blood & Aura:</span><strong className="text-emerald-300">{activePerson.blood}</strong></div>
                            <div className="pt-1 border-t border-[#2C3742] text-[11px] text-slate-300">
                              <span className="text-slate-400 block">Distinguishing Marks:</span>
                              {activePerson.mark}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-2.5">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#C0AA7F] border-b border-[#2C3742] pb-1.5">
                            Sovereign Registration Metadata
                          </h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Reg. Region:</span><strong className="text-emerald-400 font-mono">{activePerson.registrationRegionCode || 'PENDING'} (Orynvell)</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Passport No.:</span><strong className="text-amber-300 font-mono">{activePerson.passport}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Clearance:</span><strong className="text-indigo-300">{activePerson.clearance}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Comms / Phone:</span><strong className="text-slate-200 font-mono">{activePerson.phone}</strong></div>
                            <div className="flex justify-between"><span className="text-slate-400">Versenet Mail:</span><strong className="text-slate-200 font-mono">{activePerson.email}</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* 10-Print Dermal Ridge Classification Strip */}
                      <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] flex items-center gap-2">
                              <Fingerprint size={15} /> Authoritative 10-Print Dermal Ridge Classification
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              Deterministic biometric ridge matrix seeded from <code className="text-indigo-300">{activePerson.biometricSeed}</code> (synchronized with TRACE AFIS & Document 4).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { targetDocId: 4, sourceApp: 'meridionRegistry' })}
                            className="text-[11px] font-semibold text-[#D3C9B5] hover:underline flex items-center gap-1"
                          >
                            Open 10-Print Sheet <ExternalLink size={12} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {activeTenPrints.map((fp) => (
                            <div key={fp.fingerIndex} className="bg-[#1F282F] border border-[#34434F] rounded-lg p-2.5 text-center space-y-1">
                              <div className="text-[10px] font-bold text-slate-300">{fp.label}</div>
                              <div className="mx-auto h-10 w-10 rounded-full border border-indigo-400/40 bg-[#12171C] flex items-center justify-center">
                                <Fingerprint size={22} className="text-indigo-300 opacity-85" />
                              </div>
                              <div className="text-[10px] font-mono font-bold text-[#C0AA7F]">{fp.pattern}</div>
                              <div className="text-[9px] font-mono text-slate-400">
                                {fp.henryCode} · {fp.minutiaeScore}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOSSIER SECTION 2: ANCESTRY & RESONANCE */}
                  {dossierSection === 'ancestry' && (
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-5 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                            Lineage, Species & Origin
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Biological / Celestial Species:</span>
                              <strong className="text-white">{activePerson.species}</strong>
                            </div>
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Ancestral House / Lineage:</span>
                              <strong className="text-purple-300">{activePerson.ancestry}</strong>
                            </div>
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Archetype / Story Mode:</span>
                              <strong className="text-[#D3C9B5]">{activePerson.storyMode || 'Ordinary & Believable'}</strong>
                            </div>
                            <div className="pt-1">
                              <span className="text-slate-400 block mb-1">Timeline & Migration Origin:</span>
                              <p className="text-slate-200 leading-relaxed bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                                {activePerson.timeline || `Origin: ${activePerson.place}; registered in ${activePerson.home}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-5 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                            PRISM Resonance, Affinity & Abilities
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Spectrum Affinity:</span>
                              <strong className="text-indigo-300">{activePerson.affinity}</strong>
                            </div>
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Primary Power Source:</span>
                              <strong className="text-amber-300">{activePerson.powerSource}</strong>
                            </div>
                            <div className="flex justify-between border-b border-[#2C3742] pb-1.5">
                              <span className="text-slate-400">Aura Calibration Tier:</span>
                              <strong className="text-emerald-300">{activePerson.aura || 'Aura Calibrated Standard'}</strong>
                            </div>
                            <div className="pt-1">
                              <span className="text-slate-400 block mb-1">Recorded Abilities & Harmonic Traits:</span>
                              <p className="text-slate-200 leading-relaxed bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                                {activePerson.abilities}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-5 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                          Archival Biography & Civic History
                        </h3>
                        <p className="text-xs text-slate-200 leading-relaxed">{activePerson.lore || activePerson.history}</p>
                        <p className="text-[11px] text-slate-400 pt-1 border-t border-[#2C3742]">{activePerson.history}</p>
                      </div>
                    </div>
                  )}

                  {/* DOSSIER SECTION 3: INSTITUTIONAL & CLINICAL RECORDS */}
                  {dossierSection === 'institutions' && (
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Faith Medical Group */}
                        <div className="bg-[#18212B] border border-teal-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                                <HeartPulse size={15} /> Faith Medical Group
                              </span>
                              <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                                MEDSTAT SYNCED
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                              {activePerson.medical}
                            </p>
                            <div className="text-[11px] text-slate-400">
                              Blood/Aura: <strong className="text-teal-200">{activePerson.blood}</strong> · <strong className="text-teal-200">{activePerson.aura}</strong>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { targetDocId: 8, sourceApp: 'meridionRegistry' })}
                              className="w-full py-2 rounded-lg bg-teal-900/50 hover:bg-teal-800/70 border border-teal-500/40 text-teal-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <FileText size={13} /> Open Medical Summary (Doc 8)
                            </button>
                            <button
                              type="button"
                              onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'jobs', { targetTab: 'faithmed', sourceApp: 'meridionRegistry' })}
                              className="w-full py-1.5 rounded-lg bg-[#232D35] hover:bg-[#303D48] text-slate-200 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                            >
                              Open in Faith Medical Triage <ExternalLink size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Cyacademy & Housing */}
                        <div className="bg-[#18212B] border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <GraduationCap size={15} /> Cyacademy & Housing
                              </span>
                              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                                MIRROR / HOMECRAFT
                              </span>
                            </div>
                            <div className="text-xs text-slate-200 space-y-1 bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                              <div><span className="text-slate-400">Affiliation:</span> <strong>{activePerson.affiliation}</strong></div>
                              <div><span className="text-slate-400">Role:</span> <strong>{activePerson.occupation}</strong></div>
                              <div><span className="text-slate-400">Housing:</span> <strong className="text-indigo-200">{activePerson.household || activePerson.residency}</strong></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { targetDocId: 9, sourceApp: 'meridionRegistry' })}
                              className="w-full py-2 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/70 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <FileText size={13} /> Education & Service (Doc 9)
                            </button>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'passport', { sourceApp: 'meridionRegistry' })}
                                className="py-1.5 rounded-lg bg-[#232D35] hover:bg-[#303D48] text-slate-200 text-[11px] font-semibold transition"
                              >
                                MIRROR Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'housing', { sourceApp: 'meridionRegistry' })}
                                className="py-1.5 rounded-lg bg-[#232D35] hover:bg-[#303D48] text-slate-200 text-[11px] font-semibold transition"
                              >
                                Housing App
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* DGAOS & TRACE Forensics */}
                        <div className="bg-[#18212B] border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                                <Shield size={15} /> DGAOS & TRACE
                              </span>
                              <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                                EYES / AFIS
                              </span>
                            </div>
                            <div className="text-xs text-slate-200 space-y-1 bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                              <div><span className="text-slate-400">Clearance:</span> <strong className="text-amber-300">{activePerson.clearance}</strong></div>
                              <div><span className="text-slate-400">Standing:</span> <strong>{activePerson.links}</strong></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { targetDocId: 5, sourceApp: 'meridionRegistry' })}
                              className="w-full py-2 rounded-lg bg-rose-900/50 hover:bg-rose-800/70 border border-rose-500/40 text-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Shield size={13} /> Investigative Profile (Doc 5)
                            </button>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'dgaos', { sourceApp: 'meridionRegistry' })}
                                className="py-1.5 rounded-lg bg-[#232D35] hover:bg-[#303D48] text-slate-200 text-[11px] font-semibold transition"
                              >
                                Open DGAOS
                              </button>
                              <button
                                type="button"
                                onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'traceForensics', { sourceApp: 'meridionRegistry' })}
                                className="py-1.5 rounded-lg bg-[#232D35] hover:bg-[#303D48] text-slate-200 text-[11px] font-semibold transition"
                              >
                                Open TRACE
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOSSIER SECTION 4: INTERACTIVE RELATIONSHIPS & HOUSEHOLD */}
                  {dossierSection === 'relationships' && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Existing Relationships Graph */}
                        <div className="md:col-span-7 bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] flex items-center gap-2">
                            <Users size={15} /> Verified Citizen Relationships & Associates
                          </h3>
                          {activePerson.relationships && (
                            <p className="text-xs text-slate-300 bg-[#1F282F] p-3 rounded-lg border border-[#34434F]">
                              {activePerson.relationships}
                            </p>
                          )}

                          <div className="space-y-2">
                            {(activePerson.relationshipIds || []).map((rel, i) => {
                              const linkedCitizen = persons.find(p => p.maid === rel.id || p.legacyRecord === rel.id || p.id === rel.id);
                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-[#20282F] border border-[#3A4958] rounded-xl p-3 hover:border-[#C0AA7F] transition"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg overflow-hidden bg-[#12171C] border border-[#415361] flex items-center justify-center font-bold text-xs text-[#C0AA7F]">
                                      {linkedCitizen?.portraitData ? (
                                        <img src={linkedCitizen.portraitData} alt={linkedCitizen.name} className="h-full w-full object-cover" />
                                      ) : (
                                        (linkedCitizen?.name || rel.id).charAt(0)
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-white">
                                        {linkedCitizen ? linkedCitizen.name : rel.id}
                                        <span className="ml-2 text-[10px] font-mono text-[#C0AA7F]">({rel.id})</span>
                                      </div>
                                      <div className="text-[11px] text-indigo-300 font-semibold">
                                        {rel.type} {rel.notes ? <span className="text-slate-400 font-normal">· {rel.notes}</span> : null}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickLookup(rel.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#293B4A] hover:bg-[#3E4F5D] text-xs font-bold text-[#D3C9B5] flex items-center gap-1"
                                  >
                                    Inspect <ArrowRight size={12} />
                                  </button>
                                </div>
                              );
                            })}

                            {(!activePerson.relationshipIds || activePerson.relationshipIds.length === 0) && (
                              <div className="text-xs text-slate-400 py-4 text-center">
                                No structured relationship links recorded yet. Use the form on the right to link another citizen.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Link New Relationship Form */}
                        <div className="md:col-span-5 bg-[#18212B] border border-[#2F3C46] rounded-xl p-4">
                          <form onSubmit={handleLinkRelationship} className="space-y-3">
                            <fieldset className="space-y-3">
                              <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] flex items-center gap-1.5 mb-1">
                                <Link2 size={14} /> Link Citizen Relationship
                              </legend>

                              <div>
                                <label htmlFor="rel-target-select" className="block text-[11px] font-semibold text-slate-300 mb-1">
                                  Target Citizen (MAID Registry)
                                </label>
                                <select
                                  id="rel-target-select"
                                  value={relTargetMaid}
                                  onChange={(e) => setRelTargetMaid(e.target.value)}
                                  required
                                  className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                                >
                                  <option value="">Select a citizen to link...</option>
                                  {persons
                                    .filter(p => p.id !== activePerson.id)
                                    .map(p => (
                                      <option key={p.id} value={p.maid || p.legacyRecord}>
                                        {p.name} ({p.maid || p.legacyRecord})
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div>
                                <label htmlFor="rel-type-select" className="block text-[11px] font-semibold text-slate-300 mb-1">
                                  Relationship Classification
                                </label>
                                <select
                                  id="rel-type-select"
                                  value={relType}
                                  onChange={(e) => setRelType(e.target.value)}
                                  className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                                >
                                  <option value="Research Partner">Research Partner (Cyacademy)</option>
                                  <option value="Attending Clinician">Attending Clinician (Faith Medical)</option>
                                  <option value="Patient">Patient (Faith Medical)</option>
                                  <option value="Forensic Colleague">Forensic Colleague (DGAOS / TRACE)</option>
                                  <option value="Investigative Subject">Investigative Subject (DGAOS)</option>
                                  <option value="Family / Kin">Family / Kin</option>
                                  <option value="Housing Neighbor">Housing Neighbor</option>
                                  <option value="Mentor / Advisor">Mentor / Advisor</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="rel-notes-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
                                  Contextual Notes
                                </label>
                                <input
                                  id="rel-notes-input"
                                  type="text"
                                  value={relNotes}
                                  onChange={(e) => setRelNotes(e.target.value)}
                                  placeholder="e.g. Vector Housing Suite 4B / Joint Case"
                                  className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] text-[#18212B] font-bold text-xs shadow transition cursor-pointer"
                              >
                                Establish Bidirectional Link
                              </button>
                            </fieldset>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOSSIER SECTION 5: OFFICIAL DOCUMENTS SUITE */}
                  {dossierSection === 'documents' && (
                    <div className="p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18212B] border border-[#2F3C46] rounded-xl p-4">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                            Sovereign 9-Document Packet & Official Credentials
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            All 9 official documents dynamically bind to <strong className="text-white">{activePerson.name}</strong> (<code className="text-[#D3C9B5]">{activePerson.maid || activePerson.legacyRecord}</code>).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickExportAllNine(activePerson)}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] text-[#18212B] px-4 py-2 text-xs font-bold shadow cursor-pointer"
                        >
                          <Download size={14} /> Export Complete 9-Document Packet
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {OFFICIAL_DOC_CARDS.map((doc) => (
                          <div key={doc.id} className={`rounded-xl border p-3.5 flex flex-col justify-between space-y-3 ${doc.color}`}>
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-80">
                                <span>DOC 0{doc.id}</span>
                                <span>{doc.category}</span>
                              </div>
                              <div className="text-xs font-bold text-white mt-1">{doc.title}</div>
                              <div className="text-[11px] opacity-85">{doc.subtitle}</div>
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => openCitizenInApp(activePerson.maid || activePerson.legacyRecord, 'documentStudio', { targetDocId: doc.id, sourceApp: 'meridionRegistry' })}
                                className="flex-1 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-[11px] font-semibold transition flex items-center justify-center gap-1"
                              >
                                <Eye size={12} /> Preview in Studio
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickIssueDocument(activePerson, doc.id, doc.title)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition"
                                title="Issue & Download HTML"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Issued Snapshots History */}
                      <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F]">
                          Issued Document Snapshot Ledger ({activeIssuedDocs.length})
                        </h4>
                        {activeIssuedDocs.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {activeIssuedDocs.map((snap) => (
                              <div key={snap.id} className="flex items-center justify-between text-xs bg-[#1F282F] border border-[#34434F] rounded-lg px-3 py-2 font-mono">
                                <span className="text-white font-semibold">{snap.documentType}</span>
                                <span className="text-slate-400 text-[11px]">{new Date(snap.issuedAt).toLocaleString()}</span>
                                <span className="text-emerald-400 text-[10px]">HASH: {snap.hash}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">
                            No document snapshots logged for this citizen yet. Click any document above to issue and log a snapshot.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DOSSIER SECTION 6: INLINE PROFILE EDITOR (IMMUTABLE MAID) */}
                  {dossierSection === 'edit' && (
                    <form onSubmit={handleSaveInlineProfile} className="p-6 space-y-5">
                      <fieldset className="space-y-4">
                        <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] flex items-center gap-2">
                          <Lock size={14} /> Edit Citizen Attributes (MAID & Registration Region Permanently Locked)
                        </legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#151B1F] border border-[#34434F] rounded-xl p-3.5 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Immutable Official MAID</span>
                            <strong className="font-mono text-[#D3C9B5]">{activePerson.maid || 'PENDING'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Registration Region Code</span>
                            <strong className="font-mono text-emerald-400">{activePerson.registrationRegionCode || 'OR'} (Orynvell)</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Permanent Legacy Alias</span>
                            <strong className="font-mono text-indigo-300">{activePerson.legacyAliases?.join(', ') || activePerson.legacyRecord}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="edit-occupation" className="block text-xs font-semibold text-slate-300 mb-1">Occupation / Role</label>
                            <input
                              id="edit-occupation"
                              type="text"
                              value={editDraft.occupation || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, occupation: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-affiliation" className="block text-xs font-semibold text-slate-300 mb-1">Institutional Affiliation</label>
                            <input
                              id="edit-affiliation"
                              type="text"
                              value={editDraft.affiliation || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, affiliation: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-clearance" className="block text-xs font-semibold text-slate-300 mb-1">Clearance Level</label>
                            <input
                              id="edit-clearance"
                              type="text"
                              value={editDraft.clearance || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, clearance: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-housing" className="block text-xs font-semibold text-slate-300 mb-1">Housing / Domicile Assignment</label>
                            <input
                              id="edit-housing"
                              type="text"
                              value={editDraft.residency || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, residency: e.target.value, household: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-medical" className="block text-xs font-semibold text-slate-300 mb-1">Faith Medical Summary</label>
                            <input
                              id="edit-medical"
                              type="text"
                              value={editDraft.medical || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, medical: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-status" className="block text-xs font-semibold text-slate-300 mb-1">Civic Status</label>
                            <input
                              id="edit-status"
                              type="text"
                              value={editDraft.status || ''}
                              onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                              className="w-full rounded-lg bg-[#18212B] border border-[#3A4958] px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setDossierSection('overview')}
                            className="px-4 py-2 rounded-xl bg-[#27323B] text-slate-300 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] text-[#18212B] text-xs font-bold shadow cursor-pointer"
                          >
                            Save Canonical Updates
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 2: ADD PERSON (CHARACTER GENERATOR & MANUAL IDENTITY STUDIO)
             ===================================================================== */}
          {activeTab === 'add' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-[#212A32] border border-[#3A4958] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#34434F] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                      <UserPlus size={20} className="text-[#C0AA7F]" /> Add Person — Character Generator & Sovereign Identity Studio
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Generate an archetype-calibrated citizen or customize every biometric, lineage, and institutional trait before permanent <code className="text-[#D3C9B5]">MAID-OR-XXXXXXXX</code> issuance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRerollCharacter}
                      className="flex items-center gap-1.5 rounded-xl bg-[#293B4A] hover:bg-[#3E4F5D] border border-[#C0AA7F]/40 px-3.5 py-2 text-xs font-bold text-[#D3C9B5] transition cursor-pointer"
                    >
                      <Sparkles size={14} /> Generate Archetype Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortraitModalTarget('add')}
                      className="flex items-center gap-1.5 rounded-xl bg-[#344959] hover:bg-[#536A7D] border border-[#627D91] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <Camera size={14} className="text-[#C0AA7F]" /> Portrait Studio
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                <div aria-live="assertive">
                  {formError && (
                    <div role="alert" className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3.5 text-xs text-rose-200 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddPersonSubmit} className="space-y-6">
                  {/* FIELDSET 0: ARCHETYPE RADIO SELECTION (< 6 mutually exclusive options per modern-web-guidance forms) */}
                  <fieldset className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-3">
                    <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] px-1">
                      1. Select Character Generator Archetype (5 Institutional Presets)
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {ARCHETYPE_OPTIONS.map((opt) => {
                        const checked = selectedArchetype === opt.id;
                        const radioId = `archetype-radio-${opt.id}`;
                        return (
                          <label
                            key={opt.id}
                            htmlFor={radioId}
                            className={`cursor-pointer rounded-xl border p-3 transition flex flex-col justify-between ${
                              checked
                                ? 'bg-[#2C3841] border-[#C0AA7F] shadow-md'
                                : 'bg-[#1D252B] border-[#313F4A] hover:border-[#52677B]'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <input
                                  id={radioId}
                                  type="radio"
                                  name="characterArchetype"
                                  value={opt.id}
                                  checked={checked}
                                  onChange={() => handleArchetypeChange(opt.id)}
                                  className="accent-[#C0AA7F]"
                                />
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/30 text-[#D3C9B5]">
                                  {opt.badge}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-white pt-1">{opt.label}</div>
                              <p className="text-[10px] text-slate-400 leading-snug">{opt.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* FIELDSET 1: CORE IDENTITY & SOVEREIGN REGISTRATION */}
                  <fieldset className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-4">
                    <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] px-1">
                      2. Core Identity, Registration Region & Housing Coordinates
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="add-name" className="block text-xs font-semibold text-slate-200 mb-1">
                          Full Legal Name *
                        </label>
                        <input
                          id="add-name"
                          type="text"
                          required
                          aria-describedby="add-name-help"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                        />
                        <span id="add-name-help" className="text-[10px] text-slate-400">Primary legal name on Citizen ID & Passport.</span>
                      </div>

                      <div>
                        <label htmlFor="add-region" className="block text-xs font-semibold text-slate-200 mb-1">
                          Initial Registration Region *
                        </label>
                        <select
                          id="add-region"
                          aria-describedby="add-region-help"
                          value={formData.registrationRegion}
                          onChange={(e) => setFormData({ ...formData, registrationRegion: e.target.value as any })}
                          className="w-full rounded-lg bg-[#1F282F] border border-emerald-500/50 px-3 py-2 text-xs text-emerald-300 font-semibold focus:outline-none"
                        >
                          <option value="Orynvell">Orynvell (Code: OR — Confirmed)</option>
                        </select>
                        <span id="add-region-help" className="text-[10px] text-emerald-400/90">Issues permanent MAID-OR-XXXXXXXX.</span>
                      </div>

                      <div>
                        <label htmlFor="add-dob" className="block text-xs font-semibold text-slate-200 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          id="add-dob"
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-place" className="block text-xs font-semibold text-slate-200 mb-1">
                          Place of Birth
                        </label>
                        <input
                          id="add-place"
                          type="text"
                          value={formData.place}
                          onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-home" className="block text-xs font-semibold text-slate-200 mb-1">
                          Current Residence City
                        </label>
                        <input
                          id="add-home"
                          type="text"
                          value={formData.home}
                          onChange={(e) => setFormData({ ...formData, home: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-housing" className="block text-xs font-semibold text-slate-200 mb-1">
                          Assigned Housing Unit
                        </label>
                        <input
                          id="add-housing"
                          type="text"
                          value={formData.residency || ''}
                          onChange={(e) => setFormData({ ...formData, residency: e.target.value, household: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C0AA7F]"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* FIELDSET 2: SPECIES, ANCESTRY & RESONANCE */}
                  <fieldset className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-4">
                    <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] px-1">
                      3. Lineage, Species & PRISM Resonance
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="add-species" className="block text-xs font-semibold text-slate-200 mb-1">
                          Species
                        </label>
                        <input
                          id="add-species"
                          type="text"
                          value={formData.species}
                          onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-ancestry" className="block text-xs font-semibold text-slate-200 mb-1">
                          Ancestry / Bloodline
                        </label>
                        <input
                          id="add-ancestry"
                          type="text"
                          value={formData.ancestry}
                          onChange={(e) => setFormData({ ...formData, ancestry: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-affinity" className="block text-xs font-semibold text-slate-200 mb-1">
                          Spectrum Affinity
                        </label>
                        <input
                          id="add-affinity"
                          type="text"
                          value={formData.affinity}
                          onChange={(e) => setFormData({ ...formData, affinity: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="add-abilities" className="block text-xs font-semibold text-slate-200 mb-1">
                          Abilities & Resonance Signatures
                        </label>
                        <input
                          id="add-abilities"
                          type="text"
                          value={formData.abilities}
                          onChange={(e) => setFormData({ ...formData, abilities: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-powersource" className="block text-xs font-semibold text-slate-200 mb-1">
                          Power Source
                        </label>
                        <input
                          id="add-powersource"
                          type="text"
                          value={formData.powerSource}
                          onChange={(e) => setFormData({ ...formData, powerSource: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* FIELDSET 3: BIOMETRICS, PORTRAIT & LIVE 10-PRINT PREVIEW */}
                  <fieldset className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-4">
                    <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] px-1">
                      4. Portrait Synthesis, Physical Biometrics & 10-Print Dermal Matrix
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Portrait Preview Box */}
                      <div className="md:col-span-3 flex flex-col items-center bg-[#1F282F] border border-[#3A4958] rounded-xl p-3 space-y-2">
                        <div className="h-28 w-24 rounded-xl overflow-hidden border-2 border-[#C0AA7F] bg-[#12171C]">
                          {formData.portraitData ? (
                            <img src={formData.portraitData} alt="Citizen Portrait Preview" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex gap-1.5 w-full">
                          <button
                            type="button"
                            onClick={handleRegenerateDraftPortrait}
                            className="flex-1 py-1.5 rounded-lg bg-[#2C3841] hover:bg-[#3A4A58] text-[10px] font-bold text-[#D3C9B5] transition"
                          >
                            Re-Roll SVG
                          </button>
                          <button
                            type="button"
                            onClick={() => setPortraitModalTarget('add')}
                            className="flex-1 py-1.5 rounded-lg bg-[#344959] hover:bg-[#536A7D] text-[10px] font-bold text-white transition"
                          >
                            Studio
                          </button>
                        </div>
                      </div>

                      {/* Physical Biometric Inputs */}
                      <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="add-height" className="block text-xs font-semibold text-slate-200 mb-1">Height</label>
                          <input
                            id="add-height"
                            type="text"
                            value={formData.height || ''}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="add-build" className="block text-xs font-semibold text-slate-200 mb-1">Build</label>
                          <input
                            id="add-build"
                            type="text"
                            value={formData.build || ''}
                            onChange={(e) => setFormData({ ...formData, build: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="add-blood" className="block text-xs font-semibold text-slate-200 mb-1">Blood & Aura Type</label>
                          <input
                            id="add-blood"
                            type="text"
                            value={formData.blood || ''}
                            onChange={(e) => setFormData({ ...formData, blood: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="add-eyes" className="block text-xs font-semibold text-slate-200 mb-1">Eye Color</label>
                          <input
                            id="add-eyes"
                            type="text"
                            value={formData.eyes || ''}
                            onChange={(e) => setFormData({ ...formData, eyes: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="add-hair" className="block text-xs font-semibold text-slate-200 mb-1">Hair Color</label>
                          <input
                            id="add-hair"
                            type="text"
                            value={formData.hair || ''}
                            onChange={(e) => setFormData({ ...formData, hair: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="add-mark" className="block text-xs font-semibold text-slate-200 mb-1">Distinguishing Mark</label>
                          <input
                            id="add-mark"
                            type="text"
                            value={formData.mark || ''}
                            onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                            className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Compact 5-Finger Preview Strip */}
                    <div className="pt-2 border-t border-[#2C3742] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>Pre-Registration 10-Print Henry Vector:</span>
                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {draftTenPrints.slice(0, 5).map(fp => (
                          <span key={fp.fingerIndex} className="px-2 py-0.5 rounded bg-[#1F282F] border border-[#34434F] text-indigo-300">
                            {fp.label}: {fp.pattern} ({fp.henryCode})
                          </span>
                        ))}
                      </div>
                    </div>
                  </fieldset>

                  {/* FIELDSET 4: INSTITUTIONAL AFFILIATION & RELATIONSHIP LINKING */}
                  <fieldset className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-4 space-y-4">
                    <legend className="text-xs font-bold uppercase tracking-wider text-[#C0AA7F] px-1">
                      5. Cross-Application Institutional Assignment & Initial Relationship
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="add-affiliation" className="block text-xs font-semibold text-slate-200 mb-1">
                          Primary Institution
                        </label>
                        <input
                          id="add-affiliation"
                          type="text"
                          value={formData.affiliation || ''}
                          onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="add-occupation" className="block text-xs font-semibold text-slate-200 mb-1">
                          Occupation / Assignment
                        </label>
                        <input
                          id="add-occupation"
                          type="text"
                          value={formData.occupation || ''}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="add-clearance" className="block text-xs font-semibold text-slate-200 mb-1">
                          Clearance Level
                        </label>
                        <input
                          id="add-clearance"
                          type="text"
                          value={formData.clearance || ''}
                          onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-medical" className="block text-xs font-semibold text-slate-200 mb-1">
                          Faith Medical Intake Baseline
                        </label>
                        <input
                          id="add-medical"
                          type="text"
                          value={formData.medical || ''}
                          onChange={(e) => setFormData({ ...formData, medical: e.target.value })}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="add-rel-target" className="block text-xs font-semibold text-slate-200 mb-1">
                          Link to Existing Citizen (Optional)
                        </label>
                        <select
                          id="add-rel-target"
                          value={initialRelTarget}
                          onChange={(e) => setInitialRelTarget(e.target.value)}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        >
                          <option value="">None — Independent Entry</option>
                          {persons.map(p => (
                            <option key={p.id} value={p.maid || p.legacyRecord}>
                              {p.name} ({p.maid || p.legacyRecord})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="add-rel-type" className="block text-xs font-semibold text-slate-200 mb-1">
                          Relationship Role
                        </label>
                        <select
                          id="add-rel-type"
                          value={initialRelType}
                          onChange={(e) => setInitialRelType(e.target.value)}
                          className="w-full rounded-lg bg-[#1F282F] border border-[#3A4958] px-3 py-2 text-xs text-white"
                        >
                          <option value="Colleague">Colleague</option>
                          <option value="Research Partner">Research Partner</option>
                          <option value="Attending Physician">Attending Physician</option>
                          <option value="Patient">Patient</option>
                          <option value="Family / Kin">Family / Kin</option>
                          <option value="Housing Neighbor">Housing Neighbor</option>
                          <option value="Investigative Subject">Investigative Subject</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  {/* Submit Action Bar */}
                  <div className="flex items-center justify-between bg-[#151B1F] border border-[#415361] rounded-xl p-4">
                    <div className="text-xs text-slate-300">
                      <strong className="text-[#D3C9B5] block">Permanent Atomic Issuance</strong>
                      Upon registration, the next sequential <code className="text-emerald-400">MAID-OR-XXXXXXXX</code> number is permanently bound to this citizen across all MiraverseOSx applications.
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-[#C0AA7F] to-[#A7B8C6] hover:from-[#D4BC8B] hover:to-[#A9B8C5] text-[#18212B] px-6 py-3 text-xs font-bold shadow-lg transition cursor-pointer shrink-0"
                    >
                      Register Citizen & Issue Permanent MAID
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: CROSS-APPLICATION ECOSYSTEM CONNECTIONS
             ===================================================================== */}
          {activeTab === 'ecosystem' && (
            <div className="max-w-5xl mx-auto space-y-5">
              <div className="bg-[#212A32] border border-[#3A4958] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#34434F] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                      <Layers size={20} className="text-[#C0AA7F]" /> Cross-Application Citizen Record Architecture
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every application in MiraverseOSx reads and updates the same canonical <code className="text-[#D3C9B5]">miraverse-canonical-identities-v1</code> store via <code className="text-indigo-300">CitizenBridge</code>.
                    </p>
                  </div>
                  {activePerson && (
                    <div className="bg-[#151B1F] border border-[#415361] rounded-xl px-4 py-2 text-xs">
                      <span className="text-slate-400">Active Context Citizen: </span>
                      <strong className="text-white">{activePerson.name}</strong>{' '}
                      <span className="font-mono text-[#D3C9B5]">({activePerson.maid || activePerson.legacyRecord})</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      appId: 'jobs' as const,
                      title: 'Faith Medical Group (MEDSTAT & WORKNET)',
                      badge: 'CLINICAL & BIO-AURA',
                      icon: HeartPulse,
                      color: 'border-teal-500/40',
                      desc: 'Accesses canonical MAID records for patient triage, Veilwilt stabilization, blood/aura baselines, and DGA MEDSTAT forensic medical charts. Clinical updates write directly back to the citizen’s MAID medical summary.',
                      docId: 8,
                      docLabel: 'Medical Summary (Doc 8)'
                    },
                    {
                      appId: 'passport' as const,
                      title: 'Cyacademy & Housing (MIRROR & HOMECRAFT)',
                      badge: 'ACADEMIC & HOUSING',
                      icon: GraduationCap,
                      color: 'border-indigo-500/40',
                      desc: 'Synchronizes student and faculty enrollment, 9 core skills, housing assignments (Vector Housing Suite 4B), and academic service records with the canonical MAID profile.',
                      docId: 9,
                      docLabel: 'Education & Service (Doc 9)'
                    },
                    {
                      appId: 'dgaos' as const,
                      title: 'DGAOS Command Center & TRACE Forensics',
                      badge: 'AGENCY & FORENSICS',
                      icon: Shield,
                      color: 'border-rose-500/40',
                      desc: 'Resolves both official MAID numbers and legacy MRD aliases across 31 investigative records, 10-print AFIS dermal comparison stations, and hybrid forensic findings transmissions.',
                      docId: 5,
                      docLabel: 'Investigative Profile (Doc 5)'
                    },
                    {
                      appId: 'documentStudio' as const,
                      title: 'Official Document Studio (9-Document Suite)',
                      badge: 'SOVEREIGN PAPERWORK',
                      icon: FileText,
                      color: 'border-amber-500/40',
                      desc: 'Generates printable HTML/PDF Citizen IDs, Passports, Birth Certificates, 10-Print Biometrics, Residency Records, Medical Summaries, and Investigative Dossiers with immutable snapshot hashes.',
                      docId: 1,
                      docLabel: 'Aura Citizen ID (Doc 1)'
                    }
                  ].map((item) => {
                    const Icon = item.icon;
                    const targetCitizenId = activePerson?.maid || activePerson?.legacyRecord || 'MAID-OR-00481926';
                    return (
                      <div key={item.title} className={`bg-[#18212B] border ${item.color} rounded-2xl p-5 flex flex-col justify-between space-y-4`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <Icon size={17} className="text-[#C0AA7F]" /> {item.title}
                            </span>
                            <span className="text-[10px] font-mono bg-white/10 text-[#D3C9B5] px-2 py-0.5 rounded">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#2C3742]">
                          <button
                            type="button"
                            onClick={() => openCitizenInApp(targetCitizenId, item.appId, { sourceApp: 'meridionRegistry' })}
                            className="flex-1 py-2 rounded-xl bg-[#2C3841] hover:bg-[#3A4A58] border border-[#C0AA7F]/40 text-xs font-bold text-[#D3C9B5] transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Launch Application <ExternalLink size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openCitizenInApp(targetCitizenId, 'documentStudio', { targetDocId: item.docId, sourceApp: 'meridionRegistry' })}
                            className="px-3 py-2 rounded-xl bg-[#1F282F] hover:bg-[#2A353E] border border-[#3A4958] text-xs font-semibold text-slate-200 transition cursor-pointer"
                          >
                            {item.docLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: MIGRATION & LEDGER INTEGRITY
             ===================================================================== */}
          {activeTab === 'migration' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="bg-[#212A32] border border-[#3A4958] rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <Database size={18} className="text-[#C0AA7F]" /> Non-Destructive Legacy MRD Migration & MAID Ledger
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All legacy <code className="text-indigo-300">MRD-XXXX-XXX</code> records are preserved as permanent searchable aliases. Only records with confirmed Orynvell (<code className="text-emerald-300">OR</code>) registration receive automatic <code className="text-[#D3C9B5]">MAID-OR-XXXXXXXX</code> numbers; unconfirmed records remain safely queued for manual region confirmation.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase">Total Canonical</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">{persons.length}</div>
                  </div>
                  <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase">Active MAID-OR</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                      {persons.filter(p => p.maidStatus === 'active').length}
                    </div>
                  </div>
                  <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase">Pending Region</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                      {persons.filter(p => p.maidStatus === 'pending_migration').length}
                    </div>
                  </div>
                  <div className="bg-[#18212B] border border-[#2F3C46] rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase">Backup Verified</div>
                    <div className="text-lg font-bold text-indigo-300 font-mono mt-1">
                      {migrationStats?.backupCreated ? 'CREATED' : 'INTACT'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Integrated Portrait Studio Modal (Supports both Add Person draft and Active Dossier citizen) */}
      {portraitModalTarget && (
        <PortraitStudioModal
          citizen={
            portraitModalTarget === 'add'
              ? {
                  name: formData.name || 'New Citizen',
                  species: formData.species,
                  ancestry: formData.ancestry,
                  eyes: formData.eyes || 'Luminous Hazel',
                  hair: formData.hair || 'Silver-Black',
                  build: formData.build || 'Medium',
                  height: formData.height,
                  mark: formData.mark,
                  home: formData.home,
                  affinity: formData.affinity,
                  powerSource: formData.powerSource,
                  category: formData.category || 'Citizen',
                  dob: formData.dob,
                  record: 'DRAFT-PORTRAIT',
                  portraitData: formData.portraitData
                }
              : {
                  name: activePerson?.name || 'Citizen',
                  species: activePerson?.species || 'Humanoid',
                  ancestry: activePerson?.ancestry || 'Orynvell',
                  eyes: activePerson?.eyes || 'Luminous Hazel',
                  hair: activePerson?.hair || 'Silver-Black',
                  build: activePerson?.build || 'Medium',
                  height: activePerson?.height,
                  mark: activePerson?.mark,
                  home: activePerson?.home || 'Aureline, Orynvell',
                  affinity: activePerson?.affinity || 'Aether',
                  powerSource: activePerson?.powerSource || 'Aether',
                  category: activePerson?.category || 'Citizen',
                  dob: activePerson?.dob,
                  record: activePerson?.maid || activePerson?.legacyRecord || 'MAID-OR-00481926',
                  portraitData: activePerson?.portraitData
                }
          }
          isOpen={true}
          onClose={() => setPortraitModalTarget(null)}
          onPortraitSaved={async (newUri) => {
            if (portraitModalTarget === 'add') {
              setFormData(prev => ({ ...prev, portraitData: newUri }));
              showBanner('Custom portrait applied to new citizen draft.');
            } else if (activePerson) {
              const idKey = activePerson.maid || activePerson.id;
              persistCitizenPortrait(idKey, newUri);
              await MaidIdentityService.updatePerson(idKey, { portraitData: newUri });
              await loadData(idKey);
              showBanner(`Saved new portrait to ${activePerson.name}'s canonical MAID profile.`);
            }
          }}
        />
      )}
    </div>
  );
}
