export interface SeedOrganization {
  id: string;
  name: string;
  type: 'Government Agency' | 'Foreign Embassy' | 'Defense Contractor' | 'Hospital / Research' | 'Syndicate';
  jurisdiction: string;
  securityClassification: string;
  overview: string;
}

export const seedOrganizations: SeedOrganization[] = [
  {
    id: 'ORG-01',
    name: 'Department of Global Affairs (DGA)',
    type: 'Government Agency',
    jurisdiction: 'Federal / Extraterritorial Special Jurisdiction',
    securityClassification: 'LEVEL 5 OVERSIGHT',
    overview: 'Principal federal agency governing strategic intelligence, counter-threat diplomacy, bio-surveillance, and classified special operations.'
  },
  {
    id: 'ORG-02',
    name: 'St. Jude Metropolitan Hospital',
    type: 'Hospital / Research',
    jurisdiction: 'Metro District (Federal Liaison Enclave)',
    securityClassification: 'CIVILIAN / RESTRICTED ICU',
    overview: 'Level 1 Trauma center and regional biohazard referral hospital equipped with Level 4 negative-pressure isolation suites.'
  },
  {
    id: 'ORG-03',
    name: 'Cygnus Dynamics',
    type: 'Defense Contractor',
    jurisdiction: 'Industrial Sector 7',
    securityClassification: 'SECRET / INDUSTRIAL DEFENSE',
    overview: 'Critical infrastructure vendor responsible for municipal power SCADA systems, automated turbine governors, and naval telemetry.'
  },
  {
    id: 'ORG-04',
    name: 'Phoenix Biotech Ltd.',
    type: 'Hospital / Research',
    jurisdiction: 'Harbor Free Trade Zone',
    securityClassification: 'CORPORATE / COMMERCE WATCHLIST',
    overview: 'Pharmaceutical synthesis exporter recently cited for non-compliance regarding dual-use chemical precursor tracking.'
  },
  {
    id: 'ORG-05',
    name: 'TRACE Central Forensic Facility',
    type: 'Government Agency',
    jurisdiction: 'Federal Forensic Command',
    securityClassification: 'FORENSIC / RESTRICTED EVIDENCE ENCLAVE',
    overview: 'Dedicated high-precision forensic laboratory handling toxicology, mass spectrometry, ballistics, and trace material verification for DGA operations.'
  }
];
