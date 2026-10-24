import { INSTITUTIONAL_REGISTRY as REGISTRY, INITIAL_DELEGATION_TASKS as TASKS, INITIAL_SUBORDINATE_LEAVES as LEAVES, INITIAL_SCHEDULE_ITEMS as SHIFTS, CANONICAL_DYNAMIC_EVENTS as EVENTS } from './worknetData';

export const stationTrack = (station: string) => station === 'faithmed' ? 'medical' : station === 'archives' ? 'archivist' : station;
export const workTick = (game: any) => Math.max(0, Math.floor((game.timeCycleCount ?? 0) * 4 + (game.timeSegmentIndex ?? 0)));
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const finite = (v: any, fallback = 0) => Number.isFinite(v) ? v : fallback;
export function employed(player: any, station: string) {
  const org = REGISTRY[station], track = stationTrack(station), c = player.employmentContracts?.[track];
  return !!org && !!c && c.track === track && c.id === `EMP:${track}` && (player.clearanceLevel ?? 2) >= org.clearanceRequired;
}
export const canSupervise = (player: any, station: string) => employed(player, station) && player.employmentContracts[stationTrack(station)].pathwayChoice === 'supervisor';
export function restoreWorkplace(raw: any = {}, tick = 0): any {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};
  const coworkers = Object.fromEntries(Object.values(REGISTRY).flatMap(org => org.coworkers.map(c => [c.id, { trust: c.trust, competence: c.competence, familiarity: c.familiarity, cooperation: c.cooperation, conflictHistory: c.conflictHistory, ...raw.coworkerStats?.[c.id], status: c.status }])));
  const budgets = Object.fromEntries(Object.values(REGISTRY).map(org => {
    const b = raw.divisionBudgets?.[org.id];
    // Legacy unrestricted allocations cannot manufacture a larger department pool.
    const total = raw.version === 1 ? Math.max(5000, finite(b?.total, 5000)) : 5000;
    const amounts = [b?.equipment, b?.training, b?.surge];
    const valid = amounts.every(v => Number.isSafeInteger(v) && v >= 0) && amounts.reduce((n,v) => n + v, 0) <= total;
    return [org.id, { total, equipment: valid ? b.equipment : 2000, training: valid ? b.training : 1500, surge: valid ? b.surge : 1500, merit: Math.max(0, finite(b?.merit)) }];
  }));
  const delegated = (Array.isArray(raw.delegatedTasks) ? raw.delegatedTasks : []).filter(d => d && TASKS.some(t => t.id === d.taskId && t.stationId === d.stationId) && REGISTRY[d.stationId]?.coworkers.some(c => c.id === d.assigneeId)).map(d => {
    const task = TASKS.find(t => t.id === d.taskId)!;
    return { ...d, id: String(d.id), status: ['In Progress', 'Review Ready', 'Approved'].includes(d.status) ? d.status : 'In Progress', cycle: Number.isSafeInteger(d.cycle) ? d.cycle : Math.floor(tick / 4), dueTick: Number.isSafeInteger(d.dueTick) ? d.dueTick : tick + task.estUnits, revisions: Math.max(0, finite(d.revisions)), opened: d.opened === true, issues: Array.isArray(d.issues) ? d.issues.filter(i => typeof i === 'string') : [], output: typeof d.output === 'string' ? d.output : '', paid: d.paid === true || d.status === 'Approved' };
  });
  const s = { version: 1, originTick: finite(raw.originTick, tick), coworkerStats: coworkers, divisionBudgets: budgets, delegatedTasks: delegated,
    subordinateLeaves: LEAVES.map(l => { const saved = Array.isArray(raw.subordinateLeaves) ? raw.subordinateLeaves.find(x => x?.id === l.id && ['Pending','Approved','Denied'].includes(x.status)) : undefined; return { ...l, status: saved?.status || l.status, untilTick: finite(saved?.untilTick), coverage: saved?.coverage === 'Reserve roster' ? saved.coverage : '' }; }),
    scheduleItems: SHIFTS.map(l => { const saved = Array.isArray(raw.scheduleItems) ? raw.scheduleItems.find(x => x?.id === l.id) : undefined; return { ...l, isMandatory: false, status: ['Scheduled','Completed','Leave Approved','Pending'].includes(saved?.status) ? saved.status : l.status }; }),
    leaveRequests: Array.isArray(raw.leaveRequests) ? raw.leaveRequests.filter(r => r && SHIFTS.some(s => s.id === r.shiftId)) : [],
    resolvedEventIds: Array.isArray(raw.resolvedEventIds) ? raw.resolvedEventIds.filter(id => EVENTS.some(e => e.id === id)) : [],
    interactions: raw.interactions && typeof raw.interactions === 'object' ? raw.interactions : {}, breakRoomVisitCount: Math.max(0, finite(raw.breakRoomVisitCount)) };
  const statuses = ['Desk', 'In Meeting', 'In Field', 'On Break'];
  for (const org of Object.values(REGISTRY)) for (const cw of org.coworkers) {
    for (const key of ['trust', 'competence', 'familiarity', 'cooperation', 'conflictHistory']) s.coworkerStats[cw.id][key] = Math.max(0, Math.min(100, finite(s.coworkerStats[cw.id][key], cw[key])));
    const offset = Math.max(0, tick - s.originTick);
    s.coworkerStats[cw.id].status = statuses[(Math.max(0, statuses.indexOf(cw.status)) + offset) % 4];
    if (s.subordinateLeaves.some(l => l.subordinateId === cw.id && l.status === 'Approved' && tick < (l.untilTick ?? 0))) s.coworkerStats[cw.id].status = 'On Break';
  }
  for (const d of s.delegatedTasks) if ((d.status === 'In Progress' && tick >= d.dueTick) || (d.status === 'Review Ready' && !d.output)) {
    const task = TASKS.find(t => t.id === d.taskId)!, b = s.divisionBudgets[d.stationId];
    d.status = 'Review Ready'; d.opened = false;
    d.issues = b.equipment < 500 ? ['Equipment verification is unfunded. Allocate at least 500 credits to maintenance and request a revised docket.'] : [];
    d.output = `NPC completion report — ${task.title}: ${task.description} Assigned reviewer: ${d.assigneeName}. Competence at assignment: ${d.competence ?? s.coworkerStats[d.assigneeId].competence}%. Completion recorded at work segment ${d.dueTick}. ${d.issues.length ? 'Verification exception remains unresolved.' : 'Required departmental checks completed; no verification exception reported.'}`;
  }
  return s;
}
export function changeWorkplace(raw: any, action: any, player: any, tick: number) {
  const s = restoreWorkplace(raw, tick), cycle = Math.floor(tick / 4);
  const fail = (message: string) => ({ ok: false, message, state: s, credits: 0, xp: 0, stamina: 0, track: '' });
  let credits = 0, xp = 0, stamina = 0, track = '', message = 'Workplace record saved.';
  if (action.type === 'tick' || action.type === 'initialize') return { ok: true, message: '', state: s, credits, xp, stamina, track };
  const task = TASKS.find(t => t.id === action.taskId), docket = s.delegatedTasks.find(d => d.id === action.id);
  const leave = s.subordinateLeaves.find(l => l.id === action.id);
  const station = task?.stationId || docket?.stationId || leave?.stationId || action.station;
  if (['delegate','open-docket','review-docket','review-leave','budget'].includes(action.type) && !canSupervise(player, station)) return fail('An active contract, current clearance, and the Department Supervisor pathway are required for this division.');
  switch (action.type) {
    case 'delegate': {
      if (!task) return fail('Unknown departmental task.');
      const cw = REGISTRY[station].coworkers.find(c => c.id === action.person), stats = s.coworkerStats[action.person], b = s.divisionBudgets[station];
      if (!cw || !stats) return fail('Choose a colleague in this division.');
      if (stats.status !== 'Desk') return fail('Choose a colleague at their desk; workplace availability changes when game time advances.');
      if (s.delegatedTasks.some(d => (d.taskId === task.id && d.cycle === cycle) || (d.assigneeId === cw.id && d.status !== 'Approved'))) return fail('That duty is already assigned this cycle, or this colleague has an open docket.');
      const competence = finite(stats.competence) + Math.floor(b.training / 1000);
      if (competence < task.minCompetence) return fail(`This duty requires ${task.minCompetence}% competence. Training allocations can add one point per 1,000 credits.`);
      s.delegatedTasks.unshift({ id: `delegation:${task.id}:${cycle}`, taskId: task.id, stationId: station, title: task.title, assigneeId: cw.id, assigneeName: cw.name, status: 'In Progress', cycle, assignedAt: `Cycle ${cycle}, segment ${tick % 4 + 1}`, dueTick: tick + task.estUnits, competence, revisions: 0, opened: false, paid: false, issues: [], output: '' });
      message = `Delegated ${task.title} to ${cw.name}. Return after ${task.estUnits} game-time segment(s).`; break;
    }
    case 'open-docket': if (!docket || docket.status !== 'Review Ready') return fail('This docket is not ready for review.'); docket.opened = true; message = docket.output; break;
    case 'review-docket': {
      if (!docket || docket.status !== 'Review Ready' || !docket.opened || docket.paid) return fail('Open a review-ready docket before deciding. Archived dockets cannot be paid again.');
      if (!action.approved) { docket.status = 'In Progress'; docket.revisions++; docket.opened = false; docket.dueTick = tick + 1; message = 'Revision requested. The revised docket returns after one game-time segment.'; break; }
      if (s.delegatedTasks.some(d => d.id !== docket.id && d.taskId === docket.taskId && d.cycle === docket.cycle && (d.paid || d.status === 'Approved'))) return fail('This duty already has a compensation receipt for this cycle.');
      if (docket.issues.length) return fail('Resolve the recorded exception and request a revised docket before signing off.');
      const task = TASKS.find(t => t.id === docket.taskId)!, funds = Number(task.rewardDesc.match(/\+(\d+) ₢/)?.[1] || 0), merit = Number(task.rewardDesc.match(/\+(\d+) Department Merit/)?.[1] || 0);
      docket.status = 'Approved'; docket.paid = true;
      s.divisionBudgets[station].total += funds; s.divisionBudgets[station].merit += merit;
      message = `Docket archived: +${merit} department merit and +${funds} department funds. Personal pay is unchanged.`; break;
    }
    case 'review-leave': {
      if (!leave || leave.status !== 'Pending') return fail('This leave request has already been decided.');
      if (action.approved && (s.divisionBudgets[station].surge < 500 || s.delegatedTasks.some(d => d.assigneeId === leave.subordinateId && d.status !== 'Approved'))) return fail('Reserve coverage of at least 500 credits and no open assigned docket are required before approving leave.');
      leave.status = action.approved ? 'Approved' : 'Denied'; leave.untilTick = action.approved ? tick + 1 : tick; leave.coverage = action.approved ? 'Reserve roster' : '';
      message = action.approved ? 'Leave approved with reserve coverage for this work segment.' : 'Leave denied; the existing duty roster remains in place.'; break;
    }
    case 'budget': {
      const values = [action.equipment, action.training, action.surge], b = s.divisionBudgets[station];
      if (!values.every(v => Number.isSafeInteger(v) && v >= 0) || values.reduce((a,b) => a+b,0) > b.total) return fail('Allocations must be nonnegative whole credits within the existing division pool.');
      Object.assign(b, { equipment: action.equipment, training: action.training, surge: action.surge }); message = 'Division allocations saved. Maintenance supports verification, training supports competence, and surge reserves cover leave.'; break;
    }
    case 'interact': {
      const org = Object.values(REGISTRY).find(org => org.coworkers.some(c => c.id === action.person));
      if (!org || !employed(player, org.id) || !['consult','assist','collaborate','break'].includes(action.kind)) return fail('A current employment contract and a known colleague are required.');
      const key = `${action.person}:${action.kind}:${cycle}`;
      if (s.interactions[key]) return fail('You have already shared this interaction this cycle.');
      s.interactions[key] = true; const cw = s.coworkerStats[action.person];
      cw.trust = Math.min(100, finite(cw.trust) + 2); cw.familiarity = Math.min(100, finite(cw.familiarity) + 3); cw.cooperation = Math.min(100, finite(cw.cooperation) + 2); cw.lastInteraction = `Cycle ${cycle}`;
      message = 'Conversation recorded in your coworker relationship.'; break;
    }
    case 'event': {
      const ev = EVENTS.find(e => e.id === action.id);
      if (!ev || !employed(player, ev.stationId)) return fail('A current division contract and clearance are required.');
      if (s.resolvedEventIds.includes(ev.id)) return fail('This authored workplace event is already resolved.');
      if (player.stamina < ev.staminaCost) return fail('Rest before responding to this workplace event.');
      s.resolvedEventIds.push(ev.id); credits = ev.rewardCredits; xp = ev.rewardXP; stamina = ev.staminaCost; track = stationTrack(ev.stationId); message = `${ev.title}: ${ev.impactSummary}`; break;
    }
    case 'request-leave': {
      const shift = s.scheduleItems.find(x => x.id === action.id);
      if (!shift || !employed(player, shift.institutionId)) return fail('This shift requires an active employment contract.');
      if (s.leaveRequests.some(r => r.shiftId === shift.id)) return fail('This shift already has a leave record.');
      const reason = typeof action.reason === 'string' ? action.reason.slice(0, 1000) : '';
      s.leaveRequests.unshift({ id: `leave:${shift.id}`, shiftId: shift.id, stationId: shift.institutionId, reason, status: 'Approved', requestedAt: `Cycle ${cycle}`, responseNote: 'Flexible shift released without an absence penalty.' }); shift.status = 'Leave Approved'; message = 'Leave recorded. Flexible shifts carry no absence penalty.'; break;
    }
    case 'break': s.breakRoomVisitCount++; message = 'Took a quiet break in the workplace lounge.'; break;
    default: return fail('Unknown workplace action.');
  }
  return { ok: true, message, state: s, credits, xp, stamina, track };
}
