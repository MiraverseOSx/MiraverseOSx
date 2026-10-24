import {
  DGACase,
  DGASystem,
  Classification,
  Priority,
  DGACommunication,
  DGAState
} from './dga-types';

/**
 * 1. Hand-Authored Missions
 */
export function getHandAuthoredMission(missionKey: 'courier' | 'diversion' | 'cluster'): DGACase {
  const timestamp = new Date().toISOString();

  if (missionKey === 'courier') {
    return {
      id: `DGA-26-${Math.floor(200 + Math.random() * 50)}`,
      title: 'Operation Broken Courier: Dispatched Diplomatic Pouch Missing',
      classification: 'SECRET // NOFORN',
      status: 'Awaiting Acceptance',
      priority: 'High',
      leadSystem: 'AEGIS',
      supportingSystems: ['ORACLE', 'TRACE'],
      assignedAgents: ['Special Agent Miracle Jerome'],
      summary:
        'Diplomatic courier Marcus Vance failed to report to the embassy transit vault following an unscheduled detour through the harbor free-trade zone. The pouch contained encrypted telemetry keys and sovereign communications archives.',
      objectives: [
        {
          id: 'OBJ-COU-1',
          title: 'Locate Courier and Recover Diplomatic Pouch',
          description: 'Search Warehouse 18 and trace RFID seal signature of pouch.',
          completed: false
        },
        {
          id: 'OBJ-COU-2',
          title: 'Analyze Physical Evidence at Drop Site',
          description: 'Transfer vehicle tire residue and fractured padlock to TRACE laboratory.',
          completed: false
        }
      ],
      tasks: [
        {
          id: 'TSK-COU-01',
          objectiveId: 'OBJ-COU-1',
          title: 'Triangulate Last Pouch Transponder Signal',
          description: 'Analyze Harbor cell tower sector dumps to identify pinpoint warehouse coordinates.',
          completed: false,
          assignedTo: 'Special Agent Miracle Jerome',
          phase: 'Preliminary'
        },
        {
          id: 'TSK-COU-02',
          objectiveId: 'OBJ-COU-2',
          title: 'Submit Padlock Shackle to TRACE Toolmark Unit',
          description: 'Verify if hydraulic cutting shears match tools recovered from Viktor Krell associates.',
          completed: false,
          assignedTo: 'Field Agent K. Lawson',
          phase: 'Forensic Analysis'
        }
      ],
      evidence: [
        {
          id: 'EV-COU-1',
          title: 'Fractured High-Security Shackle',
          category: 'Physical Item',
          description: 'Hardened boron alloy padlock shackle severed cleanly with hydraulic cutter.',
          locationFound: 'Harbor Free-Trade Zone Warehouse 18',
          dateRecovered: timestamp,
          custodyStatus: 'In DGA Custody'
        }
      ],
      people: [
        {
          personId: 'P-104',
          name: 'Courier Marcus Vance',
          role: 'Missing Courier',
          affiliation: 'State Department Diplomatic Security',
          threatLevel: 'Moderate',
          status: 'Missing in Action'
        }
      ],
      organizations: [
        {
          organizationId: 'ORG-01',
          name: 'Department of Global Affairs',
          type: 'Government Agency',
          roleInCase: 'Lead investigative body'
        }
      ],
      locations: [
        {
          locationId: 'LOC-04',
          name: 'Harbor Free-Trade Zone Warehouse 18',
          significance: 'Last known location of courier'
        }
      ],
      communications: [],
      documents: [],
      forensicRequests: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp,
          type: 'CASE_OPENED',
          actor: 'AEGIS Field Operations',
          description: 'Courier Vance designated missing in transit.'
        }
      ],
      notes: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  if (missionKey === 'diversion') {
    return {
      id: `GOV-26-${Math.floor(100 + Math.random() * 50)}`,
      title: 'Operation Paper Trail: Pharmaceutical Precursor Diversion',
      classification: 'CONFIDENTIAL',
      status: 'Awaiting Acceptance',
      priority: 'Priority',
      leadSystem: 'CIVITAS',
      supportingSystems: ['TRACE', 'ORACLE'],
      assignedAgents: ['Special Agent Miracle Jerome'],
      summary:
        'Audits of Phoenix Biotech import manifests reveal 400 liters of dual-use phosphorus trichloride unaccounted for in customs filings. Physical inventory reconciliation required.',
      objectives: [
        {
          id: 'OBJ-DIV-1',
          title: 'Reconcile Chemical Precursor Storage Manifests',
          description: 'Subpoena warehouse storage logs and compare vat weights.',
          completed: false
        }
      ],
      tasks: [
        {
          id: 'TSK-DIV-01',
          objectiveId: 'OBJ-DIV-1',
          title: 'Issue CIVITAS Precursor Subpoena to Phoenix Bio',
          description: 'Demand sworn chain-of-custody affidavits from head chemist.',
          completed: false,
          assignedTo: 'Special Agent Miracle Jerome',
          phase: 'Preliminary'
        }
      ],
      evidence: [],
      people: [],
      organizations: [
        {
          organizationId: 'ORG-04',
          name: 'Phoenix Biotech Ltd.',
          type: 'Target Entity',
          roleInCase: 'Precursor importer under audit'
        }
      ],
      locations: [],
      communications: [],
      documents: [],
      forensicRequests: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp,
          type: 'CASE_OPENED',
          actor: 'CIVITAS Regulatory Desk',
          description: 'Chemical diversion inquiry opened.'
        }
      ],
      notes: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  // Default cluster
  return {
    id: `MED-26-${Math.floor(300 + Math.random() * 50)}`,
    title: 'Operation Cold Pulse: Acute Neurotoxic Hospital Cluster',
    classification: 'SECRET // NOFORN',
    status: 'Awaiting Acceptance',
    priority: 'Critical',
    leadSystem: 'MEDSTAT',
    supportingSystems: ['TRACE', 'AEGIS'],
    assignedAgents: ['Special Agent Miracle Jerome'],
    summary:
      'Three additional patients admitted to regional ICUs presenting with identical cholinergic crises within 6 hours of the Ambassador Vance event. Potential broader aerosol dispersal or municipal water contamination.',
    objectives: [
      {
        id: 'OBJ-MED-1',
        title: 'Isolate Common Epidemiological Vector',
        description: 'Map patient movements in the 48 hours prior to onset.',
        completed: false
      }
    ],
    tasks: [
      {
        id: 'TSK-MED-01',
        objectiveId: 'OBJ-MED-1',
        title: 'Collect Water Intake Samples from Metro District 4',
        description: 'Dispatch bio-sampling team to tap water main junctions.',
        completed: false,
        assignedTo: 'Special Agent Miracle Jerome',
        phase: 'Preliminary'
      }
    ],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp,
        type: 'CASE_OPENED',
        actor: 'MEDSTAT Watch Center',
        description: 'Cluster alarm triggered across regional emergency departments.'
      }
    ],
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * 2. Template-Generated Incidents
 */
export function createTemplateIncident(
  templateType: 'CYBER_INTRUSION' | 'SMUGGLING_INTERCEPT' | 'FOREIGN_ASSET_DEFECTION' | 'BIOHAZARD_LEAK'
): DGACase {
  const timestamp = new Date().toISOString();
  const caseNum = Math.floor(100 + Math.random() * 899);

  const configs: Record<string, Partial<DGACase>> = {
    CYBER_INTRUSION: {
      id: `CYB-26-${caseNum}`,
      title: `Incident Alpha-${caseNum}: Critical Network Gateway Telemetry Incursion`,
      classification: 'TOP SECRET // NOFORN',
      priority: 'Critical',
      leadSystem: 'CIPHER',
      summary:
        'Unauthorized encrypted SSH tunnels detected breaching perimeter firewall 3. Data exfiltration targeted naval logistics specifications.'
    },
    SMUGGLING_INTERCEPT: {
      id: `SEC-26-${caseNum}`,
      title: `Operation Border Gate-${caseNum}: Dual-Use Chemical Container Intercept`,
      classification: 'SECRET // NOFORN',
      priority: 'High',
      leadSystem: 'AEGIS',
      summary:
        'Shipping container manifests marked as industrial lubricant tested positive for schedule 2 precursor derivatives at harbor terminal.'
    },
    FOREIGN_ASSET_DEFECTION: {
      id: `INT-26-${caseNum}`,
      title: `Operation Phoenix Quill-${caseNum}: Diplomatic Attache Walk-In`,
      classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED',
      priority: 'Critical',
      leadSystem: 'ORACLE',
      summary:
        'Foreign consular official appeared at regional safehouse requesting immediate asylum in exchange for sovereign cyber-warfare documentation.'
    },
    BIOHAZARD_LEAK: {
      id: `MED-26-${caseNum}`,
      title: `Incident Bio-Shield-${caseNum}: Containment Chamber Alarm`,
      classification: 'SECRET // NOFORN',
      priority: 'High',
      leadSystem: 'MEDSTAT',
      summary:
        'HEPA negative-pressure differential dropped below safe thresholds in private bio-research facility. Secondary disinfection activated.'
    }
  };

  const conf = configs[templateType] || configs.SMUGGLING_INTERCEPT;

  return {
    id: conf.id!,
    title: conf.title!,
    classification: conf.classification as Classification,
    status: 'Awaiting Acceptance',
    priority: conf.priority as Priority,
    leadSystem: conf.leadSystem as DGASystem,
    supportingSystems: ['TRACE', 'COMMS'],
    assignedAgents: ['Special Agent Miracle Jerome'],
    summary: conf.summary!,
    objectives: [
      {
        id: `OBJ-${caseNum}-1`,
        title: 'Conduct Initial Containment and Evidence Verification',
        description: 'Deploy field sensors and secure electronic and physical logs.',
        completed: false
      }
    ],
    tasks: [
      {
        id: `TSK-${caseNum}-01`,
        objectiveId: `OBJ-${caseNum}-1`,
        title: 'Secure Primary Site Logs and Physical Artifacts',
        description: 'Impound device logs and forward specimens to TRACE lab.',
        completed: false,
        assignedTo: 'Special Agent Miracle Jerome',
        phase: 'Preliminary'
      }
    ],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp,
        type: 'CASE_OPENED',
        actor: 'DGA Automated Watchdog',
        description: `Incident spawned via ${templateType} template.`
      }
    ],
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * 3. World-State Triggered Assignment
 */
export function createWorldStateTriggeredAssignment(worldState: DGAState): DGACase {
  const severePerson = worldState.people.find((p) => p.threatLevel === 'Severe') || worldState.people[0];
  const highLocation = worldState.locations.find((l) => l.threatLevel === 'High' || l.threatLevel === 'Severe') || worldState.locations[0];

  const caseNum = Math.floor(400 + Math.random() * 99);
  const timestamp = new Date().toISOString();

  return {
    id: `DGA-26-${caseNum}`,
    title: `Operation Horizon Strike: Rapid Intervention at ${highLocation.name}`,
    classification: 'TOP SECRET // NOFORN',
    status: 'Awaiting Acceptance',
    priority: 'Critical',
    leadSystem: 'AEGIS',
    supportingSystems: ['TRACE', 'ORACLE', 'CIVITAS'],
    assignedAgents: [worldState.profile.name],
    summary: `Surveillance of target ${severePerson.name} has escalated. Real-time satellite surveillance indicates rapid mobilization towards ${highLocation.name}. Tactical apprehension and site forensic sweeping required immediately.`,
    objectives: [
      {
        id: `OBJ-${caseNum}-1`,
        title: `Establish Tactical Perimeter around ${highLocation.name}`,
        description: 'Deploy AEGIS perimeter units and intercept moving vehicles.',
        completed: false
      },
      {
        id: `OBJ-${caseNum}-2`,
        title: `Detain Subject ${severePerson.name} and Secure Possessions`,
        description: 'Execute federal arrest warrant and log all personal electronics for TRACE extraction.',
        completed: false
      }
    ],
    tasks: [
      {
        id: `TSK-${caseNum}-01`,
        objectiveId: `OBJ-${caseNum}-1`,
        title: 'Deploy Satellite Alpha-9 Infrared Feed',
        description: 'Lock continuous thermal monitoring onto building exits.',
        completed: false,
        assignedTo: worldState.profile.name,
        phase: 'Preliminary'
      },
      {
        id: `TSK-${caseNum}-02`,
        objectiveId: `OBJ-${caseNum}-2`,
        title: 'Transfer Detainee Property to TRACE Forensic Facility',
        description: 'Package chemical reagents and secure encrypted drives for analysis.',
        completed: false,
        assignedTo: worldState.profile.name,
        phase: 'Forensic Analysis'
      }
    ],
    evidence: [],
    people: [
      {
        personId: severePerson.id,
        name: severePerson.name,
        role: severePerson.role,
        affiliation: severePerson.affiliation,
        threatLevel: severePerson.threatLevel,
        status: 'Active Pursuit'
      }
    ],
    organizations: [],
    locations: [
      {
        locationId: highLocation.id,
        name: highLocation.name,
        significance: 'Target destination'
      }
    ],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp,
        type: 'CASE_OPENED',
        actor: 'DGA World State Monitoring Engine',
        description: `Automated escalation triggered by high-threat entity ${severePerson.name}.`
      }
    ],
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * 4. Message-Triggered Assignment
 */
export function createMessageTriggeredAssignment(cable: DGACommunication): DGACase {
  const timestamp = new Date().toISOString();
  const caseNum = Math.floor(500 + Math.random() * 99);

  return {
    id: `DGA-26-${caseNum}`,
    title: `Investigation: ${cable.subject.replace(/^(URGENT:|ALARM:|INTEL FLASH:)\s*/i, '')}`,
    classification: (cable.classification as Classification) || 'SECRET // NOFORN',
    status: 'Awaiting Acceptance',
    priority: cable.priority === 'Flash / Immediate' ? 'Critical' : cable.priority === 'Priority' ? 'High' : 'Priority',
    leadSystem: 'COMMS',
    supportingSystems: ['TRACE', 'ORACLE'],
    assignedAgents: ['Special Agent Miracle Jerome'],
    summary: `Active assignment spawned directly from incoming diplomatic/intelligence cable (${cable.id}) transmitted by ${cable.sender}.\n\nCable Excerpt: "${cable.body.slice(0, 200)}..."`,
    objectives: [
      {
        id: `OBJ-${caseNum}-1`,
        title: 'Investigate Dispatched Intelligence Lead',
        description: 'Verify veracity of the claims transmitted in the cable.',
        completed: false
      }
    ],
    tasks: [
      {
        id: `TSK-${caseNum}-01`,
        objectiveId: `OBJ-${caseNum}-1`,
        title: `Follow Up with ${cable.sender}`,
        description: 'Send encrypted acknowledgment and request corroborating intelligence.',
        completed: false,
        assignedTo: 'Special Agent Miracle Jerome',
        phase: 'Preliminary'
      }
    ],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [
      {
        communicationId: cable.id,
        subject: cable.subject,
        sender: cable.sender,
        timestamp: cable.timestamp
      }
    ],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp,
        type: 'CASE_OPENED',
        actor: 'Special Agent Miracle Jerome',
        description: `Spawned active assignment from incoming cable ${cable.id}.`
      }
    ],
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
