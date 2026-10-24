import {
  CustomFieldDefinition,
  SavedFilter,
  CaseTemplate,
  AutomationRule,
  DashboardWidgetConfig
} from '@/lib/dga-types';

export const seedCustomFields: CustomFieldDefinition[] = [
  {
    id: 'cf-risk',
    name: 'Operational Risk Rating',
    type: 'select',
    options: ['Minimal', 'Guarded', 'Elevated', 'High', 'Critical'],
    applicableTo: 'both',
    defaultValue: 'Elevated'
  },
  {
    id: 'cf-classification',
    name: 'Security Handling Caveat',
    type: 'badge',
    options: ['NOFORN', 'ORCON', 'PROPIN', 'FGI', 'REL TO NATO'],
    applicableTo: 'both',
    defaultValue: 'NOFORN'
  },
  {
    id: 'cf-jurisdiction',
    name: 'Lead Jurisdiction Enclave',
    type: 'text',
    applicableTo: 'cases',
    defaultValue: 'Sector 4 / Harbor Zone'
  },
  {
    id: 'cf-specimen-id',
    name: 'Forensic Specimen UID',
    type: 'text',
    applicableTo: 'tasks',
    defaultValue: 'SPEC-2026-00'
  }
];

export const seedSavedFilters: SavedFilter[] = [
  {
    id: 'filter-my-ops',
    name: 'My Assigned Directives',
    icon: 'user-check',
    view: 'list',
    criteria: {
      assignedTo: 'Special Agent Miracle Jerome',
      status: ['pending', 'in_progress', 'under_review']
    }
  },
  {
    id: 'filter-critical-blocked',
    name: 'High Priority & Blocked',
    icon: 'alert-triangle',
    view: 'board',
    criteria: {
      priority: ['High', 'Critical']
    }
  },
  {
    id: 'filter-forensics',
    name: 'Forensic Laboratory Queue',
    icon: 'beaker',
    view: 'table',
    criteria: {
      phase: 'Forensic Analysis'
    }
  },
  {
    id: 'filter-triage',
    name: 'Incoming Triage',
    icon: 'inbox',
    view: 'list',
    criteria: {
      status: ['pending']
    }
  }
];

export const seedCaseTemplates: CaseTemplate[] = [
  {
    id: 'tmpl-bio-intercept',
    title: 'Biohazard & Precursor Chemical Intercept',
    description: 'Standard protocol for biological threat materials, dual-use toxic precursors, and clandestine synthesis labs.',
    category: 'CBRN Defense',
    classification: 'TOP SECRET // NOFORN',
    priority: 'Critical',
    leadSystem: 'TRACE',
    defaultObjectives: [
      { title: 'Secure and quarantine delivery vessel / container', description: 'Prevent environmental dispersion and establish cold zone.' },
      { title: 'Recover and catalog chemical / biological samples', description: 'Maintain strict biometric chain of custody.' },
      { title: 'Perform mass spectrometry and toxicity profiling', description: 'Identify active nerve / organophosphate agent profile.' }
    ],
    defaultTasks: [
      {
        title: 'Deploy SHIELD biohazard containment cordon',
        description: 'Establish perimeter security and seal primary air intakes.',
        phase: 'Preliminary',
        priority: 'Critical',
        assignedTo: 'Special Agent Miracle Jerome',
        tags: ['#SHIELD', '#CORDON', '#BIOHAZARD']
      },
      {
        title: 'Extract specimen vials in inert atmosphere case',
        description: 'Transport sealed evidence containers under satellite tracking.',
        phase: 'Active Investigation',
        priority: 'High',
        assignedTo: 'Specialist Marcus Chen',
        tags: ['#CHAIN_OF_CUSTODY', '#EVIDENCE'],
        dependsOnOffset: [0],
        subtasks: [
          { title: 'Verify lead seal integrity' },
          { title: 'Record radiation & VOC sensor readings' }
        ]
      },
      {
        title: 'Run TRACE LC-MS high-resolution mass spectrometry',
        description: 'Determine exact molecular weight and isotopic fragmentation fingerprint.',
        phase: 'Forensic Analysis',
        priority: 'High',
        assignedTo: 'Dr. Gregory Thorne',
        tags: ['#TRACE_LAB', '#MASS_SPEC'],
        dependsOnOffset: [1]
      },
      {
        title: 'Synthesize inter-agency threat mitigation directive',
        description: 'Distribute findings to AEGIS Border Sentinels and State Department.',
        phase: 'Intervention',
        priority: 'Priority',
        assignedTo: 'Director Evelyn Cross',
        tags: ['#AEGIS', '#INTERAGENCY'],
        dependsOnOffset: [2]
      }
    ]
  },
  {
    id: 'tmpl-scada-breach',
    title: 'Critical Infrastructure SCADA Intrusion Response',
    description: 'Incident response protocol for cyber intrusions targeting energy grids, water filtration, or sat-link downlinks.',
    category: 'Cyber Operations',
    classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED',
    priority: 'Critical',
    leadSystem: 'CIPHER',
    defaultObjectives: [
      { title: 'Isolate compromised telemetry subnet', description: 'Sever external reverse shells without disrupting physical safety systems.' },
      { title: 'Acquire volatile memory and kernel telemetry', description: 'Preserve forensic memory dumps before reboot.' },
      { title: 'Attribute command and control proxy infrastructure', description: 'Correlate beaconing with ORACLE threat database.' }
    ],
    defaultTasks: [
      {
        title: 'Engage CIPHER Gateway hardware air-gap',
        description: 'Sever internet routing for Substation Node 14 while preserving local loop.',
        phase: 'Preliminary',
        priority: 'Critical',
        assignedTo: 'Specialist Marcus Chen',
        tags: ['#CIPHER', '#AIRGAP']
      },
      {
        title: 'Capture RAM snapshot and uncommitted log buffers',
        description: 'Execute cryptographic hash verify before dumping to external flash enclaves.',
        phase: 'Active Investigation',
        priority: 'High',
        assignedTo: 'Specialist Marcus Chen',
        tags: ['#MEMORY_FORENSICS', '#CIPHER'],
        dependsOnOffset: [0]
      },
      {
        title: 'Disassemble firmware backdoor payload',
        description: 'Inspect PLC register override routines for safety interlock bypasses.',
        phase: 'Forensic Analysis',
        priority: 'Critical',
        assignedTo: 'Dr. Gregory Thorne',
        tags: ['#REVERSE_ENGINEERING', '#MALWARE'],
        dependsOnOffset: [1]
      }
    ]
  },
  {
    id: 'tmpl-diplomatic-courier',
    title: 'Lost Diplomatic Courier & Pouch Recovery',
    description: 'Immediate search, trace, and recovery workflow for missing diplomatic personnel carrying encrypted ciphers.',
    category: 'Foreign Affairs',
    classification: 'SECRET // NOFORN',
    priority: 'High',
    leadSystem: 'CIVITAS',
    defaultObjectives: [
      { title: 'Locate courier last known coordinates via CIVITAS', description: 'Review transit cameras and vehicular toll records.' },
      { title: 'Inspect recovery site for physical or biological tampering', description: 'Determine if pouch was breached or duplicated.' }
    ],
    defaultTasks: [
      {
        title: 'Query CIVITAS urban surveillance for vehicle tag 99-D-014',
        description: 'Scan port zone toll cameras between 20:00 and 22:00.',
        phase: 'Preliminary',
        priority: 'High',
        assignedTo: 'Deputy Chief Miller',
        tags: ['#CIVITAS', '#SURVEILLANCE']
      },
      {
        title: 'Deploy tactical search team to harbor pier 44',
        description: 'Search abandoned warehouse and waterside slipway.',
        phase: 'Active Investigation',
        priority: 'High',
        assignedTo: 'Special Agent Miracle Jerome',
        tags: ['#TACTICAL', '#HARBOR'],
        dependsOnOffset: [0]
      }
    ]
  }
];

export const seedAutomationRules: AutomationRule[] = [
  {
    id: 'auto-unblock-dependents',
    name: 'Auto-Unblock Dependent Tasks',
    description: 'When a prerequisite task is marked completed, automatically clear blocker flags on any downstream tasks that depend on it.',
    enabled: true,
    trigger: 'ON_TASK_COMPLETED',
    action: 'UNBLOCK_DEPENDENTS',
    actionPayload: {}
  },
  {
    id: 'auto-flag-blocked-alert',
    name: 'Emit Alert on Blocked Operational Task',
    description: 'When an operative flags an active task as Blocked, automatically issue a High-Priority agency alert to Command.',
    enabled: true,
    trigger: 'ON_TASK_BLOCKED',
    action: 'CREATE_ALERT',
    actionPayload: {
      level: 'FLASH',
      title: 'OPERATIONAL TASK BLOCKED'
    }
  },
  {
    id: 'auto-phase-promote',
    name: 'Auto-Advance Case on Phase Completion',
    description: 'When all tasks within Preliminary phase are resolved, automatically set case status to Active Investigation.',
    enabled: true,
    trigger: 'ON_ALL_PHASE_TASKS_COMPLETE',
    action: 'UPDATE_CASE_STATUS',
    actionPayload: {
      targetStatus: 'Active'
    }
  },
  {
    id: 'auto-lab-directive',
    name: 'Auto-Dispatch Task on Forensic Result',
    description: 'When TRACE transmits confirmed forensic examination findings back to DGA, automatically create an Investigation Review task.',
    enabled: true,
    trigger: 'ON_FORENSIC_RESULT_RECEIVED',
    action: 'CREATE_FOLLOWUP_TASK',
    actionPayload: {
      title: 'Review Forensic Examination Findings & Formulate Indictment',
      phase: 'Forensic Analysis',
      priority: 'High'
    }
  }
];

export const seedDashboardWidgets: DashboardWidgetConfig[] = [
  { id: 'w-work-overview', title: 'Operational Directive Overview', type: 'work_overview', visible: true, order: 0 },
  { id: 'w-board-snapshot', title: 'Work Kanban Pipeline', type: 'board_snapshot', visible: true, order: 1 },
  { id: 'w-deadlines', title: 'Impending Mission Deadlines', type: 'impending_deadlines', visible: true, order: 2 },
  { id: 'w-task-activity', title: 'Recent Directive Audit Trail', type: 'task_activity', visible: true, order: 3 },
  { id: 'w-alerts', title: 'Priority Dispatch Telemetry', type: 'recent_alerts', visible: true, order: 4 },
  { id: 'w-profile', title: 'Agent Clearance & Readiness', type: 'agent_profile', visible: true, order: 5 }
];
