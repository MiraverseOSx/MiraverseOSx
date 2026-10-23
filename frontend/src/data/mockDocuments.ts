/**
 * MIRAVERSE OS x — Canonical Mock Document & Virtual File System Repository
 * Implements all 17 canonical file extensions and types from §7 of the Game Design Document.
 */

export interface MockDocument {
  title: string;
  category: string;
  type: string; // 'osform' | 'doc' | 'txt' | 'log' | 'arch' | 'map' | 'node' | 'grid' | 'mod' | 'spell' | 'veil' | 'diag' | 'aura' | 'sig' | 'img' | 'sys' | 'prism';
  summary: string;
  origin?: string;
  author?: string;
  date?: string;
  isEncrypted?: boolean;
  requiredSkill?: string;
  content: {
    sections: {
      title: string;
      body: string;
    }[];
    formFields?: {
      id: string;
      label: string;
      type: 'text' | 'select' | 'checkbox' | 'radio';
      options?: string[];
      defaultValue?: string;
      placeholder?: string;
    }[];
    mapData?: {
      district: string;
      nodes: { id: string; name: string; x: number; y: number; type: string }[];
    };
  };
}

export const MOCK_DOCUMENTS: Record<string, MockDocument> = {
  // 1. .osform - Interactive Forms
  'citizen-registration': {
    title: 'CITIZEN_REGISTRATION_FORM.osform',
    category: 'Civic Onboarding',
    type: 'osform',
    summary: 'Official Aureline Civic Identity Bureau onboarding and biometric intake form.',
    author: 'Aureline Civic Identity Bureau',
    date: 'Sys-Cycle Day 1',
    content: {
      sections: [
        {
          title: 'Directive 14-B: Mandatory Registration',
          body: 'All arriving residents in the coastal city of Aureline must register their declared district, house assignment, and aura resonance tier.'
        }
      ],
      formFields: [
        { id: 'residentName', label: 'Citizen Legal Handle', type: 'text', placeholder: 'e.g. Cipher-01' },
        { id: 'assignedHouse', label: 'Cyacademy House Affiliation', type: 'select', options: ['Vertex (Strategists)', 'Vector (Innovators)', 'Anchor (Guardians)', 'Pulse (Connectors)'] },
        { id: 'districtPlacement', label: 'Initial District', type: 'select', options: ['Glassline District', 'Lumen Market', 'Cyacademy Campus', 'Faith Medical Campus'] },
        { id: 'agreeTerms', label: 'I acknowledge the terms of the Aureline System Governance', type: 'checkbox' }
      ]
    }
  },

  'housing-temp-assignment': {
    title: 'HOUSING_TEMP_ASSIGNMENT.osform',
    category: 'Housing Services',
    type: 'osform',
    summary: 'Provisional housing suite allocation and room key confirmation.',
    author: 'Housing Services Bureau',
    date: 'Sys-Cycle Day 1',
    content: {
      sections: [
        {
          title: 'Housing Unit 4B Allocation',
          body: 'Your provisional starter housing suite is located on Campus North Wing. Room features include a Rest Bed, Study Desk, and Secure Storage Vault.'
        }
      ],
      formFields: [
        { id: 'roomConfirm', label: 'Confirm Housing 4B Assignment', type: 'select', options: ['Accept Assignment', 'Request East Wing Transfer'] },
        { id: 'mattressUpgrade', label: 'Request Better Mattress (+Stamina)', type: 'checkbox' }
      ]
    }
  },

  'faith-patient-intake': {
    title: 'FAITH_PATIENT_INTAKE.osform',
    category: 'Healthcare & Diagnostics',
    type: 'osform',
    summary: 'Faith Medical Group clinical admission and aura flux baseline questionnaire.',
    author: 'Dr. Ilyra Saint (Faith Medical)',
    date: 'Sys-Cycle Day 1',
    content: {
      sections: [
        {
          title: 'Aura Health & Veil Exposure Screening',
          body: 'Faith Medical is the only authorized healthcare network licensed to treat Veil exposure, neural desynchronization, and memory fragmentation.'
        }
      ],
      formFields: [
        { id: 'conditionReport', label: 'Current Reported Symptoms', type: 'select', options: ['None / Normal', 'Veilwilt (Memory Fog)', 'Frostlung (Cryo Chest Pain)', 'Sunspire Burn Fever'] },
        { id: 'diagnosticConsent', label: 'Authorize Thermal Aura Diagnostics Sync', type: 'checkbox' }
      ]
    }
  },

  // 2. .doc / .txt - Plain Text Documents
  'personal-log': {
    title: 'Personal_Log_88.txt',
    category: 'Diary Log',
    type: 'txt',
    summary: 'Personal diary log from a former resident of Housing Unit 4B.',
    author: 'Previous Occupant',
    date: 'Cycle 14',
    content: {
      sections: [
        {
          title: 'Night Shift at Old Factory Ward',
          body: 'The factory basement hums at night. The Supercomputer isn\'t just running algorithms—it\'s dreaming. Last night I saw an AETHERCORE prompt on an ancient terminal.'
        }
      ]
    }
  },

  // 3. .log - System Logs
  'system-audit': {
    title: 'System_Audit.log',
    category: 'System Telemetry',
    type: 'log',
    summary: 'Automated memory leak trace from Aureline Core Substation.',
    author: 'Kernel Daemon',
    date: 'Cycle 28',
    content: {
      sections: [
        {
          title: 'Kernel Audit Trail',
          body: 'ERROR 0x7F-PRISM: Unregistered thread PID 512 detected attempting memory override in /sys/veil/matrix. Quarantine recommended.'
        }
      ]
    }
  },

  // 4. .arch - Encrypted Archive
  'purge-archive': {
    title: 'Purge_Record_01.arch',
    category: 'Classified History',
    type: 'arch',
    isEncrypted: true,
    requiredSkill: 'Cryptography',
    summary: 'Classified historical manuscript describing the attempted erasure of the Lightborn lineage.',
    author: 'Archive Keepers',
    date: 'Year 0 (Purge Era)',
    content: {
      sections: [
        {
          title: 'DECRYPTED: The Erasure of Lightborn Records',
          body: 'Maeryn Seraphima founded the sanctuary on March 6, Year 0. Those born with Lightborn inheritance bear the direct pre-code signature capable of sealing data leaks.'
        }
      ]
    }
  },

  // 5. .map - Vector Maps
  'glassline-map': {
    title: 'Glassline_District.map',
    category: 'Navigation',
    type: 'map',
    summary: 'Tactical navigation vector map of Glassline District and tram routes.',
    author: 'Aureline Transit Authority',
    date: 'Current',
    content: {
      sections: [
        {
          title: 'District Grid Layout',
          body: 'Major server nodes, corporate tech hubs, and Faith Medical clinics are linked along Tram Line 01.'
        }
      ],
      mapData: {
        district: 'Glassline District',
        nodes: [
          { id: 'n1', name: 'Corporate Tower A', x: 20, y: 30, type: 'Tech' },
          { id: 'n2', name: 'Central Tram Station', x: 50, y: 50, type: 'Transit' },
          { id: 'n3', name: 'Faith Clinic #04', x: 80, y: 70, type: 'Medical' },
          { id: 'n4', name: 'Veil Anomaly Zone', x: 90, y: 20, type: 'Hazard' }
        ]
      }
    }
  },

  // 6. .mod & .spell - SpellForge
  'firewall-mod': {
    title: 'Firewall_v2.mod',
    category: 'SpellForge Module',
    type: 'mod',
    summary: 'Core defense module that redirects incoming corruption when combined with Routing.',
    author: 'Arcane Guild',
    date: 'Current',
    content: {
      sections: [
        {
          title: 'Module Specifications',
          body: 'Base Power: 65.0 | Element: Ignis (Kaji) | Type: Protocol Defense. Combine with Routing to craft Reflect Shield.'
        }
      ]
    }
  },

  // 7. .diag & .aura - Medical
  'faith-diag': {
    title: 'Dr_Saint_Aura_Report.diag',
    category: 'Medical Diagnostic',
    type: 'diag',
    summary: 'Thermal aura scan measuring flux stability and elemental balance.',
    author: 'Dr. Ilyra Saint',
    date: 'Sys-Cycle 28',
    content: {
      sections: [
        {
          title: 'Thermal Aura Clinical Summary',
          body: 'Aura Heat: 38.4°C (Elevated). Flux Stability: 82%. Patient exhibits minor Veilwilt symptoms following Old Factory Ward exploration.'
        }
      ]
    }
  }
};

// Keep the stable file-inspection keys used by saved quests and mail links.
MOCK_DOCUMENTS['dga-registration'] = MOCK_DOCUMENTS['citizen-registration'];
MOCK_DOCUMENTS['aura-scan'] = MOCK_DOCUMENTS['faith-diag'];

const additionalFiles = [
  ['cryofreeze-mod', 'CryoFreeze.mod', 'mod', 'CryoFreeze module', 'Arcane Guild', 'A cooling protocol specification.', 'Module configuration', 'Element: Cryo\nRole: Thermal stabilization\nInput: Calibrated aura supply\nConstraint: Requires an isolated target channel.\nThis file is a specification; opening it does not execute the protocol.'],
  ['void-shield', 'Void_Shield.spell', 'spell', 'Void Shield recipe', 'Arcane Guild', 'A compiled defensive spell recipe.', 'Protocol recipe', 'Stage 1: Establish a stable boundary.\nStage 2: Route incoming flux away from protected nodes.\nStage 3: Release the boundary when the supply is interrupted.\nOperating limit: Defensive use only. This reader does not cast spells.'],
  ['bleed-manipulation', 'Bleed_Manipulation.veil', 'veil', 'Unstable Veil fragment', 'Recovery Service', 'A recovered reality fragment with uncertain integrity.', 'Recovery notice', 'The recovered fragment contains discontinuities between its recorded origin and its current position. Treat its contents as unverified. Do not interpret missing segments as confirmed events.'],
  ['aura-lean', 'Aura_Lean_Biometrics.aura', 'aura', 'Aura resonance profile', 'Faith Medical Group', 'Biometric resonance observations.', 'Resonance assessment', 'Profile type: Elemental lean and biometric correlation.\nInterpretation: A resonance profile describes observed tendencies, not a diagnosis or an identity credential. Compare with the original intake scan before drawing conclusions.'],
  ['net-relay', 'net_relay.sys', 'sys', 'Network relay driver', 'Municipal Systems Engineering', 'Read-only service configuration.', 'Service definition', 'SERVICE = net_relay\nPURPOSE = Municipal packet relay\nDEPENDENCY = stable power and authenticated routing\nDIAGNOSTIC = Check supply, signal continuity and terminal logs before replacing a relay.\nEXECUTION = Disabled in document reader'],
  ['aethercore-sys', 'AETHERCORE.sys', 'sys', 'AetherCore driver', 'Core Systems Archive', 'A legacy subterranean service record.', 'Driver manifest', 'SERVICE = AETHERCORE\nLAYER = Subterranean infrastructure\nSOURCE = Legacy core archive\nSIGNATURE = Pre-code lineage reference retained\nACCESS = Read-only manifest; no driver is installed by opening this file.'],
  ['prism-bleed', 'Malware_Infection.prism', 'prism', 'PRISM intrusion record', 'Kernel Monitor', 'A retained copy of a flagged process record.', 'Integrity findings', 'Unregistered thread: PID 512\nObserved target: /sys/veil/matrix\nEvent: Attempted memory override\nRecommendation: Compare with System_Audit.log. This retained record is evidence of an alert, not an executable malware sample.'],
  ['corrupted-bleed', 'Corrupted_Bleed.corrupt', 'corrupt', 'Damaged system fragment', 'Recovery Service', 'A partially readable recovery record.', 'Recovered text', '[BLOCK 01] Header recovered.\n[BLOCK 02] Payload unreadable.\n[BLOCK 03] Sequence checksum mismatch.\nRecovery is incomplete. Missing bytes cannot establish what the original file contained.'],
  ['intercept-sig', 'Transmission_Intercept.sig', 'sig', 'Intercepted signal', 'Signal Desk', 'A retained signal reference.', 'Signal record', 'Sub-conduit transmission reference. Use the signal player to inspect the available transmission record.'],
] as const;
for (const [key, title, type, category, author, summary, sectionTitle, body] of additionalFiles) {
  MOCK_DOCUMENTS[key] = { title, type, category, author, summary, date: 'Current', content: { sections: [{ title: sectionTitle, body }] } };
}
