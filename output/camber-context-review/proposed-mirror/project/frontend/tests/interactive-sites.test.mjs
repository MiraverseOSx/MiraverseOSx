import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { INTERACTIVE_SITES, siteOwner, siteProfileKey, siteDraftKey, restoreVersenetSites } = await import('../src/apps/Browser/interactiveSites.ts');
let sequence = 0;
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; return values; }
async function fresh() { return (await import(`../src/store/useOSStore.ts?sites=${sequence++}`)).useOSStore; }
async function playable() { storage(); const store = await fresh(); store.getState().loginUser({ name: 'Site Tester', credits: 500 }); return store; }
function profile(site) { return { displayName: 'Mira Vale', handle: 'mira_vale', interest: site.interests[0], about: 'A reader in Aureline.' }; }
const answers = {
  companion: { animal:'Dog',topic:'Neighborhood walks',message:'Where can I find the posted public walking routes?' },
  garden: { purpose:'Sketch walk',period:'Morning',party:'2',notes:'We would like to sketch the public garden beds.' },
  reading: { subject:'Public garden history',collection:'Local history',format:'Reading list',question:'Which public sources describe the history of the garden?' },
};
test('all three sites require their own profile and validate registration', async () => {
  const store = await playable();
  for (const site of INTERACTIVE_SITES) {
    assert.equal(store.getState().submitSiteForm(site.id,answers[site.id]).ok,false);
    assert.equal(store.getState().registerSiteProfile(site.id,{...profile(site),handle:'bad handle'}).ok,false);
    assert.equal(store.getState().registerSiteProfile(site.id,profile(site)).ok,true);
    assert.equal(store.getState().registerSiteProfile(site.id,profile(site)).ok,false);
  }
  assert.equal(Object.keys(store.getState().versenetSites.profiles).length,3);
});
test('profiles update through a whitelist and keep their original join date', async () => {
  const store = await playable(); const site=INTERACTIVE_SITES[0]; store.getState().registerSiteProfile(site.id,profile(site));
  const key=siteProfileKey(site.id,siteOwner(store.getState().gameplay)); const created=store.getState().versenetSites.profiles[key].createdAt;
  assert.equal(store.getState().updateSiteProfile(site.id,{...profile(site),displayName:'Mira Rowan',owner:'other',isAdmin:true}).ok,true);
  const saved=store.getState().versenetSites.profiles[key]; assert.equal(saved.displayName,'Mira Rowan'); assert.equal(saved.createdAt,created); assert.equal(saved.isAdmin,undefined);
  assert.equal(store.getState().updateSiteProfile(site.id,{...profile(site),about:'x'.repeat(501)}).ok,false);
});
test('each site accepts its own form, rejects malformed values, and deduplicates repeat submissions', async () => {
  const store=await playable();
  for (const site of INTERACTIVE_SITES) {
    store.getState().registerSiteProfile(site.id,profile(site));
    assert.equal(store.getState().submitSiteForm(site.id,null).ok,false);
    assert.equal(store.getState().submitSiteForm(site.id,[]).ok,false);
    const first=store.getState().submitSiteForm(site.id,answers[site.id]); assert.equal(first.ok,true);
    assert.equal(store.getState().submitSiteForm(site.id,answers[site.id]).id,first.id);
  }
  assert.equal(Object.keys(store.getState().versenetSites.submissions).length,3);
  assert.equal(store.getState().submitSiteForm('garden',{...answers.garden,party:'2.5'}).ok,false);
  assert.equal(store.getState().submitSiteForm('garden',{...answers.garden,party:'9'}).ok,false);
  assert.equal(store.getState().submitSiteForm('companion',{...answers.companion,animal:'Dragon'}).ok,false);
});
test('partial drafts survive reload and are cleared only for the submitted form', async () => {
  const store=await playable(); for (const site of INTERACTIVE_SITES) store.getState().registerSiteProfile(site.id,profile(site));
  assert.equal(store.getState().saveSiteDraft('reading',{subject:'Garden'}).ok,true);
  assert.equal(store.getState().saveSiteDraft('companion',{animal:'Dog'}).ok,true);
  const restored=await fresh(); const owner=siteOwner(restored.getState().gameplay);
  assert.equal(restored.getState().versenetSites.drafts[siteDraftKey('reading',owner)].values.subject,'Garden');
  restored.getState().submitSiteForm('reading',answers.reading);
  assert.equal(restored.getState().versenetSites.drafts[siteDraftKey('reading',owner)],undefined);
  assert.ok(restored.getState().versenetSites.drafts[siteDraftKey('companion',owner)]);
});
test('revisions keep references, original submission dates, and accurate revision counts', async () => {
  const store=await playable(); const site=INTERACTIVE_SITES[2]; store.getState().registerSiteProfile(site.id,profile(site));
  const first=store.getState().submitSiteForm(site.id,answers.reading); const before=store.getState().versenetSites.submissions[first.id];
  const changed={...answers.reading,subject:'Glassline public history'};
  const revised=store.getState().submitSiteForm(site.id,changed,first.id); assert.equal(revised.id,first.id);
  const after=store.getState().versenetSites.submissions[first.id]; assert.equal(after.createdAt,before.createdAt); assert.equal(after.revisions,1); assert.equal(after.values.subject,changed.subject);
  store.getState().submitSiteForm(site.id,changed,first.id); assert.equal(store.getState().versenetSites.submissions[first.id].revisions,1);
  assert.equal(store.getState().submitSiteForm('garden',answers.garden,first.id).ok,false);
});
test('withdrawal preserves records, blocks editing, and can be reversed', async () => {
  const store=await playable(); store.getState().registerSiteProfile('companion',profile(INTERACTIVE_SITES[0]));
  const first=store.getState().submitSiteForm('companion',answers.companion);
  assert.equal(store.getState().setSiteSubmissionStatus(first.id,'Confirmed').ok,false);
  assert.equal(store.getState().setSiteSubmissionStatus(first.id,'Withdrawn').ok,true);
  assert.equal(store.getState().submitSiteForm('companion',answers.companion,first.id).ok,false);
  assert.equal(store.getState().saveSiteDraft('companion',answers.companion,first.id).ok,false);
  assert.equal(store.getState().setSiteSubmissionStatus(first.id,'Received').ok,true);
  assert.equal(Object.keys(store.getState().versenetSites.submissions).length,1);
});
test('another character cannot change site records or reuse a registered site handle', async () => {
  const store=await playable(); store.getState().registerSiteProfile('companion',profile(INTERACTIVE_SITES[0]));
  const first=store.getState().submitSiteForm('companion',answers.companion);
  store.setState(s=>({gameplay:{...s.gameplay,player:{...s.gameplay.player,name:'Another Citizen'}}}));
  assert.equal(store.getState().setSiteSubmissionStatus(first.id,'Withdrawn').ok,false);
  assert.equal(store.getState().registerSiteProfile('companion',profile(INTERACTIVE_SITES[0])).ok,false);
  assert.equal(store.getState().registerSiteProfile('companion',{...profile(INTERACTIVE_SITES[0]),handle:'another_citizen'}).ok,true);
  assert.equal(store.getState().submitSiteForm('companion',answers.companion,first.id).ok,false);
  assert.equal(store.getState().saveSiteDraft('companion',answers.companion,first.id).ok,false);
});
test('site profiles and received records persist without granting rewards or editing world state', async () => {
  const store=await playable(); const before=JSON.stringify(store.getState().gameplay);
  store.getState().registerSiteProfile('garden',profile(INTERACTIVE_SITES[1])); const first=store.getState().submitSiteForm('garden',answers.garden);
  assert.equal(JSON.stringify(store.getState().gameplay),before);
  const restored=await fresh(); assert.equal(restored.getState().versenetSites.submissions[first.id].status,'Received');
  assert.equal(JSON.stringify(restored.getState().gameplay),before);
  assert.equal(restored.getState().versenetSites.nextId,2);
});
test('civic verification does not detach the same character from local site profiles', () => {
  assert.equal(siteOwner({player:{name:'Site Tester'},identity:{citizenId:null}}),siteOwner({player:{name:'Site Tester'},identity:{citizenId:'CY-999'}}));
});
test('unknown IDs and malformed saves stay playable with old-save defaults', async () => {
  const store=await playable();
  assert.equal(store.getState().registerSiteProfile('__proto__',{}).ok,false);
  assert.equal(store.getState().submitSiteForm('constructor',{}).ok,false);
  assert.equal(store.getState().setSiteSubmissionStatus('__proto__','Received').ok,false);
  assert.deepEqual(restoreVersenetSites(undefined),{profiles:{},submissions:{},drafts:{},nextId:1});
  assert.deepEqual(restoreVersenetSites({profiles:{bad:{}},submissions:{'SR-1':{owner:'fake'}},drafts:{bad:[]},nextId:0}),{profiles:{},submissions:{},drafts:{},nextId:1});
  store.setState({isLoggedIn:false}); assert.equal(store.getState().registerSiteProfile('companion',profile(INTERACTIVE_SITES[0])).ok,false);
});
