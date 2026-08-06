// src/data/mockDocuments.js

export const MOCK_DOCUMENTS = {
  // --- 1. CIVIC FORM (.osform) ---
  "dga-registration": {
    id: "dga-registration",
    filename: "DGA_REGISTRATION_DIRECTIVE_14B.osform",
    extension: ".osform",
    category: "Civic Document",
    meta: {
      classification: "CIVIC ONBOARDING DIRECTIVE",
      author: "Aureline Municipal Bureau",
      timestamp: "WINTER 00:14",
      fileSize: "4.2 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "PROVISIONAL RESIDENT REGISTRATION",
      subtitle: "DGA Oversight Directive 14-B",
      bodyText: "All relocating citizens must register their clearance status and declare primary district residency upon MIRAVERSEOSX activation.",
      formFields: [
        { id: "displayName", label: "Citizen Handle", type: "text", placeholder: "e.g. Miracle", required: true },
        { id: "district", label: "Primary District Residency", type: "select", options: ["Glassline District", "Sub-Aureline", "Old Factory Ward", "Lumen Market"], required: true },
        { id: "auraConsent", label: "Grant Faith Medical Aura Diagnostic Telemetry", type: "checkbox", default: true }
      ],
      actionButton: { label: "[ SUBMIT REGISTRATION DOSSIER ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  // --- 2. MEDICAL DIAGNOSTIC (.diag) ---
  "aura-scan": {
    id: "aura-scan",
    filename: "Faith_Thermal_Aura_Scan_09.diag",
    extension: ".diag",
    category: "Medical",
    meta: {
      classification: "FAITH MEDICAL RESTRICTED",
      author: "Dr. Ilyra Saint",
      timestamp: "WINTER 02:45",
      fileSize: "8.6 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "THERMAL AURA DIAGNOSTIC REPORT",
      subtitle: "Patient Record #FM-88021",
      bodyText: "Aura heat distribution shows elevated flux alignment. Celestial resonance detected in core pathways. Recommend monitoring for Sunspire Burn Fever. Conditions: Veilwilt, Sunspire Fever.",
      formFields: [
        { id: "thermalStatus", label: "Core Temp Baseline", type: "text", placeholder: "38.2°C (Elevated)", required: false },
        { id: "elementalLean", label: "Elemental Resonance", type: "text", placeholder: "Aether / Celestial", required: false }
      ],
      actionButton: { label: "[ SYNC TO FAITH MEDICAL PORTAL ]", actionTrigger: "SYNC_FAITHMED" }
    }
  },

  // --- 3. ENCRYPTED ARCHIVE (.arch) ---
  "purge-archive": {
    id: "purge-archive",
    filename: "Purge_Era_Genealogy.arch",
    extension: ".arch",
    category: "Archive Keepers",
    meta: {
      classification: "CLASSIFIED HISTORICAL RECORD",
      author: "Archivist Selene Arclight",
      timestamp: "FOUNDING ERA",
      fileSize: "18.4 KB"
    },
    security: {
      isEncrypted: true,
      requiredSkill: "Cryptography",
      requiredLevel: 3,
      lineageKeyRequired: "SERAPHIMA_KEY_01"
    },
    content: {
      title: "SERAPHIMA LINEAGE FRAGMENT",
      subtitle: "Archive Lock #771",
      bodyText: "DECRYPTED ACCESS UNLOCKED: Trace confirms direct descent from Maeryn Seraphima. Subject CY-9021 exhibits hereditary pre-Collapse genetic alignment and extreme sensitivity to subterranean Aether cores."
    }
  },

  // --- 4. MALWARE THREAT (.prism) ---
  "prism-bleed": {
    id: "prism-bleed",
    filename: "Corrupted_Data_Bleed.prism",
    extension: ".prism",
    category: "Malware / Threat",
    meta: {
      classification: "CRITICAL SYSTEM THREAT",
      author: "PRISM_INJECTION_NODE",
      timestamp: "UNKNOWN",
      fileSize: "999 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "⚠️ UNSTABLE DATA BLEED DETECTED",
      subtitle: "Threat ID: PRISM_CORRUPT_07",
      bodyText: "Active viral process corrupting local system memory. Isolate using Process Monitor or deploy Seal Lock (.spell) protocol immediately.",
      actionButton: { label: "[ QUARANTINE THREAT VECTOR ]", actionTrigger: "QUARANTINE_PRISM" }
    }
  },

  // --- 5. SYSTEM LOG (.log) ---
  "system-audit": {
    id: "system-audit",
    filename: "System_Audit.log",
    extension: ".log",
    category: "System Log",
    meta: {
      classification: "UNCLASSIFIED INTERNALS",
      author: "Process Monitor Daemon",
      timestamp: "WINTER 05:12",
      fileSize: "14.2 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "PROCESS DEPLOYMENT LOG",
      subtitle: "Audit Cycle 88",
      bodyText: "TRACE START...\n[04:12:02] connection established with Cycademy Node Gate\n[04:15:30] WARNING: packet delay exceeding 400ms\n[04:22:15] CRITICAL ERROR: PRISM signal intercept pattern detected on frequency 88.2 MHz\n[04:22:18] net_relay.sys active defense quarantine protocol initiated"
    }
  },

  // --- 6. PLAIN TEXT (.txt) ---
  "personal-log": {
    id: "personal-log",
    filename: "Personal_Log_88.txt",
    extension: ".txt",
    category: "Text Document",
    meta: {
      classification: "PERSONAL NOTES",
      author: "CY-9021-CITIZEN",
      timestamp: "WINTER 06:12",
      fileSize: "1.8 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "RESIDENT DIARY DIARY LOG 88",
      subtitle: "Subjective Feed Entry",
      bodyText: "Day 142. The hum from the lower industrial grids is getting louder. Faith Medical claims it is harmless ambient feedback, but Riven says they are drawing more power to shield the Veil leaks. I kept my intake scanner close just in case..."
    }
  },

  // --- 7. TACTICAL MAP (.map) ---
  "glassline-map": {
    id: "glassline-map",
    filename: "Aureline_Glassline.map",
    extension: ".map",
    category: "Spatial",
    meta: {
      classification: "RESTRICTED VECTOR GRID",
      author: "Spatial Navigation Dept",
      timestamp: "WINTER 01:22",
      fileSize: "12.8 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "GLASSLINE DISTRICT SPATIAL PATHWAY",
      subtitle: "Map Grid 04-Alpha",
      bodyText: "Glassline District Vector Grid. Showing secure municipal server gateways, subterranean tram route corridors, and active Veil leakage coordinates."
    }
  },

  // --- 8. SPELLFORGE MODULE (.mod) ---
  "firewall-mod": {
    id: "firewall-mod",
    filename: "Firewall_v2.mod",
    extension: ".mod",
    category: "SpellForge",
    meta: {
      classification: "RESTRICTED spell MODULE",
      author: "Cycademy Sciences Bureau",
      timestamp: "FOUNDING ERA",
      fileSize: "8.4 KB"
    },
    security: { isEncrypted: false },
    content: {
      title: "FIREWALL SPELL BLOCK MODULE",
      subtitle: "Spell Matrix ID: Firewall_v2",
      bodyText: "Spell Type: Fire / Protection. Cost: 45 Aether. Creates a blazing screen of elemental code to block incoming PRISM cult malware buffer overflows.",
      actionButton: { label: "[ INTEGRATE MODULE INTO SPELLFORGE ]", actionTrigger: "LOAD_SPELLFORGE" }
    }
  }
};
