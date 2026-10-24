'use client';

import React, { useState } from 'react';
import {
  Globe,
  Building2,
  Users,
  MapPin,
  Share2,
  Search,
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  DGAEntityPerson,
  DGAEntityOrganization,
  DGAEntityLocation,
  DGARelationship
} from '@/lib/dga-types';

interface DgaWorldViewerProps {
  people: DGAEntityPerson[];
  organizations: DGAEntityOrganization[];
  locations: DGAEntityLocation[];
  relationships: DGARelationship[];
}

export function DgaWorldViewer({
  people,
  organizations,
  locations,
  relationships
}: DgaWorldViewerProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'organizations' | 'locations' | 'relationships'>('people');
  const [search, setSearch] = useState('');

  const filterItem = (text: string) => text.toLowerCase().includes(search.toLowerCase());

  const filteredPeople = people.filter(
    (p) => filterItem(p.name) || filterItem(p.role) || filterItem(p.affiliation) || filterItem(p.bio)
  );

  const filteredOrgs = organizations.filter(
    (o) => filterItem(o.name) || filterItem(o.type) || filterItem(o.overview)
  );

  const filteredLocs = locations.filter(
    (l) => filterItem(l.name) || filterItem(l.type) || filterItem(l.description)
  );

  const filteredRels = relationships.filter(
    (r) => filterItem(r.sourceName) || filterItem(r.targetName) || filterItem(r.type) || (r.notes && filterItem(r.notes))
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#e9e8f0]">
      {/* Top Controls Bar */}
      <div className="p-4 bg-white border-b border-[#cfcddb] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5d5a86]">
            <Globe className="w-4 h-4" />
            CIVITAS / AEGIS PERSISTENT WORLD-STATE
          </div>
          <h1 className="text-xl font-bold text-[#1e1d2c]">Geopolitical Entity Registry & Entity Links</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7b7899]" />
            <input
              type="text"
              placeholder="Search world entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#cfcddb] rounded pl-8 pr-3 py-1.5 text-xs text-[#2a293c] placeholder-[#9593aa] focus:outline-none focus:border-[#7c79a8] w-64"
            />
          </div>

          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab('people')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                activeTab === 'people'
                  ? 'bg-[#5d5a86] text-white'
                  : 'bg-[#f0eff5] text-[#555370] hover:bg-[#e4e2ed]'
              }`}
            >
              Persons ({people.length})
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                activeTab === 'organizations'
                  ? 'bg-[#5d5a86] text-white'
                  : 'bg-[#f0eff5] text-[#555370] hover:bg-[#e4e2ed]'
              }`}
            >
              Agencies & Orgs ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                activeTab === 'locations'
                  ? 'bg-[#5d5a86] text-white'
                  : 'bg-[#f0eff5] text-[#555370] hover:bg-[#e4e2ed]'
              }`}
            >
              Sites ({locations.length})
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                activeTab === 'relationships'
                  ? 'bg-[#5d5a86] text-white'
                  : 'bg-[#f0eff5] text-[#555370] hover:bg-[#e4e2ed]'
              }`}
            >
              Entity Links ({relationships.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* PEOPLE TAB */}
        {activeTab === 'people' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => {
              const personRels = relationships.filter((r) => r.sourceId === person.id || r.targetId === person.id);

              return (
                <div key={person.id} className="bg-white border border-[#cfcddb] rounded-lg p-4 shadow-sm space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-[#1f1e30]">{person.name}</div>
                      <div className="text-[11px] text-[#63617b]">{person.role}</div>
                      <div className="text-[10px] text-[#8684a0] font-semibold mt-0.5">{person.affiliation}</div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        person.threatLevel === 'Severe'
                          ? 'bg-rose-100 text-rose-800'
                          : person.threatLevel === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {person.threatLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#4d4b65] leading-relaxed bg-[#f8f7fc] p-2.5 rounded">
                    {person.bio}
                  </p>

                  {/* Relationship badges */}
                  {personRels.length > 0 && (
                    <div className="pt-2 border-t border-[#f0eff5] space-y-1">
                      <div className="text-[10px] font-bold text-[#686683] uppercase">Entity Connections:</div>
                      {personRels.map((rel) => (
                        <div key={rel.id} className="text-[10px] flex items-center gap-1.5 text-[#52506b]">
                          <span className="font-mono bg-[#eeeef5] px-1 rounded font-semibold text-[#302e48]">
                            {rel.type.replace('_', ' ')}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 text-[#8886a4]" />
                          <span className="font-medium text-[#201f30]">
                            {rel.sourceId === person.id ? rel.targetName : rel.sourceName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#817f9b] pt-1 border-t border-[#f5f4f8]">
                    <span>STATUS: <strong className="text-[#201f30]">{person.status}</strong></span>
                    <span className="font-mono">{person.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ORGANIZATIONS TAB */}
        {activeTab === 'organizations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrgs.map((org) => (
              <div key={org.id} className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#5d5a86]" />
                    <div>
                      <div className="font-bold text-sm text-[#1f1e30]">{org.name}</div>
                      <div className="text-[11px] text-[#63617b]">{org.type} • {org.jurisdiction}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eeeef5] text-[#3d3b58]">
                    {org.securityClassification}
                  </span>
                </div>

                <p className="text-xs text-[#484662] leading-relaxed">
                  {org.overview}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#817f9b] pt-2 border-t border-[#f0eff5]">
                  <span>RECORD ID: <strong className="font-mono">{org.id}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLocs.map((loc) => (
              <div key={loc.id} className="bg-white border border-[#cfcddb] rounded-lg p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#5d5a86]" />
                    <div>
                      <div className="font-bold text-sm text-[#1f1e30]">{loc.name}</div>
                      <div className="text-[11px] text-[#63617b]">{loc.type} • {loc.coordinates}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      loc.threatLevel === 'Severe'
                        ? 'bg-rose-100 text-rose-800'
                        : loc.threatLevel === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {loc.threatLevel}
                  </span>
                </div>

                <p className="text-xs text-[#484662] leading-relaxed">
                  {loc.description}
                </p>

                <div className="text-[11px] text-[#555370] bg-[#f8f7fc] p-2 rounded">
                  Access: <strong>{loc.accessRestrictions}</strong>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#817f9b] pt-2 border-t border-[#f0eff5]">
                  <span>SITE ID: <strong className="font-mono">{loc.id}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RELATIONSHIPS TAB */}
        {activeTab === 'relationships' && (
          <div className="space-y-3 w-full">
            <div className="text-xs text-[#555370] pb-1">
              Active Geopolitical & Intelligence Relationships Graph
            </div>

            <div className="bg-white border border-[#cfcddb] rounded-lg overflow-hidden shadow-sm divide-y divide-[#ebe9f2] text-xs">
              {filteredRels.map((rel) => (
                <div key={rel.id} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#1f1e30]">{rel.sourceName}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#5d5a86] text-white uppercase font-bold">
                      {rel.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-sm text-[#1f1e30]">{rel.targetName}</span>
                  </div>

                  <div className="text-[11px] text-[#6a6886] max-w-md text-right">
                    {rel.notes || 'Direct intelligence link'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
