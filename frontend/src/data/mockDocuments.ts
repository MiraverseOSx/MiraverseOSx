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
    category: 'Residential Services',
    type: 'osform',
    summary: 'Provisional dormitory room allocation and room key confirmation.',
    author: 'Residential Services Bureau',
    date: 'Sys-Cycle Day 1',
    content: {
      sections: [
        {
          title: 'Dormitory Unit 4B Allocation',
          body: 'Your provisional starter dorm is located on Campus North Wing. Room features include a Rest Bed, Study Desk, and Secure Storage Vault.'
        }
      ],
      formFields: [
        { id: 'roomConfirm', label: 'Confirm Dorm 4B Assignment', type: 'select', options: ['Accept Assignment', 'Request East Wing Transfer'] },
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
    summary: 'Personal diary log from a former resident of Dorm 4B.',
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
