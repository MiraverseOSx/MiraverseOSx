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
    attachments: [
      { id: "att-1", name: "Directive_14B_Notice.sig", size: "1.2 KB", type: "sig", desc: "Cryptographic Authorization Proof" },
      { id: "att-2", name: "District_Map_Index.map", size: "3.4 KB", type: "map", desc: "Municipal District Zone Chart" }
    ],
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

  // --- WELCOME PACKET ATTACHMENTS & FORMS ---
  "starter-access-manifest": {
    id: "starter-access-manifest",
    filename: "STARTER_ACCESS_MANIFEST.pdf",
    extension: ".pdf",
    category: "System Guide",
    meta: { classification: "CIVIC ONBOARDING", author: "Account Services", timestamp: "DAY ONE", fileSize: "3.5 KB" },
    security: { isEncrypted: false },
    content: {
      title: "STARTER ACCESS MANIFEST",
      subtitle: "UNLOCKED VS RESTRICTED MUNICIPAL APPS",
      bodyText: "UNLOCKED AT START:\n- Mail (Municipal Dispatches)\n- Comms (Shadow Relay & Direct Links)\n- Notice Board (Student Jobs & Tasks)\n- Civic Profile (Basic Citizen Data)\n- Faith Medical Portal (Intake & Diagnostics)\n- Cyacademy Systems\n\nLOCKED UNTIL PROGRESSION:\n- Passport (Requires DGA Biometric Identity Verification)\n- Pulse Social (Requires Profile Creation)\n- Black Market Subnets (Requires Encryption Keys)"
    }
  },

  "housing-temp-assignment": {
    id: "housing-temp-assignment",
    filename: "HOUSING_TEMP_ASSIGNMENT.form",
    extension: ".form",
    category: "Housing Document",
    meta: { classification: "RESIDENTIAL SERVICES", author: "Cyacademy Housing", timestamp: "DAY ONE", fileSize: "4.0 KB" },
    security: { isEncrypted: false },
    content: {
      title: "TEMPORARY HOUSING ASSIGNMENT",
      subtitle: "UNIT ACCESS CONFIRMATION",
      bodyText: "Unit: Block A (North Wing), Room 104.\nState: Unfurnished Starter Suite.\nStorage Limit: 50 KB / 5 Inventory Slots.\nEnergy Recover: +10 Aura Health / hr of sleep.\n\nProperty upgrades require Tier 1 Civic Clearance and 1,000 Credits.",
      formFields: [
        { id: "roomName", label: "Customize Dorm Tag", type: "text", placeholder: "e.g. Netrunner Haven", required: false }
      ],
      actionButton: { label: "[ CONFIRM DORM ROOM ASSIGNMENT ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  "citizen-record-activation": {
    id: "citizen-record-activation",
    filename: "CITIZEN_RECORD_ACTIVATION.osform",
    extension: ".osform",
    category: "Civic Document",
    meta: { classification: "IDENTITY REGISTRATION", author: "Civic Identity Bureau", timestamp: "DAY ONE", fileSize: "4.8 KB" },
    security: { isEncrypted: false },
    content: {
      title: "CITIZEN RECORD ACTIVATION",
      subtitle: "PRIMARY PROFILE INITIALIZATION",
      bodyText: "Complete activation to initialize identity, declared residence, employment track, and blank aura baseline record fields.",
      formFields: [
        { id: "citizenName", label: "Full Legal Handle", type: "text", placeholder: "e.g. Miracle", required: true },
        { id: "declaredTrack", label: "Preferred Career Track", type: "select", options: ["Faith Medical Group", "DGA Careers", "Governmental Services"], required: true }
      ],
      actionButton: { label: "[ ACTIVATE CITIZEN RECORD ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  "faith-patient-intake": {
    id: "faith-patient-intake",
    filename: "FAITH_PATIENT_INTAKE.osform",
    extension: ".osform",
    category: "Medical Document",
    meta: { classification: "FAITH MEDICAL RESTRICTED", author: "Dr. Ilyra Saint", timestamp: "DAY ONE", fileSize: "5.2 KB" },
    security: { isEncrypted: false },
    content: {
      title: "FAITH MEDICAL PATIENT INTAKE",
      subtitle: "BASELINE DIAGNOSTIC PROFILE",
      bodyText: "Establishes patient baseline aura health, records temporary conditions (Veilwilt), and schedules first intake appointment.",
      formFields: [
        { id: "allergies", label: "Known Aether/Void Sensitivities", type: "text", placeholder: "e.g. Veilwilt, Thermal Flux", required: false },
        { id: "consent", label: "Authorize Aura Health Telemetry", type: "checkbox", default: true }
      ],
      actionButton: { label: "[ SYNC TO FAITH MEDICAL PORTAL ]", actionTrigger: "SYNC_FAITHMED" }
    }
  },

  "communications-quickstart": {
    id: "communications-quickstart",
    filename: "COMMUNICATIONS_QUICKSTART.pdf",
    extension: ".pdf",
    category: "System Guide",
    meta: { classification: "SYSTEM GOVERNANCE", author: "Comms Bureau", timestamp: "DAY ONE", fileSize: "3.2 KB" },
    security: { isEncrypted: false },
    content: {
      title: "COMMUNICATIONS QUICKSTART GUIDE",
      subtitle: "IN-WORLD NETWORK SPECIFICATION",
      bodyText: "1. MAIL (MailApp): Asynchronous official dispatches, municipal invoices, and welcome packets.\n2. COMMS (CommsApp): Real-time terminal network divided into Tier 0 (Alerts), Tier 1 (District/Faction), Tier 2 (Squad Ops), and Tier 3 (Direct NPC Links).\n3. SURVEILLANCE WARNING: DGA monitors unencrypted channels for restricted terms. Use Encryption Keys for illicit channels."
    }
  },

  "notice-board-guide": {
    id: "notice-board-guide",
    filename: "NOTICE_BOARD_GUIDE.pdf",
    extension: ".pdf",
    category: "Career Guide",
    meta: { classification: "MUNICIPAL NOTICE BOARD", author: "Student Job Center", timestamp: "DAY ONE", fileSize: "3.8 KB" },
    security: { isEncrypted: false },
    content: {
      title: "NOTICE BOARD & CAREER GUIDE",
      subtitle: "TASKS, QUESTS & CITY CONTRACTS",
      bodyText: "The Notice Board contains micro-tasks and career shifts across 3 main organizations:\n- Faith Medical Group (Aura & Diagnostics)\n- DGA Careers (Security & Node Audit)\n- Governmental Careers (Archive Sorting & Policy)\n\nCompleting tasks awards Credits, XP, and Skill Proficiency XP."
    }
  },

  "day-one-schedule": {
    id: "day-one-schedule",
    filename: "DAY_ONE_INTEGRATION_SCHEDULE.ics",
    extension: ".ics",
    category: "Calendar Schedule",
    meta: { classification: "CYACADEMY ORIENTATION", author: "Dean Cassian Rook", timestamp: "DAY ONE", fileSize: "2.5 KB" },
    security: { isEncrypted: false },
    content: {
      title: "DAY ONE INTEGRATION SCHEDULE",
      subtitle: "ORIENTATION TIMELINE",
      bodyText: "• 08:00 AM - Citizen Registration & Identity Verification\n• 09:00 AM - DGA Security & Surveillance Briefing\n• 11:00 AM - SpellForge Fundamentals & Alignment\n• 02:00 PM - Netrunner Traversal Labs\n• 05:00 PM - Evening Assembly at Cyacademy Core"
    }
  },

  // --- ADDITIONAL START EMAILS ATTACHMENTS ---
  "district-placement-survey": {
    id: "district-placement-survey",
    filename: "DISTRICT_PLACEMENT_SURVEY.osform",
    extension: ".osform",
    category: "Civic Document",
    meta: { classification: "HOUSING PLACEMENT", author: "Civic Housing Office", timestamp: "DAY ONE", fileSize: "4.5 KB" },
    security: { isEncrypted: false },
    content: {
      title: "DISTRICT PLACEMENT SURVEY",
      subtitle: "NEIGHBORHOOD AFFILIATION REVIEW",
      bodyText: "Select your preferred starting district. Placement affects housing block, early social flavor, minor starting bonuses, and first-week events.",
      formFields: [
        { id: "selectedDistrict", label: "Preferred Starting District", type: "select", options: ["Glassline District (Tech & High-Rise)", "Sub-Aureline (Underground Relay)", "Old Factory Ward (Netrunner Industrial)", "Lumen Market (Trade & Artisans)"], required: true }
      ],
      actionButton: { label: "[ SUBMIT DISTRICT PLACEMENT ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  "four-districts-overview": {
    id: "four-districts-overview",
    filename: "FOUR_DISTRICTS_OVERVIEW.pdf",
    extension: ".pdf",
    category: "Municipal Overview",
    meta: { classification: "GEOGRAPHIC GUIDE", author: "Spatial Dept", timestamp: "DAY ONE", fileSize: "6.0 KB" },
    security: { isEncrypted: false },
    content: {
      title: "FOUR DISTRICTS OVERVIEW",
      subtitle: "AURELINE NEIGHBORHOOD BREAKDOWN",
      bodyText: "1. GLASSLINE DISTRICT: Modern high-rise municipal center and DGA headquarters.\n2. SUB-AURELINE: Subterranean conduits, relay hubs, and AETHERCORE access.\n3. OLD FACTORY WARD: Industrial ruins, netrunner nodes, and Veil leakages.\n4. LUMEN MARKET: Vibrant commerce district, Faith Medical clinics, and trade halls."
    }
  },

  "zero-balance-ledger": {
    id: "zero-balance-ledger",
    filename: "ZERO_BALANCE_LEDGER.pdf",
    extension: ".pdf",
    category: "Financial Record",
    meta: { classification: "FINANCE OFFICE", author: "Municipal Finance Dept", timestamp: "DAY ONE", fileSize: "2.2 KB" },
    security: { isEncrypted: false },
    content: {
      title: "STARTER CREDITS LEDGER",
      subtitle: "BEGINNING FINANCIAL STATEMENT",
      bodyText: "ACCOUNT HOLDER: Player (Provisional Record)\nSTARTING BALANCE: ₡0 Credits\nSTATE STIPEND: None (Standard Provisional Policy)\n\nNote: All credits must be earned through Notice Board tasks, faction quests, job shifts, and software publishing."
    }
  },

  "credit-earning-guide": {
    id: "credit-earning-guide",
    filename: "CREDIT_EARNING_GUIDE.pdf",
    extension: ".pdf",
    category: "Financial Guide",
    meta: { classification: "FINANCE ADVISORY", author: "Municipal Finance Dept", timestamp: "DAY ONE", fileSize: "3.1 KB" },
    security: { isEncrypted: false },
    content: {
      title: "CREDIT EARNING GUIDE",
      subtitle: "INCOME SOURCES IN MIRAVERSEOSX",
      bodyText: "Approved income channels:\n- Notice Board Micro-Tasks (+50 to +120 Credits)\n- Faction Quest Runner (+100 to +400 Credits)\n- Netrunner Node Breaches (+50 to +500 Credits)\n- Career Shift Shifts (+90 to +120 Credits)\n- Spell Cleansing in Defense Matrix (+200 to +400 Credits)"
    }
  },

  "required-forms-checklist": {
    id: "required-forms-checklist",
    filename: "REQUIRED_FORMS_CHECKLIST.pdf",
    extension: ".pdf",
    category: "Civic Checklist",
    meta: { classification: "ONBOARDING COMPLIANCE", author: "Registration Office", timestamp: "DAY ONE", fileSize: "2.8 KB" },
    security: { isEncrypted: false },
    content: {
      title: "REQUIRED FORMS CHECKLIST",
      subtitle: "ONBOARDING COMPLETION TRACKER",
      bodyText: "Items required for full municipal clearance:\n[ ] Citizen Record Activation (.osform)\n[ ] Housing Assignment Confirmation (.form)\n[ ] District Placement Survey (.osform)\n[ ] Faith Medical Patient Intake (.osform)\n[ ] Emergency Contact Registration (.osform)\n[ ] Acceptable Use Agreement (.osform)"
    }
  },

  "emergency-contact-form": {
    id: "emergency-contact-form",
    filename: "EMERGENCY_CONTACT_FORM.osform",
    extension: ".osform",
    category: "Civic Document",
    meta: { classification: "CIVIL SAFETY", author: "Civil Safety Office", timestamp: "DAY ONE", fileSize: "3.6 KB" },
    security: { isEncrypted: false },
    content: {
      title: "EMERGENCY CONTACT REGISTRATION",
      subtitle: "RESPONSE ROUTING FORM",
      bodyText: "Register primary emergency contacts. Routing defaults to Civil Safety, Faith Medical Group, and DGA Liaison until contacts are submitted.",
      formFields: [
        { id: "contactName", label: "Primary Emergency Contact", type: "text", placeholder: "e.g. Dr. Voss / Riven", required: true },
        { id: "contactRelation", label: "Relationship", type: "select", options: ["Faculty Advisor", "Faction Member", "Medical Sponsor", "Guildmate"], required: true }
      ],
      actionButton: { label: "[ REGISTER EMERGENCY CONTACT ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  "city-safety-protocols": {
    id: "city-safety-protocols",
    filename: "CITY_SAFETY_PROTOCOLS.pdf",
    extension: ".pdf",
    category: "Safety Guide",
    meta: { classification: "CIVIL SAFETY", author: "Civil Safety Office", timestamp: "DAY ONE", fileSize: "4.1 KB" },
    security: { isEncrypted: false },
    content: {
      title: "CITY SAFETY PROTOCOLS",
      subtitle: "EMERGENCY RESPONSE GUIDELINES",
      bodyText: "1. PRISM ANOMALIES: Isolate corrupted processes immediately.\n2. VEIL LEAKS: Seek shelter in Dorm Block A or Marlowe Springs if experiencing Veilwilt.\n3. DGA CURFEW: Nighttime travel requires Tier 2 clearance."
    }
  },

  "acceptable-use-agreement": {
    id: "acceptable-use-agreement",
    filename: "ACCEPTABLE_USE_AGREEMENT.osform",
    extension: ".osform",
    category: "System Terms",
    meta: { classification: "SYSTEM GOVERNANCE", author: "System Governance", timestamp: "DAY ONE", fileSize: "4.9 KB" },
    security: { isEncrypted: false },
    content: {
      title: "ACCEPTABLE USE AGREEMENT",
      subtitle: "MIRAVERSEOSX NETWORK TERMS",
      bodyText: "You must agree to network terms before advanced access is granted. Unauthorized access to restricted folders, DGA files, and Old Factory Ward nodes is prohibited.",
      formFields: [
        { id: "termsAgree", label: "I Agree to System Governance Terms", type: "checkbox", default: true }
      ],
      actionButton: { label: "[ ACKNOWLEDGE TERMS & AGREE ]", actionTrigger: "SUBMIT_CIVIC_REG" }
    }
  },

  "data-bleed-reporting-rules": {
    id: "data-bleed-reporting-rules",
    filename: "DATA_BLEED_REPORTING_RULES.pdf",
    extension: ".pdf",
    category: "Safety Guide",
    meta: { classification: "SYSTEM GOVERNANCE", author: "System Governance", timestamp: "DAY ONE", fileSize: "3.4 KB" },
    security: { isEncrypted: false },
    content: {
      title: "DATA BLEED REPORTING RULES",
      subtitle: "ANOMALY DISCLOSURE DIRECTIVE",
      bodyText: "All citizens who detect data bleeds or glitched channel feeds must run OS diagnostics or submit a report to DGA Ops immediately."
    }
  },

  "phone-starter-plan": {
    id: "phone-starter-plan",
    filename: "PHONE_STARTER_PLAN.pdf",
    extension: ".pdf",
    category: "Mobile Service",
    meta: { classification: "AURELINE MOBILE", author: "Mobile Services", timestamp: "DAY ONE", fileSize: "2.9 KB" },
    security: { isEncrypted: false },
    content: {
      title: "PHONE STARTER PLAN",
      subtitle: "RESERVED MOBILE NUMBER",
      bodyText: "Reserved Number: #CY-5501-TEL.\nCalling, texting, voicemail, photos, and emergency dialing will activate after confirming the plan."
    }
  },

  "chatmeet-access-token": {
    id: "chatmeet-access-token",
    filename: "CHATMEET_ACCESS_TOKEN.key",
    extension: ".key",
    category: "Access Key",
    meta: { classification: "CYACADEMY INTEGRATION", author: "Integration Team", timestamp: "DAY ONE", fileSize: "1.5 KB" },
    security: { isEncrypted: false },
    content: {
      title: "CHATMEET ACCESS TOKEN",
      subtitle: "DAY ONE ASSEMBLY PASS",
      bodyText: "TOKEN KEY: #CM-KEY-0x99201.\nGrants entrance to Day One Assembly channel on ChatMeet."
    }
  },

  "pulse-community-guidelines": {
    id: "pulse-community-guidelines",
    filename: "PULSE_COMMUNITY_GUIDELINES.pdf",
    extension: ".pdf",
    category: "Social Terms",
    meta: { classification: "PULSE CIVIC NETWORK", author: "Pulse Community Team", timestamp: "DAY ONE", fileSize: "3.0 KB" },
    security: { isEncrypted: false },
    content: {
      title: "PULSE COMMUNITY GUIDELINES",
      subtitle: "PUBLIC REPUTATION RULES",
      bodyText: "Rules for public social posting, house tag declaration, reputation tracking, and city event participation."
    }
  },

  // --- OTHER MOCK DOCUMENTS ---
  "aura-scan": {
    id: "aura-scan",
    filename: "Faith_Thermal_Aura_Scan_09.diag",
    extension: ".diag",
    category: "Medical",
    meta: { classification: "FAITH MEDICAL RESTRICTED", author: "Dr. Ilyra Saint", timestamp: "WINTER 02:45", fileSize: "8.6 KB" },
    security: { isEncrypted: false },
    attachments: [
      { id: "att-3", name: "Raw_Aura_Telemetry.aura", size: "4.1 KB", type: "aura", desc: "High-Frequency Biometric Scan Data" }
    ],
    content: {
      title: "THERMAL AURA DIAGNOSTIC REPORT",
      subtitle: "Patient Record #FM-88021",
      bodyText: "Aura heat distribution shows elevated flux alignment. Celestial resonance detected in core pathways. Recommend monitoring for Sunspire Burn Fever.",
      actionButton: { label: "[ SYNC TO FAITH MEDICAL PORTAL ]", actionTrigger: "SYNC_FAITHMED" }
    }
  },

  "purge-archive": {
    id: "purge-archive",
    filename: "Purge_Era_Genealogy.arch",
    extension: ".arch",
    category: "Archive Keepers",
    meta: { classification: "CLASSIFIED HISTORICAL RECORD", author: "Archivist Selene Arclight", timestamp: "FOUNDING ERA", fileSize: "18.4 KB" },
    security: { isEncrypted: true, requiredSkill: "Cryptography", requiredLevel: 3, lineageKeyRequired: "SERAPHIMA_KEY_01" },
    content: {
      title: "SERAPHIMA LINEAGE FRAGMENT",
      subtitle: "Archive Lock #771",
      bodyText: "DECRYPTED ACCESS UNLOCKED: Trace confirms direct descent from Maeryn Seraphima. Subject CY-9021 exhibits hereditary pre-Collapse genetic alignment."
    }
  },

  "prism-bleed": {
    id: "prism-bleed",
    filename: "Corrupted_Data_Bleed.prism",
    extension: ".prism",
    category: "Malware / Threat",
    meta: { classification: "CRITICAL SYSTEM THREAT", author: "PRISM_INJECTION_NODE", timestamp: "UNKNOWN", fileSize: "999 KB" },
    security: { isEncrypted: false },
    content: {
      title: "⚠️ UNSTABLE DATA BLEED DETECTED",
      subtitle: "Threat ID: PRISM_CORRUPT_07",
      bodyText: "Active viral process corrupting local system memory. Isolate using Process Monitor or deploy Seal Lock (.spell) protocol immediately.",
      actionButton: { label: "[ QUARANTINE THREAT VECTOR ]", actionTrigger: "QUARANTINE_PRISM" }
    }
  },

  "system-audit": {
    id: "system-audit",
    filename: "System_Audit.log",
    extension: ".log",
    category: "System Log",
    meta: { classification: "UNCLASSIFIED INTERNALS", author: "Process Monitor Daemon", timestamp: "WINTER 05:12", fileSize: "14.2 KB" },
    security: { isEncrypted: false },
    content: {
      title: "PROCESS DEPLOYMENT LOG",
      subtitle: "Audit Cycle 88",
      bodyText: "TRACE START...\n[04:12:02] connection established with Cycademy Node Gate\n[04:15:30] WARNING: packet delay exceeding 400ms\n[04:22:15] CRITICAL ERROR: PRISM signal intercept pattern detected on frequency 88.2 MHz\n[04:22:18] net_relay.sys active defense quarantine protocol initiated"
    }
  },

  "personal-log": {
    id: "personal-log",
    filename: "Personal_Log_88.txt",
    extension: ".txt",
    category: "Text Document",
    meta: { classification: "PERSONAL NOTES", author: "CY-9021-CITIZEN", timestamp: "WINTER 06:12", fileSize: "1.8 KB" },
    security: { isEncrypted: false },
    content: {
      title: "RESIDENT DIARY DIARY LOG 88",
      subtitle: "Subjective Feed Entry",
      bodyText: "Day 142. The hum from the lower industrial grids is getting louder. Faith Medical claims it is harmless ambient feedback..."
    }
  },

  "glassline-map": {
    id: "glassline-map",
    filename: "Aureline_Glassline.map",
    extension: ".map",
    category: "Spatial",
    meta: { classification: "RESTRICTED VECTOR GRID", author: "Spatial Navigation Dept", timestamp: "WINTER 01:22", fileSize: "12.8 KB" },
    security: { isEncrypted: false },
    content: {
      title: "GLASSLINE DISTRICT SPATIAL PATHWAY",
      subtitle: "Map Grid 04-Alpha",
      bodyText: "Glassline District Vector Grid. Showing secure municipal server gateways and subterranean tram route corridors."
    }
  },

  "firewall-mod": {
    id: "firewall-mod",
    filename: "Firewall_v2.mod",
    extension: ".mod",
    category: "SpellForge",
    meta: { classification: "RESTRICTED spell MODULE", author: "Cycademy Sciences Bureau", timestamp: "FOUNDING ERA", fileSize: "8.4 KB" },
    security: { isEncrypted: false },
    content: {
      title: "FIREWALL SPELL BLOCK MODULE",
      subtitle: "Spell Matrix ID: Firewall_v2",
      bodyText: "Spell Type: Fire / Protection. Cost: 45 Aether. Creates a blazing screen of elemental code to block incoming PRISM cult malware buffer overflows.",
      actionButton: { label: "[ INTEGRATE MODULE INTO SPELLFORGE ]", actionTrigger: "LOAD_SPELLFORGE" }
    }
  }
};
