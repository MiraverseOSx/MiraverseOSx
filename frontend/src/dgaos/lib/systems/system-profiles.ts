import type { DGACase, DGASystem, IntegratedSystemId, SystemActor, SystemRequest } from '@/lib/dga-types';

export interface DgaSystemProfile {
  id: DGASystem;
  name: string;
  division: string;
  actorName: string;
  alertSource: string;
  findingAlertTitle: string;
  findingHeadline: string;
  findingTimelineLabel: string;
  requestTypes: string[];
  /** Simulated turnaround used when the system processes a request automatically. */
  processingSeconds: number;
  describeFinding: (request: SystemRequest, dgaCase?: DGACase) => string;
}

export const INTEGRATED_SYSTEMS: IntegratedSystemId[] = [
  'TRACE',
  'MEDSTAT',
  'ORACLE',
  'CIPHER',
  'AEGIS',
  'CIVITAS',
  'COMMS',
  'ARCHIVE'
];

function humanize(requestType: string): string {
  return requestType.toLowerCase().replace(/_/g, ' ');
}

function caseLabel(request: SystemRequest, dgaCase?: DGACase): string {
  return dgaCase ? `${dgaCase.id} (${dgaCase.title})` : request.caseId;
}

const PROFILES: Record<IntegratedSystemId, DgaSystemProfile> = {
  TRACE: {
    id: 'TRACE',
    name: 'TRACE',
    division: 'Forensic Laboratory',
    actorName: 'TRACE Central Forensic Facility',
    alertSource: 'TRACE FORENSIC SUITE',
    findingAlertTitle: 'TRACE LAB RESULT',
    findingHeadline: 'Laboratory Finding Delivered',
    findingTimelineLabel: 'TRACE examination result received',
    requestTypes: ['FORENSIC_EXAMINATION', 'TOXICOLOGY_SCREEN', 'TRACE_COMPARISON', 'DIGITAL_EXTRACTION'],
    processingSeconds: 45,
    describeFinding: (r, c) =>
      `Laboratory ${humanize(r.requestType)} for ${caseLabel(r, c)} complete. Examined ${r.evidenceIds.length || 'submitted'} item(s); results documented in attached report.`
  },
  MEDSTAT: {
    id: 'MEDSTAT',
    name: 'MEDSTAT',
    division: 'Public Health Surveillance',
    actorName: 'MEDSTAT Clinical Telemetry Desk',
    alertSource: 'MEDSTAT HEALTH GRID',
    findingAlertTitle: 'MEDSTAT CLINICAL UPDATE',
    findingHeadline: 'Clinical Assessment Returned',
    findingTimelineLabel: 'MEDSTAT clinical assessment received',
    requestTypes: ['PATIENT_TELEMETRY', 'EXPOSURE_TRIAGE', 'OUTBREAK_SURVEILLANCE'],
    processingSeconds: 30,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: attending telemetry reviewed, exposure profile logged, no secondary cluster detected in regional ED feeds.`
  },
  ORACLE: {
    id: 'ORACLE',
    name: 'ORACLE',
    division: 'Geopolitical Intelligence',
    actorName: 'ORACLE Intelligence Directorate',
    alertSource: 'ORACLE INTEL',
    findingAlertTitle: 'ORACLE INTELLIGENCE BRIEF',
    findingHeadline: 'Intelligence Assessment Returned',
    findingTimelineLabel: 'ORACLE intelligence assessment received',
    requestTypes: ['INTEL_BACKGROUND', 'SATELLITE_TASKING', 'CORPORATE_REGISTRY_TRACE'],
    processingSeconds: 40,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: source reporting correlated against registry and orbital collection; two corroborating indicators flagged for analyst review.`
  },
  CIPHER: {
    id: 'CIPHER',
    name: 'CIPHER',
    division: 'Signals & Cryptanalysis',
    actorName: 'CIPHER SIGINT Operations',
    alertSource: 'CIPHER SIGINT',
    findingAlertTitle: 'CIPHER SIGINT RESULT',
    findingHeadline: 'Signals Analysis Returned',
    findingTimelineLabel: 'CIPHER signals analysis received',
    requestTypes: ['SIGINT_INTERCEPT', 'DECRYPTION', 'NETWORK_FORENSICS'],
    processingSeconds: 35,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: traffic decrypted and attributed; command-and-control pattern matches a known intrusion toolkit.`
  },
  AEGIS: {
    id: 'AEGIS',
    name: 'AEGIS',
    division: 'Homeland Defense',
    actorName: 'AEGIS Tactical Operations Center',
    alertSource: 'AEGIS TOC',
    findingAlertTitle: 'AEGIS FIELD REPORT',
    findingHeadline: 'Field Team Report Returned',
    findingTimelineLabel: 'AEGIS field report received',
    requestTypes: ['FIELD_TEAM_DEPLOYMENT', 'PERIMETER_SECURITY', 'BORDER_ALERT'],
    processingSeconds: 25,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: team on station, perimeter established, no hostile contact reported.`
  },
  CIVITAS: {
    id: 'CIVITAS',
    name: 'CIVITAS',
    division: 'Inter-Agency Liaison',
    actorName: 'CIVITAS Federal Liaison Office',
    alertSource: 'CIVITAS LIAISON',
    findingAlertTitle: 'CIVITAS LIAISON RESPONSE',
    findingHeadline: 'Liaison Response Returned',
    findingTimelineLabel: 'CIVITAS liaison response received',
    requestTypes: ['LIAISON_REQUEST', 'WARRANT_COORDINATION', 'DIPLOMATIC_CLEARANCE'],
    processingSeconds: 50,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: partner agency acknowledged; coordination memorandum countersigned and filed.`
  },
  COMMS: {
    id: 'COMMS',
    name: 'COMMS',
    division: 'Secure Transmissions',
    actorName: 'COMMS Secure Relay',
    alertSource: 'SATELLITE COMMS',
    findingAlertTitle: 'COMMS RELAY CONFIRMATION',
    findingHeadline: 'Secure Relay Confirmed',
    findingTimelineLabel: 'COMMS relay confirmation received',
    requestTypes: ['SECURE_CABLE', 'DIPLOMATIC_POUCH', 'CHANNEL_AUTHENTICATION'],
    processingSeconds: 15,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: transmission delivered over encrypted channel; recipient authentication verified.`
  },
  ARCHIVE: {
    id: 'ARCHIVE',
    name: 'ARCHIVE',
    division: 'Records & Cold Cases',
    actorName: 'ARCHIVE Records Custodian',
    alertSource: 'ARCHIVE RECORDS',
    findingAlertTitle: 'ARCHIVE RECORDS MATCH',
    findingHeadline: 'Records Search Returned',
    findingTimelineLabel: 'ARCHIVE records search received',
    requestTypes: ['RECORDS_SEARCH', 'COLD_CASE_CROSSREF', 'AFIS_QUERY'],
    processingSeconds: 20,
    describeFinding: (r, c) =>
      `${humanize(r.requestType)} for ${caseLabel(r, c)}: historical holdings searched; one archived file shares entities with this case.`
  }
};

export function isIntegratedSystem(system: SystemActor | undefined): system is IntegratedSystemId {
  return !!system && (INTEGRATED_SYSTEMS as string[]).includes(system);
}

export function getSystemProfile(system: DGASystem): DgaSystemProfile {
  if (isIntegratedSystem(system)) return PROFILES[system];
  return {
    id: system,
    name: system,
    division: 'Agency Division',
    actorName: `${system} Operations`,
    alertSource: system,
    findingAlertTitle: `${system} FINDING`,
    findingHeadline: 'Finding Returned',
    findingTimelineLabel: `${system} finding received`,
    requestTypes: [],
    processingSeconds: 30,
    describeFinding: (r, c) => `${humanize(r.requestType)} for ${caseLabel(r, c)} complete.`
  };
}

export function actorLabel(actor: SystemActor): string {
  return actor === 'DGA_CORE' ? 'DGA Command Core' : getSystemProfile(actor).actorName;
}
