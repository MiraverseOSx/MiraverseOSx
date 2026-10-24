'use client';
import { useState } from 'react';
import {
  Package,
  Microscope,
  Compass,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface CrimeSceneProps {
  navigate: (view: string) => void;
}

interface EvidenceMarker {
  id: string;
  markerNumber: number;
  label: string;
  category: 'physical' | 'trace' | 'impression' | 'digital';
  location: string;
  x: number; // percentage coordinate on map
  y: number;
  description: string;
  intakeRef?: string;
  recoveredBy: string;
  lightingMethod: string;
  condition: string;
  isCollected: boolean;
}

interface SceneZone {
  id: string;
  name: string;
  code: string;
  sector: string;
  status: 'Secured' | 'Processing' | 'Cleared';
  markersCount: number;
  description: string;
}

const ZONES: SceneZone[] = [
  {
    id: 'zone-1',
    name: 'East Wing Conservatory Window',
    code: 'SEC-A1-EAST',
    sector: 'Zone 1 · Point of Entry',
    status: 'Secured',
    markersCount: 2,
    description: 'Ground floor divided-light glass window. Latch mechanism forced open with exterior pry marks.',
  },
  {
    id: 'zone-2',
    name: 'Perimeter Fence & Service Road',
    code: 'SEC-B4-PERIM',
    sector: 'Zone 2 · Ingress Route',
    status: 'Processing',
    markersCount: 1,
    description: 'Gravel access path along east security fence. Soft mud embankment showing tire & boot impressions.',
  },
  {
    id: 'zone-3',
    name: 'Botanical Vault Interior Corridor',
    code: 'SEC-C2-VAULT',
    sector: 'Zone 3 · Target Area',
    status: 'Secured',
    markersCount: 1,
    description: 'High-security climate-controlled containment wing. Vault door #04 found unlocked with access bypass.',
  },
  {
    id: 'zone-4',
    name: 'Security Guard Gatehouse',
    code: 'SEC-D1-GATE',
    sector: 'Zone 4 · Dispatch Hub',
    status: 'Cleared',
    markersCount: 0,
    description: 'Main facility perimeter checkpoint. 911 dispatch initiated at 02:46 UTC by Guard Jenkins.',
  },
];

const INITIAL_MARKERS: EvidenceMarker[] = [
  {
    id: 'MARKER-01',
    markerNumber: 1,
    label: 'Fractured Window Glass Shards',
    category: 'physical',
    location: 'East Wing Window Sill & Interior Flooring',
    x: 48,
    y: 35,
    description: 'Radial and concentric fracture patterns with Becke line index n=1.517. Exterior force applied.',
    intakeRef: 'EV-0001',
    recoveredBy: 'Lead Tech M. Davis (ID #4401)',
    lightingMethod: 'Oblique White Light & 254nm Shortwave UV',
    condition: 'Packaged in rigid metal evidence tin, tamper-evident tape sealed.',
    isCollected: true,
  },
  {
    id: 'MARKER-02',
    markerNumber: 2,
    label: 'Navy Acrylic Fleece Fiber',
    category: 'trace',
    location: 'Jagged Upper-Left Glass Shard Edge',
    x: 52,
    y: 40,
    description: 'Trilobal cross-section synthetic polymer fiber snagged on sharp glass edge. High birefringence.',
    intakeRef: 'EV-0002',
    recoveredBy: 'Lead Tech M. Davis (ID #4401)',
    lightingMethod: 'ALS 450nm Blue Light with Yellow Barrier Filter',
    condition: 'Lifted with forensic gelatin lifter, sealed in glassine envelope.',
    isCollected: true,
  },
  {
    id: 'MARKER-03',
    markerNumber: 3,
    label: 'Wet Mud Lug Boot Impression',
    category: 'impression',
    location: 'East Fence Ingress Mud Embankment',
    x: 25,
    y: 72,
    description: 'Size 10.5 tactical lug tread impression. Heel wear pattern indicates right-side pronation.',
    intakeRef: 'EV-0003',
    recoveredBy: 'CSI Officer Jenkins (ID #319)',
    lightingMethod: 'Low-Angle Oblique LED Raking Light',
    condition: 'Photographed with millimeter scale, dental stone casting prepared.',
    isCollected: true,
  },
  {
    id: 'MARKER-04',
    markerNumber: 4,
    label: 'SIM Card Tray & Micro-SIM Scrap',
    category: 'digital',
    location: 'Vault Corridor Threshold Floor Grate',
    x: 75,
    y: 28,
    description: 'Prepaid SIM card snapped in half. ICCID #890141032114921 recovered and routed to Cyber Lab.',
    intakeRef: 'ART-001',
    recoveredBy: 'Cyber Special Agent K. Patel',
    lightingMethod: 'Handheld Macro Inspection Loupe',
    condition: 'Faraday pouch sealed to prevent remote signal wipe.',
    isCollected: true,
  },
];

export default function CrimeScene({ navigate }: CrimeSceneProps) {
  const [selectedZone, setSelectedZone] = useState<string>('zone-1');
  const [selectedMarker, setSelectedMarker] = useState<EvidenceMarker>(INITIAL_MARKERS[0]);
  const [viewMode, setViewMode] = useState<'blueprint' | 'photolog' | 'trajectory'>('blueprint');

  const currentZone = ZONES.find((z) => z.id === selectedZone) || ZONES[0];

  return (
    <div className="crime-scene-page space-y-6">
      <InvestigationBreadcrumbs currentView="Crime Scene (CSI)" navigate={navigate} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#4338ca] uppercase tracking-wider mb-1">
            <Compass size={14} className="text-[#4338ca]" />
            <span>CRIME SCENE INVESTIGATION · PRIMARY INCIDENT SCENE</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#0f0d1a] tracking-tight flex items-center gap-3">
            Botanical Conservatory Sector East
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
              SCENE SECURED
            </span>
          </h1>
          <p className="text-[11px] text-[#2c273d] mt-1">
            Scene Ref: <span className="font-mono font-semibold text-[#0f0d1a]">CSI-2026-0881</span> · Weather: Overcast / Rain (11°C) · First Response: MPD Unit 14
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('Detective Desk')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-xs font-semibold text-[#0f0d1a] transition-colors cursor-pointer"
          >
            <FolderKanban size={13} className="text-[#4338ca]" />
            <span>Corkboard Link</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Evidence')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Package size={13} />
            <span>Open Evidence Room</span>
          </button>
        </div>
      </div>

      {/* Zone Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ZONES.map((zone) => {
          const isSelected = zone.id === selectedZone;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone(zone.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#fcfaff] border-2 border-[#4338ca] shadow-sm ring-1 ring-[#4338ca]/20'
                  : 'bg-white hover:bg-[#fbf9fe] border-[#d4ceeb]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#4338ca] font-mono font-bold">{zone.code}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    zone.status === 'Secured'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#f1edf7] text-[#4b465c] border border-[#d4ceeb]'
                  }`}
                >
                  {zone.status}
                </span>
              </div>
              <div className="text-sm font-bold text-[#0f0d1a] truncate mb-1">{zone.name}</div>
              <div className="text-xs text-[#4b465c] line-clamp-2 leading-relaxed">{zone.description}</div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-[#2c273d]">
                <span>{zone.sector}</span>
                <span className="font-bold text-[#4338ca]">{zone.markersCount} Markers</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Spatial Floorplan / Blueprint */}
        <div className="lg:col-span-8 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#e5e0f0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4338ca]" />
              <span className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wide">
                {currentZone.name} · Spatial Floorplan
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#f8f6fc] p-1 rounded-lg border border-[#e5e0f0]">
              <button
                type="button"
                onClick={() => setViewMode('blueprint')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'blueprint' ? 'bg-[#4338ca] text-white shadow-sm' : 'text-[#4b465c] hover:text-[#0f0d1a]'
                }`}
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => setViewMode('trajectory')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'trajectory' ? 'bg-[#4338ca] text-white shadow-sm' : 'text-[#4b465c] hover:text-[#0f0d1a]'
                }`}
              >
                Intruder Vector
              </button>
              <button
                type="button"
                onClick={() => setViewMode('photolog')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'photolog' ? 'bg-[#4338ca] text-white shadow-sm' : 'text-[#4b465c] hover:text-[#0f0d1a]'
                }`}
              >
                Photo Gallery
              </button>
            </div>
          </div>

          {/* Interactive Scene Canvas */}
          <div className="relative w-full h-[380px] bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg overflow-hidden flex items-center justify-center p-4 select-none">
            {/* Blueprint Grid Lines */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#dcd5ed 1px, transparent 1px), linear-gradient(90deg, #dcd5ed 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Compass Rose */}
            <div className="absolute top-3 right-3 text-xs font-mono text-[#0f0d1a] border border-[#d4ceeb] bg-white px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 pointer-events-none">
              <Compass size={13} className="text-[#4338ca]" />
              <span className="font-bold">N ↑ 045° AZ</span>
            </div>

            {/* Trajectory Ingress Vector (Visible in Trajectory mode) */}
            {viewMode === 'trajectory' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4338ca" />
                  </marker>
                </defs>
                <path
                  d="M 120 280 Q 280 200, 360 145 T 580 110"
                  fill="none"
                  stroke="#4338ca"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#arrow)"
                />
                <text x="140" y="270" fill="#2c273d" fontSize="11" fontWeight="bold">
                  EGRESS EAST FENCE (02:14 UTC)
                </text>
                <text x="380" y="130" fill="#4338ca" fontSize="11" fontWeight="bold">
                  WINDOW BREACH (01:48 UTC)
                </text>
              </svg>
            )}

            {/* Schematic Architectural Layout Boxes */}
            <div className="absolute w-[80%] h-[70%] border-2 border-[#a89bc2] rounded-lg bg-white/85 shadow-sm pointer-events-none">
              <div className="absolute top-2 left-3 text-xs font-bold text-[#4338ca] uppercase tracking-wide">
                EAST CONSERVATORY WING · LEVEL 1
              </div>
              <div className="absolute bottom-2 right-3 text-[11px] font-mono text-[#4b465c]">
                COORDINATES: 38°53&apos;21.4&quot;N 77°02&apos;11.8&quot;W
              </div>
              {/* Internal partition lines */}
              <div className="absolute top-1/3 left-0 right-0 border-b border-[#d4ceeb] border-dashed" />
              <div className="absolute top-0 bottom-0 left-1/2 border-r border-[#d4ceeb] border-dashed" />
            </div>

            {/* Markers placed on canvas - Standard Yellow Crime Scene Placards */}
            {INITIAL_MARKERS.map((marker) => {
              const isSelected = selectedMarker.id === marker.id;
              return (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => setSelectedMarker(marker)}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 p-1 rounded-md transition-all cursor-pointer ${
                    isSelected
                      ? 'scale-115 ring-2 ring-[#4338ca] bg-amber-300 text-[#0f0d1a] shadow-md font-bold'
                      : 'bg-white hover:bg-amber-50 border border-amber-400 text-[#0f0d1a] shadow-xs'
                  }`}
                  title={`Marker #${marker.markerNumber}: ${marker.label}`}
                >
                  <span className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-xs font-black text-[#0f0d1a] border border-amber-500">
                    {marker.markerNumber}
                  </span>
                  <span className="text-xs font-semibold pr-1 text-[#0f0d1a] hidden sm:inline-block">
                    {marker.intakeRef || `MK-${marker.markerNumber}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Scene Diagnostics Footer */}
          <div className="mt-4 pt-3 border-t border-[#e5e0f0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#2c273d]">
            <div className="flex items-center gap-4">
              <span>Scene Lighting: <strong className="text-[#0f0d1a]">Oblique / ALS UV</strong></span>
              <span>Intruder Trace: <strong className="text-emerald-700">Positive Matched</strong></span>
            </div>
            <div className="text-xs font-medium text-[#4338ca]">
              Click any evidence marker on the canvas to inspect forensic recovery notes
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Active Marker Forensic Dossier */}
        <div className="lg:col-span-4 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e5e0f0]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-300 text-[#0f0d1a] font-black text-xs border border-amber-400">
                  MARKER #{selectedMarker.markerNumber}
                </span>
                <span className="text-xs font-mono font-bold text-[#0f0d1a]">
                  {selectedMarker.intakeRef || `MK-${selectedMarker.markerNumber}`}
                </span>
              </div>
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-[#f1edf7] border border-[#d4ceeb] text-[#2c273d]">
                {selectedMarker.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#0f0d1a] mb-1.5">{selectedMarker.label}</h3>
            <p className="text-xs text-[#2c273d] leading-relaxed mb-4">{selectedMarker.description}</p>

            <div className="space-y-2.5 text-xs bg-[#f8f6fc] p-3.5 rounded-lg border border-[#e5e0f0]">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#4b465c] font-semibold">Recovery Spot:</span>
                <span className="text-[#0f0d1a] text-right font-medium">{selectedMarker.location}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#4b465c] font-semibold">Technician:</span>
                <span className="text-[#0f0d1a] text-right">{selectedMarker.recoveredBy}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#4b465c] font-semibold">Lighting/Optics:</span>
                <span className="text-[#4338ca] font-medium text-right">{selectedMarker.lightingMethod}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#4b465c] font-semibold">Packaging:</span>
                <span className="text-[#0f0d1a] text-right">{selectedMarker.condition}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
              <span className="font-medium">Chain of Custody sealed. Transferred to Secure Locker A-04.</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e5e0f0] space-y-2">
            <button
              type="button"
              onClick={() => navigate('Laboratory')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Microscope size={14} />
              <span>Run Bench Analysis in Lab</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('Evidence')}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-xs font-semibold text-[#0f0d1a] transition-colors cursor-pointer"
            >
              <Package size={14} />
              <span>View in Evidence Custody Chain</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
