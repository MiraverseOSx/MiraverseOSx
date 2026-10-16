import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Users, FileText, Sparkles, Shield, AlertCircle, 
  CheckCircle2, Copy, Check, Clock, ChevronRight, Lock, RefreshCw, ExternalLink
} from 'lucide-react';
import { 
  MaidIdentityService, 
  type CanonicalPerson, 
  type LookupResult, 
  validateMaidFormat 
} from '../services/maidIdentityService';
import { useOSStore } from '../store/useOSStore';
import PortraitStudioModal from '../components/portrait/PortraitStudioModal';

type RegistryTab = 'lookup' | 'add' | 'roster' | 'legacy_generator';

export default function RegistryWorkspaceApp() {
  const [activeTab, setActiveTab] = useState<RegistryTab>('lookup');
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [allPersons, setAllPersons] = useState<CanonicalPerson[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  // Portrait Studio integration state
  const [portraitCitizen, setPortraitCitizen] = useState<CanonicalPerson | null>(null);
  const [isPortraitOpen, setIsPortraitOpen] = useState(false);

  // Add Person form state
  const [formData, setFormData] = useState({
    name: '',
    registrationRegion: 'OR' as const,
    dob: '2001-05-14',
    place: 'Aureline, Orynvell',
    home: 'Aureline, Orynvell',
    species: 'Luminari',
    ancestry: 'Lightborn · Seraphima Lineage',
    abilities: 'Solar illumination, photon constructs, resonance shielding',
    powerSource: 'PRISM resonance',
    affinity: 'Gold · wealth / commerce / influence',
    category: 'Everyday civilian',
    occupation: 'Civic Archivist',
    clearance: 'General civic access',
    storyMode: 'Ordinary & Believable'
  });

  const [addPersonNotice, setAddPersonNotice] = useState<string | null>(null);
  const toggleApp = useOSStore((s) => s.toggleApp);

  const loadData = async () => {
    const list = await MaidIdentityService.getAllPersons();
    setAllPersons(list);
  };

  useEffect(() => {
    loadData();

    // Cross-tab / iframe sync
    const onMessage = (e: MessageEvent) => {
      if (e.data?.source === 'meridion-registry' && e.data?.type === 'citizens-changed') {
        loadData();
      }
      if (e.data?.source === 'meridion-registry' && e.data?.type === 'open-app' && e.data?.appId) {
        toggleApp(e.data.appId);
      }
    };
    window.addEventListener('message', onMessage);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const result = await MaidIdentityService.lookupPerson(searchQuery);
    setLookupResult(result);
    setIsSearching(false);
  };

  const handleQuickLookup = async (idOrMaid: string) => {
    setSearchQuery(idOrMaid);
    setIsSearching(true);
    const result = await MaidIdentityService.lookupPerson(idOrMaid);
    setLookupResult(result);
    setIsSearching(false);
    setActiveTab('lookup');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAddPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a citizen name.');
      return;
    }

    const res = await MaidIdentityService.addPerson(formData);
    if (res.success && res.person) {
      setAddPersonNotice(`Official identity created! Permanent MAID issued: ${res.person.maid}`);
      await loadData();
      // Jump to lookup view displaying the newly created citizen
      setSearchQuery(res.person.maid || res.person.legacyRecord);
      setLookupResult({
        status: 'found',
        person: res.person,
        matchedBy: 'maid',
        matchedQuery: res.person.maid || ''
      });
      setActiveTab('lookup');
      setTimeout(() => setAddPersonNotice(null), 5000);
    } else {
      alert(res.error || 'Failed to issue MAID identity.');
    }
  };

  const handleConfirmPendingRegistration = async (personId: string) => {
    const res = await MaidIdentityService.confirmPendingRegistration(personId, 'OR');
    if (res.success && res.person) {
      await loadData();
      setLookupResult({
        status: 'found',
        person: res.person,
        matchedBy: 'maid',
        matchedQuery: res.person.maid || ''
      });
      alert(`Orynvell registration confirmed! Official permanent MAID allocated: ${res.person.maid}`);
    } else {
      alert(res.error || 'Could not confirm registration.');
    }
  };

  const handleRunMigration = async () => {
    const res = await MaidIdentityService.migrateLegacyRegistry();
    await loadData();
    setMigrationStatus(
      `Migration complete: ${res.migratedCount} active MAIDs issued, ${res.pendingCount} pending region confirmation, ${res.alreadyMigratedCount} already canonical.`
    );
    setTimeout(() => setMigrationStatus(null), 5000);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#F8F6FC] text-[#25283C] font-sans select-none overflow-hidden">
      
      {/* Top Application Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-[#E2DCEF] bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C5FAC] to-[#2C2849] text-white shadow">
            <Shield size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-[#2C2849] font-serif">MERIDION IDENTITY REGISTRY</h1>
              <span className="rounded bg-[#6C5FAC]/10 px-2 py-0.5 text-[10px] font-bold text-[#6C5FAC] border border-[#6C5FAC]/20 uppercase">
                Official MAID Registry
              </span>
            </div>
            <p className="text-[11px] text-[#69758A]">
              Authoritative citizen identity archive · Permanent MAID allocation &amp; legacy alias resolution
            </p>
          </div>
        </div>

        {/* Global Toolbar Shortcuts */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => toggleApp('documentStudio')}
            className="flex items-center gap-1.5 rounded-md bg-[#2C2849] hover:bg-[#3E3866] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition"
          >
            <FileText size={13} className="text-[#C5AB78]" />
            Document Studio (9 Documents)
          </button>
        </div>
      </header>

      {/* Migration / Add Notice Banner */}
      {addPersonNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-5 py-2 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>{addPersonNotice}</span>
        </div>
      )}
      {migrationStatus && (
        <div className="bg-purple-50 border-b border-purple-200 text-purple-900 px-5 py-2 text-xs font-semibold flex items-center gap-2">
          <Clock size={14} className="text-purple-600" />
          <span>{migrationStatus}</span>
        </div>
      )}

      {/* Workflow Tabs Rail */}
      <nav className="flex border-b border-[#E2DCEF] bg-[#F1EDF8] px-5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('lookup')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'lookup'
              ? 'border-[#6C5FAC] text-[#2C2849] bg-white'
              : 'border-transparent text-[#69758A] hover:text-[#2C2849]'
          }`}
        >
          <Search size={14} />
          Look Up MAID
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'add'
              ? 'border-[#6C5FAC] text-[#2C2849] bg-white'
              : 'border-transparent text-[#69758A] hover:text-[#2C2849]'
          }`}
        >
          <UserPlus size={14} />
          Add Person
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'roster'
              ? 'border-[#6C5FAC] text-[#2C2849] bg-white'
              : 'border-transparent text-[#69758A] hover:text-[#2C2849]'
          }`}
        >
          <Users size={14} />
          Registry Network ({allPersons.length})
        </button>

        <button
          onClick={() => setActiveTab('legacy_generator')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'legacy_generator'
              ? 'border-[#6C5FAC] text-[#2C2849] bg-white'
              : 'border-transparent text-[#69758A] hover:text-[#2C2849]'
          }`}
        >
          <ExternalLink size={13} />
          Standalone Generator (Fixed)
        </button>
      </nav>

      {/* Main Content Areas */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        
        {/* WORKFLOW 1: LOOK UP MAID */}
        {activeTab === 'lookup' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3.5 text-[#8A95A5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter official MAID (e.g. MAID-OR-00481926), legacy alias (e.g. MRD-8492-319), or full name..."
                  className="w-full rounded-xl border border-[#D5CEE4] bg-white pl-10 pr-4 py-3 text-xs text-[#2C2849] shadow-sm focus:border-[#6C5FAC] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center gap-2 rounded-xl bg-[#2C2849] hover:bg-[#3E3866] text-white px-6 py-3 text-xs font-bold shadow transition"
              >
                {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                Search Registry
              </button>
            </form>

            {/* Quick Suggestions Strip */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#69758A]">
              <span className="font-semibold text-[#2C2849]">Sample Records:</span>
              {allPersons.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLookup(p.maid || p.legacyRecord)}
                  className="rounded-md bg-white border border-[#D5CEE4] px-2 py-0.5 hover:border-[#6C5FAC] hover:text-[#6C5FAC] transition"
                >
                  {p.name} ({p.maid ? p.maid.substring(0, 13) + '…' : p.legacyRecord})
                </button>
              ))}
            </div>

            {/* Lookup Result Display */}
            {lookupResult && (
              <div className="rounded-2xl border border-[#D5CEE4] bg-white p-6 shadow-md space-y-6">
                
                {/* Status: FOUND */}
                {lookupResult.status === 'found' && lookupResult.person && (
                  <div>
                    {/* Header Banner */}
                    <div className="flex flex-wrap items-start justify-between border-b border-[#EAE6F2] pb-4 mb-4 gap-4">
                      <div className="flex items-start gap-4">
                        {/* Citizen Portrait Frame */}
                        <div className="relative group w-20 h-24 rounded-lg border-2 border-[#C5AB78] overflow-hidden bg-[#FAF8F5] flex-shrink-0 shadow-sm">
                          {lookupResult.person.portraitData ? (
                            <img 
                              src={lookupResult.person.portraitData} 
                              alt={lookupResult.person.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#718096] text-[10px] text-center p-1 bg-slate-50 font-sans">
                              <span>NO PHOTO</span>
                              <span className="text-[8px] text-[#A0AEC0]">ON FILE</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setPortraitCitizen(lookupResult.person);
                              setIsPortraitOpen(true);
                            }}
                            className="absolute inset-0 bg-[#2C2849]/75 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold gap-1 p-1 text-center cursor-pointer"
                            title="Open Portrait Studio"
                          >
                            <Sparkles size={14} className="text-[#C5AB78]" />
                            <span>Edit Photo</span>
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold font-serif text-[#2C2849]">
                              {lookupResult.person.name}
                            </h2>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                              CANONICAL RECORD
                            </span>
                          </div>
                          <div className="text-xs text-[#69758A] mt-1">
                            Matched via <strong className="text-[#2C2849] uppercase">{lookupResult.matchedBy}</strong> ({lookupResult.matchedQuery})
                          </div>
                        </div>
                      </div>

                      {/* Official MAID Card */}
                      <div className="rounded-xl border-2 border-[#C5AB78] bg-[#FAF8F5] p-3 text-right">
                        <div className="text-[9px] font-bold tracking-widest text-[#8C7541] uppercase">Official Permanent Identifier</div>
                        <div className="flex items-center justify-end gap-2 font-mono text-base font-extrabold text-[#2C2849]">
                          <span>{lookupResult.person.maid}</span>
                          <button
                            onClick={() => handleCopy(lookupResult.person!.maid!)}
                            className="text-[#6C5FAC] hover:text-[#2C2849]"
                            title="Copy MAID"
                          >
                            {copiedText === lookupResult.person.maid ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-[10px] text-[#8C7541] font-semibold mt-0.5">
                          Initial Registration: <strong>{lookupResult.person.registrationRegionCode === 'OR' ? 'Orynvell (OR)' : 'Unconfirmed'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Legacy Aliases Callout */}
                    <div className="mb-5 rounded-lg border border-[#E2DCEF] bg-[#F9F7FC] p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#6C5FAC]">Permanent Legacy Search Aliases:</span>
                        <div className="flex gap-1.5 font-mono">
                          {lookupResult.person.legacyAliases.map((alias) => (
                            <span key={alias} className="rounded bg-white border border-[#D5CEE4] px-2 py-0.5 text-[11px] font-semibold text-[#2C2849]">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#8A95A5]">Searchable forever</span>
                    </div>

                    {/* Person Attributes Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Date of Birth</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.dob}</strong>
                      </div>
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Place of Birth</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.place}</strong>
                      </div>
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Current Residence</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.home}</strong>
                      </div>
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Species / Kind</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.species}</strong>
                      </div>
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Ancestral Lineage</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.ancestry}</strong>
                      </div>
                      <div>
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">PRISM Affinity</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.affinity}</strong>
                      </div>
                      <div className="col-span-full">
                        <span className="text-[#69758A] text-[10px] uppercase font-bold block">Abilities / Powers</span>
                        <strong className="text-[#2C2849]">{lookupResult.person.abilities}</strong>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 flex justify-end gap-3 border-t border-[#EAE6F2] pt-4">
                      <button
                        onClick={() => {
                          setPortraitCitizen(lookupResult.person);
                          setIsPortraitOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#C5AB78] text-[#8C7541] px-4 py-2 text-xs font-semibold shadow-sm transition"
                      >
                        <Sparkles size={14} className="text-[#C5AB78]" />
                        Portrait Studio
                      </button>
                      <button
                        onClick={() => toggleApp('documentStudio')}
                        className="flex items-center gap-1.5 rounded-lg bg-[#2C2849] hover:bg-[#3E3866] text-white px-4 py-2 text-xs font-semibold shadow transition"
                      >
                        <FileText size={14} className="text-[#C5AB78]" />
                        Generate Nine-Document Packet
                      </button>
                    </div>
                  </div>
                )}

                {/* Status: PENDING MIGRATION */}
                {lookupResult.status === 'pending_migration' && lookupResult.person && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-start gap-3">
                      <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-sm">Legacy Record Located: Pending Region Confirmation</h3>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          This record (<strong className="font-mono">{lookupResult.person.legacyRecord}</strong>) was imported from prior legacy registrations without an explicitly recorded Initial Registration Region.
                          Per non-negotiable directive, registration region is never derived from birthplace or residence.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#D5CEE4] p-4 bg-[#FAF9FD] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#2C2849]">{lookupResult.person.name}</div>
                        <div className="text-xs text-[#69758A]">Birthplace: {lookupResult.person.place} · Home: {lookupResult.person.home}</div>
                      </div>

                      <button
                        onClick={() => handleConfirmPendingRegistration(lookupResult.person!.id, 'OR')}
                        className="flex items-center gap-2 rounded-lg bg-[#6C5FAC] hover:bg-[#524484] text-white px-4 py-2 text-xs font-bold shadow transition"
                      >
                        <CheckCircle2 size={14} />
                        Confirm Initial Registration in Orynvell (OR) &amp; Issue MAID
                      </button>
                    </div>
                  </div>
                )}

                {/* Status: RESTRICTED */}
                {lookupResult.status === 'restricted' && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mx-auto">
                      <Lock size={24} />
                    </div>
                    <h3 className="font-bold text-base text-rose-950">Classification Restriction</h3>
                    <p className="text-xs text-rose-800 max-w-md mx-auto">
                      {lookupResult.message || 'Access to this record is restricted to authorized DGA investigators. Public civic index query withheld.'}
                    </p>
                  </div>
                )}

                {/* Status: NOT FOUND */}
                {lookupResult.status === 'not_found' && (
                  <div className="text-center py-8 text-[#69758A] space-y-2">
                    <AlertCircle size={32} className="mx-auto text-[#A5ADC0]" />
                    <h3 className="font-bold text-sm text-[#2C2849]">No Record Located</h3>
                    <p className="text-xs max-w-sm mx-auto">
                      {lookupResult.message || 'No citizen was found matching that search parameter.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WORKFLOW 2: ADD PERSON */}
        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-[#D5CEE4] bg-white p-6 shadow-md space-y-6">
            <div className="border-b border-[#EAE6F2] pb-3">
              <h2 className="text-base font-bold font-serif text-[#2C2849]">Official Person Registration</h2>
              <p className="text-xs text-[#69758A]">
                Establishes a new citizen identity and atomically allocates an official, permanent MAID.
              </p>
            </div>

            <form onSubmit={handleAddPersonSubmit} className="space-y-4 text-xs">
              
              {/* Name & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Citizen Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kieran Vesper"
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Initial Registration Region *
                  </label>
                  <select
                    value={formData.registrationRegion}
                    onChange={(e) => setFormData({ ...formData, registrationRegion: e.target.value as any })}
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none bg-white font-semibold"
                  >
                    <option value="OR">Orynvell (OR) · Authorized for MAID Issuance</option>
                  </select>
                  <span className="text-[10px] text-[#8C7541] mt-1 block">
                    ✦ Note: Non-OR regional codes require confirmation by Creative Director.
                  </span>
                </div>
              </div>

              {/* Birthplace & Residence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Place of Birth *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Current Home Region / Residence *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.home}
                    onChange={(e) => setFormData({ ...formData, home: e.target.value })}
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                  />
                </div>
              </div>

              {/* Species & Lineage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Species / Kind
                  </label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                    Ancestral Lineage
                  </label>
                  <input
                    type="text"
                    value={formData.ancestry}
                    onChange={(e) => setFormData({ ...formData, ancestry: e.target.value })}
                    className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                  />
                </div>
              </div>

              {/* Abilities */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A5568] uppercase mb-1">
                  Abilities &amp; Resonance Powers *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.abilities}
                  onChange={(e) => setFormData({ ...formData, abilities: e.target.value })}
                  className="w-full rounded-lg border border-[#D5CEE4] p-2.5 text-xs text-[#2C2849] focus:border-[#6C5FAC] focus:outline-none"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-[#EAE6F2] flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5FAC] to-[#2C2849] hover:from-[#7D6FBF] hover:to-[#3E3866] text-white px-6 py-3 text-xs font-bold shadow-md transition"
                >
                  <CheckCircle2 size={16} />
                  ✦ Register Person &amp; Issue Official MAID
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WORKFLOW 3: ROSTER / NETWORK */}
        {activeTab === 'roster' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-serif text-[#2C2849]">Canonical Citizen Network</h2>
                <p className="text-xs text-[#69758A]">
                  All officially registered persons and legacy aliases currently present in the durable registry.
                </p>
              </div>

              <button
                onClick={handleRunMigration}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-[#D5CEE4] px-3 py-1.5 text-xs font-semibold text-[#2C2849] hover:bg-[#F9F7FC] transition shadow-sm"
              >
                <RefreshCw size={12} />
                Run Legacy Migration Check
              </button>
            </div>

            {/* Roster Table */}
            <div className="rounded-xl border border-[#D5CEE4] bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9FD] border-b border-[#E2DCEF] text-[10px] font-bold text-[#69758A] uppercase">
                    <th className="py-3 px-4">Citizen Name</th>
                    <th className="py-3 px-4">Official MAID</th>
                    <th className="py-3 px-4">Initial Region</th>
                    <th className="py-3 px-4">Legacy Alias</th>
                    <th className="py-3 px-4">Species</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6F2]">
                  {allPersons.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF9FD] transition">
                      <td className="py-3 px-4 font-semibold text-[#2C2849]">{p.name}</td>
                      <td className="py-3 px-4 font-mono">
                        {p.maid ? (
                          <span className="font-bold text-[#6C5FAC]">{p.maid}</span>
                        ) : (
                          <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-semibold">Pending Confirmation</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">
                        {p.registrationRegionCode === 'OR' ? 'Orynvell (OR)' : 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#69758A]">
                        {p.legacyAliases.join(', ') || p.legacyRecord}
                      </td>
                      <td className="py-3 px-4 text-[#4A5568]">{p.species}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleQuickLookup(p.maid || p.legacyRecord)}
                          className="text-[#6C5FAC] hover:text-[#2C2849] font-bold text-[11px]"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORKFLOW 4: STANDALONE FIXED GENERATOR (IFRAME) */}
        {activeTab === 'legacy_generator' && (
          <div className="h-full w-full flex flex-col rounded-xl overflow-hidden border border-[#D5CEE4] bg-white">
            <iframe
              title="Meridion Standalone Generator"
              src="/registry.html"
              className="w-full flex-1 border-0"
            />
          </div>
        )}
      </main>

      {/* Integrated Portrait Studio Modal */}
      {portraitCitizen && (
        <PortraitStudioModal
          citizen={{
            ...portraitCitizen,
            record: portraitCitizen.maid || portraitCitizen.legacyRecord
          }}
          isOpen={isPortraitOpen}
          onClose={() => {
            setIsPortraitOpen(false);
            setPortraitCitizen(null);
          }}
          onPortraitSaved={async (newUri) => {
            if (portraitCitizen) {
              await MaidIdentityService.updatePerson(portraitCitizen.id, { portraitData: newUri });
              await loadData();
              if (lookupResult?.person?.id === portraitCitizen.id) {
                setLookupResult({
                  ...lookupResult,
                  person: {
                    ...lookupResult.person,
                    portraitData: newUri
                  }
                });
              }
            }
          }}
        />
      )}
    </div>
  );
}

