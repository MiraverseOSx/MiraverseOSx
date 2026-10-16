import { CaseBlueprint } from '@/lib/dga-types';

export const seedCaseBlueprints: Record<string, CaseBlueprint> = {
  'DGA-26-194': {
    caseId: 'DGA-26-194',
    seed: 1948804,
    incident: 'Diplomatic Poisoning of Ambassador Christian Vance',
    initiatingEvent: 'Ambassador collapsed mid-sentence during bilateral economic negotiations.',
    hiddenTruth: {
      culprit: 'Viktor Krell contracted by rogue Eurasian syndicate operative via Embassy catering badge 8891',
      cause: 'Fluorophosphate ester with dimethyl sulfoxide penetration enhancer applied to carafe lip',
      secretConnection: 'Toxin was produced using dual-use reagents diverted from Phoenix Biotech harbor warehouse',
      hiddenEvidence: [
        'Disposable latex glove fragment with DMSO residue in pantry freight elevator trash',
        'Audio artifact: faint click of aerosol spray 14 minutes prior to summit start'
      ],
      futureTwist: 'Ambassador Vance was carrying an unrecorded Swiss safe-deposit key in his fountain pen barrel',
      correctDiagnosis: 'Delayed-action synthetic fluorophosphate organophosphate cholinergic crisis',
      intelligenceSource: 'Station Geneva Swiss financial banking intercept',
      finalLocation: 'Harbor Free-Trade Zone Warehouse 18 (Slip 4-B)'
    },
    knownFacts: [
      'Ambassador Vance in ICU at St. Jude Metro Hospital under Level 4 isolation.',
      'Serum cholinesterase is depressed below 28%.',
      'Pantry door opened with badge 8891 with biometric mismatch.'
    ],
    unknownFacts: [
      'Chemical was synthesized in domestic regional harbor laboratory, not foreign soil.',
      'Courier Marcus Vance went missing after intercepting secondary batch.'
    ],
    falseLeads: [
      'Initial claim that the embassy air conditioning duct was aerosol-seeded (disproven by negative HVAC filter swabs).'
    ],
    systemConnections: ['TRACE', 'MEDSTAT', 'ORACLE', 'CIPHER', 'AEGIS'],
    escalationRules: [
      'If Vance ICU vitals drop below threshold, trigger Emergency Directorate Flash Alert.',
      'If Viktor Krell harbor departure occurs without interdiction, case escalates to International Fugitive Status.'
    ],
    resolutionConditions: [
      'TRACE mass spectrometry identification of chemical signature matches Phoenix precursor batch.',
      'Interdiction of Viktor Krell at Harbor Warehouse 18.'
    ]
  },
  'CYB-26-091': {
    caseId: 'CYB-26-091',
    seed: 918804,
    incident: 'SCADA Substation 14-B Ingress & Firmware Manipulation',
    initiatingEvent: 'Safety trip governors disabled on high-voltage power router.',
    hiddenTruth: {
      culprit: 'Contractor engineer laptop compromised via spear-phishing disguised as firmware calibration certificate',
      cause: 'Buffer overflow injection in Siemens S7-1500 communication module',
      secretConnection: 'The cyber ingress was timed to coincide with the power blackout of Embassy Row security grid',
      hiddenEvidence: [
        'Hardcoded IP address in PLC flash image points to virtual private server registered to Phoenix Bio subsidiary'
      ],
      futureTwist: 'The substation probe was a diversion to test emergency generator transition delays',
      correctDiagnosis: 'State-sponsored ICS cyber-sabotage payload',
      intelligenceSource: 'Cygnus network perimeter log watchdog',
      finalLocation: 'Offshore cloud command node'
    },
    knownFacts: [
      'Siemens S7 PLC flash memory modified at 03:22 UTC.',
      'Packets dropped at perimeter boundary switch.'
    ],
    unknownFacts: [
      'Internal contractor workstation was patient zero for credential compromise.'
    ],
    falseLeads: [
      'Suspected brute-force SSH attack (in reality it was a stolen cryptographic token).'
    ],
    systemConnections: ['CIPHER', 'AEGIS', 'TRACE', 'CIVITAS'],
    escalationRules: [
      'If secondary payload executes during peak hours, regional grid experiences cascading brownout.'
    ],
    resolutionConditions: [
      'TRACE digital forensics extracts C2 IP and cryptographic certificate from desoldered flash memory.',
      'Perimeter firewall isolation rules deployed.'
    ]
  }
};
