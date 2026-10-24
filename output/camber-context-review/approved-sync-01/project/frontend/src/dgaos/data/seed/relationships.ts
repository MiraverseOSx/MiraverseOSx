export type RelationshipType =
  | 'employed_by'
  | 'related_to'
  | 'suspected_of'
  | 'assigned_to'
  | 'treated_at'
  | 'investigating'
  | 'allied_with'
  | 'hostile_to';

export interface SeedRelationship {
  id: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: RelationshipType;
  notes?: string;
}

export const seedRelationships: SeedRelationship[] = [
  {
    id: 'REL-001',
    sourceId: 'DGA-SA-8804',
    sourceName: 'Special Agent Miracle Jerome',
    targetId: 'DGA-26-194',
    targetName: 'Operation Velvet Cord',
    type: 'assigned_to',
    notes: 'Primary case director for the diplomatic poisoning investigation.'
  },
  {
    id: 'REL-002',
    sourceId: 'P-101',
    sourceName: 'Ambassador Christian Vance',
    targetId: 'LOC-03',
    targetName: 'St. Jude Isolation Ward 4-B',
    type: 'treated_at',
    notes: 'Admitted under emergency neuro-intensive care following collapse at Embassy Row.'
  },
  {
    id: 'REL-003',
    sourceId: 'P-102',
    sourceName: 'Dr. Gregory Thorne',
    targetId: 'ORG-02',
    targetName: 'St. Jude Metropolitan Hospital',
    type: 'employed_by',
    notes: 'Chief of Critical Toxicology supervising emergency stabilization protocol.'
  },
  {
    id: 'REL-004',
    sourceId: 'P-103',
    sourceName: 'Viktor Krell',
    targetId: 'ORG-04',
    targetName: 'Phoenix Biotech Ltd.',
    type: 'suspected_of',
    notes: 'Suspected illicit synthesis broker funneling organophosphates through Phoenix Bio shell companies.'
  },
  {
    id: 'REL-005',
    sourceId: 'P-104',
    sourceName: 'Courier Marcus Vance',
    targetId: 'LOC-04',
    targetName: 'Harbor Free-Trade Zone Warehouse 18',
    type: 'suspected_of',
    notes: 'Last GPS ping and diplomatic pouch transponder recorded at this industrial warehouse.'
  },
  {
    id: 'REL-006',
    sourceId: 'P-105',
    sourceName: 'Elena Rostova',
    targetId: 'ORG-03',
    targetName: 'Cygnus Dynamics',
    type: 'employed_by',
    notes: 'Senior SCADA firmware engineer cooperating with DGA cyber forensics.'
  },
  {
    id: 'REL-007',
    sourceId: 'DGA-SA-8804',
    sourceName: 'Special Agent Miracle Jerome',
    targetId: 'ORG-05',
    targetName: 'TRACE Central Forensic Facility',
    type: 'investigating',
    notes: 'Has active forensic transfer pipeline with TRACE toxicologists for rapid substance characterization.'
  }
];
