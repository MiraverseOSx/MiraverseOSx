import { WORK_DEFINITIONS, WORKNET_ASSIGNMENTS, LINKED_ACTIVITIES, evaluateLinkedActivities, type ActivityKind } from './ActivityEngine';
import type { EmailItem } from '../data/commsData';
import { isOpportunityRevealed } from './ProgressionEngine';

export interface AssignmentFile {
  id: string; name: string; dir: string; type: 'txt' | 'log'; size: string; desc: string; body: string; assignmentId: string;
}
export interface AssignmentJournal {
  selectedId: string;
  selectionVersion: number;
  fileDirectory: string;
  fileRequest: number;
  dispatches: Record<string, { receivedAt: string; channel: 'email' | 'phone'; heardAt?: string }>;
  files: Record<string, AssignmentFile>;
  started: Record<string, string>;
  claimed: Record<string, string>;
  unlocks: string[];
  chapterClaims: Record<string, string>;
}
export const emptyAssignmentJournal = (): AssignmentJournal => ({ selectedId: '', selectionVersion: 0, fileDirectory: '/assignments', fileRequest: 0, dispatches: {}, files: {}, started: {}, claimed: {}, unlocks: [], chapterClaims: {} });
export interface Opportunity {
  id: string; kind: ActivityKind; title: string; description: string; institution: string; location: string;
  missionIds: string[]; clearance: number; reward: string; unlock?: { name: string; text: string };
  parentMissionId?: string; taskStageId?: string;
}
const bonuses: Record<string, { name: string; text: string }> = {
  'adventure-relay-response': { name: 'Relay field response notebook', text: 'An investigation developed from your assigned relay work. The accepted repair and containment reports form this field notebook. Your chosen approach remains part of the record.' },
  'quest-glassline': { name: 'Glassline signal atlas', text: 'The relay fault and memory bleed have been resolved. Your field atlas now connects Junction 12 to Tunnel 09: a civic relay fault led to the Sub-Conduit incursion. The atlas preserves your diagnostic trail and containment findings.' },
  'journey-engineering': { name: 'Accredited engineer field manual', text: 'Your verified GL-12A repair and ENG-404 practical qualify this field manual for release. Procedure: isolate transit power, measure both sides of a failed component, replace to specification, restore compatible firmware, and verify the civic bus before sign-off.' },
  'adventure-old-factory': { name: 'Old Factory Ward sealed archive', text: 'A sealed Ward archive opens after your investigation. The transit anomalies and PID-512 bleed exposed a route into the old infrastructure. The RHS-001 audit corroborates the Pre-Collapse Seraphima succession charter. Your relay report, containment report, and lineage audit are retained as the evidentiary chain.' },
};
export const OPPORTUNITIES: Opportunity[] = [
  ...Object.values(WORK_DEFINITIONS).map(definition => {
    const mission = WORKNET_ASSIGNMENTS[definition.id];
    return { id: definition.id, kind: (definition.kind === 'quest' ? 'quest' : 'mission') as ActivityKind,
      title: mission.title, description: mission.description, institution: mission.department, location: mission.location,
      missionIds: [definition.id], clearance: definition.clearance, reward: `${mission.rewardCredits} credits · ${mission.rewardBits || 0} bits · ${mission.rewardXP} career XP` };
  }),
  ...LINKED_ACTIVITIES.map(activity => ({ id: activity.id, kind: activity.kind, title: activity.title,
    description: activity.id === 'adventure-old-factory' ? 'Follow a transit fault into the buried infrastructure of Old Factory Ward. Restore the relay, contain the incursion and uncover the sealed lineage record.' : activity.id === 'adventure-relay-response' ? 'Your field experience has opened an investigation. Choose how to coordinate the response, preserve the repair findings and follow them into containment.' : activity.id === 'journey-engineering' ? 'Build a professional life through completed chapters. Field experience and accreditation can be finished while the broader Journey continues.' : 'Connect the relay diagnostics with the related DGA containment investigation.',
    institution: activity.kind === 'journey' ? 'Engineering accreditation office' : 'Aureline field dispatch', location: 'Aureline / Old Factory Ward',
    missionIds: [...new Set(activity.milestones.flatMap(milestone => milestone.requirements.map(requirement => requirement.definitionId)))],
    clearance: 0, reward: `${activity.kind === 'journey' ? 'Accreditation chapter unlock' : 'Unlock'}: ${bonuses[activity.id].name}. Each assignment pays its own published reward.`, unlock: bonuses[activity.id] })),
];
export const ASSIGNED_TASKS: Opportunity[] = Object.values(WORK_DEFINITIONS).flatMap(definition => definition.stages.map(stage => ({ id: `${definition.id}::${stage.id}`, kind: 'task' as const, title: stage.title, description: stage.brief, institution: WORKNET_ASSIGNMENTS[definition.id].department, location: WORKNET_ASSIGNMENTS[definition.id].location, missionIds: [definition.id], parentMissionId: definition.id, taskStageId: stage.id, clearance: definition.clearance, reward: 'Contributes to the published assignment reward. This task does not pay it a second time.' })));
export const getOpportunity = (id: string) => OPPORTUNITIES.find(opportunity => opportunity.id === id) || ASSIGNED_TASKS.find(opportunity => opportunity.id === id);
export function visibleOpportunities(player: any): Opportunity[] {
  return [...OPPORTUNITIES.filter(opportunity => isOpportunityRevealed(opportunity.id, player)), ...ASSIGNED_TASKS.filter(task => player.worknetOrders?.[task.parentMissionId!]?.status === 'active')];
}
export function opportunityStatus(opportunity: Opportunity, player: any, cycle: number): string {
  if (opportunity.kind === 'journey') return player.assignmentJournal?.started?.[opportunity.id] || player.assignmentJournal?.claimed?.[opportunity.id] ? 'Journey ongoing' : 'Open Journey';
  if (opportunity.kind === 'task') {
    const order = player.worknetOrders?.[opportunity.parentMissionId!];
    return !order ? 'Awaiting assignment' : order.resultIds.some((id: string) => player.taskResults?.[id]?.stageId === opportunity.taskStageId) ? 'Output accepted' : 'Assigned';
  }
  if (opportunity.unlock) return player.assignmentJournal?.claimed?.[opportunity.id] ? 'Collected' : player.assignmentJournal?.started?.[opportunity.id] ? 'In progress' : 'Available';
  const definition = WORK_DEFINITIONS[opportunity.id];
  const order = player.worknetOrders?.[opportunity.id];
  if (order?.status === 'active') return 'In progress';
  const repeatable = definition.kind === 'shift' && definition.track !== 'medical';
  if (order?.status === 'accepted' && (!repeatable || cycle <= order.cycle)) return 'Completed';
  if (!repeatable && player.completedWorknetMissionIds?.includes(opportunity.id)) return 'Completed';
  return (player.clearanceLevel ?? 2) < opportunity.clearance ? `Clearance ${opportunity.clearance} required` : 'Available';
}
export function briefingText(opportunity: Opportunity): string {
  return `${opportunity.title}\n${opportunity.kind.toUpperCase()} / ${opportunity.institution}\nLocation: ${opportunity.location}\n\nBRIEFING\n${opportunity.description}\n\nASSIGNMENT\n${opportunity.missionIds.map(id => {
    const definition = WORK_DEFINITIONS[id];
    return `${WORKNET_ASSIGNMENTS[id].title}\nSubject: ${definition.subject}\nEquipment: ${definition.tools.join(', ')}\n${definition.stages.map((stage, index) => `${index + 1}. ${stage.title} [${stage.mechanic}]\n${stage.brief}`).join('\n\n')}`;
  }).join('\n\n')}\n\nCOMPLETION\nComplete the required activities and submit each work order for acceptance.\nReward: ${opportunity.reward}\nReading files or answering a call does not issue payment.`;
}
export function assignmentFiles(opportunity: Opportunity): AssignmentFile[] {
  const dir = `/assignments/${opportunity.id}`;
  return [
    { id: `briefing:${opportunity.id}`, name: 'Briefing.txt', dir, type: 'txt', size: 'Briefing', desc: opportunity.title, assignmentId: opportunity.id, body: briefingText(opportunity) },
    { id: `objectives:${opportunity.id}`, name: 'Assignment_checklist.txt', dir, type: 'txt', size: 'Checklist', desc: 'Required actions and equipment', assignmentId: opportunity.id,
      body: opportunity.missionIds.map(id => `${WORKNET_ASSIGNMENTS[id].title}\n${WORK_DEFINITIONS[id].stages.map((stage, index) => `${index + 1}. ${stage.title} — ${stage.mechanic}`).join('\n')}`).join('\n\n') },
  ];
}
export const DISPATCH_SCHEDULE = [
  { id: 'ms-shift-04', channel: 'email' as const },
  { id: 'qn-02', channel: 'email' as const },
  { id: 'adventure-old-factory', channel: 'phone' as const },
  { id: 'ms-shift-01', channel: 'email' as const },
  { id: 'ms-spec-01', channel: 'email' as const },
  { id: 'journey-engineering', channel: 'email' as const, after: 'ms-shift-04' },
];
export function dispatchEmail(opportunity: Opportunity, recipient: string, timestamp: string): EmailItem {
  return { id: `JOB-DISPATCH:${opportunity.id}`, assignmentId: opportunity.id, sender: opportunity.institution, senderAddress: 'dispatch@worknet.aure',
    recipientAddress: recipient, faction: 'WORKNET', subject: `Opportunity: ${opportunity.title}`, time: 'Dispatch', timestamp, read: false, folder: 'inbox',
    deliveryStatus: 'delivered', verifiedSender: true, linkedApp: 'jobs', attachment: null,
    attachments: [{ id: `briefing:${opportunity.id}`, name: 'Briefing.txt', kind: 'record', isReward: false, type: 'document', amount: 0, claimed: false, previewTitle: opportunity.title, previewText: briefingText(opportunity) }],
    body: `A new ${opportunity.kind} is available.\n\n${opportunity.description}\n\nLocation: ${opportunity.location}\nReward: ${opportunity.reward}\n\nReview the briefing in WorkNet. Accepting creates your briefing and assignment checklist in VAULT. Published opportunities are also listed at versenet.aure/jobs.` };
}
export function activityReady(id: string, player: any): boolean {
  const activity = evaluateLinkedActivities(player.taskResults || {}).find(item => item.id === id);
  const opportunity = getOpportunity(id);
  return Boolean(activity?.chaptersComplete && opportunity?.missionIds.every(missionId => player.worknetOrders?.[missionId]?.status === 'accepted'));
}
export function journeyChapterReady(id: string, chapterId: string, player: any): boolean {
  const activity = evaluateLinkedActivities(player.taskResults || {}).find(item => item.id === id && item.kind === 'journey');
  const chapter = activity?.chapters.find(item => item.id === chapterId);
  if (!activity || !chapter) return false;
  const required = activity.chapters.filter(item => item.id === chapterId || item.id === chapter.after);
  return required.every(item => item.complete && activity.milestones.filter(milestone => item.milestoneIds.includes(milestone.id)).every(milestone => milestone.requirements.every(requirement => player.worknetOrders?.[requirement.definitionId]?.status === 'accepted')));
}
