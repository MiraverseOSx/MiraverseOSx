import type { OSStoreState } from './useOSStore';
import { useCommsStore } from './useCommsStore';
import { getOpportunity, opportunityStatus, assignmentFiles, emptyAssignmentJournal, DISPATCH_SCHEDULE, dispatchEmail, activityReady, type AssignmentJournal, type AssignmentFile } from '../gameplay/AssignmentFlow';
import { WORKNET_ASSIGNMENTS, evaluateLinkedActivities } from '../gameplay/ActivityEngine';
import { isOpportunityRevealed } from '../gameplay/ProgressionEngine';

type Result = { ok: boolean; message: string };
export interface AssignmentFlowActions {
  refreshAssignmentDispatches: () => void;
  openAssignment: (id: string) => void;
  startAssignment: (id: string) => Result;
  saveAssignmentBriefing: (id: string) => void;
  acknowledgeAssignmentBriefing: (id: string) => Result;
  answerAssignmentCall: (id: string) => void;
  openAssignmentFiles: (id?: string) => void;
  claimActivityUnlock: (id: string) => Result;
  claimJourneyChapter: (id: string, chapterId: string) => Result;
  recordAssignmentCompletion: (id: string) => void;
  recordAssignmentOpened: (id: string) => void;
}
export function createAssignmentActions(set: (update: (state: OSStoreState) => Partial<OSStoreState>) => void, get: () => OSStoreState): AssignmentFlowActions {
  const journal = (): AssignmentJournal => get().gameplay.player.assignmentJournal || emptyAssignmentJournal();
  const update = (change: (current: AssignmentJournal) => AssignmentJournal) => set(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, assignmentJournal: change(state.gameplay.player.assignmentJournal || emptyAssignmentJournal()) } } }));
  const showApp = (id: string) => {
    if (get().windows.some(window => window.id === id)) get().focusWindow(id);
    else get().toggleApp(id);
  };
  const saveFiles = (files: AssignmentFile[]) => update(current => ({ ...current, files: { ...current.files, ...Object.fromEntries(files.map(file => [file.id, file])) } }));
  const sendReceipt = (id: string, phase: 'opened' | 'completed', file: AssignmentFile) => {
    const opportunity = getOpportunity(id); const order = get().gameplay.player.worknetOrders?.[id];
    if (!opportunity || !order) return;
    const mailbox = useCommsStore.getState(); const mailId = `JOB-${phase.toUpperCase()}:${order.id}`;
    if (mailbox.emails.some(mail => mail.id === mailId)) return;
    const recipient = mailbox.playerAccounts.find(account => account.accountType === 'work')?.address || 'citizen@auremail.aure';
    mailbox.addEmail({ id: mailId, assignmentId: id, threadId: `JOB-DISPATCH:${id}`, sender: opportunity.institution, senderAddress: 'dispatch@worknet.aure', recipientAddress: recipient,
      faction: 'WORKNET', subject: `${phase === 'opened' ? 'Assignment accepted' : 'Work accepted'}: ${opportunity.title}`, timestamp: new Date().toISOString(), time: 'Just now', read: false, folder: 'inbox', verifiedSender: true, deliveryStatus: 'delivered', linkedApp: 'jobs', attachment: null,
      attachments: [{ id: file.id, name: file.name, kind: 'record', isReward: false, type: 'document', amount: 0, xp: 0, claimed: false, previewTitle: file.desc, previewText: file.body }],
      body: phase === 'opened' ? `Your work order ${order.id} is active.\n\nThe briefing and assignment checklist are ready in VAULT at ${file.dir}. Review the briefing in WorkNet before beginning. Accepting this assignment does not issue payment.` : `Work order ${order.id} has been accepted.\n\nYour completion receipt is saved in VAULT at ${file.dir}. Your career and compensation records have been updated by the verified work result. This message is a record, not an additional payment.\n\n${file.body}` });
  };
  return {
    recordAssignmentOpened: id => {
      const opportunity = getOpportunity(id); const order = get().gameplay.player.worknetOrders?.[id];
      if (!opportunity || order?.status !== 'active') return;
      const files = assignmentFiles(opportunity); saveFiles(files); sendReceipt(id, 'opened', files[0]);
    },
    refreshAssignmentDispatches: () => {
      if (!get().isLoggedIn) return;
      const player = get().gameplay.player;
      // Older saves can already have active work without its AureMail confirmation.
      for (const [id, order] of Object.entries(player.worknetOrders || {}) as [string, any][]) if (order.status === 'active') get().recordAssignmentOpened(id);
      const recipient = useCommsStore.getState().playerAccounts.find(account => account.accountType === 'work')?.address || 'citizen@auremail.aure';
      for (const scheduled of DISPATCH_SCHEDULE) {
        const opportunity = getOpportunity(scheduled.id)!;
        if (journal().dispatches[opportunity.id] || !isOpportunityRevealed(opportunity.id, player) || !['Available', 'Open Journey'].includes(opportunityStatus(opportunity, player, get().gameplay.timeCycleCount)) || (scheduled.after && !player.completedWorknetMissionIds.includes(scheduled.after))) continue;
        const receivedAt = new Date().toISOString();
        // Persist the delivery identity first. Opening apps and reloading cannot reissue offers.
        update(current => ({ ...current, dispatches: { ...current.dispatches, [opportunity.id]: { receivedAt, channel: scheduled.channel } } }));
        if (scheduled.channel === 'email' && !useCommsStore.getState().emails.some(mail => mail.id === `JOB-DISPATCH:${opportunity.id}`)) {
          useCommsStore.getState().addEmail(dispatchEmail(opportunity, recipient, receivedAt));
        }
      }
    },
    openAssignment: id => {
      const opportunity = getOpportunity(id);
      if (!opportunity || !isOpportunityRevealed(id, get().gameplay.player)) return;
      if (opportunity.kind === 'task' && get().gameplay.player.worknetOrders?.[opportunity.parentMissionId!]?.status !== 'active') return;
      id = opportunity.parentMissionId || id;
      update(current => ({ ...current, selectedId: id, selectionVersion: current.selectionVersion + 1 }));
      showApp('jobs');
    },
    saveAssignmentBriefing: id => {
      const opportunity = getOpportunity(id);
      if (opportunity && isOpportunityRevealed(id, get().gameplay.player)) saveFiles(assignmentFiles(opportunity));
    },
    startAssignment: id => {
      const opportunity = getOpportunity(id);
      if (!opportunity) return { ok: false, message: 'Unknown opportunity.' };
      if (!isOpportunityRevealed(id, get().gameplay.player)) return { ok: false, message: 'Find a lead through exploration before following this opportunity.' };
      if (opportunity.kind === 'task') return { ok: false, message: 'Tasks are assigned within an accepted work order. Open the parent assignment to perform this task.' };
      if (!opportunity.unlock) return get().openWorknetOrder(id);
      get().saveAssignmentBriefing(id);
      if (!journal().started[id]) update(current => ({ ...current, started: { ...current.started, [id]: new Date().toISOString() } }));
      return { ok: true, message: 'Briefing and assignment checklist saved in VAULT. Choose the next required assignment below.' };
    },
    acknowledgeAssignmentBriefing: id => {
      const order = get().gameplay.player.worknetOrders?.[id];
      if (!order || order.status !== 'active') return { ok: false, message: 'Accept this assignment before beginning the work.' };
      get().saveAssignmentBriefing(id);
      if (!order.briefingReadAt) set(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, worknetOrders: { ...state.gameplay.player.worknetOrders, [id]: { ...state.gameplay.player.worknetOrders[id], briefingReadAt: new Date().toISOString() } } } } }));
      return { ok: true, message: 'Briefing reviewed. Your assignment activities are ready.' };
    },
    answerAssignmentCall: id => {
      const dispatch = journal().dispatches[id];
      if (!dispatch || dispatch.channel !== 'phone' || dispatch.heardAt) return;
      update(current => ({ ...current, dispatches: { ...current.dispatches, [id]: { ...dispatch, heardAt: new Date().toISOString() } } }));
    },
    openAssignmentFiles: id => {
      if (id && (!getOpportunity(id) || !isOpportunityRevealed(id, get().gameplay.player))) return;
      if (id) {
        get().saveAssignmentBriefing(id);
        if (get().gameplay.player.worknetOrders?.[id]?.status === 'accepted') get().recordAssignmentCompletion(id);
      }
      update(current => ({ ...current, fileDirectory: id ? `/assignments/${id}` : '/assignments', fileRequest: current.fileRequest + 1 }));
      showApp('files');
    },
    claimActivityUnlock: id => {
      const opportunity = getOpportunity(id);
      if (opportunity?.kind === 'journey') return get().claimJourneyChapter(id, 'accreditation');
      if (!opportunity?.unlock || !journal().started[id] || !activityReady(id, get().gameplay.player)) return { ok: false, message: 'Start this activity and submit all of its required assignments first.' };
      if (journal().claimed[id]) return { ok: false, message: 'This special unlock is already in your collection.' };
      if (opportunity.kind === 'adventure' && !get().gameplay.player.worldJournal?.branches?.[id]) return { ok: false, message: 'Record your Adventure approach before closing its field notebook.' };
      const { name, text } = opportunity.unlock;
      const branch = get().gameplay.player.worldJournal?.branches?.[id];
      const file: AssignmentFile = { id: `unlock:${id}`, name: `${name}.txt`, dir: `/assignments/${id}`, type: 'txt', size: 'Unlocked record', desc: name, body: `${text}${branch ? `\n\nYour approach: ${branch.choice}\n${branch.consequence}` : ''}`, assignmentId: id };
      update(current => ({ ...current, claimed: { ...current.claimed, [id]: new Date().toISOString() }, unlocks: [...current.unlocks, name], files: { ...current.files, [file.id]: file } }));
      return { ok: true, message: `${name} unlocked. Open its record in VAULT.` };
    },
    claimJourneyChapter: (id, chapterId) => {
      const activity = evaluateLinkedActivities(get().gameplay.player.taskResults || {}).find(item => item.id === id && item.kind === 'journey');
      const chapter = activity?.chapters.find(item => item.id === chapterId);
      const key = `${id}:${chapterId}`;
      if (!chapter || !journal().started[id]) return { ok: false, message: 'Choose this Journey before recording its chapters.' };
      const needed = activity!.chapters.filter(item => item.id === chapterId || item.id === chapter.after);
      const requiredMissions = [...new Set(needed.flatMap(item => activity!.milestones.filter(milestone => item.milestoneIds.includes(milestone.id)).flatMap(milestone => milestone.requirements.map(requirement => requirement.definitionId))))];
      if (!needed.every(item => item.complete) || !requiredMissions.every(mission => get().gameplay.player.worknetOrders?.[mission]?.status === 'accepted')) return { ok: false, message: 'Complete this chapter and its prerequisites, and submit the related work for acceptance.' };
      if (journal().chapterClaims?.[key] || (chapterId === 'accreditation' && journal().claimed[id])) return { ok: false, message: 'This chapter record is already saved. Your Journey continues.' };
      const opportunity = getOpportunity(id)!;
      const bonus = chapterId === 'accreditation' ? opportunity.unlock : undefined;
      const file: AssignmentFile = { id: `chapter:${key}`, name: `${chapter.title}.txt`, dir: `/assignments/${id}`, type: 'txt', size: 'Chapter record', desc: chapter.title, assignmentId: id, body: `${chapter.title}\nChapter completed. Your broader Journey remains open.\n${bonus?.text || 'Your accepted field experience is retained in this chapter record.'}` };
      update(current => ({ ...current, chapterClaims: { ...current.chapterClaims, [key]: new Date().toISOString() }, unlocks: bonus && !current.unlocks.includes(bonus.name) ? [...current.unlocks, bonus.name] : current.unlocks, files: { ...current.files, [file.id]: file } }));
      return { ok: true, message: `${chapter.title} chapter completed. Your Journey continues.` };
    },
    recordAssignmentCompletion: id => {
      const player = get().gameplay.player;
      const order = player.worknetOrders?.[id];
      const opportunity = getOpportunity(id);
      if (!opportunity || order?.status !== 'accepted' || !player.rewardedWorkOrderIds?.includes(order.id)) return;
      const assignment = WORKNET_ASSIGNMENTS[id];
      const carePaid = order.resultIds.some((resultId: string) => player.taskResults[resultId]?.compensationPaid);
      const file: AssignmentFile = { id: `completion:${order.id}`, name: `Completion_cycle_${order.cycle}.log`, dir: `/assignments/${id}`, type: 'log', size: 'Receipt', desc: 'Accepted work and compensation', assignmentId: id,
        body: `${opportunity.title}\nWork order: ${order.id}\nStatus: accepted\nEvaluation: ${order.evaluation}/100\n\n${order.resultIds.map((resultId: string) => { const result = player.taskResults[resultId]; return `${result.stageId}\n${Object.entries(result.output).map(([key, value]) => `${key}: ${value}`).join('\n')}`; }).join('\n\n')}\n\n${carePaid ? 'Clinical compensation was already issued at treatment. No duplicate payment.' : `Paid: ${assignment.rewardCredits} credits, ${assignment.rewardBits || 0} bits, ${assignment.rewardXP} career XP.`}` };
      saveFiles([file]);
      sendReceipt(id, 'completed', file);
      get().refreshContextualDiscoveries();
      get().refreshAssignmentDispatches();
    },
  };
}
