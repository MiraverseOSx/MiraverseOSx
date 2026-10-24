import { CaseRelationship } from '@/lib/dga-types';

export const seedCaseRelationships: CaseRelationship[] = [
  {
    id: 'CREL-01',
    sourceCaseId: 'DGA-26-194',
    targetCaseId: 'MED-26-441',
    type: 'suspected_related',
    notes: 'Identical acute cholinesterase inhibition profile observed in ICU cluster patients.',
    discovered: true
  },
  {
    id: 'CREL-02',
    sourceCaseId: 'DGA-26-194',
    targetCaseId: 'CYB-26-091',
    type: 'classified_connection',
    notes: 'Substation 14 cyber probe was timed to drop embassy security surveillance 15 minutes before toxin delivery.',
    discovered: false
  },
  {
    id: 'CREL-03',
    sourceCaseId: 'DGA-26-194',
    targetCaseId: 'GOV-26-044',
    type: 'shares_organization',
    notes: 'Phoenix Biotech dual-use precursor diversion suspected as chemical origin.',
    discovered: true
  }
];
