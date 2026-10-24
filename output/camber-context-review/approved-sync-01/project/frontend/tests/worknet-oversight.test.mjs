import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,next) { try { return next(s,c); } catch(e) { if(e.code !== 'ERR_MODULE_NOT_FOUND' || !s.startsWith('.')) throw e; return next(`${s}.ts`,c); } } });
const { restoreWorkplace, changeWorkplace, canSupervise } = await import('../src/apps/worknet/workplaceModel.ts');
const { readWorldEntries } = await import('../src/backend/worldSync.ts');
const player = () => ({ clearanceLevel: 5, credits: 1000, stamina: 100, employmentContracts: { dga: { id:'EMP:dga',track:'dga',pathwayChoice:'supervisor' } } });
const run = (s,a,p=player(),tick=112) => changeWorkplace(s,a,p,tick);
const seed = () => restoreWorkplace({},112);
const assign = s => run(s,{type:'delegate',taskId:'dt-dga-01',person:'cw-dga-1'}).state;
const roundtrip = s => JSON.parse(JSON.stringify(s));

test('delegation checks current pathway, contract, clearance, division, availability and competence', () => {
  const a = {type:'delegate',taskId:'dt-dga-01',person:'cw-dga-1'};
  assert.equal(run(seed(),a,{...player(),employmentContracts:{}}).ok,false);
  const specialist = player(); specialist.employmentContracts.dga.pathwayChoice='specialist';
  assert.equal(run(seed(),a,specialist).ok,false);
  assert.equal(run(seed(),a,{...player(),clearanceLevel:0}).ok,false);
  assert.equal(run(seed(),{...a,person:'cw-fin-1'}).ok,false);
  assert.equal(run(seed(),{...a,person:'cw-dga-2'}).ok,false);
  const s=seed(); s.coworkerStats['cw-dga-1'].competence=60;
  assert.equal(run(s,a).ok,false);
  assert.equal(run(seed(),a).ok,true);
});

test('work advances across closing and hydration, not wall-clock waits or repeated clicks', () => {
  const s=assign(seed()), id=s.delegatedTasks[0].id;
  assert.equal(restoreWorkplace(roundtrip(s),112).delegatedTasks[0].status,'In Progress');
  assert.equal(run(s,{type:'delegate',taskId:'dt-dga-01',person:'cw-dga-1'}).ok,false);
  const ready=restoreWorkplace(roundtrip(s),114);
  assert.equal(ready.delegatedTasks[0].status,'Review Ready');
  assert.match(ready.delegatedTasks[0].output,/Carrier Packet/);
  assert.equal(run(ready,{type:'review-docket',id,approved:true},player(),114).ok,false);
  const opened=run(ready,{type:'open-docket',id},player(),114).state;
  const accepted=run(opened,{type:'review-docket',id,approved:true},player(),114);
  assert.equal(accepted.ok,true); assert.equal(accepted.credits,0);
  assert.equal(accepted.state.divisionBudgets.dga.total,5020);
  assert.equal(accepted.state.divisionBudgets.dga.merit,35);
  const saved=restoreWorkplace(roundtrip(accepted.state),119);
  assert.equal(run(saved,{type:'review-docket',id,approved:true},player(),119).ok,false);
  assert.equal(saved.divisionBudgets.dga.total,5020);
});

test('returned dockets resume after another game segment and require reading the revision', () => {
  let s=assign(seed()), id=s.delegatedTasks[0].id;
  s=run(s,{type:'open-docket',id},player(),114).state;
  const revised=run(s,{type:'review-docket',id,approved:false},player(),114);
  assert.equal(revised.ok,true); assert.equal(revised.state.delegatedTasks[0].revisions,1);
  s=restoreWorkplace(roundtrip(revised.state),115);
  assert.equal(s.delegatedTasks[0].status,'Review Ready'); assert.equal(s.delegatedTasks[0].opened,false);
  assert.equal(run(s,{type:'review-docket',id,approved:true},player(),115).ok,false);
  const revoked=player(); revoked.employmentContracts.dga.pathwayChoice='specialist';
  assert.equal(run(s,{type:'open-docket',id},revoked,115).ok,false);
});

test('budget allocations affect verification, training eligibility and leave coverage without minting money', () => {
  let s=seed();
  for(const values of [[5000,5000,5000],[-1,0,0],[NaN,0,0],[1.5,0,0]]) assert.equal(run(s,{type:'budget',station:'dga',equipment:values[0],training:values[1],surge:values[2]}).ok,false);
  s=run(s,{type:'budget',station:'dga',equipment:0,training:5000,surge:0}).state;
  assert.equal(s.divisionBudgets.dga.total,5000);
  s.coworkerStats['cw-dga-1'].competence=70;
  s=assign(s); assert.equal(s.delegatedTasks.length,1);
  const id=s.delegatedTasks[0].id;
  s=run(s,{type:'open-docket',id},player(),114).state;
  assert.ok(s.delegatedTasks[0].issues.length);
  assert.equal(run(s,{type:'review-docket',id,approved:true},player(),114).ok,false);
  s=run(s,{type:'budget',station:'dga',equipment:2000,training:1500,surge:1500},player(),114).state;
  s=run(s,{type:'review-docket',id,approved:false},player(),114).state;
  s=run(s,{type:'open-docket',id},player(),115).state;
  assert.equal(s.delegatedTasks[0].issues.length,0);
  assert.equal(run(s,{type:'review-docket',id,approved:true},player(),115).ok,true);
});

test('subordinate leave is decided once, requires coverage, and changes availability for the approved segment', () => {
  let s=seed(); s.divisionBudgets.dga.surge=0;
  assert.equal(run(s,{type:'review-leave',id:'sub-lv-01',approved:true}).ok,false);
  s=seed(); s=run(s,{type:'review-leave',id:'sub-lv-01',approved:true}).state;
  assert.equal(run(s,{type:'delegate',taskId:'dt-dga-01',person:'cw-dga-1'}).ok,false);
  assert.equal(run(s,{type:'review-leave',id:'sub-lv-01',approved:false}).ok,false);
  assert.equal(s.subordinateLeaves[0].coverage,'Reserve roster');
  assert.equal(run(seed(),{type:'review-leave',id:'sub-lv-02',approved:true}).ok,false);
  assert.equal(run(assign(seed()),{type:'review-leave',id:'sub-lv-01',approved:true}).ok,false);
  assert.equal(restoreWorkplace(roundtrip(s),116).coworkerStats['cw-dga-1'].status,'Desk');
});

test('legacy completed dockets remain archived, old unrestricted budgets are bounded, schedules remain flexible', () => {
  const old=assign(seed()); delete old.version;
  old.delegatedTasks[0].status='Approved'; old.divisionBudgets.dga.total=99999;
  old.divisionBudgets.dga.equipment=90000;
  const s=restoreWorkplace(roundtrip(old),112);
  assert.equal(s.divisionBudgets.dga.total,5000);
  assert.equal(s.delegatedTasks[0].paid,true);
  assert.ok(s.scheduleItems.every(x=>!x.isMandatory));
  const ready = roundtrip(old); ready.delegatedTasks[0].status='Review Ready'; ready.delegatedTasks[0].output='';
  assert.match(restoreWorkplace(ready,112).delegatedTasks[0].output,/NPC completion report/);
  assert.equal(run(s,{type:'review-docket',id:s.delegatedTasks[0].id,approved:true}).ok,false);
});

test('coworker routine follows world time; ordinary social clicks cannot repeatedly raise stats', () => {
  const s=seed(); assert.equal(s.coworkerStats['cw-dga-1'].status,'Desk');
  assert.equal(restoreWorkplace(s,113).coworkerStats['cw-dga-1'].status,'In Meeting');
  const interacted=run(s,{type:'interact',person:'cw-dga-1',kind:'consult'});
  assert.equal(interacted.ok,true);
  assert.equal(run(interacted.state,{type:'interact',person:'cw-dga-1',kind:'consult'}).ok,false);
});

const memory = new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.window={localStorage:globalThis.localStorage};
const {useOSStore:store}=await import('../src/store/useOSStore.ts?oversight=initial');
function setup() { store.setState(s=>({gameplay:{...s.gameplay,timeCycleCount:28,timeSegmentIndex:0,player:{...s.gameplay.player,clearanceLevel:5,credits:1000,stamina:100,employmentContracts:{},worknetWorkplace:undefined}}})); }

test('store salary is 150 per current cycle, honors clearance, rejects unknown contracts, and does not backpay skipped cycles',()=>{
  setup(); assert.equal(store.getState().acceptEmployment('dga').ok,true);
  assert.equal(store.getState().gameplay.player.employmentContracts.dga.baseSalaryCredits,150);
  assert.equal(store.getState().claimCycleStipends().creditsClaimed,150);
  assert.equal(store.getState().claimCycleStipends().ok,false);
  store.setState(s=>({gameplay:{...s.gameplay,timeCycleCount:33,player:{...s.gameplay.player,employmentContracts:{...s.gameplay.player.employmentContracts,forged:{id:'EMP:forged',track:'forged',baseSalaryCredits:999999}}}}}));
  assert.equal(store.getState().claimCycleStipends().creditsClaimed,150);
  store.setState(s=>({gameplay:{...s.gameplay,timeCycleCount:34,player:{...s.gameplay.player,clearanceLevel:0}}}));
  assert.equal(store.getState().claimCycleStipends().ok,false);
});

test('runtime pathway validation and shared world-save hydration retain oversight and prevent repeat department payout',async()=>{
  setup(); store.getState().acceptEmployment('dga');
  assert.equal(store.getState().setCareerPathwayChoice('dga','invalid').ok,false);
  assert.equal(store.getState().setCareerPathwayChoice('dga','supervisor').ok,true);
  store.getState().worknetWorkplaceAction({type:'initialize'});
  assert.equal(store.getState().worknetWorkplaceAction({type:'delegate',taskId:'dt-dga-01',person:'cw-dga-1'}).ok,true);
  const id=store.getState().gameplay.player.worknetWorkplace.delegatedTasks[0].id;
  store.setState(s=>({gameplay:{...s.gameplay,timeSegmentIndex:2}}));
  store.getState().worknetWorkplaceAction({type:'open-docket',id});
  assert.equal(store.getState().worknetWorkplaceAction({type:'review-docket',id,approved:true}).ok,true);
  assert.equal(store.getState().gameplay.player.credits,1000);
  const entries=readWorldEntries(globalThis.localStorage);
  assert.match(entries['miraverse-os-progress'],/delegation:dt-dga-01:28/);
  const {useOSStore:restored}=await import('../src/store/useOSStore.ts?oversight=reload');
  assert.equal(restored.getState().gameplay.player.worknetWorkplace.divisionBudgets.dga.total,5020);
  assert.equal(restored.getState().worknetWorkplaceAction({type:'review-docket',id,approved:true}).ok,false);
  assert.equal(restored.getState().gameplay.player.worknetWorkplace.divisionBudgets.dga.total,5020);
});


test('malformed optional saves recover and duplicate legacy duties share one department receipt', () => {
  assert.equal(restoreWorkplace(null,112).version,1);
  let s=assign(seed());
  const duplicate={...s.delegatedTasks[0],id:'legacy-duplicate'};
  s.delegatedTasks.push(duplicate);
  const id=s.delegatedTasks[0].id;
  s=run(s,{type:'open-docket',id},player(),114).state;
  s=run(s,{type:'review-docket',id,approved:true},player(),114).state;
  s=run(s,{type:'open-docket',id:'legacy-duplicate'},player(),114).state;
  assert.equal(run(s,{type:'review-docket',id:'legacy-duplicate',approved:true},player(),114).ok,false);
  assert.equal(s.divisionBudgets.dga.total,5020);
});


test('assignment links issue an explicit runtime entry request while saved journal history does not', async () => {
  setup(); store.getState().openAssignment('ms-spec-01');
  assert.equal(store.getState().gameplay.player.assignmentJournal.selectedId, 'ms-spec-01');
  const entry=store.getState().workspaceRequests.jobs;
  assert.equal(entry.section,'assignment');
  store.getState().consumeWorkspaceRequest('jobs',entry.revision);
  assert.equal(store.getState().workspaceRequests.jobs,undefined);
  const {useOSStore:reopened}=await import('../src/store/useOSStore.ts?oversight=entry');
  assert.equal(reopened.getState().gameplay.player.assignmentJournal.selectedId,'ms-spec-01');
  assert.equal(reopened.getState().workspaceRequests.jobs,undefined);
});
