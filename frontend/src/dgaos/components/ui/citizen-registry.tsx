'use client';

import { useState, useMemo, useEffect } from 'react';
import { subscribeCitizenUpdates } from '../../../integration/citizenEvents';
import {
  Users,
  Search,
  AlertTriangle,
  FileBadge,
  Phone,
  Car,
  Fingerprint,
  Dna,
  Shield,
  FolderKanban,
  Terminal,
  Scale,
  Package,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  FileText,
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';
import { MaidIdentityService } from '../../../services/maidIdentityService';
import {
  openCitizenInApp,
  syncDgaInvestigativeUpdate,
  getActiveCitizenContext,
} from '../../../integration/citizenBridge';

export interface CitizenRecord {
  id: string;
  legalName: string;
  aliases: string[];
  category: 'Suspect' | 'Person of Interest' | 'Witness' | 'Victim' | 'Law Enforcement';
  threatLevel: 'High' | 'Medium' | 'Low' | 'None';
  avatarInitials: string;
  avatarColor: string;
  age: number;
  dob: string;
  gender: string;
  occupation: string;
  employer: string;
  address: string;
  cityState: string;
  biometrics: {
    bloodType: string;
    height: string;
    weight: string;
    fingerprintClass: string;
    dnaReferenceId: string;
    facialMatchConfidence: string;
  };
  telecom: {
    phone: string;
    carrier: string;
    imsi?: string;
    imei?: string;
    ipAddress?: string;
    onlineHandles: string[];
  };
  vehicles: {
    makeModel: string;
    year: number;
    color: string;
    plate: string;
    vin: string;
  }[];
  criminalRecord: {
    hasWarrant: boolean;
    priorOffenses: string[];
    probationStatus: string;
  };
  investigativeNotes: string;
  associatedCitizenIds: string[];
  linkedEvidenceIds: string[];
}

export const SEEDED_CITIZENS: CitizenRecord[] = [
  {
    id: 'CIT-90421',
    legalName: 'Dr. Julian Paul Vance',
    aliases: ['J.P. Vance', 'Orchid_Doc', 'JV-Genomics'],
    category: 'Suspect',
    threatLevel: 'High',
    avatarInitials: 'JV',
    avatarColor: 'from-amber-600 to-rose-700',
    age: 46,
    dob: '1980-04-12',
    gender: 'Male',
    occupation: 'Former Director of Botanical Genomics',
    employer: 'Vance Bio-Genomics (Revoked)',
    address: '4410 Willow Creek Rd, Apt 4B',
    cityState: 'Capital District, Metro',
    biometrics: {
      bloodType: 'O+',
      height: '5\'11" (180 cm)',
      weight: '178 lbs (80 kg)',
      fingerprintClass: 'Loop (Ulnar) #FP-8841-A',
      dnaReferenceId: 'STR-CODIS-9921-JV',
      facialMatchConfidence: '98.4% (CCTV Camera 04)',
    },
    telecom: {
      phone: '+1 (202) 555-0184',
      carrier: 'Verizon Wireless',
      imsi: '310410192847192',
      imei: '867530919284711',
      ipAddress: '73.194.22.109',
      onlineHandles: ['@vance_bio', 't.me/orchid_vault'],
    },
    vehicles: [
      {
        makeModel: 'Audi A4 Sedan',
        year: 2021,
        color: 'Black',
        plate: '7XYZ99',
        vin: 'WBA530I9928174129',
      },
    ],
    criminalRecord: {
      hasWarrant: true,
      priorOffenses: [
        '2024: Federal Trade Injunction (Theft of Proprietary Genetic Markers - Settled)',
        '2026: Active Person of Interest in Conservatory Burglary (CASE-2026-0042)',
      ],
      probationStatus: 'Under Civil Supervision',
    },
    investigativeNotes:
      'Disputed alibi for night of the burglary. Laboratory microscopic analysis on EV-0001 confirms trilobal blue polyester fibers match his seized cardigan. Tower handoff confirms burner IMSI near the Conservatory fence at 02:18 UTC.',
    associatedCitizenIds: ['CIT-88192', 'CIT-61049', 'CIT-11029'],
    linkedEvidenceIds: ['EV-0001', 'EV-0005'],
  },
  {
    id: 'CIT-88192',
    legalName: 'Elena Rostova',
    aliases: ['The Curator', 'Hélène Rostova', 'ER-Logistics'],
    category: 'Suspect',
    threatLevel: 'High',
    avatarInitials: 'ER',
    avatarColor: 'from-purple-600 to-indigo-800',
    age: 39,
    dob: '1987-11-03',
    gender: 'Female',
    occupation: 'Antiquities & Rare Specimen Broker',
    employer: 'Rostova Global Logistics LLC (Zurich/Metro)',
    address: '1200 Penthouse Way, Harbor Tower Suite #18',
    cityState: 'Harbor District, Metro',
    biometrics: {
      bloodType: 'A-',
      height: '5\'8" (173 cm)',
      weight: '140 lbs (63 kg)',
      fingerprintClass: 'Whorl (Plain) #FP-4412-B',
      dnaReferenceId: 'STR-CODIS-7714-ER',
      facialMatchConfidence: '91.2% (Airport Border Camera)',
    },
    telecom: {
      phone: '+41 79 555 3821',
      carrier: 'Swisscom (US AT&T Roaming)',
      imsi: '228019918274610',
      imei: '358920194827104',
      ipAddress: '185.220.101.5 (Tor Relay Exit)',
      onlineHandles: ['@curator_art', 'matrix:rostova_vault'],
    },
    vehicles: [
      {
        makeModel: 'Audi Q7 SUV',
        year: 2024,
        color: 'Mythos Black',
        plate: '4ABC-104',
        vin: 'WAUZZZ4M1RD092811',
      },
    ],
    criminalRecord: {
      hasWarrant: true,
      priorOffenses: [
        'Interpol Blue Notice B-491-2025: Cross-border illegal transport of CITES protected flora',
        'Grand Jury § 2703(d) Subpoena Issued (WAR-2026-0882)',
      ],
      probationStatus: 'Active International Flight Risk',
    },
    investigativeNotes:
      'Bank subpoena uncovered an $85,000 escrow transfer executed hours before the burglary. Booked ticket for Swiss Air flight LX-041 departing for Zurich at 08:30 AM.',
    associatedCitizenIds: ['CIT-90421', 'CIT-61049'],
    linkedEvidenceIds: ['EV-0002', 'EV-0007'],
  },
  {
    id: 'CIT-61049',
    legalName: 'Marcus Chen',
    aliases: ['#GHOST-404', 'gl1tch_root', 'K-Zero'],
    category: 'Person of Interest',
    threatLevel: 'Medium',
    avatarInitials: 'MC',
    avatarColor: 'from-cyan-600 to-teal-800',
    age: 28,
    dob: '1998-07-22',
    gender: 'Male',
    occupation: 'Firmware Modder & Freelance Cyber Specialist',
    employer: 'Self-Employed (Cryptographic Consulting)',
    address: '788 Industrial Parkway, Studio #12',
    cityState: 'Docklands District, Metro',
    biometrics: {
      bloodType: 'B+',
      height: '5\'9" (175 cm)',
      weight: '155 lbs (70 kg)',
      fingerprintClass: 'Arch (Tented) #FP-3301-C',
      dnaReferenceId: 'STR-CODIS-4029-MC',
      facialMatchConfidence: '87.6% (Subway Terminal C)',
    },
    telecom: {
      phone: '+1 (202) 555-0133',
      carrier: 'Mint Mobile (Burner SIM)',
      imsi: '310260991823419',
      imei: '869019284719284',
      ipAddress: '185.220.101.5',
      onlineHandles: ['@gl1tch_root', 'gh/k-zero-sec'],
    },
    vehicles: [
      {
        makeModel: 'Honda Civic Hatchback',
        year: 2018,
        color: 'Sonic Gray Pearl',
        plate: '2HCK-404',
        vin: '2HGFC1751JH592814',
      },
    ],
    criminalRecord: {
      hasWarrant: false,
      priorOffenses: [
        '2021: 18 U.S.C. § 1030 Unauthorized Network Intrusion (Suspended Sentence / Cleaned)',
      ],
      probationStatus: 'Expired (2023)',
    },
    investigativeNotes:
      'Seized Wireshark PCAP (ART-004) reveals an Evil Twin rogue access point created with MAC 00:14:22:98:A1:FE, harvesting conservatory security credentials.',
    associatedCitizenIds: ['CIT-90421', 'CIT-88192'],
    linkedEvidenceIds: ['EV-0008'],
  },
  {
    id: 'CIT-39401',
    legalName: 'Sarah Elizabeth Jenkins',
    aliases: ['S. Jenkins', 'Supervisor 04'],
    category: 'Witness',
    threatLevel: 'Low',
    avatarInitials: 'SJ',
    avatarColor: 'from-emerald-600 to-green-800',
    age: 34,
    dob: '1992-02-18',
    gender: 'Female',
    occupation: 'Night Shift Physical Security Supervisor',
    employer: 'Conservatory Grounds Facility Management',
    address: '215 Elmira Blvd, Unit 3',
    cityState: 'Northgate, Metro',
    biometrics: {
      bloodType: 'O-',
      height: '5\'6" (168 cm)',
      weight: '135 lbs (61 kg)',
      fingerprintClass: 'Loop (Radial) #FP-1104-D',
      dnaReferenceId: 'STR-CODIS-1194-SJ (Elimination Reference)',
      facialMatchConfidence: '99.8% (Gatehouse 1 Access)',
    },
    telecom: {
      phone: '+1 (202) 555-0199',
      carrier: 'T-Mobile US',
      ipAddress: '172.56.21.90',
      onlineHandles: ['@sarah_j_sec'],
    },
    vehicles: [
      {
        makeModel: 'Subaru Outback',
        year: 2020,
        color: 'Autumn Green Metallic',
        plate: '9SEC-391',
        vin: '4S4BSANC1L3201948',
      },
    ],
    criminalRecord: {
      hasWarrant: false,
      priorOffenses: [],
      probationStatus: 'None (DOJ Security Clearance Active)',
    },
    investigativeNotes:
      'First civilian to discover perimeter glass breach at 02:45. Placed 911 dispatch call. Alibi verified by biometric gatehouse reader and continuous internal CCTV.',
    associatedCitizenIds: ['CIT-50491', 'CIT-11029'],
    linkedEvidenceIds: ['EV-0002'],
  },
  {
    id: 'CIT-11029',
    legalName: 'Dr. Aris Thorne',
    aliases: ['A. Thorne', 'Chief Geneticist'],
    category: 'Victim',
    threatLevel: 'Low',
    avatarInitials: 'AT',
    avatarColor: 'from-blue-600 to-sky-800',
    age: 58,
    dob: '1968-09-14',
    gender: 'Non-Binary',
    occupation: 'Lead Geneticist & Botanical Cultivar Breeder',
    employer: 'Consortium for Rare Floral Genomics',
    address: '14 Highgate Ridge Estate',
    cityState: 'Highgate, Metro',
    biometrics: {
      bloodType: 'AB+',
      height: '6\'1" (185 cm)',
      weight: '190 lbs (86 kg)',
      fingerprintClass: 'Whorl (Double Loop) #FP-0021-E',
      dnaReferenceId: 'STR-CODIS-0021-AT (Elimination Reference)',
      facialMatchConfidence: '99.9%',
    },
    telecom: {
      phone: '+1 (202) 555-0144',
      carrier: 'AT&T Business',
      ipAddress: '98.120.44.18',
      onlineHandles: ['@dr_thorne_genomics'],
    },
    vehicles: [
      {
        makeModel: 'Tesla Model S',
        year: 2023,
        color: 'Pearl White Multi-Coat',
        plate: '1ECO-990',
        vin: '5YJSA1E29PF918274',
      },
    ],
    criminalRecord: {
      hasWarrant: false,
      priorOffenses: [],
      probationStatus: 'None',
    },
    investigativeNotes:
      'Primary breeder and legal patent holder of the stolen chimeric orchid germplasm (PVP Certificate #2024-0091). Filed civil trade theft complaint against Julian Vance in 2024.',
    associatedCitizenIds: ['CIT-90421', 'CIT-39401'],
    linkedEvidenceIds: [],
  },
  {
    id: 'CIT-50491',
    legalName: 'David Arthur Miller',
    aliases: ['Officer Dave Miller', 'Badge #4092'],
    category: 'Law Enforcement',
    threatLevel: 'None',
    avatarInitials: 'DM',
    avatarColor: 'from-slate-700 to-indigo-900',
    age: 42,
    dob: '1984-05-30',
    gender: 'Male',
    occupation: 'Metropolitan Police Patrol Officer (Unit 14)',
    employer: 'Metropolitan Police Department (2nd Precinct)',
    address: '802 Birch Hollow Road',
    cityState: 'Westfall, Metro',
    biometrics: {
      bloodType: 'A+',
      height: '6\'2" (188 cm)',
      weight: '210 lbs (95 kg)',
      fingerprintClass: 'Loop (Ulnar) #FP-5049-M',
      dnaReferenceId: 'STR-CODIS-5049-DM (First Responder Reference)',
      facialMatchConfidence: '100% (Department Badge ID)',
    },
    telecom: {
      phone: '+1 (202) 555-0100',
      carrier: 'FirstNet / AT&T Public Safety',
      ipAddress: '10.14.0.92 (Police MDT VPN)',
      onlineHandles: ['mpd_unit14'],
    },
    vehicles: [
      {
        makeModel: 'Ford Police Interceptor Utility',
        year: 2023,
        color: 'Police Black & White',
        plate: 'MPD-4092',
        vin: '1FM5K8HC8PGA19284',
      },
    ],
    criminalRecord: {
      hasWarrant: false,
      priorOffenses: [],
      probationStatus: 'Sworn Peace Officer in Good Standing',
    },
    investigativeNotes:
      'First responding patrol unit on scene at 02:52. Secured the exterior broken glass perimeter and signed over physical intake custody to TRACE evidence technicians.',
    associatedCitizenIds: ['CIT-39401'],
    linkedEvidenceIds: ['EV-0001', 'EV-0002'],
  },
];

async function getCanonicalCitizens(): Promise<CitizenRecord[]> {
  try {
    const list = await MaidIdentityService.ensureDefaultPopulationSeeded();
    if (!Array.isArray(list)) return [];
    return list.map((c: any) => ({
      id: c.maid || c.record || c.id,
      legalName: c.name || 'Unnamed Citizen',
      aliases: [
        ...(c.legacyAliases || []),
        c.alias,
        c.maid && c.record !== c.maid ? c.record : null
      ].filter(Boolean),
      category: (c.category?.toLowerCase().includes('dga') || c.category?.toLowerCase().includes('complex')) ? 'Person of Interest' : 'Witness',
      threatLevel: c.status?.includes('RESTRICTED') ? 'Medium' : 'Low',
      avatarInitials: (c.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarColor: 'from-purple-600 to-indigo-800',
      age: c.dob ? (2026 - parseInt(c.dob.slice(0, 4), 10) || 25) : 25,
      dob: c.dob || '2001-01-01',
      gender: 'Unspecified',
      occupation: c.occupation || 'Resident',
      employer: c.affiliation || 'Independent',
      address: c.address || 'Address on file',
      cityState: c.district || c.home || 'Aureline Central, Orynvell',
      biometrics: {
        bloodType: c.blood || 'A+',
        height: c.height || '172 cm',
        weight: c.build || 'Medium',
        fingerprintClass: 'Simulated Dermal Ridge #BIO-' + (c.maid || c.record),
        dnaReferenceId: 'AURA-RESONANCE-' + (c.maid || c.record),
        facialMatchConfidence: '99.2% (Aura Biometrics)',
      },
      telecom: {
        phone: c.phone || '+1 (202) 555-0100',
        carrier: 'Aureline Telecom Grid',
        onlineHandles: [c.email || 'citizen@example.com'],
      },
      vehicles: [],
      criminalRecord: {
        hasWarrant: c.status?.includes('WARRANT') || false,
        priorOffenses: c.history ? [c.history] : [],
        probationStatus: 'None',
      },
      investigativeNotes: c.links || 'Registered Meridion citizen.',
      associatedCitizenIds: (c.relationshipIds || []).map((r: any) => r.id),
      linkedEvidenceIds: [],
    }));
  } catch {
    return [];
  }
}

interface CitizenRegistryProps {
  cases: LabRecord[];
  evidence: LabRecord[];
  navigate: (view: string) => void;
  onOpenRecord: (item: LabRecord) => void;
}

export function CitizenRegistry({
  cases: _cases,
  evidence,
  navigate,
  onOpenRecord,
}: CitizenRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(() => {
    const ctx = getActiveCitizenContext();
    return ctx?.citizenId || 'MAID-OR-00481926';
  });
  const [isQuerying, setIsQuerying] = useState(false);
  const [pinnedCitizens, setPinnedCitizens] = useState<string[]>(['CIT-90421', 'CIT-88192']);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [canonicalCitizens, setCanonicalCitizens] = useState<CitizenRecord[]>([]);
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    let revision = 0;
    const syncCtx = async (update: { citizenId?: string } = {}) => {
      const request = ++revision;
      const records = await getCanonicalCitizens();
      if (!mounted || request !== revision) return;
      setCanonicalCitizens(records);
      const id = update.citizenId || getActiveCitizenContext()?.citizenId;
      if (id) setSelectedCitizenId(id);
    };
    void syncCtx();
    const unsubscribe = subscribeCitizenUpdates(update => { void syncCtx(update); });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const combinedCitizens = useMemo(() => {
    const canonical = canonicalCitizens;
    const seen = new Set(canonical.map(c => c.id));
    return [...canonical, ...SEEDED_CITIZENS.filter(c => !seen.has(c.id))];
  }, [canonicalCitizens]);

  const filteredCitizens = useMemo(() => {
    return combinedCitizens.filter((c) => {
      const matchesCategory =
        categoryFilter === 'All' ||
        (categoryFilter === 'Warrants'
          ? c.criminalRecord.hasWarrant
          : c.category === categoryFilter);

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const nameMatch = c.legalName.toLowerCase().includes(q);
      const aliasMatch = c.aliases.some((a) => a.toLowerCase().includes(q));
      const idMatch = c.id.toLowerCase().includes(q);
      const phoneMatch = c.telecom.phone.includes(q);
      const plateMatch = c.vehicles.some((v) => v.plate.toLowerCase().includes(q));
      const addressMatch = c.address.toLowerCase().includes(q);
      const employerMatch = c.employer.toLowerCase().includes(q);

      return (
        nameMatch ||
        aliasMatch ||
        idMatch ||
        phoneMatch ||
        plateMatch ||
        addressMatch ||
        employerMatch
      );
    });
  }, [combinedCitizens, searchQuery, categoryFilter]);

  const selectedCitizen = useMemo(() => {
    return (
      combinedCitizens.find((c) => c.id === selectedCitizenId) ||
      filteredCitizens[0] ||
      combinedCitizens[0]
    );
  }, [combinedCitizens, selectedCitizenId, filteredCitizens]);

  const handleSimulateRefresh = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      setRegistryVersion((v) => v + 1);
      setActionNotice('Canonical MAID Population Registry, NCIC / State DMV & Interpol records synchronized.');
      setTimeout(() => setActionNotice(null), 3500);
    }, 600);
  };

  const handleTogglePin = (citizen: CitizenRecord) => {
    if (pinnedCitizens.includes(citizen.id)) {
      setPinnedCitizens((prev) => prev.filter((id) => id !== citizen.id));
      setActionNotice(`Removed ${citizen.legalName} from active Detective Corkboard pin list.`);
    } else {
      setPinnedCitizens((prev) => [...prev, citizen.id]);
      setActionNotice(`Pinned ${citizen.legalName} to Detective Desk corkboard.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="citizen-registry-root flex flex-col gap-5">
      <InvestigationBreadcrumbs currentView="Citizen Registry" navigate={navigate} />

      {/* Header Bar */}
      <div className="p-5 bg-white border border-[#a89bc2] rounded-xl text-[#0f0d1a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f8f6fc] border border-[#d4ceeb] text-[#4338ca]">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0f0d1a] tracking-tight">
                CITIZEN REGISTRY &amp; BIOMETRIC RECORDS
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                DATABASE ONLINE
              </span>
            </div>
            <p className="text-xs text-[#2c273d] mt-0.5">
              Cross-jurisdictional biometric profiles, registered assets, vehicle telemetry, and case associations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSimulateRefresh}
            disabled={isQuerying}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#d4ceeb] bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isQuerying ? 'animate-spin text-[#4338ca]' : 'text-[#4338ca]'} />
            <span>{isQuerying ? 'Synchronizing…' : 'Sync Records'}</span>
          </button>
          <div className="text-right pl-3 border-l border-[#e5e0f0] text-xs">
            <div className="text-[#4338ca] font-bold">{combinedCitizens.length} Persons Indexed</div>
            <div className="text-[11px] text-[#4b465c]">
              {pinnedCitizens.length} Pinned to Corkboard
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-white border border-[#a89bc2] rounded-lg text-xs text-[#0f0d1a] flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#4338ca] flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Search & Citizen List (Left 1 col) + Detailed Dossier (Right 2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Search & Registry Index */}
        <div className="col-span-1 bg-white border border-[#a89bc2] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, alias, plate, phone, ID…"
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg outline-none focus:border-[#4338ca] text-[#0f0d1a] placeholder-[#64748b] transition-all font-sans"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#e5e0f0]">
            {['All', 'Suspect', 'Person of Interest', 'Witness', 'Victim', 'Law Enforcement', 'Warrants'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition-colors cursor-pointer border ${
                  categoryFilter === cat
                    ? 'bg-[#4338ca] text-white border-[#4338ca]'
                    : 'bg-[#f8f6fc] text-[#4b465c] border-[#d4ceeb] hover:bg-[#ece7f4] hover:text-[#0f0d1a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[580px] pr-1">
            {filteredCitizens.map((c) => {
              const isSelected = selectedCitizen.id === c.id;
              const isPinned = pinnedCitizens.includes(c.id);

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCitizenId(c.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 relative cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#4338ca] bg-[#fcfaff] shadow-sm ring-1 ring-[#4338ca]/20'
                      : 'border-[#d4ceeb] bg-white hover:bg-[#fbf9fe]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded bg-gradient-to-br ${c.avatarColor} text-white font-black text-xs flex items-center justify-center shadow-xs font-mono`}
                      >
                        {c.avatarInitials}
                      </div>
                      <div>
                        <strong className="text-xs text-[#0f0d1a] block line-clamp-1">
                          {c.legalName}
                        </strong>
                        <span className="text-[11px] font-mono text-[#4338ca]">{c.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isPinned && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.5 rounded font-bold">
                          PINNED
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                          c.category === 'Suspect'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : c.category === 'Person of Interest'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : c.category === 'Witness'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : c.category === 'Victim'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {c.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#4b465c] line-clamp-1">
                    {c.occupation}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#4b465c] pt-1 border-t border-[#e5e0f0]">
                    <span>{c.telecom.phone}</span>
                    {c.vehicles[0] && <span className="font-mono">Plate: {c.vehicles[0].plate}</span>}
                  </div>
                </button>
              );
            })}

            {filteredCitizens.length === 0 && (
              <div className="text-center py-8 text-[#4b465c] text-xs">
                No citizen records matched your search query.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Comprehensive Dossier & Cross-Pillar Actions */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          {/* Dossier Header Card */}
          <div className="bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col gap-4 text-[#0f0d1a]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#e5e0f0] pb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCitizen.avatarColor} text-white font-black text-[15px] flex items-center justify-center shadow-sm font-mono border border-white`}
                >
                  {selectedCitizen.avatarInitials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[#0f0d1a]">
                      {selectedCitizen.legalName}
                    </h2>
                    <span className="text-[10px] font-mono font-bold text-[#4338ca] bg-[#f1edf7] border border-[#d4ceeb] px-2 py-0.5 rounded">
                      {selectedCitizen.id}
                    </span>
                    {selectedCitizen.criminalRecord.hasWarrant && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 border border-rose-300 text-rose-800 flex items-center gap-1 shadow-xs">
                        <AlertTriangle size={12} />
                        ACTIVE WARRANT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#2c273d] mt-1">
                    Known Aliases: <span className="font-semibold text-[#0f0d1a]">{selectedCitizen.aliases.join(' · ')}</span>
                  </p>
                  <p className="text-xs text-[#4b465c] mt-0.5">
                    {selectedCitizen.occupation} · <b className="text-[#0f0d1a]">{selectedCitizen.employer}</b>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Cross-Pillar Linking */}
              <div className="flex flex-col gap-2 items-start sm:items-end">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openCitizenInApp(selectedCitizen.id, 'meridionRegistry', { targetTab: 'lookup' })}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#4338ca] hover:bg-[#3730a3] text-white flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <ExternalLink size={12} />
                    <span>MAID Registry Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCitizenInApp(selectedCitizen.id, 'documentStudio', { targetDocId: 5 })}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] border border-[#d4ceeb] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <FileText size={12} className="text-[#4338ca]" />
                    <span>Investigative Report (Doc 5)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await syncDgaInvestigativeUpdate(selectedCitizen.id, {
                        caseId: 'CASE-2026-0042',
                        investigativeNote: `DGAOS/TRACE Citizen Registry cross-check logged (${new Date().toLocaleDateString()}).`,
                      });
                      setRegistryVersion((v) => v + 1);
                      setActionNotice(
                        result.success && result.person
                          ? `Synchronized DGAOS investigative note to canonical MAID record ${result.person.maid}.`
                          : `Logged local DGAOS investigative note for ${selectedCitizen.legalName}.`
                      );
                      setTimeout(() => setActionNotice(null), 3500);
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={12} />
                    <span>Sync Note to MAID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePin(selectedCitizen)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer border ${
                      pinnedCitizens.includes(selectedCitizen.id)
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] border-[#d4ceeb]'
                    }`}
                  >
                    <FolderKanban size={12} className="text-[#4338ca]" />
                    <span>
                      {pinnedCitizens.includes(selectedCitizen.id) ? 'Pinned ✓' : 'Pin'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('Cyber Lab')}
                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#f8f6fc] text-[#4338ca] hover:bg-[#ece7f4] border border-[#d4ceeb] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Terminal size={12} />
                    <span>Cyber Recon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('Legal & Warrants')}
                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Scale size={12} className="text-[#4338ca]" />
                    <span>Warrants</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Fact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f6fc] border border-[#e5e0f0] p-3 rounded-lg text-xs">
              <div>
                <span className="text-[#4b465c] block text-[10px] uppercase font-bold">Category / Role</span>
                <strong className="text-[#0f0d1a]">{selectedCitizen.category}</strong>
              </div>
              <div>
                <span className="text-[#4b465c] block text-[10px] uppercase font-bold">DOB &amp; Age</span>
                <span className="text-[#0f0d1a] font-medium">{selectedCitizen.dob} ({selectedCitizen.age} y/o)</span>
              </div>
              <div>
                <span className="text-[#4b465c] block text-[10px] uppercase font-bold">Threat Priority</span>
                <span
                  className={`font-bold ${
                    selectedCitizen.threatLevel === 'High'
                      ? 'text-rose-700'
                      : selectedCitizen.threatLevel === 'Medium'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {selectedCitizen.threatLevel} Priority
                </span>
              </div>
              <div>
                <span className="text-[#4b465c] block text-[10px] uppercase font-bold">Residence</span>
                <span className="text-[#0f0d1a] line-clamp-1">{selectedCitizen.cityState}</span>
              </div>
            </div>

            {/* Detail Tabs / Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Section 1: Biometrics & Forensic Indicators */}
              <div className="p-4 border border-[#e5e0f0] bg-[#f8f6fc] rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4338ca] uppercase tracking-wide border-b border-[#e5e0f0] pb-2">
                  <Fingerprint size={15} />
                  <span>Biometric Identification</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#4b465c] text-[10px] block uppercase font-semibold">Blood Type:</span>
                    <strong className="text-[#0f0d1a] font-mono">{selectedCitizen.biometrics.bloodType}</strong>
                  </div>
                  <div>
                    <span className="text-[#4b465c] text-[10px] block uppercase font-semibold">Physical Build:</span>
                    <span className="text-[#0f0d1a]">{selectedCitizen.biometrics.height} · {selectedCitizen.biometrics.weight}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#4b465c] text-[10px] block uppercase font-semibold">Fingerprint Classification:</span>
                    <span className="font-mono text-[#0f0d1a] text-xs">{selectedCitizen.biometrics.fingerprintClass}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#4b465c] text-[10px] block flex items-center gap-1 uppercase font-semibold">
                      <Dna size={12} className="text-[#4338ca]" />
                      CODIS DNA Index Reference:
                    </span>
                    <span className="font-mono text-[#0f0d1a] text-xs bg-white border border-[#d4ceeb] px-2 py-0.5 rounded font-bold inline-block mt-0.5">
                      {selectedCitizen.biometrics.dnaReferenceId}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#4b465c] text-[10px] block uppercase font-semibold">Facial Recognition Match:</span>
                    <span className="text-emerald-800 font-bold text-xs">{selectedCitizen.biometrics.facialMatchConfidence}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Telecommunications & Digital Footprint */}
              <div className="p-4 border border-[#e5e0f0] bg-[#f8f6fc] rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4338ca] uppercase tracking-wide border-b border-[#e5e0f0] pb-2">
                  <Phone size={15} />
                  <span>Telecom &amp; Network Nodes</span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] text-[10px] uppercase font-semibold">Registered Phone:</span>
                    <strong className="text-[#0f0d1a] font-mono">{selectedCitizen.telecom.phone}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] text-[10px] uppercase font-semibold">Carrier Network:</span>
                    <span className="text-[#0f0d1a]">{selectedCitizen.telecom.carrier}</span>
                  </div>
                  {selectedCitizen.telecom.imsi && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c] text-[10px] uppercase font-semibold">Cell IMSI:</span>
                      <span className="font-mono text-[#0f0d1a] text-xs">{selectedCitizen.telecom.imsi}</span>
                    </div>
                  )}
                  {selectedCitizen.telecom.ipAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c] text-[10px] uppercase font-semibold">Active IP:</span>
                      <span className="font-mono text-[#0f0d1a] text-xs bg-white border border-[#d4ceeb] px-1.5 py-0.5 rounded font-bold">
                        {selectedCitizen.telecom.ipAddress}
                      </span>
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="text-[#4b465c] text-[10px] block mb-1 uppercase font-semibold">Known Handles:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCitizen.telecom.onlineHandles.map((h) => (
                        <span
                          key={h}
                          className="px-2 py-0.5 rounded bg-white border border-[#d4ceeb] text-[#0f0d1a] text-xs"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Registered Motor Vehicles & Assets */}
            <div className="p-4 border border-[#e5e0f0] bg-[#f8f6fc] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4338ca] uppercase tracking-wide">
                  <Car size={15} />
                  <span>Registered Motor Vehicles ({selectedCitizen.vehicles.length})</span>
                </div>
                <span className="text-xs text-[#4b465c]">State DMV Database</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedCitizen.vehicles.map((v) => (
                  <div
                    key={v.plate}
                    className="p-3 bg-white border border-[#d4ceeb] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#0f0d1a] block">
                        {v.year} {v.makeModel}
                      </strong>
                      <span className="text-[#4b465c] text-xs">{v.color}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-[#f1edf7] border border-[#d4ceeb] font-mono font-bold text-[#0f0d1a] text-xs block">
                        {v.plate}
                      </span>
                      <span className="text-[10px] font-mono text-[#4b465c]">VIN: {v.vin.slice(-8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Criminal History & Prior Offenses */}
            <div className="p-4 border border-[#e5e0f0] bg-[#f8f6fc] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                  <Shield size={15} />
                  <span>Criminal &amp; Regulatory History</span>
                </div>
                <span className="text-xs text-[#4b465c]">
                  Status: <b className="text-[#0f0d1a]">{selectedCitizen.criminalRecord.probationStatus}</b>
                </span>
              </div>
              {selectedCitizen.criminalRecord.priorOffenses.length > 0 ? (
                <ul className="space-y-1.5">
                  {selectedCitizen.criminalRecord.priorOffenses.map((off, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#0f0d1a] bg-white p-2.5 rounded-lg border-l-3 border-rose-600 border border-[#e5e0f0]"
                    >
                      {off}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#4b465c] italic">
                  No prior felony infractions or arrest records found in this jurisdiction.
                </p>
              )}
            </div>

            {/* Section 5: Case Investigative Notes */}
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-col gap-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-900">
                <FileBadge size={14} />
                <span>Forensic &amp; Detective Case Notes</span>
              </div>
              <p className="leading-relaxed">
                {selectedCitizen.investigativeNotes}
              </p>
            </div>

            {/* Section 6: Known Associates & Connected Evidence Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Known Associates Network */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#4338ca] uppercase tracking-wide flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Known Associates ({selectedCitizen.associatedCitizenIds.length})</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCitizen.associatedCitizenIds.map((assocId) => {
                    const assoc = SEEDED_CITIZENS.find((c) => c.id === assocId);
                    if (!assoc) return null;

                    return (
                      <button
                        key={assoc.id}
                        type="button"
                        onClick={() => setSelectedCitizenId(assoc.id)}
                        className="px-3 py-2 rounded-lg border border-[#d4ceeb] bg-[#f8f6fc] hover:bg-[#ece7f4] text-left transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
                      >
                        <span
                          className={`w-6 h-6 rounded bg-gradient-to-br ${assoc.avatarColor} text-white font-mono text-xs font-black flex items-center justify-center`}
                        >
                          {assoc.avatarInitials}
                        </span>
                        <div>
                          <strong className="text-xs text-[#0f0d1a] block line-clamp-1">
                            {assoc.legalName}
                          </strong>
                          <span className="text-[11px] text-[#4b465c] block">
                            {assoc.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Linked Physical Evidence */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#4338ca] uppercase tracking-wide flex items-center gap-1.5">
                  <Package size={14} />
                  <span>Seized Belongings ({selectedCitizen.linkedEvidenceIds.length})</span>
                </h4>
                {selectedCitizen.linkedEvidenceIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCitizen.linkedEvidenceIds.map((evId) => {
                      const itemMatch = evidence.find((e) => e.id === evId);

                      return (
                        <button
                          key={evId}
                          type="button"
                          onClick={() => {
                            if (itemMatch) onOpenRecord(itemMatch);
                            else navigate('Evidence');
                          }}
                          className="px-3 py-2 rounded-lg border border-[#d4ceeb] bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Package size={13} className="text-[#4338ca]" />
                          <span className="font-mono text-[#4338ca]">{evId}</span>
                          <span className="text-xs font-normal text-[#4b465c]">
                            ({itemMatch?.data?.type || 'Physical Specimen'}) ↗
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#4b465c] italic">
                    No physical belongings currently booked in Evidence Room for this person.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
