export interface SeedAgentProfile {
  id: string;
  name: string;
  badgeNumber: string;
  title: string;
  division: string;
  clearanceLevel: number;
  clearanceCode: string;
  callsign: string;
  station: string;
  dateAssigned: string;
  specializations: string[];
  commendations: string[];
}

export const primarySeedAgent: SeedAgentProfile = {
  id: 'DGA-SA-8804',
  name: 'Miracle Jerome',
  badgeNumber: 'DGA-092-OMEGA',
  title: 'Senior Special Agent / Case Director',
  division: 'Multidisciplinary Operations & Strategic Oversight',
  clearanceLevel: 5,
  clearanceCode: 'LEVEL 5 // TOP SECRET // NOFORN // SPECIAL COMPARTMENTED',
  callsign: 'AEGIS-ACTUAL',
  station: 'HQ Secure Node 04 (Langley Enclave)',
  dateAssigned: '2023-04-12',
  specializations: [
    'Forensic Specimen Triage',
    'Diplomatic Counter-Intelligence',
    'Critical SCADA Infrastructure Protection',
    'Classified Inter-Agency Coordination (Liaison)'
  ],
  commendations: [
    'Distinguished Intelligence Medal (Operation Silver Needle)',
    'Directorate Citation for Excellence in Forensic Reconstruction',
    'Presidential Special Assignment Commendation'
  ]
};
