import { changeWorkplace, workTick, stationTrack, employed } from '../apps/worknet/workplaceModel';
import type { OSStoreState } from './useOSStore';
import { sanitizeMailHtml, mailHtmlToText } from '../apps/mail/richText';
import { CASE_MISSION, restoreCaseProgress, reviewBroadStreet } from '../gameplay/BroadStreetCase';
import { WORK_DEFINITIONS, getWorkDefinition, WORKNET_ASSIGNMENTS, nextWorkStage, resolveWorkStage, validateWorkStage, type WorkOrder, type WorkValues, type TaskResult, type EmploymentContract } from '../gameplay/ActivityEngine';
import { CAREER_TRACK_SPECS, WORKNET_DOMAIN_TASKS, evaluateWorknetObjective } from '../gameplay/WorldEventEngine';

export function createWorknetActions(set: (update: (state: OSStoreState) => Partial<OSStoreState>) => void, get: () => OSStoreState) {
  const updatePlayer = (update: (player: any) => any) => set(state => ({ gameplay: { ...state.gameplay, player: update(state.gameplay.player) } }));
  const updateOrder = (missionId: string, update: (order: WorkOrder) => WorkOrder) => updatePlayer(player => ({ ...player, worknetOrders: { ...player.worknetOrders, [missionId]: update(player.worknetOrders[missionId]) } }));
  return {
    // Compatibility for older callers. A procedure answer is a plan, never a deliverable.
    completeWorknetDomainTask: (missionId: string, selectedOptionId: string) => {
      const chosen = Object.hasOwn(WORKNET_DOMAIN_TASKS, missionId) ? WORKNET_DOMAIN_TASKS[missionId].options.find(option => option.id === selectedOptionId) : undefined;
      if (!chosen?.isCorrect) return { ok: false, message: 'Review the procedure against the assignment requirements.' };
      get().advanceWorknetMissionStep(missionId, `procedure-plan:${selectedOptionId}`);
      return { ok: true, message: 'Procedure plan recorded. Complete the work-order stages and submit the required outputs.' };
    },

    acceptEmployment: (track: string) => {
      const definition = Object.values(WORK_DEFINITIONS).find(item => item.track === track);
      if (!definition) return { ok: false, message: 'No institutional position is available for this career track.' };
      const player = get().gameplay.player;
      if (player.employmentContracts?.[track]) return { ok: false, message: 'Your employment contract is already active.' };
      if ((player.clearanceLevel ?? 2) < definition.clearance) return { ok: false, message: 'Institutional clearance is required for this position.' };
      const contract: EmploymentContract = {
        id: `EMP:${track}`, track, position: CAREER_TRACK_SPECS[track]?.rankTitles[0] || track,
        duties: Object.values(WORK_DEFINITIONS).filter(item => item.track === track).map(item => item.subject),
        schedule: 'Available shifts; accept an individual work order when ready.',
        payTerms: '150 credits per cycle plus published assignment compensation. Patient charts and work receipts are paid once.',
        baseSalaryCredits: 150, lastStipendClaimedCycle: (get().gameplay.timeCycleCount ?? 0) - 1, pathwayChoice: 'specialist',
      };
      updatePlayer(current => ({ ...current, employmentContracts: { ...current.employmentContracts, [track]: contract } }));
      return { ok: true, message: `Employment accepted: ${contract.position}. You can now open a work shift.` };
    },

    openWorknetOrder: (missionId: string) => {
      if (missionId === CASE_MISSION && (!get().broadStreetEligible() || get().broadStreetPreviouslyComplete())) return { ok: false, message: 'Existing DGA/TRACE access and clearance 2 are required. Previously closed or paid Broad Street cases cannot reopen as new paid assignments.' };
      const state = get();
      const player = state.gameplay.player;
      const definition = getWorkDefinition(missionId);
      if (!definition) return { ok: false, message: 'Unknown assignment.' };
      const existing: WorkOrder | undefined = player.worknetOrders?.[missionId];
      if (existing?.status === 'active') { get().recordAssignmentOpened(missionId); return { ok: true, message: 'Resumed your saved work order.' }; }
      const repeatable = definition.kind === 'shift' && definition.track !== 'medical';
      if ((!repeatable && player.completedWorknetMissionIds.includes(missionId)) || (existing && (!repeatable || existing.cycle >= state.gameplay.timeCycleCount))) {
        return { ok: false, message: repeatable ? 'This shift is already paid for this cycle. A new shift opens next cycle.' : 'This one-time assignment is already accepted and paid.' };
      }
      const contract: EmploymentContract | undefined = player.employmentContracts?.[definition.track];
      if (definition.kind === 'shift' && !contract) return { ok: false, message: 'Accept the employment contract before opening a work shift.' };
      if ((player.clearanceLevel ?? 2) < definition.clearance) return { ok: false, message: `This assignment requires clearance ${definition.clearance}.` };
      if (player.stamina < 10) return { ok: false, message: 'A work order requires 10 stamina. Rest before accepting the assignment.' };
      const id = `WORK:${missionId}:${repeatable ? state.gameplay.timeCycleCount : 'once'}`;
      if (player.rewardedWorkOrderIds?.includes(id)) return { ok: false, message: 'This work order has already been paid.' };
      const order: WorkOrder = {
        id, definitionId: missionId, subject: definition.subject, cycle: state.gameplay.timeCycleCount,
        employmentContractId: definition.kind === 'shift' ? contract?.id : undefined,
        tools: [...definition.tools], timeRemaining: 20, resultIds: [], drafts: {}, status: 'active',
        evaluation: 100, resourcesUsed: 0, remediationRequired: false, incidents: [],
      };
      // A clinical receipt has the same identity whether earned in Faith Medical or WorkNet.
      const care: TaskResult | undefined = player.taskResults?.[`${id}:care`];
      if (care?.compensationPaid && care.subject === definition.subject) order.resultIds.push(care.id);
      updatePlayer(current => ({ ...current, worknetOrders: { ...current.worknetOrders, [missionId]: order } }));
      get().recordAssignmentOpened(missionId);
      return { ok: true, message: `Work order opened for ${definition.subject}. Equipment reserved; 20 work units available.` };
    },

    saveWorknetDraft: (missionId: string, stageId: string, values: WorkValues) => {
      const player = get().gameplay.player;
      const order: WorkOrder | undefined = player.worknetOrders?.[missionId];
      const stage = order ? nextWorkStage(order, player.taskResults || {}) : undefined;
      if (!order || order.status !== 'active' || stage?.id !== stageId) return;
      const selected = resolveWorkStage(stage, values);
      if (!selected) return;
      const draft = Object.fromEntries(selected.fields.map(field => [field.id, typeof values?.[field.id] === 'string' ? values[field.id].slice(0, 4000) : '']));
      for (const field of selected.fields.filter(field => field.kind === 'report')) {
        const html = sanitizeMailHtml(values?.[`${field.id}__html`]);
        if (html && mailHtmlToText(html).trim() === draft[field.id].trim()) draft[`${field.id}__html`] = html;
      }
      if (values?._approach) draft._approach = values._approach;
      updateOrder(missionId, saved => ({ ...saved, drafts: { ...saved.drafts, [stageId]: draft } }));
    },

    submitWorknetStage: (missionId: string, stageId: string, values: WorkValues) => {
      if (missionId === CASE_MISSION) return { ok: false, message: 'Submit the structured findings and citations through the case report reviewer.' };
      const player = get().gameplay.player;
      const order: WorkOrder | undefined = player.worknetOrders?.[missionId];
      if (!order || order.status !== 'active') return { ok: false, message: 'Open an active work order first.' };
      if (!order.briefingReadAt) return { ok: false, message: 'Review the briefing before starting assignment activities.' };
      if (order.remediationRequired) return { ok: false, message: 'Equipment is offline. Submit a remediation note first.' };
      const stage = nextWorkStage(order, player.taskResults || {});
      if (!stage || stage.id !== stageId) return { ok: false, message: 'Complete the current stage; accepted outputs cannot be resubmitted.' };
      get().saveWorknetDraft(missionId, stageId, values);
      const evaluation = validateWorkStage(stage, values);
      if (!evaluation.ok) {
        const serious = evaluation.severity === 'serious';
        updateOrder(missionId, saved => ({ ...saved, evaluation: Math.max(0, saved.evaluation - (serious ? 15 : 2)),
          resourcesUsed: saved.resourcesUsed + (serious ? 1 : 0), remediationRequired: serious,
          incidents: [...saved.incidents, { stageId, severity: evaluation.severity, message: evaluation.message }],
        }));
        return { ok: false, message: evaluation.message };
      }
      if (missionId === 'ms-shift-01' && stageId === 'care' && !player.completedPatientCareIds.includes('pc-mercer')) {
        return get().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals');
      }
      const selected = resolveWorkStage(stage, values)!;
      const result: TaskResult = {
        id: `${order.id}:${stageId}`, workOrderId: order.id, definitionId: missionId,
        stageId, subject: order.subject, mechanic: selected.mechanic,
        output: { ...Object.fromEntries(selected.fields.map(field => [field.id, values[field.id]])), ...Object.fromEntries(Object.entries(get().gameplay.player.worknetOrders[missionId].drafts[stageId] || {}).filter(([key]) => key.endsWith('__html'))), ...(values._approach ? { _approach: values._approach } : {}) }, completedAt: new Date().toISOString(),
        // A legacy paid chart can be reviewed again for proof, without another clinical reward.
        compensationPaid: missionId === 'ms-shift-01' && stageId === 'care' ? true : undefined,
      };
      updatePlayer(current => ({ ...current,
        taskResults: { ...current.taskResults, [result.id]: result },
        worknetOrders: { ...current.worknetOrders, [missionId]: { ...current.worknetOrders[missionId], resultIds: [...current.worknetOrders[missionId].resultIds, result.id], timeRemaining: order.timeRemaining - 1 } },
      }));
      const skill = { evidence: 'Research', documents: 'Communication', diagnostics: 'Research', equipment: 'Creativity', investigation: 'Research', dialogue: 'Communication', logistics: 'Resilience', creative: 'Creativity' }[selected.mechanic];
      get().addSkillXP(skill, 5);
      const professionSkill = ({ engineer: 'Engineering', medical: 'Research', diplomat: 'Communication', finance: 'Research', archivist: 'Research', dga: 'CyberSecurity', warden: 'Research', questnotice: 'Resilience' } as Record<string, string>)[getWorkDefinition(missionId)!.track];
      if (professionSkill && professionSkill !== skill) get().addSkillXP(professionSkill, 5);
      get().refreshContextualDiscoveries();
      return { ok: true, message: `${evaluation.message} Receipt ${result.id} saved.` };
    },

    remediateWorknetOrder: (missionId: string, note: string) => {
      const order: WorkOrder | undefined = get().gameplay.player.worknetOrders?.[missionId];
      if (!order?.remediationRequired || order.status !== 'active') return { ok: false, message: 'No incident requires remediation.' };
      if (note.trim().length < 30 || !/isolat/i.test(note) || !/supervisor/i.test(note)) return { ok: false, message: 'Describe isolation of the unsafe equipment and supervisor review (at least 30 characters).' };
      updateOrder(missionId, saved => ({ ...saved, remediationRequired: false, drafts: { ...saved.drafts, remediation: { report: note.slice(0, 4000) } } }));
      return { ok: true, message: 'Safe conditions restored under supervisor review. Correct and retry the failed stage; the incident remains in your evaluation.' };
    },

    completeWorknetMission: (mission: { id: string; track: string; rewardCredits: number; rewardBits?: number; rewardXP: number; primaryAttribute?: string }) => {
      if (mission?.id === CASE_MISSION) {
        const order = get().gameplay.player.worknetOrders?.[CASE_MISSION];
        const progress = restoreCaseProgress(order?.caseProgress);
        const last = progress.reviews.at(-1);
        if (!get().broadStreetEligible() || get().broadStreetPreviouslyComplete() || !last?.accepted || reviewBroadStreet(progress).length) return { ok: false, reason: 'A current accepted evidence review is required. Access changes or an existing completion receipt prevent another payout.' };
      }
      const state = get();
      const player = state.gameplay.player;
      const order: WorkOrder | undefined = player.worknetOrders?.[mission?.id];
      const definition = getWorkDefinition(mission?.id);
      const assignment = WORKNET_ASSIGNMENTS[mission?.id];
      if (!definition || !order || order.status !== 'active' || player.rewardedWorkOrderIds?.includes(order.id)) return { ok: false, reason: 'No unpaid active work order is available.' };
      const evaluation = evaluateWorknetObjective(mission.id, mission.track, player);
      if (!evaluation.verified) return { ok: false, reason: evaluation.requirementText };
      if (player.stamina < 10) return { ok: false, reason: 'Finalization requires 10 stamina. Rest and return to your saved work.' };
      const completedIds: string[] = player.completedWorknetMissionIds || [];
      // Clinical care is paid at treatment. WorkNet sign-off accepts its chart without paying twice.
      const paidCare = order.resultIds.some(id => player.taskResults[id]?.compensationPaid);
      const credits = paidCare ? 0 : assignment.rewardCredits;
      const bits = paidCare ? 0 : assignment.rewardBits;
      const xp = paidCare ? 0 : assignment.rewardXP;
      const newXP = player.xp + xp;
      set(current => ({ gameplay: { ...current.gameplay,
        prismCorruptionLevel: ['dga', 'engineer', 'medical', 'archivist'].includes(definition.track) ? Math.max(2, Number((current.gameplay.prismCorruptionLevel - 1).toFixed(1))) : current.gameplay.prismCorruptionLevel,
        player: { ...current.gameplay.player,
          completedWorknetMissionIds: completedIds.includes(mission.id) ? completedIds : [...completedIds, mission.id],
          rewardedWorkOrderIds: [...(player.rewardedWorkOrderIds || []), order.id],
          worknetOrders: { ...player.worknetOrders, [mission.id]: { ...order, status: 'accepted' } },
          credits: player.credits + credits, bits: player.bits + bits, xp: newXP,
          level: Math.floor(newXP / 100) + 1, stamina: player.stamina - 10,
        },
      } }));
      if (xp) get().addCareerXP(definition.track, xp);
      get().recordAssignmentCompletion(mission.id);
      get().recordWorldEvent({ category: 'worknet', title: `Accepted work order ${order.id}`,
        summary: `${order.subject}: outputs accepted; evaluation ${order.evaluation}/100; supplies lost ${order.resourcesUsed}. Compensation: ${credits} credits, ${xp} career XP.${paidCare ? ' Clinical pay already issued.' : ''}`,
        institution: `WORKNET // ${definition.track.toUpperCase()}`,
      });
      return { ok: true };
    },

    resetWorknetMissionsAdmin: () => {
      if (!get().gameplay.player.isAdmin) return;
      // Payout receipts and saved outputs survive administrative panel resets.
      updatePlayer(player => ({ ...player, worknetMissionProgress: {} }));
    },

    worknetWorkplaceAction: (action: any) => {
      const game = get().gameplay, player = game.player;
      const raw = player.worknetWorkplace ?? (action.type === 'initialize' ? action.legacy : undefined);
      const result = changeWorkplace(raw, action, player, workTick(game));
      if (!result.ok) return { ok: false, message: result.message };
      // Commit the receipt and any compensation together into the ordinary world save.
      if (JSON.stringify(player.worknetWorkplace) !== JSON.stringify(result.state)) updatePlayer(p => ({ ...p, worknetWorkplace: result.state, credits: p.credits + result.credits, stamina: p.stamina - result.stamina }));
      if (result.xp) get().addCareerXP(result.track, result.xp);
      return { ok: true, message: result.message };
    },

    claimCycleStipends: () => {
      const state = get();
      const player = state.gameplay.player;
      const contracts = player.employmentContracts || {};
      const currentCycle = Math.max(0, state.gameplay.timeCycleCount ?? 0);
      let totalClaimed = 0;
      let eligibleCount = 0;
      const updatedContracts = { ...contracts };

      for (const [track, contract] of Object.entries(contracts)) {
        const station = track === 'medical' ? 'faithmed' : track === 'archivist' ? 'archives' : track;
        if (!employed(player, station)) continue;
        const lastClaim = Number.isSafeInteger(contract.lastStipendClaimedCycle) ? contract.lastStipendClaimedCycle! : currentCycle - 1;
        if (lastClaim < currentCycle) {
          const stipend = 150;
          totalClaimed += stipend;
          eligibleCount += 1;
          updatedContracts[track] = { ...contract, lastStipendClaimedCycle: currentCycle };
        }
      }

      if (eligibleCount === 0) {
        return { ok: false, message: 'Institutional stipends for this cycle have already been disbursed.' };
      }

      updatePlayer(current => ({
        ...current,
        credits: current.credits + totalClaimed,
        employmentContracts: updatedContracts
      }));

      get().recordWorldEvent({
        category: 'worknet',
        title: 'Institutional Payroll Disbursement',
        summary: `Disbursed ${totalClaimed} ₢ in baseline cycle stipends across ${eligibleCount} active position(s).`,
        institution: 'WORKNET // TREASURY PAYROLL',
      });

      return {
        ok: true,
        message: `Disbursed +${totalClaimed} ₢ base stipend across ${eligibleCount} active position(s) for Cycle ${currentCycle}.`,
        creditsClaimed: totalClaimed
      };
    },

    setCareerPathwayChoice: (track: string, pathway: 'specialist' | 'supervisor') => {
      const player = get().gameplay.player;
      if (!['specialist', 'supervisor'].includes(pathway)) return { ok: false, message: 'Choose a valid career pathway.' };
      const contract = player.employmentContracts?.[track];
      const station = track === 'medical' ? 'faithmed' : track === 'archivist' ? 'archives' : track;
      if (!employed(player, station) || !contract) return { ok: false, message: 'An active employment contract is required to select a career pathway.' };

      updatePlayer(current => ({
        ...current,
        employmentContracts: {
          ...current.employmentContracts,
          [track]: { ...contract, pathwayChoice: pathway }
        }
      }));

      return {
        ok: true,
        message: `Career pathway updated: ${pathway} for ${track}.`
      };
    },
  };
}
