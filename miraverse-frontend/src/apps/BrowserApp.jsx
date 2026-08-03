import React, { useState } from 'react';
import GlassContainer from '../components/GlassContainer';
import { useOSStore } from '../store/useOSStore';
import { NPCS } from '../db/miraverseDb';
import {
  Search, Globe, Shield, Activity, BookOpen, User, Image, Link, FileText,
  Building, ChevronLeft, ChevronRight, RotateCw, Lock, Sparkles, CheckCircle2,
  LogIn, UserCheck, AlertTriangle, Key, ArrowRight, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

const PORTALS = {
  'faithmed.aure': {
    title: 'Faith Medical Group — Aureline Health Network',
    category: 'Medical Services',
    icon: Activity,
    color: 'from-emerald-950 to-slate-900 border-emerald-500/30 text-emerald-300',
    desc: 'Official website of Aureline Health. Healthcare providers, clinic locations, and locked Patient/Employee Portals.',
  },
  'cyacademy.aure': {
    title: 'Cycademy of Celestial & Applied OS Sciences',
    category: 'Academic Institution',
    icon: Building,
    color: 'from-purple-950 to-slate-900 border-purple-500/30 text-purple-300',
    desc: 'Official school website. Faculty directory, academic programs, dorm info, and secure Student Portal login.',
  },
  'dga.gov.aure': {
    title: 'Digital Governance Agency (DGA) — Official Government Portal',
    category: 'Government / Security',
    icon: Shield,
    color: 'from-blue-950 to-slate-900 border-blue-500/30 text-blue-300',
    desc: 'Public advisories, security bulletins, agency leadership, and Citizen Records Sign-In Portal.',
  },
  'library.aure': {
    title: 'Cyacademy Central Library & Purge Archives',
    category: 'Lore & Historical Archives',
    icon: BookOpen,
    color: 'from-amber-950 to-slate-900 border-amber-500/30 text-amber-300',
    desc: 'Public library catalog, digital manuscripts, pre-Collapse records, and restricted Vault search.',
  },
  'vectornet.aure': {
    title: 'Vector Underground Net & Exploits Mesh',
    category: 'Netrunner / Drifters',
    icon: Globe,
    color: 'from-cyan-950 to-slate-900 border-cyan-500/30 text-cyan-300',
    desc: 'Underground Netrunner forums, PRISM leak dispatches, node vulnerability advisories, and Drifter mesh chat.',
  },
};

const SAMPLE_ARCHIVES = [
  { id: 'ARC-001', title: 'Pre-Collapse AETHERCORE Blueprint Fragment', address: 'library.aure/archives/aethercore-01', type: 'Archive', excerpt: 'Deep energy resonance maps indicating AETHERCORE subterranean conduit lines under the Old Factory Ward.' },
  { id: 'ARC-002', title: 'Purge-Era Student Genealogy Index', address: 'library.aure/archives/lineage-index', type: 'Archive', excerpt: 'Classified records detailing Lightborn lineage bloodlines and hereditary Veil sensitivities.' },
  { id: 'ARC-003', title: 'PRISM Cult Signal Intercept #88', address: 'dga.gov.aure/intercepts/prism-88', type: 'Security Log', excerpt: 'Intercepted frequency wave containing corrupted binary runes targeting Cycademy node gateways.' },
  { id: 'ARC-004', title: 'Clinical Study: Veilwilt & Sunspire Fever', address: 'faithmed.aure/research/veilwilt-study', type: 'Medical Report', excerpt: 'Telemetry analysis showing direct correlation between elemental spell strain and aura corruption.' },
];

export default function BrowserApp() {
  const [inputUrl, setInputUrl] = useState('https://search.aure');
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'portal' | 'search'
  const [activePortalKey, setActivePortalKey] = useState('cyacademy.aure');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'sites' | 'people' | 'archives' | 'images'

  // Authentication states for portals
  const [cyacademyLoggedIn, setCyacademyLoggedIn] = useState(false);
  const [faithMedLoggedIn, setFaithMedLoggedIn] = useState(false);
  const [dgaLoggedIn, setDgaLoggedIn] = useState(false);
  const [libraryLoggedIn, setLibraryLoggedIn] = useState(false);

  // Sub-tabs for realistic websites
  const [cycademyTab, setCycademyTab] = useState('home'); // 'home' | 'programs' | 'faculty' | 'dorms' | 'portal'
  const [faithMedTab, setFaithMedTab] = useState('home'); // 'home' | 'providers' | 'services' | 'portal'
  const [dgaTab, setDgaTab] = useState('home'); // 'home' | 'advisories' | 'leadership' | 'portal'
  const [libraryTab, setLibraryTab] = useState('catalog'); // 'catalog' | 'manuscripts' | 'vault'

  // Intake scan state for FaithMed
  const [scheduled, setScheduled] = useState(false);

  const player = useOSStore((s) => s.gameplay.player);
  const healAura = useOSStore((s) => s.healAura);
  const removeCondition = useOSStore((s) => s.removeCondition);
  const addCareerXP = useOSStore((s) => s.addCareerXP);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);

  const handleNavigate = (url) => {
    setInputUrl(url);
    const clean = url.replace('https://', '').toLowerCase();
    if (PORTALS[clean]) {
      setActivePortalKey(clean);
      setCurrentView('portal');
    } else if (clean.includes('search') || clean.trim() === '') {
      setCurrentView('home');
    } else {
      setSearchQuery(clean);
      setCurrentView('search');
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setInputUrl(`https://search.aure/find?q=${encodeURIComponent(searchQuery)}`);
    setCurrentView('search');
  };

  // Guaranteed search results for ANY search query
  const getSearchResults = () => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Sites
    const matchedSites = Object.entries(PORTALS)
      .filter(([key, val]) => key.includes(q) || val.title.toLowerCase().includes(q) || val.desc.toLowerCase().includes(q))
      .map(([key, val]) => ({
        id: `site-${key}`,
        type: 'site',
        title: val.title,
        address: `https://${key}`,
        desc: val.desc,
        category: val.category,
      }));

    if (matchedSites.length === 0) {
      matchedSites.push(
        {
          id: `site-gen-1`,
          type: 'site',
          title: `${searchQuery.toUpperCase()} Regional Network Node`,
          address: `https://${q.replace(/[^a-z0-9]/g, '') || 'node'}.aure`,
          desc: `Official public domain for ${searchQuery}. Provides real-time network logs, public directory listings, and encrypted telemetry.`,
          category: 'Regional Portal',
        },
        {
          id: `site-gen-2`,
          type: 'site',
          title: `Cycademy Archives: Query [${searchQuery}]`,
          address: `https://library.aure/search?query=${encodeURIComponent(q)}`,
          desc: `Central Library record indexing historical references and academic papers mentioning ${searchQuery}.`,
          category: 'Academic Index',
        }
      );
    }

    // 2. People & Profiles
    const matchedPeople = NPCS.filter(
      (npc) =>
        npc.name.toLowerCase().includes(q) ||
        npc.role.toLowerCase().includes(q) ||
        npc.faction.toLowerCase().includes(q) ||
        npc.traits.toLowerCase().includes(q)
    ).map((npc) => ({
      id: npc.id,
      type: 'person',
      name: npc.name,
      role: npc.role,
      faction: npc.faction,
      region: npc.region,
      skill: npc.skill,
      lore: npc.lore,
      address: `https://cyacademy.aure/faculty/${npc.name.toLowerCase().replace(/\s+/g, '-')}`,
    }));

    if (matchedPeople.length === 0) {
      matchedPeople.push(
        {
          id: `person-gen-1`,
          type: 'person',
          name: `Officer / Subject ${searchQuery.toUpperCase()}`,
          role: 'Registered Citizen Record',
          faction: 'Aureline Civic Network',
          region: 'Central Sector',
          skill: 'Data Synthesis',
          lore: `Verified resident profile associated with query term [${searchQuery}]. Identity key verified under Citizen Record protocol.`,
          address: `https://cyacademy.aure/profiles/${encodeURIComponent(q)}`,
        },
        {
          id: `person-gen-2`,
          type: 'person',
          name: `Dr. ${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Vane`,
          role: 'Field Researcher',
          faction: 'Archive Keepers',
          region: 'Lab 4',
          skill: 'Veil Analysis',
          lore: `Senior investigator assigned to anomalies involving ${searchQuery}.`,
          address: `https://library.aure/staff/${encodeURIComponent(q)}`,
        }
      );
    }

    // 3. Archives & Documents
    const matchedArchives = SAMPLE_ARCHIVES.filter(
      (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
    if (matchedArchives.length === 0) {
      matchedArchives.push(
        {
          id: `arc-gen-1`,
          title: `Encrypted Log: Incident #${Math.floor(Math.random() * 899 + 100)} [${searchQuery}]`,
          address: `https://library.aure/archives/${encodeURIComponent(q)}`,
          type: 'Classified Archive',
          excerpt: `Decrypted terminal entry regarding ${searchQuery}. Signal interference detected during pre-Collapse scan.`,
        },
        {
          id: `arc-gen-2`,
          title: `DGA Threat Memorandum: ${searchQuery.toUpperCase()}`,
          address: `https://dga.gov.aure/memos/${encodeURIComponent(q)}`,
          type: 'Security Bulletin',
          excerpt: `Containment protocol advisory issued for ${searchQuery} in Sector 9.`,
        }
      );
    }

    // 4. Images & Visual Pictures
    const matchedImages = [
      {
        id: 'img-1',
        title: `${searchQuery} Node Visual Telemetry`,
        address: `https://network.aure/assets/${encodeURIComponent(q)}-render.png`,
        desc: `High-resolution frequency scan of ${searchQuery} captured near the Void Rift.`,
      },
      {
        id: 'img-2',
        title: `Architectural Diagram: ${searchQuery}`,
        address: `https://library.aure/diagrams/${encodeURIComponent(q)}.svg`,
        desc: `Pre-Collapse CAD layout diagram mapping structural conduits and energy lines.`,
      },
    ];

    return {
      sites: matchedSites,
      people: matchedPeople,
      archives: matchedArchives,
      images: matchedImages,
    };
  };

  const results = getSearchResults();

  return (
    <GlassContainer className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] font-sans text-xs text-[#162241] select-none overflow-hidden">
      {/* ── Browser Top Navigation Bar ── */}
      <div className="flex items-center gap-3 border-b border-slate-300/80 bg-white/70 px-4 py-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView('home')}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white"
            title="Home"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white"
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Address & Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 rounded-full bg-white border border-slate-300 px-3 py-1 text-xs focus-within:border-[#5f6ab0]">
          <Lock size={12} className="text-emerald-600 shrink-0" />
          <Input
            type="text"
            value={searchQuery || inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="Search Miraverse or enter domain (faithmed.aure, cyacademy.aure, dga.gov.aure, library.aure)..."
            className="w-full bg-transparent text-[#1d2650] placeholder:text-slate-400 text-xs"
          />
          <Button type="submit" variant="ghost" className="text-slate-500 hover:text-[#1d2650]">
            <Search size={14} />
          </Button>
        </form>

        {/* Bookmarks Bar */}
        <div className="hidden md:flex items-center gap-1 text-[10px]">
          {Object.keys(PORTALS).map((key) => (
            <button
              key={key}
              onClick={() => handleNavigate(`https://${key}`)}
              className={`px-2 py-1 rounded-lg border transition ${
                activePortalKey === key && currentView === 'portal'
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {key.split('.')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── BROWSER CONTENT ── */}
      <div className="flex-1 overflow-auto p-5">
        {/* VIEW 1: HOME SEARCH PORTAL */}
        {currentView === 'home' && (
          <div className="max-w-4xl mx-auto space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-2xl font-bold text-cyan-400 tracking-wider">
                <Globe className="animate-spin text-cyan-500" size={24} /> MIRASEARCH GLOBAL NETWORK
              </div>
              <p className="text-xs text-white/50">Search regional databases, citizen records, purge archives, and official institution portals.</p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, archives, faithmed, cyacademy, dga, library..."
                className="w-full rounded-2xl border border-cyan-500/40 bg-black/80 px-5 py-3 text-sm text-cyan-300 focus:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
              />
              <Button
                type="submit"
                className="absolute right-2 top-2 rounded-xl bg-cyan-500 px-4 py-1.5 font-bold text-xs text-black hover:bg-cyan-400"
              >
                Search
              </Button>
            </form>

            {/* Portals Grid */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Official Institution Websites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(PORTALS).map(([key, p]) => {
                  const IconComp = p.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleNavigate(`https://${key}`)}
                      className={`p-4 rounded-xl border bg-gradient-to-br text-left transition hover:scale-[1.01] ${p.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <IconComp size={18} />
                          <span>{p.title}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10">https://{key}</span>
                      </div>
                      <p className="text-[11px] mt-2 opacity-80 leading-relaxed">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REALISTIC WEBSITE PORTALS */}
        {currentView === 'portal' && (
          <div className="max-w-5xl mx-auto space-y-6">

            {/* 🏫 WEBSITE 1: CYCADEMY OF CELESTIAL & APPLIED OS SCIENCES (cyacademy.aure) */}
            {activePortalKey === 'cyacademy.aure' && (
              <div className="rounded-2xl border border-purple-400/30 bg-slate-900/90 overflow-hidden shadow-2xl">
                {/* School Header Navigation */}
                <div className="bg-purple-950 border-b border-purple-800/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow">
                      🎓
                    </div>
                    <div>
                      <h1 className="font-serif text-lg font-bold text-white tracking-wide">CYCADEMY</h1>
                      <p className="text-[10px] text-purple-300 font-mono">OF CELESTIAL & APPLIED OS SCIENCES • AURELINE</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button onClick={() => setCycademyTab('home')} className={`px-3 py-1.5 rounded-lg transition ${cycademyTab === 'home' ? 'bg-white/20 text-white font-bold' : 'text-purple-200 hover:bg-white/10'}`}>Overview</button>
                    <button onClick={() => setCycademyTab('programs')} className={`px-3 py-1.5 rounded-lg transition ${cycademyTab === 'programs' ? 'bg-white/20 text-white font-bold' : 'text-purple-200 hover:bg-white/10'}`}>Programs</button>
                    <button onClick={() => setCycademyTab('faculty')} className={`px-3 py-1.5 rounded-lg transition ${cycademyTab === 'faculty' ? 'bg-white/20 text-white font-bold' : 'text-purple-200 hover:bg-white/10'}`}>Faculty</button>
                    <button onClick={() => setCycademyTab('dorms')} className={`px-3 py-1.5 rounded-lg transition ${cycademyTab === 'dorms' ? 'bg-white/20 text-white font-bold' : 'text-purple-200 hover:bg-white/10'}`}>Dormitories</button>
                    <button onClick={() => setCycademyTab('portal')} className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition flex items-center gap-1">
                      <LogIn size={13} /> {cyacademyLoggedIn ? 'Student Portal (Active)' : 'Student Portal Sign In'}
                    </button>
                  </div>
                </div>

                {/* Cycademy Content */}
                <div className="p-6 space-y-6">
                  {cycademyTab === 'home' && (
                    <div className="space-y-6">
                      {/* Hero Section */}
                      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 p-6 space-y-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Welcome to Cycademy</span>
                        <h2 className="text-xl font-bold text-white">Shaping the Future of Reality Physics & Network Warfare</h2>
                        <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
                          Cycademy is Aureline's premier higher institution for celestial protocol studies, cyber defense, and AETHERCORE energy research. Dean Cassian Rook and our distinguished faculty welcome all newly registered assets for Cycle 28.
                        </p>
                      </div>

                      {/* Campus Announcements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <span className="text-[10px] font-bold text-purple-300 uppercase">Campus Bulletin</span>
                          <h3 className="font-bold text-white text-sm">Orientation & Veil Safety Briefing</h3>
                          <p className="text-xs text-white/60">All students must register their baseline aura scans at Faith Medical before attending Lab 4 practicals.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <span className="text-[10px] font-bold text-purple-300 uppercase">Faculty Notice</span>
                          <h3 className="font-bold text-white text-sm">Dr. Voss Lecture Series Announced</h3>
                          <p className="text-xs text-white/60">Advanced Reality Physics lectures on Veil resonance harmonics start this Thursday in Supercomputer Vault 2.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cycademyTab === 'programs' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-purple-300">Academic Curriculums & Departments</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { title: 'Department of Reality Physics', prof: 'Dr. Maelis Voss', desc: 'Studies elemental protocol alignment, Veil harmonics, and spatial anchors.' },
                          { title: 'Department of Cyber Defense', prof: 'Prof. Corvin Vale', desc: 'Tactical field drills, firewall defense, malware quarantine, and counter-intrusion.' },
                          { title: 'Interface Weaving & Art', prof: 'Liora Lucent', desc: 'Hard-light weaving, OS UI design, and creative spell formatting.' },
                        ].map((p, i) => (
                          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                            <h3 className="font-bold text-sm text-cyan-300">{p.title}</h3>
                            <div className="text-[10px] text-purple-300 font-medium">Head: {p.prof}</div>
                            <p className="text-xs text-white/70 leading-relaxed">{p.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cycademyTab === 'faculty' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-purple-300">Faculty & Administrator Directory</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {NPCS.filter((n) => n.faction.includes('Faculty') || n.faction.includes('Admin')).map((fac) => (
                          <div key={fac.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-900/60 border border-purple-400/40 flex items-center justify-center font-bold text-sm text-purple-200 shrink-0">
                              {fac.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold text-sm text-white">{fac.name}</div>
                              <div className="text-[10px] text-purple-300">{fac.role} • {fac.region}</div>
                              <p className="text-xs text-white/70 leading-snug">{fac.lore.slice(0, 90)}...</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cycademyTab === 'dorms' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-purple-300">Student Dormitories (Block A & Block B)</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <h3 className="font-bold text-white text-sm">Dorm Block A (North Wing)</h3>
                          <p className="text-xs text-white/70 leading-relaxed">Quiet study wing housing tech strategists and research scholars. Features individual terminal ports and direct library access.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <h3 className="font-bold text-white text-sm">Dorm Block B (South Wing)</h3>
                          <p className="text-xs text-white/70 leading-relaxed">Social wing featuring the main Room Board, communal lounge, and Drifter mesh repeater nodes.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STUDENT PORTAL (LOCKED LOGIN UNTIL SIGNED IN) */}
                  {cycademyTab === 'portal' && (
                    <div className="space-y-4">
                      {!cyacademyLoggedIn ? (
                        <div className="max-w-md mx-auto rounded-2xl border border-purple-500/40 bg-purple-950/40 p-6 space-y-4 text-center">
                          <Lock size={32} className="mx-auto text-amber-400" />
                          <div>
                            <h2 className="text-base font-bold text-white">Cycademy Student Portal Login</h2>
                            <p className="text-xs text-white/60 mt-1">Authorized access only. Enter your Student ID credentials to view dorm room boards, grades, and schedules.</p>
                          </div>

                          <div className="space-y-2 text-left">
                            <label className="text-[10px] text-purple-300 font-bold uppercase">Student ID / Asset Key</label>
                            <input type="text" defaultValue="CY-9021-X9" className="w-full rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-xs text-cyan-300 outline-none" />
                          </div>

                          <button
                            onClick={() => setCyacademyLoggedIn(true)}
                            className="w-full rounded-xl bg-amber-400 py-2.5 font-bold text-xs text-black hover:bg-amber-300 transition"
                          >
                            Sign In to Student Portal
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <UserCheck size={20} className="text-emerald-400" />
                              <div>
                                <span className="font-bold text-sm text-emerald-300">Signed In: Asset CY-9021-X9</span>
                                <div className="text-[10px] text-white/60">Registered Student • Clearance Level 01</div>
                              </div>
                            </div>
                            <button onClick={() => setCyacademyLoggedIn(false)} className="px-3 py-1 rounded bg-white/10 text-xs text-white/60 hover:text-white">Sign Out</button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <h3 className="font-bold text-sm text-cyan-300">Daily Cycademy Schedule</h3>
                              <div className="space-y-1.5 text-xs text-white/80 font-mono">
                                <div>• 09:00 - Coding 101 (Terminal Lab)</div>
                                <div>• 11:30 - Reality Physics (Dr. Voss)</div>
                                <div>• 14:00 - Cyber Defense Drill (Prof. Vale)</div>
                              </div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <h3 className="font-bold text-sm text-cyan-300">Assigned Dorm Room</h3>
                              <p className="text-xs text-white/70">Dorm Block A, Room 204. Rest in dorm available via OS menu bar.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🏥 WEBSITE 2: FAITH MEDICAL GROUP (faithmed.aure) */}
            {activePortalKey === 'faithmed.aure' && (
              <div className="rounded-2xl border border-emerald-400/30 bg-slate-900/90 overflow-hidden shadow-2xl">
                {/* FaithMed Header */}
                <div className="bg-emerald-950 border-b border-emerald-800/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow">
                      🏥
                    </div>
                    <div>
                      <h1 className="font-serif text-lg font-bold text-white tracking-wide">FAITH MEDICAL GROUP</h1>
                      <p className="text-[10px] text-emerald-300 font-mono">AURELINE HEALTH & AURA CLINICAL NETWORK</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button onClick={() => setFaithMedTab('home')} className={`px-3 py-1.5 rounded-lg transition ${faithMedTab === 'home' ? 'bg-white/20 text-white font-bold' : 'text-emerald-200 hover:bg-white/10'}`}>Overview</button>
                    <button onClick={() => setFaithMedTab('providers')} className={`px-3 py-1.5 rounded-lg transition ${faithMedTab === 'providers' ? 'bg-white/20 text-white font-bold' : 'text-emerald-200 hover:bg-white/10'}`}>Care Providers</button>
                    <button onClick={() => setFaithMedTab('services')} className={`px-3 py-1.5 rounded-lg transition ${faithMedTab === 'services' ? 'bg-white/20 text-white font-bold' : 'text-emerald-200 hover:bg-white/10'}`}>Specializations</button>
                    <button onClick={() => setFaithMedTab('portal')} className="px-3 py-1.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition flex items-center gap-1">
                      <LogIn size={13} /> {faithMedLoggedIn ? 'Patient Portal (Active)' : 'Patient / Staff Sign In'}
                    </button>
                  </div>
                </div>

                {/* FaithMed Content */}
                <div className="p-6 space-y-6">
                  {faithMedTab === 'home' && (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-6 space-y-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Compassionate Healthcare</span>
                        <h2 className="text-xl font-bold text-white">Restoring Aura Resonance & Treating Veil Conditions</h2>
                        <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
                          Faith Medical Group provides specialized aura diagnostic telemetry, warm-essence botanical therapies, and emergency medical recovery for students and citizens across Aureline.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <div className="font-bold text-emerald-300 text-xs">Emergency Clinic Intake</div>
                          <p className="text-xs text-white/60">24/7 emergency response for acute Veilwilt and riftspine trauma.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <div className="font-bold text-emerald-300 text-xs">Aura Diagnostic Telemetry</div>
                          <p className="text-xs text-white/60">Non-invasive frequency scans measuring aura capacity and strain.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <div className="font-bold text-emerald-300 text-xs">Botanical Remedies</div>
                          <p className="text-xs text-white/60">Warm-essence herbal treatments formulated by Dr. Sharon.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {faithMedTab === 'providers' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-emerald-300">Healthcare Providers & Physicians</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'Dr. Ilyra Saint', title: 'Chief Aura Physician', desc: 'Expert in Veil strain diagnosis and pre-Collapse lineage telemetry.' },
                          { name: 'Dr. Sharon', title: 'Senior Clinic Director', desc: 'Specializes in warm-essence botanical remedies and student intake.' },
                        ].map((doc, idx) => (
                          <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                            <div className="font-bold text-sm text-white">{doc.name}</div>
                            <div className="text-[10px] text-emerald-300">{doc.title}</div>
                            <p className="text-xs text-white/70">{doc.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {faithMedTab === 'services' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-emerald-300">Clinical Specializations</h2>
                      <div className="space-y-2">
                        {[
                          { name: 'Veilwilt Recovery Protocol', desc: 'Alleviates elemental exhaustion contracted during SpellForge overloads.' },
                          { name: 'Sunspire Burn Fever Therapy', desc: 'Cools high-frequency aura burns resulting from intense Lightborn spell casting.' },
                          { name: 'Riftspine Fracture Realignment', desc: 'Stabilizes spatial skeletal trauma caused by Void Rift surges.' },
                        ].map((s, idx) => (
                          <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                            <div className="font-bold text-sm text-cyan-300">{s.name}</div>
                            <p className="text-xs text-white/70">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PATIENT / EMPLOYEE PORTAL (LOCKED UNTIL SIGNED IN) */}
                  {faithMedTab === 'portal' && (
                    <div className="space-y-4">
                      {!faithMedLoggedIn ? (
                        <div className="max-w-md mx-auto rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 space-y-4 text-center">
                          <Lock size={32} className="mx-auto text-emerald-400" />
                          <div>
                            <h2 className="text-base font-bold text-white">Faith Medical Secure Portal Login</h2>
                            <p className="text-xs text-white/60 mt-1">Patient & Employee Access. Sign in with your Medical Record Key to access aura scans and treatment scheduling.</p>
                          </div>

                          <div className="space-y-2 text-left">
                            <label className="text-[10px] text-emerald-300 font-bold uppercase">Medical Record Key / Staff ID</label>
                            <input type="text" defaultValue="MED-8802-A" className="w-full rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-xs text-emerald-300 outline-none" />
                          </div>

                          <button
                            onClick={() => setFaithMedLoggedIn(true)}
                            className="w-full rounded-xl bg-emerald-400 py-2.5 font-bold text-xs text-black hover:bg-emerald-300 transition"
                          >
                            Sign In to Patient Portal
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-sm text-emerald-300">Patient Dashboard Active (Record #MED-8802-A)</div>
                              <div className="text-[10px] text-white/60">Current Aura Health: {player.auraHealth}%</div>
                            </div>
                            <button onClick={() => setFaithMedLoggedIn(false)} className="px-3 py-1 rounded bg-white/10 text-xs text-white/60 hover:text-white">Sign Out</button>
                          </div>

                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                            <h3 className="font-bold text-emerald-300 text-sm">Schedule Clinical Aura Treatment</h3>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setScheduled(true)}
                                className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-xs text-black hover:bg-emerald-400 transition"
                              >
                                📅 {scheduled ? 'Intake Scan Scheduled' : 'Schedule Aura Scan'}
                              </button>
                              <button
                                disabled={!scheduled}
                                onClick={() => {
                                  healAura(30);
                                  removeCondition('Veilwilt');
                                  removeCondition('Riftspine Fracture');
                                  removeCondition('Sunspire Burn Fever');
                                  addCareerXP('medical', 50);
                                  addCredits(150);
                                  addXP(75);
                                }}
                                className={`rounded-lg px-4 py-2 font-bold text-xs transition ${
                                  scheduled ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                              >
                                ✨ Complete Intake Scan (+150 Credits, +75 XP)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🛡️ WEBSITE 3: DIGITAL GOVERNANCE AGENCY (dga.gov.aure) */}
            {activePortalKey === 'dga.gov.aure' && (
              <div className="rounded-2xl border border-blue-400/30 bg-slate-900/90 overflow-hidden shadow-2xl">
                {/* DGA Header */}
                <div className="bg-blue-950 border-b border-blue-800/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-bold text-white text-lg shadow">
                      🛡️
                    </div>
                    <div>
                      <h1 className="font-serif text-lg font-bold text-white tracking-wide">DIGITAL GOVERNANCE AGENCY</h1>
                      <p className="text-[10px] text-blue-300 font-mono">OFFICIAL GOVERNMENT PORTAL • AURELINE</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button onClick={() => setDgaTab('home')} className={`px-3 py-1.5 rounded-lg transition ${dgaTab === 'home' ? 'bg-white/20 text-white font-bold' : 'text-blue-200 hover:bg-white/10'}`}>Overview</button>
                    <button onClick={() => setDgaTab('advisories')} className={`px-3 py-1.5 rounded-lg transition ${dgaTab === 'advisories' ? 'bg-white/20 text-white font-bold' : 'text-blue-200 hover:bg-white/10'}`}>Advisories</button>
                    <button onClick={() => setDgaTab('leadership')} className={`px-3 py-1.5 rounded-lg transition ${dgaTab === 'leadership' ? 'bg-white/20 text-white font-bold' : 'text-blue-200 hover:bg-white/10'}`}>Leadership</button>
                    <button onClick={() => setDgaTab('portal')} className="px-3 py-1.5 rounded-lg bg-blue-400 text-black font-bold hover:bg-blue-300 transition flex items-center gap-1">
                      <LogIn size={13} /> {dgaLoggedIn ? 'Citizen Records (Active)' : 'Citizen Public Records Sign In'}
                    </button>
                  </div>
                </div>

                {/* DGA Content */}
                <div className="p-6 space-y-6">
                  {dgaTab === 'home' && (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 p-6 space-y-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300">Public Governance</span>
                        <h2 className="text-xl font-bold text-white">Maintaining Network Order & Securing the Veil</h2>
                        <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
                          The Digital Governance Agency (DGA) safeguards Aureline's regional node infrastructure, manages citizen records, and enforces security protocols across all public subnets.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <h3 className="font-bold text-white text-sm">Public Threat Advisory: Level 2</h3>
                          <p className="text-xs text-white/60">Minor corruption ripples detected near the Digital Sprawl. Citizens are advised to keep personal firewall protocols active.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <h3 className="font-bold text-white text-sm">Central Archive System Directive</h3>
                          <p className="text-xs text-white/60">Public historical queries have been migrated to the Cyacademy Central Library domain (`library.aure`).</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {dgaTab === 'advisories' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-blue-300">Security Bulletins & Directives</h2>
                      <div className="space-y-2">
                        {[
                          { id: 'BUL-901', title: 'Unauthorized Node Breach Notice', desc: 'All student netrunners attempting unauthorized port scans on Imperial War Subnets will face clearance demotions.' },
                          { id: 'BUL-902', title: 'Aethercore Resonance Sweep', desc: 'DGA field operatives are conducting routine frequency sweeps in Sector 9.' },
                        ].map((b) => (
                          <div key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                            <div className="font-bold text-sm text-cyan-300">{b.title}</div>
                            <p className="text-xs text-white/70">{b.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dgaTab === 'leadership' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-blue-300">Agency Command & Officers</h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <div className="font-bold text-sm text-white">Agent Mara Quell</div>
                          <div className="text-[10px] text-blue-300">DGA Mission Handler & Field Operative</div>
                          <p className="text-xs text-white/70">Oversees strategic security operations, cadet assignments, and classified threat containment.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <div className="font-bold text-sm text-white">Professor Corvin Vale</div>
                          <div className="text-[10px] text-blue-300">Tactical Defense Liaison</div>
                          <p className="text-xs text-white/70">Coordinates Cyacademy cyber defense drills with DGA field protocols.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CITIZEN PUBLIC RECORDS PORTAL (LOCKED SIGN IN) */}
                  {dgaTab === 'portal' && (
                    <div className="space-y-4">
                      {!dgaLoggedIn ? (
                        <div className="max-w-md mx-auto rounded-2xl border border-blue-500/40 bg-blue-950/40 p-6 space-y-4 text-center">
                          <Lock size={32} className="mx-auto text-blue-400" />
                          <div>
                            <h2 className="text-base font-bold text-white">Citizen Public Records Sign In</h2>
                            <p className="text-xs text-white/60 mt-1">Sign in with your Citizen Clearance Key to search public civic records or request access to the Central Archive System.</p>
                          </div>

                          <div className="space-y-2 text-left">
                            <label className="text-[10px] text-blue-300 font-bold uppercase">Citizen Clearance Key</label>
                            <input type="text" defaultValue="CIV-CLEAR-01" className="w-full rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-xs text-cyan-300 outline-none" />
                          </div>

                          <button
                            onClick={() => setDgaLoggedIn(true)}
                            className="w-full rounded-xl bg-blue-400 py-2.5 font-bold text-xs text-black hover:bg-blue-300 transition"
                          >
                            Sign In to Citizen Records
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-sm text-blue-300">Citizen Portal Active (Clearance: Level 01)</div>
                              <div className="text-[10px] text-white/60">Public Records & Archive Redirect Ready</div>
                            </div>
                            <button onClick={() => setDgaLoggedIn(false)} className="px-3 py-1 rounded bg-white/10 text-xs text-white/60 hover:text-white">Sign Out</button>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                            <h3 className="font-bold text-sm text-cyan-300">Access Central Archive System</h3>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Public history records and pre-Collapse archives are managed by Cyacademy Central Library.
                            </p>
                            <button
                              onClick={() => handleNavigate('https://library.aure')}
                              className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-xs text-black hover:bg-cyan-400 transition flex items-center gap-1"
                            >
                              Go to Central Library Archives <ExternalLink size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 📚 WEBSITE 4: CYCADEMY CENTRAL LIBRARY (library.aure) */}
            {activePortalKey === 'library.aure' && (
              <div className="rounded-2xl border border-amber-400/30 bg-slate-900/90 overflow-hidden shadow-2xl">
                {/* Library Header */}
                <div className="bg-amber-950 border-b border-amber-800/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center font-bold text-white text-lg shadow">
                      📚
                    </div>
                    <div>
                      <h1 className="font-serif text-lg font-bold text-white tracking-wide">CENTRAL LIBRARY & PURGE ARCHIVES</h1>
                      <p className="text-[10px] text-amber-300 font-mono">CYCADEMY ARCHIVAL SYSTEM • AURELINE</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button onClick={() => setLibraryTab('catalog')} className={`px-3 py-1.5 rounded-lg transition ${libraryTab === 'catalog' ? 'bg-white/20 text-white font-bold' : 'text-amber-200 hover:bg-white/10'}`}>Public Catalog</button>
                    <button onClick={() => setLibraryTab('manuscripts')} className={`px-3 py-1.5 rounded-lg transition ${libraryTab === 'manuscripts' ? 'bg-white/20 text-white font-bold' : 'text-amber-200 hover:bg-white/10'}`}>Digital Manuscripts</button>
                    <button onClick={() => setLibraryTab('vault')} className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition flex items-center gap-1">
                      <LogIn size={13} /> {libraryLoggedIn ? 'Restricted Vault (Active)' : 'Restricted Vault Login'}
                    </button>
                  </div>
                </div>

                {/* Library Content */}
                <div className="p-6 space-y-6">
                  {libraryTab === 'catalog' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-amber-300">Public Archive Catalog</h2>
                      <div className="space-y-2">
                        {SAMPLE_ARCHIVES.map((arc) => (
                          <div key={arc.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-cyan-300">{arc.title}</span>
                              <span className="text-[9px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{arc.type}</span>
                            </div>
                            <div className="text-[10px] text-white/40 font-mono">{arc.address}</div>
                            <p className="text-xs text-white/70 pt-1 leading-relaxed">{arc.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {libraryTab === 'manuscripts' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-amber-300">Digital Manuscripts</h2>
                      <p className="text-xs text-white/70">Pre-Collapse research manuscripts curated by Archivist Selene Arclight.</p>
                    </div>
                  )}

                  {/* RESTRICTED VAULT LOGIN */}
                  {libraryTab === 'vault' && (
                    <div className="space-y-4">
                      {!libraryLoggedIn ? (
                        <div className="max-w-md mx-auto rounded-2xl border border-amber-500/40 bg-amber-950/40 p-6 space-y-4 text-center">
                          <Lock size={32} className="mx-auto text-amber-400" />
                          <div>
                            <h2 className="text-base font-bold text-white">Restricted Vault Login</h2>
                            <p className="text-xs text-white/60 mt-1">Special permission required. Enter Lineage Key to unlock Purge-era confidential records.</p>
                          </div>

                          <div className="space-y-2 text-left">
                            <label className="text-[10px] text-amber-300 font-bold uppercase">Lineage Key / Vault Code</label>
                            <input type="text" defaultValue="KEY-LIGHTBORN-77" className="w-full rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-xs text-amber-300 outline-none" />
                          </div>

                          <button
                            onClick={() => setLibraryLoggedIn(true)}
                            className="w-full rounded-xl bg-amber-400 py-2.5 font-bold text-xs text-black hover:bg-amber-300 transition"
                          >
                            Unlock Vault Archives
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex justify-between items-center">
                            <div className="font-bold text-sm text-amber-300">Vault Access Granted (Lineage Key Verified)</div>
                            <button onClick={() => setLibraryLoggedIn(false)} className="px-3 py-1 rounded bg-white/10 text-xs text-white/60 hover:text-white">Lock Vault</button>
                          </div>
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                            <h3 className="font-bold text-sm text-amber-300">Confidential File: Purge-Era Lightborn Lineage</h3>
                            <p className="text-xs text-white/70 mt-1 leading-relaxed">
                              Decrypted genealogical chart confirming inherited celestial aura sensitivity.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SEARCH RESULTS PAGE (ALWAYS RETURNS RESULTS) */}
        {currentView === 'search' && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Search Header Bar */}
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-cyan-400">Search Results for "{searchQuery}"</h2>
                <p className="text-xs text-white/50">Found matches across Web Sites, People Profiles, Archives, and Image Scans.</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 text-[10px]">
                {[
                  { key: 'all', label: 'All Results' },
                  { key: 'sites', label: `Websites (${results.sites.length})` },
                  { key: 'people', label: `People (${results.people.length})` },
                  { key: 'archives', label: `Archives (${results.archives.length})` },
                  { key: 'images', label: `Images (${results.images.length})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-3 py-1 rounded-lg border transition ${
                      activeFilter === f.key
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS LISTING */}
            <div className="space-y-4">
              {/* 1. WEBSITES & ADDRESSES */}
              {(activeFilter === 'all' || activeFilter === 'sites') && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 flex items-center gap-1.5">
                    <Globe size={14} /> Websites & Web Addresses
                  </h3>
                  <div className="space-y-2">
                    {results.sites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => handleNavigate(site.address)}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1 hover:border-cyan-400/50 hover:bg-white/10 transition cursor-pointer"
                      >
                        <div className="text-[10px] text-cyan-400/80 font-mono flex items-center gap-1">
                          <Link size={10} /> {site.address}
                        </div>
                        <div className="font-bold text-sm text-cyan-300">{site.title}</div>
                        <p className="text-xs text-white/70 leading-relaxed">{site.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. PEOPLE & PROFILES */}
              {(activeFilter === 'all' || activeFilter === 'people') && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400/80 flex items-center gap-1.5">
                    <User size={14} /> Citizen & Student Records (People)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.people.map((person) => (
                      <div key={person.id} className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-purple-300">{person.name}</div>
                            <div className="text-[10px] text-white/50">{person.role} • {person.faction}</div>
                          </div>
                          <span className="text-[9px] bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded font-mono">
                            {person.region}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">{person.lore}</p>
                        <div className="text-[10px] text-cyan-300/80 pt-1 border-t border-white/5 font-mono">
                          Address: {person.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. LORE & ARCHIVES */}
              {(activeFilter === 'all' || activeFilter === 'archives') && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                    <FileText size={14} /> Historical Archives & Records
                  </h3>
                  <div className="space-y-2">
                    {results.archives.map((arc) => (
                      <div key={arc.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-amber-300">{arc.title}</span>
                          <span className="text-[9px] text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded font-mono">{arc.type}</span>
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">{arc.address}</div>
                        <p className="text-xs text-white/70 leading-relaxed">{arc.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. IMAGES & PICTURES */}
              {(activeFilter === 'all' || activeFilter === 'images') && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400/80 flex items-center gap-1.5">
                    <Image size={14} /> Image Scans & Visual Pictures
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {results.images.map((img) => (
                      <div key={img.id} className="rounded-xl border border-emerald-500/30 bg-white/5 p-4 space-y-2">
                        <div className="h-24 w-full rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex flex-col items-center justify-center p-3 text-center">
                          <Image size={24} className="text-emerald-400 mb-1" />
                          <span className="text-[10px] font-mono text-emerald-300 font-bold">{img.title}</span>
                        </div>
                        <div className="text-xs font-semibold text-white">{img.title}</div>
                        <p className="text-[11px] text-white/60">{img.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassContainer>
  );
}
