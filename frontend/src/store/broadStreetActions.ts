import type { OSStoreState } from './useOSStore';
import { useCommsStore } from './useCommsStore';
import { resolveDGAAuthority } from '../dgaos/lib/dga-permissions';
import { BROAD_STREET, CASE_ID, CASE_MAIL, CASE_MISSION, caseSource, restoreCaseProgress, reviewBroadStreet, legacyCaseComplete, type CaseProgress, type CaseReportDraft, type CaseReview } from '../gameplay/BroadStreetCase';
import { sanitizeMailHtml, mailHtmlToText, escapeMailText } from '../apps/mail/richText';
import type { TaskResult, WorkOrder } from '../gameplay/ActivityEngine';
type Result = { ok: boolean; message: string };
export interface BroadStreetActions {
  acquireCaseSource: (id: string, app: string) => Result;
  requestCaseStatement: () => Result;
  saveCaseReport: (draft: CaseReportDraft) => Result;
  reviewCaseReport: () => Result;
  openCaseSource: (id: string) => void;
  broadStreetEligible: () => boolean;
  broadStreetPreviouslyComplete: () => boolean;
}
export function createBroadStreetActions(set: any, get: () => OSStoreState): BroadStreetActions {
  const eligible = () => { const state = get(); return state.isLoggedIn && (state.gameplay.player.clearanceLevel ?? 2) >= 2 && resolveDGAAuthority({ player: state.gameplay.player, isLoggedIn: state.isLoggedIn }).canAccessTrace; };
  const previouslyComplete = () => {
    const read = (key: string) => { try { return JSON.parse(globalThis.localStorage.getItem(key) || 'null'); } catch { return null; } };
    return legacyCaseComplete(get().gameplay.player, read('DGAOS_WORKSTATION_STATE_V3'), read('trace_active_case_data_v2'));
  };
  const currentOrder = () => get().gameplay.player.worknetOrders?.[CASE_MISSION];
  const active = () => eligible() && currentOrder()?.status === 'active' && Boolean(currentOrder()?.briefingReadAt) && !currentOrder()?.remediationRequired;
  const update = (change: (current: CaseProgress) => CaseProgress) => set((state: OSStoreState) => {
    const order = state.gameplay.player.worknetOrders[CASE_MISSION];
    return { gameplay: { ...state.gameplay, player: { ...state.gameplay.player, worknetOrders: { ...state.gameplay.player.worknetOrders, [CASE_MISSION]: { ...order, caseProgress: change(restoreCaseProgress(order.caseProgress)) } } } } };
  });
  const denied = () => ({ ok: false, message: 'An active, briefed work order and existing DGA/TRACE access at clearance 2 are required. This assignment does not issue credentials.' });
  const sourceFile = (id: string) => {
    const source = caseSource(id)!;
    set((state: OSStoreState) => { const journal = state.gameplay.player.assignmentJournal;
      const file = { id: `case002:${id}`, name: `${source.title}.txt`, dir: `/assignments/${CASE_MISSION}`, type: 'txt', size: 'Case record', desc: source.title, assignmentId: CASE_MISSION, caseSourceId: id, body: source.body };
      return { gameplay: { ...state.gameplay, player: { ...state.gameplay.player, assignmentJournal: { ...journal, files: { ...journal.files, [file.id]: file } } } } };
    });
  };
  const saveReviewReceipt = (order: WorkOrder, progress: CaseProgress, review: CaseReview) => {
    const receipt: TaskResult = { id: `${order.id}:case-review`, workOrderId: order.id, definitionId: CASE_MISSION, stageId: 'case-review', subject: CASE_ID, mechanic: 'investigation', output: { report: progress.draft.text, report__html: sanitizeMailHtml(progress.draft.html), findings: JSON.stringify(progress.draft.findings), reviewId: review.id }, completedAt: review.submittedAt };
    set((state: OSStoreState) => {
      const player = state.gameplay.player, current = player.worknetOrders[CASE_MISSION];
      return { gameplay: { ...state.gameplay, player: { ...player, taskResults: { ...player.taskResults, [receipt.id]: receipt }, worknetOrders: { ...player.worknetOrders, [CASE_MISSION]: { ...current, resultIds: [...new Set([...current.resultIds, receipt.id])] } } } } };
    });
  };
  const clearReviewReceipt = () => set((state: OSStoreState) => {
    const player = state.gameplay.player, order = player.worknetOrders[CASE_MISSION];
    const results = { ...player.taskResults }; delete results[`${order.id}:case-review`];
    return { gameplay: { ...state.gameplay, player: { ...player, taskResults: results, worknetOrders: { ...player.worknetOrders, [CASE_MISSION]: { ...order, resultIds: order.resultIds.filter((id: string) => id !== `${order.id}:case-review`) } } } } };
  });
  return {
    broadStreetEligible: eligible,
    broadStreetPreviouslyComplete: previouslyComplete,
    acquireCaseSource: (id, app) => {
      if (!active()) return denied();
      const source = caseSource(id);
      if (!source || source.app !== app) return { ok: false, message: 'Open the original record in its source application.' };
      if (id === 'guard-statement' && (!restoreCaseProgress(currentOrder().caseProgress).witnessRequested || !useCommsStore.getState().emails.some(mail => mail.id === CASE_MAIL))) return { ok: false, message: 'Request the guard’s clarification through AureMail first.' };
      update(current => ({ ...current, acquired: [...new Set([...current.acquired, id])] }));
      sourceFile(id);
      return { ok: true, message: 'Source acquired. The original reference is available in your DGAOS notebook and case folder.' };
    },
    requestCaseStatement: () => {
      if (!active()) return denied();
      const mailbox = useCommsStore.getState();
      if (!mailbox.emails.some(mail => mail.id === CASE_MAIL)) mailbox.addEmail({ id: CASE_MAIL, threadId: CASE_MAIL, sender: 'Mateo Cruz / witness liaison', senderAddress: 'mateo.cruz@firstfederal.aure', recipientAddress: mailbox.playerAccounts.find(account => account.accountType === 'personal')?.address || 'citizen@auremail.aure', faction: 'DGA', subject: 'Broad Street: requested guard clarification', body: caseSource('guard-statement')!.body, timestamp: new Date().toISOString(), time: 'Just now', read: false, folder: 'inbox', verifiedSender: true, deliveryStatus: 'delivered', linkedApp: 'dgaos', attachment: null, assignmentId: CASE_MISSION });
      update(current => ({ ...current, witnessRequested: true }));
      mailbox.requestMailMessage(CASE_MAIL); get().openAppWorkspace('mail');
      return { ok: true, message: 'The recorded clarification is ready in AureMail. Add it to the evidence notebook after reading.' };
    },
    saveCaseReport: draft => {
      if (!active()) return denied();
      const restored = restoreCaseProgress({ draft }).draft;
      const clean = sanitizeMailHtml(restored.html);
      restored.html = mailHtmlToText(clean).trim() === restored.text.trim() ? clean : `<p>${escapeMailText(restored.text).replace(/\n/g, '<br>')}</p>`;
      if (JSON.stringify(restored) === JSON.stringify(restoreCaseProgress(currentOrder().caseProgress).draft)) return { ok: true, message: 'Case report is already saved.' };
      update(current => ({ ...current, draft: restored }));
      // Editing invalidates the prior acceptance receipt but preserves every submitted version.
      clearReviewReceipt();
      return { ok: true, message: 'Case report saved.' };
    },
    reviewCaseReport: () => {
      if (!active()) return denied();
      const order = currentOrder(), progress = restoreCaseProgress(order.caseProgress);
      const prior = progress.reviews.at(-1);
      const feedback = reviewBroadStreet(progress);
      if (prior && prior.accepted === (feedback.length === 0) && (prior.accepted || JSON.stringify(prior.feedback) === JSON.stringify(feedback)) && prior.version === progress.version && JSON.stringify(prior.draft) === JSON.stringify(progress.draft) && JSON.stringify([...prior.acquired].sort()) === JSON.stringify([...progress.acquired].sort())) {
        if (prior.accepted) saveReviewReceipt(order, progress, prior);
        else clearReviewReceipt();
        return { ok: prior.accepted, message: prior.feedback.join(' ') };
      }
      const review = { id: crypto.randomUUID(), submittedAt: new Date().toISOString(), version: progress.version, acquired: [...progress.acquired], draft: structuredClone(progress.draft), accepted: feedback.length === 0, feedback: feedback.length ? feedback : ['Report accepted. Finalize through WORKNET for your published compensation.'] };
      update(current => ({ ...current, reviews: [...current.reviews, review] }));
      if (review.accepted) saveReviewReceipt(order, progress, review);
      else clearReviewReceipt();
      return { ok: review.accepted, message: review.feedback.join(' ') };
    },
    openCaseSource: id => {
      const source = caseSource(id); if (!source) return;
      if (source.app === 'browser') { get().navigateBrowserTab('https://firstfederal.aure/maintenance'); get().openAppWorkspace('browser'); return; }
      if (!active() && !(eligible() && currentOrder()?.status === 'accepted')) return;
      if (source.app === 'mail') {
        if (currentOrder()?.status === 'accepted') { useCommsStore.getState().requestMailMessage(CASE_MAIL); get().openAppWorkspace('mail'); }
        else get().requestCaseStatement();
        return;
      }
      if (source.app === 'files') sourceFile(id);
      get().openAppWorkspace(source.app, `broadstreet:${id}`);
    },
  };
}
