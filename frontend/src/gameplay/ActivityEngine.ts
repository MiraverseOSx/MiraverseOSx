import missionData from '../data/missions.json' with { type: 'json' };
import type { WorknetMission } from '../types';

export const WORKNET_ASSIGNMENTS = Object.fromEntries((missionData as WorknetMission[]).map(mission => [mission.id, mission]));

/** Saved work is evidence. Activity containers reference it without copying its rewards. */
export type ActivityKind = 'task' | 'quest' | 'mission' | 'journey' | 'adventure';
export type InteractionMechanic = 'evidence' | 'documents' | 'diagnostics' | 'equipment' | 'investigation' | 'dialogue' | 'logistics' | 'creative';
export type WorkValues = Record<string, string>;
export interface WorkField {
  id: string;
  label: string;
  kind: 'select' | 'number' | 'text' | 'report';
  options?: string[];
  expected?: string;
  tolerance?: number;
  contains?: string[];
  dangerous?: string[];
}
export interface WorkStage {
  id: string;
  title: string;
  mechanic: InteractionMechanic;
  brief: string;
  fields: WorkField[];
  defaultApproachLabel?: string;
  approaches?: { id: string; label: string; mechanic: InteractionMechanic; brief: string; fields: WorkField[] }[];
}
export interface WorkDefinition {
  id: string;
  track: string;
  subject: string;
  kind: 'shift' | 'assignment' | 'quest';
  clearance: number;
  tools: string[];
  stages: WorkStage[];
}
export interface TaskResult {
  id: string;
  workOrderId: string;
  definitionId: string;
  stageId: string;
  subject: string;
  mechanic: InteractionMechanic;
  output: WorkValues;
  completedAt: string;
  compensationPaid?: boolean;
}
export interface EmploymentContract {
  id: string;
  track: string;
  position: string;
  duties: string[];
  schedule: string;
  payTerms: string;
}
export interface WorkOrder {
  briefingReadAt?: string;
  id: string;
  definitionId: string;
  subject: string;
  cycle: number;
  employmentContractId?: string;
  tools: string[];
  timeRemaining: number;
  resultIds: string[];
  drafts: Record<string, WorkValues>;
  status: 'active' | 'accepted';
  evaluation: number;
  resourcesUsed: number;
  remediationRequired: boolean;
  incidents: { stageId: string; severity: 'minor' | 'serious'; message: string }[];
}
const pick = (id: string, label: string, options: string[], expected: string, dangerous: string[] = []): WorkField => ({ id, label, kind: 'select', options, expected, dangerous });
const number = (id: string, label: string, expected: string, tolerance = 0): WorkField => ({ id, label, kind: 'number', expected, tolerance });
const text = (id: string, label: string, expected: string): WorkField => ({ id, label, kind: 'text', expected });
const report = (label: string, contains: string[]): WorkField => ({ id: 'report', label, kind: 'report', contains });
const stage = (id: string, title: string, mechanic: InteractionMechanic, brief: string, fields: WorkField[]): WorkStage => ({ id, title, mechanic, brief, fields });
const define = (id: string, track: string, subject: string, kind: WorkDefinition['kind'], tools: string[], stages: WorkStage[], clearance = 1): WorkDefinition => ({ id, track, subject, kind, tools: WORKNET_ASSIGNMENTS[id]?.permittedTools || tools, stages, clearance: kind === 'quest' ? 0 : clearance });

export const WORK_DEFINITIONS: Record<string, WorkDefinition> = Object.fromEntries([
  define('ms-shift-04', 'engineer', 'GL-12A', 'shift', ['Oscilloscope', 'FirmwareFlasher', 'CircuitSolder'], [
    stage('preflight', 'Accept and prepare the work site', 'equipment', 'Authorized site: Glassline Terminal Junction 12. Reserve the listed tools for this shift; keep transit power isolated during component work.', [pick('site', 'Work site', ['Terminal Junction 12', 'Terminal Junction 3'], 'Terminal Junction 12'), pick('kit', 'Reserved equipment', ['Oscilloscope, flasher and soldering kit', 'Display cleaning kit'], 'Oscilloscope, flasher and soldering kit')]),
    stage('inspect', 'Inspect the relay and logs', 'evidence', 'GL-12A log: packet loss 18%; C4 trace dips by 4.2 V while C1 remains stable. Annotate the affected node and the degraded signal.', [text('node', 'Affected node', 'C4'), number('loss', 'Observed packet loss (%)', '18')]),
    stage('diagnose', 'Measure and diagnose the fault', 'diagnostics', 'C4 supply: 5.0 V; measured output: 0.8 V. C1 output: 5.0 V. Calculate the voltage drop and identify the failed component.', [pick('test', 'Measurement test', ['Voltage across C4', 'Display brightness'], 'Voltage across C4'), number('drop', 'C4 voltage drop (V)', '4.2', 0.05), text('component', 'Defective component', 'C4')]),
    stage('repair', 'Isolate, replace and reconnect', 'equipment', 'C4 is a 470 µF capacitor. Isolate the transit supply, replace C4 with the matching component, and reconnect the civic bus.', [pick('power', 'Transit supply', ['Isolated and locked out', 'Energized'], 'Isolated and locked out', ['Energized']), pick('part', 'Replacement component', ['470 µF capacitor at C4', 'Wire bridge across C4'], '470 µF capacitor at C4', ['Wire bridge across C4']), pick('bus', 'Civic bus connection', ['Reconnected after replacement', 'Left disconnected'], 'Reconnected after replacement')]),
    stage('verify', 'Restore firmware and test the relay', 'diagnostics', 'GL-12A supports Bus Telemetry v2.4. After repair the oscilloscope reads 5.0 V and the bus test reports 0% packet loss. Record both readings.', [pick('firmware', 'Firmware image', ['Bus Telemetry v2.4', 'Display Controller v1.0'], 'Bus Telemetry v2.4'), number('voltage', 'Final output (V)', '5', 0.1), number('loss', 'Final packet loss (%)', '0')]),
    stage('report', 'Submit the work order', 'documents', 'Document the GL-12A fault at C4, the 470 µF replacement, power isolation, v2.4 firmware and final readings (5 V, 0% loss).', [report('Diagnostic and repair report', ['GL-12A', 'C4', '470', 'isolat', 'v2.4', '5', '0%'])]),
  ]),
  define('ms-shift-02', 'archivist', 'LN-892', 'shift', ['FoilRestorer', 'ArchiveIndexer'], [
    stage('restore', 'Restore the assigned micro-cards', 'equipment', 'Batch LN-892 has degraded magnetic foil. Preserve the foil with a low-field recovery pass before indexing.', [text('batch', 'Batch identifier', 'LN-892'), pick('method', 'Recovery method', ['Low-field FoilRestorer pass', 'Incinerate foil'], 'Low-field FoilRestorer pass', ['Incinerate foil'])]),
    stage('classify', 'Classify recovered metadata', 'evidence', 'Recovered records: Pre-Collapse cartographic blueprints. Catalog key: ARC-PRE-892; category: Cartography.', [text('index', 'Catalog key', 'ARC-PRE-892'), pick('category', 'Record category', ['Cartography', 'Cafeteria menus', 'Fiction'], 'Cartography')]),
    stage('report', 'Submit the restored catalog', 'documents', 'Submit a preservation note naming LN-892, ARC-PRE-892 and the recovered cartography.', [report('Catalog submission', ['LN-892', 'ARC-PRE-892', 'cartograph'])]),
  ]),
  define('ms-shift-03', 'finance', 'ROLL-401', 'shift', ['LedgerMatrix', 'AuditValidator', 'DisbursementSigner'], [
    stage('reconcile', 'Reconcile the disbursement roll', 'documents', 'Roll 401: municipal debit 14,820 credits; routed regional credit 13,420 credits. The missing entry is a scholarship allocation.', [number('variance', 'Routing variance (credits)', '1400'), pick('account', 'Adjustment account', ['Regional scholarships', 'Untracked cash'], 'Regional scholarships')]),
    stage('validate', 'Validate the balanced ledger', 'diagnostics', 'Include the scholarship allocation and verify that routed credits equal the municipal debit.', [number('total', 'Corrected routed credit (credits)', '14820'), number('balance', 'Remaining variance', '0')]),
    stage('sign', 'Sign and submit the receipt', 'documents', 'Receipt must identify Roll 401 and scholarship adjustment 1400. Sign as the assigned treasury operator.', [report('Disbursement receipt', ['401', '1400', 'scholarship']), pick('signature', 'Signature authority', ['Assigned treasury operator', 'Unsigned'], 'Assigned treasury operator')]),
  ]),
  define('ms-shift-01', 'medical', 'pc-mercer', 'shift', ['VITALS-Sync', 'BioCompress-04'], [
    stage('care', 'Assess and treat the assigned patient', 'diagnostics', 'S. Mercer: aura greying, 39.1°C thermal flux, memory fragmentation after high-load synthesis. Compare the presentation with Veilwilt desync and calibrate telemetry after treatment.', [pick('diagnosis', 'Diagnosis', ['Acute Veilwilt Desync', 'Frostlung', 'Benign fatigue'], 'Acute Veilwilt Desync'), pick('treatment', 'Treatment', ['BioCompress-04 and VITALS-Sync', 'Sub-zero cryo-immersion', 'Discharge untreated'], 'BioCompress-04 and VITALS-Sync', ['Sub-zero cryo-immersion', 'Discharge untreated'])]),
    stage('report', 'Submit the clinical chart', 'documents', 'Document Mercer, the 39.1°C presentation, Veilwilt diagnosis, BioCompress-04 treatment and VITALS calibration.', [report('Clinical chart', ['Mercer', '39.1', 'Veilwilt', 'BioCompress', 'VITALS'])]),
  ]),
  define('ms-field-01', 'warden', 'C14', 'assignment', ['BioSampler', 'SpectralAssay', 'FieldTransponder'], [
    ...['soil', 'water', 'flora'].map(sample => stage(`collect-${sample}`, `Collect ${sample} specimen`, 'logistics', `Collect a separate ${sample} specimen from perimeter C14. Label its source and seal it for analysis.`, [text('zone', 'Collection zone', 'C14'), text('specimen', 'Specimen type', sample), pick('container', 'Specimen container', ['Sealed and labeled', 'Mixed with other samples'], 'Sealed and labeled')])),
    stage('assay', 'Analyze all three specimens', 'diagnostics', 'Spectral readings for soil, water and flora each show 18.4% Veil ionization. Record the finding and choose a targeted remediation.', [number('ionization', 'Veil ionization (%)', '18.4', 0.05), pick('remedy', 'Remediation', ['Crystalline flora chelator', 'Industrial defoliant'], 'Crystalline flora chelator', ['Industrial defoliant'])]),
    stage('report', 'Transmit the environmental findings', 'documents', 'Identify C14, soil, water, flora and the 18.4% ionization finding in the environmental grid report.', [report('Environmental report', ['C14', 'soil', 'water', 'flora', '18.4'])]),
  ]),
  define('ms-dev-01', 'engineer', 'ENG-404', 'assignment', ['ExamSimulator', 'ThesisValidator'], [
    stage('configure', 'Configure the practical simulation', 'equipment', 'ENG-404 requires an adaptive firewall and isolated quarantine for hostile PRISM traffic while preserving legitimate traffic.', [pick('mode', 'Firewall mode', ['Adaptive harmonic quarantine', 'All ports disabled', 'Firewall disabled'], 'Adaptive harmonic quarantine', ['Firewall disabled'])]),
    stage('practical', 'Run the threat isolation assessment', 'diagnostics', 'Simulator: 12 hostile PRISM packets, 8 legitimate packets. Route the hostile packets to quarantine and keep legitimate traffic available.', [number('quarantine', 'Packets quarantined', '12'), number('preserved', 'Legitimate packets preserved', '8')]),
    stage('report', 'Submit the assessment thesis', 'documents', 'Explain ENG-404 adaptive quarantine, isolation of 12 PRISM packets and preservation of 8 legitimate packets.', [report('Accreditation thesis', ['ENG-404', 'adaptive', 'quarantine', '12', '8', 'legitimate'])]),
  ]),
  define('ms-spec-01', 'dga', 'PID-512', 'assignment', ['SquadDispatch', 'SealLockCrypt'], [
    stage('inspect', 'Trace the incursion', 'investigation', 'Tunnel 09 telemetry links PRISM PID 512 to an 88.2 MHz transit memory bleed. Identify the source and carrier.', [number('pid', 'Source PID', '512'), number('frequency', 'Carrier (MHz)', '88.2', 0.01)]),
    stage('contain', 'Deploy containment', 'equipment', 'Deploy Hazmat-01 and Patrol-12 under SealLockCrypt; public platforms must remain sealed from Tunnel 09.', [pick('team', 'Deployment', ['Hazmat-01 and Patrol-12', 'Unshielded volunteers'], 'Hazmat-01 and Patrol-12', ['Unshielded volunteers']), pick('seal', 'Containment protocol', ['SealLockCrypt', 'Open tunnel blast doors'], 'SealLockCrypt', ['Open tunnel blast doors'])]),
    stage('report', 'Submit containment findings', 'documents', 'Report PID 512, Tunnel 09, the 88.2 MHz source and the containment seal.', [report('Containment report', ['512', '09', '88.2', 'seal'])]),
  ], 2),
  define('ms-spec-02', 'dga', '88A', 'assignment', ['SIGINT-Decoder', 'IPTracer'], [
    stage('decode', 'Decode the intercepted stream', 'evidence', 'Stream 88A uses carrier 88.2 MHz. The recovered key hint is “light” + “born”. Apply it to decode the routing header.', [text('key', 'Cipher key', 'lightborn'), number('carrier', 'Carrier (MHz)', '88.2')]),
    stage('trace', 'Trace and link the recipient', 'investigation', 'Decoded header: origin Netrunner Node; destination Sector 3 relay. Trace the destination and distinguish it from unrelated hospital routing.', [pick('recipient', 'Recipient terminal', ['Sector 3 relay', 'Municipal hospital'], 'Sector 3 relay')]),
    stage('report', 'Submit the intercept audit', 'documents', 'Record stream 88A, lightborn key, 88.2 carrier and Sector 3 recipient.', [report('Intercept audit', ['88A', 'lightborn', '88.2', 'Sector 3'])]),
  ], 2),
  define('ms-spec-03', 'archivist', 'RHS-001', 'assignment', ['ResonanceCipher', 'DynastyCatalog'], [
    stage('decrypt', 'Open the assigned cipher seal', 'equipment', 'Dossier RHS-001 responds to the Seraphima harmonic key. Preserve the parchment with non-invasive resonance.', [text('dossier', 'Dossier identifier', 'RHS-001'), pick('key', 'Opening method', ['Seraphima harmonic resonance', 'Corrosive solvent'], 'Seraphima harmonic resonance', ['Corrosive solvent'])]),
    stage('verify', 'Verify the succession charter', 'evidence', 'Compare the recovered lineage with the Pre-Collapse Seraphima succession charter, then preserve the audit chain.', [pick('charter', 'Corroborating charter', ['Pre-Collapse Seraphima succession', 'Modern shipping manifest'], 'Pre-Collapse Seraphima succession')]),
    stage('report', 'Submit the lineage audit', 'documents', 'Name RHS-001, Seraphima and the succession charter; describe the non-invasive resonance method.', [report('Lineage audit', ['RHS-001', 'Seraphima', 'succession', 'resonance'])]),
  ], 2),
  define('ms-dev-02', 'diplomat', 'DIP-201', 'assignment', ['TreatyDraftsman', 'ConsensusAnalyzer'], [
    stage('hear', 'Hear both delegations', 'dialogue', 'Fross requires solar cores; Lumia requires cryo-coolant. Record each need before drafting terms.', [text('fross', 'Fross requested resource', 'solar cores'), text('lumia', 'Lumia requested resource', 'cryo-coolant')]),
    stage('draft', 'Draft the compromise', 'creative', 'Draft DIP-201 terms with reciprocal cryo-coolant and solar core exchange, parity and Council arbitration.', [report('Treaty framework', ['reciprocal', 'cryo', 'solar', 'parity', 'arbitration'])]),
    stage('consensus', 'Secure delegation signatures', 'dialogue', 'Both delegations accept reciprocal parity with Council arbitration. Secure both signatures.', [pick('fross', 'Fross consent', ['Signed', 'Rejected'], 'Signed'), pick('lumia', 'Lumia consent', ['Signed', 'Rejected'], 'Signed')]),
  ]),
  define('ms-field-02', 'dga', 'BLK-99', 'assignment', ['PolarityAnchor', 'RootPurgeKey'], [
    stage('scan', 'Map the root-layer tear', 'investigation', 'BLK-99 has five unstable anchor points at Level -4. Count them and locate the node before purging.', [text('node', 'Node identifier', 'BLK-99'), number('anchors', 'Required anchor points', '5')]),
    stage('anchor', 'Synchronize the polarity anchors', 'equipment', 'Five anchors must be locked in counter-phase to support the sub-structure.', [number('locked', 'Locked anchor count', '5'), pick('phase', 'Anchor alignment', ['Counter-phase', 'Overload pylons'], 'Counter-phase', ['Overload pylons'])]),
    stage('purge', 'Purge and verify the memory blocks', 'diagnostics', 'Run RootPurgeKey after anchoring. Final scanner shows zero recursive glitch blocks.', [pick('tool', 'Purge tool', ['RootPurgeKey', 'Display reboot'], 'RootPurgeKey'), number('remaining', 'Recursive glitch blocks remaining', '0')]),
    stage('report', 'Submit stabilization findings', 'documents', 'Record BLK-99, five anchors, counter-phase and zero remaining glitch blocks.', [report('Stabilization report', ['BLK-99', '5', 'counter-phase', '0'])]),
  ], 2),
  define('qn-01', 'questnotice', 'CLINIC-2-FLASKS', 'quest', ['CourierBag', 'ReceiptScanner'], [
    stage('pack', 'Pack the medical flasks', 'logistics', 'Chilled essence requires a sealed insulated courier bag.', [pick('bag', 'Packing method', ['Sealed insulated courier bag', 'Open uninsulated box'], 'Sealed insulated courier bag', ['Open uninsulated box'])]),
    stage('route', 'Route the delivery', 'logistics', 'The shaded Sub-Plaza Conduit reaches Faith Clinic 2 before the noon heat.', [pick('route', 'Delivery route', ['Shaded Sub-Plaza Conduit', 'Sunspire Plaza bench'], 'Shaded Sub-Plaza Conduit'), text('destination', 'Destination', 'Faith Clinic 2')]),
    stage('receipt', 'Verify recipient handover', 'documents', 'Recipient receipt: CL2-ESSENCE. Confirm that the flasks arrived intact at Clinic 2.', [text('receipt', 'Signed recipient receipt code', 'CL2-ESSENCE'), pick('condition', 'Package condition', ['Intact and chilled', 'Broken'], 'Intact and chilled')]),
  ]),
  define('qn-02', 'questnotice', 'SILVER-CHRONOMETER', 'quest', ['AreaScanner'], [
    stage('search', 'Search the garden', 'investigation', 'Metallic resonance peaks beneath fallen cherry blossoms at the East Fountain Bench.', [pick('site', 'Search site', ['East Fountain Bench', 'Koi reservoir'], 'East Fountain Bench')]),
    stage('identify', 'Examine the recovered watch', 'evidence', 'Owner description: engraved silver chronometer with mechanical gears. Compare the recovered item.', [text('metal', 'Case material', 'silver'), pick('movement', 'Movement', ['Mechanical gears', 'Digital display'], 'Mechanical gears')]),
    stage('return', 'Return it to the owner', 'dialogue', 'The elder verifies the engraving and signs receipt WATCH-RETURN. Record the return.', [text('receipt', 'Owner receipt', 'WATCH-RETURN')]),
  ]),
  define('qn-03', 'questnotice', 'EAST-WING-40', 'quest', ['CallNumberGuide', 'MicrofiberCloth'], [
    stage('classify', 'Sort the returned volumes', 'evidence', 'Sort ascending by decimal call number: 900 Orynvell History, 100 Philosophy, 500 Sciences.', [text('sequence', 'Call number order (comma separated)', '100,500,900')]),
    stage('shelve', 'Shelve the assigned collection', 'logistics', 'The assigned cart holds 40 volumes for the East Wing reading room.', [number('count', 'Volumes shelved', '40'), text('wing', 'Shelving location', 'East Wing')]),
    stage('preserve', 'Clean the manuscript vitrines', 'equipment', 'Use dry microfiber around unsealed parchment; water will damage the collection.', [pick('method', 'Cleaning method', ['Dry microfiber cloth', 'Pressurized water'], 'Dry microfiber cloth', ['Pressurized water'])]),
  ]),
].map(definition => [definition.id, definition]));

export function getWorkDefinition(id: string): WorkDefinition | undefined {
  return Object.hasOwn(WORK_DEFINITIONS, id) ? WORK_DEFINITIONS[id] : undefined;
}

// A Quest can accept a different approach while producing the same scoped evidence receipt.
WORK_DEFINITIONS['qn-02'].stages[0].defaultApproachLabel = 'Search with the area scanner';
WORK_DEFINITIONS['qn-02'].stages[0].approaches = [{ id: 'owner-account', label: 'Ask the owner and retrace their steps', mechanic: 'dialogue', brief: 'The elder remembers stopping at the East Fountain Bench and confirms that the watch carries their engraving. Ask permission to search there before retracing the route.', fields: [text('location', 'Place described by the owner', 'East Fountain Bench'), pick('permission', 'Owner confirmation', ['Owner confirmed engraving and permission', 'Search another resident without asking'], 'Owner confirmed engraving and permission')] }];
export function resolveWorkStage(stageDef: WorkStage, values: WorkValues | undefined): WorkStage | undefined {
  const approach = values?._approach;
  if (!approach || approach === 'default') return stageDef;
  const chosen = stageDef.approaches?.find(item => item.id === approach);
  return chosen ? { ...stageDef, mechanic: chosen.mechanic, brief: chosen.brief, fields: chosen.fields } : undefined;
}

export function validateWorkStage(stageDef: WorkStage, values: WorkValues): { ok: boolean; severity: 'minor' | 'serious'; message: string } {
  const chosenStage = resolveWorkStage(stageDef, values);
  if (!chosenStage) return { ok: false, severity: 'minor', message: 'Choose an available approach for this assigned Task.' };
  stageDef = chosenStage;
  const normalize = (value: string) => value.toLowerCase().trim().replace(/\s*,\s*/g, ',');
  // Dangerous actions take priority over incomplete paperwork in the same submission.
  const dangerous = stageDef.fields.find(field => typeof values?.[field.id] === 'string' && field.dangerous?.some(value => normalize(value) === normalize(values[field.id])));
  if (dangerous) return { ok: false, severity: 'serious', message: `Unsafe ${dangerous.label.toLowerCase()}. Equipment is offline; submit a remediation note before retrying. One supply unit was lost.` };
  for (const field of stageDef.fields) {
    const raw = values?.[field.id];
    if (typeof raw !== 'string' || !raw.trim() || raw.length > 4000) return { ok: false, severity: 'minor', message: `Complete ${field.label.toLowerCase()} (maximum 4,000 characters).` };
    const valid = field.kind === 'number'
      ? Number.isFinite(Number(raw)) && Math.abs(Number(raw) - Number(field.expected)) <= (field.tolerance ?? 0)
      : field.kind === 'report'
        ? raw.trim().length >= 30 && field.contains!.every(term => normalize(raw).includes(normalize(term)))
        : normalize(raw) === normalize(field.expected!);
    if (!valid) return { ok: false, severity: 'minor', message: `Revise ${field.label.toLowerCase()} using the work-site readings and requirements. Earlier accepted work is preserved.` };
  }
  return { ok: true, severity: 'minor', message: `${stageDef.title}: output accepted.` };
}

export function resultForStage(order: WorkOrder, stageId: string, results: Record<string, TaskResult>): TaskResult | undefined {
  const result = results[`${order.id}:${stageId}`];
  return result && order.resultIds.includes(result.id) && result.workOrderId === order.id && result.definitionId === order.definitionId && result.subject === order.subject && result.stageId === stageId ? result : undefined;
}
export function nextWorkStage(order: WorkOrder, results: Record<string, TaskResult>): WorkStage | undefined {
  return getWorkDefinition(order.definitionId)?.stages.find(stageDef => !resultForStage(order, stageDef.id, results));
}
export function evaluateWorkOrder(order: WorkOrder | undefined, results: Record<string, TaskResult>): boolean {
  return Boolean(order && !order.remediationRequired && getWorkDefinition(order.definitionId)?.stages.every(stageDef => resultForStage(order, stageDef.id, results)));
}

export interface ActivityDefinition {
  id: string;
  kind: Exclude<ActivityKind, 'task'>;
  title: string;
  origin?: 'authored' | 'emergent';
  styles?: ('realistic' | 'mystery' | 'cinematic')[];
  chapters?: { id: string; title: string; milestoneIds: string[]; after?: string }[];
  milestones: { id: string; label: string; requirements: { definitionId: string; stageId: string }[]; unlock: string }[];
}
export const LINKED_ACTIVITIES: ActivityDefinition[] = [
  { id: 'quest-glassline', kind: 'quest', title: 'Trace the Glassline signal failure', milestones: [
    { id: 'relay-evidence', label: 'Establish the relay fault', requirements: [{ definitionId: 'ms-shift-04', stageId: 'diagnose' }], unlock: 'C4 diagnostic evidence available' },
    { id: 'source-contained', label: 'Resolve the related incursion', requirements: [{ definitionId: 'ms-spec-01', stageId: 'report' }], unlock: 'Glassline inquiry resolved' },
  ] },
  { id: 'journey-engineering', kind: 'journey', title: 'A life in systems engineering', chapters: [
    { id: 'field-experience', title: 'Field experience', milestoneIds: ['field-work'] },
    { id: 'accreditation', title: 'Engineering accreditation', milestoneIds: ['accreditation'], after: 'field-experience' },
  ], milestones: [
    { id: 'field-work', label: 'Submit a verified relay repair', requirements: [{ definitionId: 'ms-shift-04', stageId: 'report' }], unlock: 'Verified field experience' },
    { id: 'accreditation', label: 'Pass ENG-404 and submit the thesis', requirements: [{ definitionId: 'ms-dev-01', stageId: 'practical' }, { definitionId: 'ms-dev-01', stageId: 'report' }], unlock: 'ENG-404 qualification' },
  ] },
  { id: 'adventure-old-factory', kind: 'adventure', origin: 'authored', styles: ['mystery', 'cinematic'], title: 'Signals beneath Old Factory Ward', chapters: [
    { id: 'relay-lead', title: 'The relay lead', milestoneIds: ['relay-discovery'] },
    { id: 'ward-records', title: 'The buried records', milestoneIds: ['ward-secrets'], after: 'relay-lead' },
  ], milestones: [
    { id: 'relay-discovery', label: 'Diagnose and restore the transit relay', requirements: [{ definitionId: 'ms-shift-04', stageId: 'diagnose' }, { definitionId: 'ms-shift-04', stageId: 'report' }], unlock: 'Sub-Conduit lead discovered' },
    { id: 'ward-secrets', label: 'Contain the bleed and verify the sealed lineage', requirements: [{ definitionId: 'ms-spec-01', stageId: 'report' }, { definitionId: 'ms-spec-03', stageId: 'report' }], unlock: 'Old Factory Ward investigation resolved' },
  ] },
  { id: 'adventure-relay-response', kind: 'adventure', origin: 'emergent', styles: ['realistic'], title: 'An investigation from the relay work', milestones: [
    { id: 'recover', label: 'Restore the relay and preserve the findings', requirements: [{ definitionId: 'ms-shift-04', stageId: 'report' }], unlock: 'Relay findings preserved' },
    { id: 'contain', label: 'Follow the findings through containment', requirements: [{ definitionId: 'ms-spec-01', stageId: 'report' }], unlock: 'Field response recorded' },
  ] },
];
/** Each milestone holds references to the original receipts; no copied accomplishments or task payouts. */
export function evaluateLinkedActivities(results: Record<string, TaskResult>) {
  return LINKED_ACTIVITIES.map(activity => {
    const milestones = activity.milestones.map(milestone => {
      const evidence = milestone.requirements.map(requirement => Object.values(results).find(result => result.definitionId === requirement.definitionId && result.stageId === requirement.stageId && result.subject === WORK_DEFINITIONS[requirement.definitionId]?.subject));
      return { ...milestone, complete: evidence.every(Boolean), resultIds: evidence.filter((result): result is TaskResult => Boolean(result)).map(result => result.id) };
    });
    const chapters = (activity.chapters || []).map(chapter => ({ ...chapter, complete: chapter.milestoneIds.every(id => milestones.some(milestone => milestone.id === id && milestone.complete)) }));
    const chaptersComplete = milestones.every(milestone => milestone.complete);
    return { ...activity, milestones, chapters, chaptersComplete, continuing: activity.kind === 'journey', complete: activity.kind !== 'journey' && chaptersComplete };
  });
}
