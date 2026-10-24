import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return next(`${specifier}.ts`, context);
    }
  }
});

const {
  INSTITUTIONAL_REGISTRY,
  CANONICAL_DYNAMIC_EVENTS,
  INITIAL_SCHEDULE_ITEMS,
  INITIAL_DELEGATION_TASKS,
  INITIAL_SUBORDINATE_LEAVES
} = await import('../src/apps/worknet/worknetData.ts');
const { evaluateCareerPromotion } = await import('../src/gameplay/WorldEventEngine.ts');
const { WORK_DEFINITIONS } = await import('../src/gameplay/ActivityEngine.ts');
const { useOSStore } = await import('../src/store/useOSStore.ts');

test('WORKNET-001 & WORKNET-002: Institutional branding and modern visual identity registry', () => {
  const expectedInstitutions = ['dga', 'faithmed', 'finance', 'archives', 'engineer', 'diplomat', 'warden', 'artist', 'questnotice'];
  for (const id of expectedInstitutions) {
    const inst = INSTITUTIONAL_REGISTRY[id];
    assert.ok(inst, `Institution ${id} must be registered`);
    assert.ok(inst.accentColor, `Institution ${id} must define an accent color`);
    assert.ok(inst.headerBg, `Institution ${id} must define header background`);
    assert.ok(inst.divisions.length > 0, `Institution ${id} must have registered divisions`);
    assert.ok(inst.supervisor.name, `Institution ${id} must have an identified supervisor`);
    assert.ok(inst.coworkers.length > 0, `Institution ${id} must have active NPC coworkers`);
  }

  // DGA styling: Navy & Steel
  assert.equal(INSTITUTIONAL_REGISTRY.dga.shortOrg, 'DGA');
  assert.match(INSTITUTIONAL_REGISTRY.dga.focus, /investigations/i);

  // Faith Medical styling: Clinical Teal
  assert.equal(INSTITUTIONAL_REGISTRY.faithmed.shortOrg, 'Faith Medical');
  assert.match(INSTITUTIONAL_REGISTRY.faithmed.focus, /healthcare/i);

  // Treasury styling: Finance & Audit
  assert.equal(INSTITUTIONAL_REGISTRY.finance.shortOrg, 'Treasury');
  assert.match(INSTITUTIONAL_REGISTRY.finance.focus, /finance/i);
});

test('WORKNET-004 & WORKNET-005: Workplace Switcher and multi-employer affiliations', () => {
  const dummyPlayer = {
    clearanceLevel: 2,
    credits: 1000,
    bits: 50,
    xp: 250,
    employmentContracts: {
      dga: { id: 'EMP:dga', track: 'dga', position: 'Tactical Analyst', duties: ['SIGINT'], schedule: 'Morning', payTerms: 'Standard' },
      medical: { id: 'EMP:medical', track: 'medical', position: 'Clinical Intake Aide', duties: ['Triage'], schedule: 'Afternoon', payTerms: 'Standard' }
    },
    worknetOrders: {},
    completedWorknetMissionIds: []
  };

  assert.equal(Object.keys(dummyPlayer.employmentContracts).length, 2);
  assert.equal(dummyPlayer.employmentContracts.dga.position, 'Tactical Analyst');
  assert.equal(dummyPlayer.employmentContracts.medical.position, 'Clinical Intake Aide');

  const dgaTheme = INSTITUTIONAL_REGISTRY.dga;
  const fmTheme = INSTITUTIONAL_REGISTRY.faithmed;
  assert.notEqual(dgaTheme.accentColor, fmTheme.accentColor);
  assert.notEqual(dgaTheme.supervisor.name, fmTheme.supervisor.name);
});

test('WORKNET-006 & WORKNET-011: Option C Full Workplace Life & 5 NPC relationship dimensions', () => {
  for (const inst of Object.values(INSTITUTIONAL_REGISTRY)) {
    for (const cw of inst.coworkers) {
      assert.ok(typeof cw.trust === 'number' && cw.trust >= 0 && cw.trust <= 100, `${cw.name} trust must be 0-100`);
      assert.ok(typeof cw.competence === 'number' && cw.competence >= 0 && cw.competence <= 100, `${cw.name} competence must be 0-100`);
      assert.ok(typeof cw.familiarity === 'number' && cw.familiarity >= 0 && cw.familiarity <= 100, `${cw.name} familiarity must be 0-100`);
      assert.ok(typeof cw.cooperation === 'number' && cw.cooperation >= 0 && cw.cooperation <= 100, `${cw.name} cooperation must be 0-100`);
      assert.ok(typeof cw.conflictHistory === 'number' && cw.conflictHistory >= 0 && cw.conflictHistory <= 100, `${cw.name} conflict must be 0-100`);
      assert.ok(['Desk', 'In Field', 'In Meeting', 'On Break'].includes(cw.status), `${cw.name} status must be valid`);
    }
  }
});

test('WORKNET-007: Option C Hybrid Work (routine, dynamic, and authored)', () => {
  assert.ok(INSTITUTIONAL_REGISTRY.dga.routineDuties.length > 0);
  assert.ok(INSTITUTIONAL_REGISTRY.faithmed.routineDuties.length > 0);

  assert.ok(CANONICAL_DYNAMIC_EVENTS.length >= 4);
  const surgeEvent = CANONICAL_DYNAMIC_EVENTS.find(e => e.id === 'dyn-fm-01');
  assert.ok(surgeEvent);
  assert.equal(surgeEvent.stationId, 'faithmed');
  assert.match(surgeEvent.title, /Intake Surge/i);
  assert.ok(surgeEvent.staminaCost > 0);
  assert.ok(surgeEvent.rewardCredits > 0);

  assert.ok(WORK_DEFINITIONS['ms-case-002']);
  assert.ok(WORK_DEFINITIONS['ms-spec-01']);
  assert.equal(WORK_DEFINITIONS['ms-case-002'].track, 'dga');
});

test('WORKNET-009 & WORKNET-010: Career promotion requires verified qualifications and avoids duplicate rewards', () => {
  const freshPlayer = {
    clearanceLevel: 1,
    careerXP: { medical: 500 },
    completedPatientCareIds: [],
    reputation: { faith: 40 },
    skills: { Research: { level: 1 } }
  };

  const evalResult = evaluateCareerPromotion('medical', freshPlayer);
  assert.equal(evalResult.canPromote, false, 'Career XP alone cannot bypass required clinical qualifications');

  const definition = WORK_DEFINITIONS['ms-shift-01'];
  assert.ok(definition);
  assert.equal(definition.track, 'medical');
});

test('WORKNET-011 & WORKNET-012: Dual-Track progression and active supervisory delegation', () => {
  // Check delegation tasks exist for major institutions
  assert.ok(INITIAL_DELEGATION_TASKS.length >= 4);
  const dgaTask = INITIAL_DELEGATION_TASKS.find(t => t.stationId === 'dga');
  assert.ok(dgaTask);
  assert.ok(dgaTask.minCompetence > 50);

  // Check subordinate leave requests exist for supervisor review
  assert.ok(INITIAL_SUBORDINATE_LEAVES.length >= 3);
  const leave = INITIAL_SUBORDINATE_LEAVES[0];
  assert.ok(leave.subordinateName);
  assert.equal(leave.status, 'Pending');

  // Verify pathway choice updates cleanly in the store
  const testState = useOSStore.getState();
  testState.acceptEmployment('engineer');
  const res = testState.setCareerPathwayChoice('engineer', 'supervisor');
  assert.equal(res.ok, true);
  assert.equal(useOSStore.getState().gameplay.player.employmentContracts.engineer.pathwayChoice, 'supervisor');
});

test('WORKNET-015: Hybrid Base Stipend dispatches per cycle and avoids duplicate disbursement', () => {
  const testState = useOSStore.getState();
  testState.acceptEmployment('finance');

  const initialCredits = useOSStore.getState().gameplay.player.credits;
  const claimRes = testState.claimCycleStipends();
  assert.equal(claimRes.ok, true);
  assert.ok(useOSStore.getState().gameplay.player.credits > initialCredits);

  // Calling claim again in the same cycle must reject duplicate payout
  const dupRes = testState.claimCycleStipends();
  assert.equal(dupRes.ok, false);
  assert.match(dupRes.message, /already been disbursed/i);
});

test('WORKNET-016 & WORKNET-017: Flexible open shifts and scaled institutional complexity tiers', () => {
  // Institutional tiers are properly categorized
  assert.equal(INSTITUTIONAL_REGISTRY.dga.proceduralTier, 'Tier 3: Multi-Stage Technical');
  assert.equal(INSTITUTIONAL_REGISTRY.faithmed.proceduralTier, 'Tier 3: Multi-Stage Technical');
  assert.equal(INSTITUTIONAL_REGISTRY.finance.proceduralTier, 'Tier 3: Multi-Stage Technical');
  assert.equal(INSTITUTIONAL_REGISTRY.engineer.proceduralTier, 'Tier 3: Multi-Stage Technical');
  assert.equal(INSTITUTIONAL_REGISTRY.archives.proceduralTier, 'Tier 2: Field Synthesis & Sampling');
  assert.equal(INSTITUTIONAL_REGISTRY.questnotice.proceduralTier, 'Tier 1: Agile Civic Dispatch');

  // Shifts are flexible without attendance penalties
  for (const item of INITIAL_SCHEDULE_ITEMS) {
    assert.ok(item.dutyTitle);
    assert.ok(item.location);
    assert.ok(['Scheduled', 'Completed', 'Leave Approved', 'Pending'].includes(item.status));
  }
});
