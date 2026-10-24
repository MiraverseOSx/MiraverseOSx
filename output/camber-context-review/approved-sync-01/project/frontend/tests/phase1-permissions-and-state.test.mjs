import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return next(`${specifier}.ts`, context);
    }
  },
});

const {
  ORGANIZATIONS,
  channelAccess,
  channelsForOrganization,
  canAcceptInvitation,
  invitationForOrganization,
  membershipSource,
  restoreMailAccounts,
} = await import('../src/integration/communicationsAccess.ts');
const {
  resolveAuraActor,
  evaluateAuraRecordPermissions,
  authorizeAuraAction,
} = await import('../src/integration/auraPermissions.ts');
const {
  resolveDGAAuthority,
  canAccessDgaWorkspace,
  canAccessTraceLab,
  authorizeTraceView,
  filterAuthorizedDgaCases,
} = await import('../src/dgaos/lib/dga-permissions.ts');
const {
  pauseWorld,
  resumeWorld,
  isWorldPaused,
  captureWorldCheckpoint,
  restoreWorldCheckpoint,
  saveCreatorDraft,
  validateCreatorDraft,
  publishCreatorDraft,
  discardCreatorDraft,
  listCreatorDrafts,
  getPublishedHistory,
} = await import('../src/integration/worldStateManager.ts');
const { MaidIdentityService } = await import('../src/services/maidIdentityService.ts');
const { DEFAULT_PLAYER_EMAIL_ACCOUNTS } = await import('../src/data/commsData.ts');

let seq = 0;
function setupStorage() {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    },
  });
  globalThis.window = {
    localStorage: globalThis.localStorage,
    location: { origin: 'http://localhost' },
    postMessage: () => {},
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  return values;
}

async function freshOS() {
  return (await import(`../src/store/useOSStore.ts?phase1=${seq++}`)).useOSStore;
}

async function freshComms() {
  return (await import(`../src/store/useCommsStore.ts?phase1=${seq++}`)).useCommsStore;
}

test('AureMail enforces one active starter personal account and supports revoking institutional accounts without losing history', async () => {
  setupStorage();
  const os = await freshOS();
  const comms = await freshComms();

  // Duplicate personal accounts in malformed saves are collapsed to one active starter personal account
  const restoredAccounts = restoreMailAccounts(
    [
      { id: 'p1', address: 'citizen@auremail.aure', accountType: 'personal', status: 'suspended' },
      { id: 'p2', address: 'second.personal@auremail.aure', accountType: 'personal', status: 'active' },
    ],
    DEFAULT_PLAYER_EMAIL_ACCOUNTS
  );
  assert.equal(restoredAccounts.filter((a) => a.accountType === 'personal').length, 1);
  assert.equal(restoredAccounts[0].status, 'active');

  os.getState().loginUser({ name: 'World Admin', isAdmin: true });
  os.getState().setOrganizationMembership('cyacademy', 'active');
  assert.equal(
    comms.getState().issueInstitutionalAccount({
      organizationId: 'cyacademy',
      address: 'scholar@cyacademy.edu',
    }).ok,
    true
  );

  // Starter personal account cannot be suspended or revoked
  comms.getState().updateAccountStatus('citizen@auremail.aure', 'suspended');
  assert.equal(comms.getState().playerAccounts[0].status, 'active');
  assert.equal(comms.getState().revokeInstitutionalAccount('citizen@auremail.aure').ok, false);

  // Select institutional account, save draft, send email, then revoke institutional account
  comms.getState().setSelectedSenderAddress('scholar@cyacademy.edu');
  assert.equal(comms.getState().selectedSenderAddress, 'scholar@cyacademy.edu');
  const draft = comms.getState().saveDraft({
    fromAddress: 'scholar@cyacademy.edu',
    toAddress: 'registrar@cyacademy.edu',
    subject: 'Thesis Draft',
    body: 'Retain this draft after revocation.',
  });

  const revokeRes = comms.getState().revokeInstitutionalAccount('scholar@cyacademy.edu');
  assert.equal(revokeRes.ok, true);
  assert.equal(comms.getState().selectedSenderAddress, 'citizen@auremail.aure');
  assert.equal(
    comms.getState().sendEmail({
      fromAddress: 'scholar@cyacademy.edu',
      toAddress: 'registrar@cyacademy.edu',
      subject: 'Blocked after revoke',
      body: 'Should not send',
    }).ok,
    false
  );
  assert.ok(comms.getState().drafts.some((d) => d.id === draft.id));
});

test('Comms supports organization invitations, acceptance, declining, leaving, and removal across all 9 organizations without auto-issuing email or rewards', async () => {
  setupStorage();
  const os = await freshOS();
  const comms = await freshComms();

  // Every organization has at least one mapped Comms channel
  for (const org of ORGANIZATIONS) {
    const channels = channelsForOrganization(org.id);
    assert.ok(channels.length >= 1, `Expected channel mapping for ${org.id}`);
  }

  // Admin issues invitations for archivist and finance
  os.getState().loginUser({ name: 'Admin Issuer', isAdmin: true });
  assert.equal(os.getState().inviteToOrganization('archivist', 'Welcome to Royal Archives').ok, true);
  assert.equal(os.getState().inviteToOrganization('finance', 'Treasury audit team').ok, true);

  // Switch to ordinary citizen mode on same profile to test accepting/declining invitations
  os.setState((s) => ({
    gameplay: {
      ...s.gameplay,
      player: { ...s.gameplay.player, isAdmin: false, clearanceLevel: 2, credits: 500, xp: 100 },
    },
  }));

  assert.equal(canAcceptInvitation(os.getState().gameplay.player, 'archivist'), true);
  assert.equal(channelAccess(os.getState().gameplay.player, 'royal-archives-desk'), false);

  // Accept archivist invitation -> opens channel, does not issue email or grant credits/XP
  const acceptRes = os.getState().acceptOrganizationInvitation('archivist');
  assert.equal(acceptRes.ok, true);
  assert.equal(membershipSource(os.getState().gameplay.player, 'archivist'), 'issued');
  assert.equal(channelAccess(os.getState().gameplay.player, 'royal-archives-desk'), true);
  assert.equal(comms.getState().playerAccounts.length, 1);
  assert.equal(os.getState().gameplay.player.credits, 500);
  assert.equal(os.getState().gameplay.player.xp, 100);

  // Can post in royal-archives-desk while member
  assert.equal(
    comms.getState().addChatMessage('royal-archives-desk', {
      id: 'msg-arch-1',
      user: 'Archivist Member',
      team: 'Archives',
      text: 'Cataloging Folio 9.',
      time: '10:00 AM',
    }),
    true
  );

  // Decline finance invitation
  assert.equal(os.getState().declineOrganizationInvitation('finance').ok, true);
  assert.equal(invitationForOrganization(os.getState().gameplay.player, 'finance')?.status, 'declined');
  assert.equal(channelAccess(os.getState().gameplay.player, 'oryn-treasury-ledger'), false);

  // Leave archivist organization -> immediately locks channel while keeping message history
  assert.equal(os.getState().leaveOrganizationMembership('archivist').ok, true);
  assert.equal(channelAccess(os.getState().gameplay.player, 'royal-archives-desk'), false);
  assert.equal(
    comms.getState().addChatMessage('royal-archives-desk', {
      id: 'msg-arch-2',
      user: 'Former Member',
      team: 'Archives',
      text: 'Should be blocked',
      time: '10:05 AM',
    }),
    false
  );
  assert.ok(
    comms.getState().messages['royal-archives-desk'].some((m) => m.id === 'msg-arch-1')
  );

  // Admin can remove an active employment-based membership
  os.getState().acceptEmployment('medical');
  assert.equal(channelAccess(os.getState().gameplay.player, 'faith-medical-hub'), true);
  os.setState((s) => ({
    gameplay: { ...s.gameplay, player: { ...s.gameplay.player, isAdmin: true } },
  }));
  assert.equal(os.getState().removeOrganizationMembership('medical', 'Contract concluded').ok, true);
  assert.equal(channelAccess(os.getState().gameplay.player, 'faith-medical-hub'), false);
});

test('AURA Registry enforces role-based access, record permissions, and document issuance authorization', async () => {
  setupStorage();
  const os = await freshOS();
  await MaidIdentityService.ensureDefaultPopulationSeeded();
  const allPersons = await MaidIdentityService.getAllPersons();
  const targetCitizen = allPersons[0];

  // Create a restricted record while in admin mode
  os.getState().loginUser({ name: 'Registry Root', isAdmin: true });
  await MaidIdentityService.updatePerson(targetCitizen.id, { isRestricted: true });

  // Switch to ordinary signed-in citizen
  os.setState((s) => ({
    isLoggedIn: true,
    gameplay: {
      ...s.gameplay,
      identity: { ...s.gameplay.identity, canonicalPersonId: allPersons[1].id, citizenId: allPersons[1].maid },
      player: {
        ...s.gameplay.player,
        isAdmin: false,
        clearanceLevel: 1,
        dgaVerified: false,
        organizationMemberships: {},
        employmentContracts: {},
        careers: {},
      },
    },
  }));

  // 1. Ordinary citizen cannot bypass restricted lookup even if { allowRestricted: true } is passed
  const restrictedLookup = await MaidIdentityService.lookupPerson(targetCitizen.maid, { allowRestricted: true });
  assert.equal(restrictedLookup.status, 'restricted');
  assert.equal(restrictedLookup.person, null);

  // 2. Ordinary citizen cannot register a new person or link citizens
  const draft = MaidIdentityService.generateCharacterDraft('ordinary', 777);
  const addRes = await MaidIdentityService.addPerson(draft);
  assert.equal(addRes.success, false);
  assert.match(addRes.error || '', /Registrar|Administrator/i);

  const linkRes = await MaidIdentityService.linkCitizens(allPersons[1].id, allPersons[2].id, 'Colleague');
  assert.equal(linkRes.success, false);

  // 3. Ordinary citizen can update their OWN contact details, but NOT their clearance or someone else's record
  const selfContactUpdate = await MaidIdentityService.updatePerson(allPersons[1].id, {
    phone: '+1 (202) 555-9999',
  });
  assert.equal(selfContactUpdate.success, true);

  const selfClearanceUpdate = await MaidIdentityService.updatePerson(allPersons[1].id, {
    clearance: 'Level 5 Root',
  });
  assert.equal(selfClearanceUpdate.success, false);

  const otherUpdate = await MaidIdentityService.updatePerson(allPersons[2].id, {
    phone: '+1 (202) 555-0000',
  });
  assert.equal(otherUpdate.success, false);

  // 4. Faith Medical clinician can update medical fields and issue Doc 8, but not Doc 5 (DGA Investigative Profile)
  os.setState((s) => ({
    gameplay: {
      ...s.gameplay,
      player: {
        ...s.gameplay.player,
        organizationMemberships: { medical: { status: 'active', issuedAt: new Date().toISOString(), issuedBy: 'Admin' } },
      },
    },
  }));
  const medUpdate = await MaidIdentityService.updatePerson(allPersons[2].id, {
    medical: 'Faith Medical Group · Cleared after harmonic scan',
  });
  assert.equal(medUpdate.success, true);
  assert.equal(authorizeAuraAction('issue_document', { targetPerson: allPersons[2], documentId: 8 }).authorized, true);
  assert.equal(authorizeAuraAction('issue_document', { targetPerson: allPersons[2], documentId: 5 }).authorized, false);

  // 5. DGA Investigator (Clearance 3+) can look up restricted records and issue forensic/investigative documents (Docs 4, 5, 7)
  os.setState((s) => ({
    gameplay: {
      ...s.gameplay,
      player: {
        ...s.gameplay.player,
        clearanceLevel: 3,
        dgaVerified: true,
        organizationMemberships: { dga: { status: 'active', issuedAt: new Date().toISOString(), issuedBy: 'Admin' } },
      },
    },
  }));
  const dgaLookup = await MaidIdentityService.lookupPerson(targetCitizen.maid, { allowRestricted: true });
  assert.equal(dgaLookup.status, 'found');
  assert.equal(dgaLookup.person?.id, targetCitizen.id);
  assert.equal(authorizeAuraAction('issue_document', { targetPerson: targetCitizen, documentId: 5 }).authorized, true);

  // 6. Civic Registrar (archivist membership) can register new citizens
  os.setState((s) => ({
    gameplay: {
      ...s.gameplay,
      player: {
        ...s.gameplay.player,
        organizationMemberships: { archivist: { status: 'active', issuedAt: new Date().toISOString(), issuedBy: 'Admin' } },
      },
    },
  }));
  const registrarAdd = await MaidIdentityService.addPerson({
    ...draft,
    name: 'Seraphina Vey-RegistrarTest',
    dob: '1994-08-19',
  });
  assert.equal(registrarAdd.success, true);
  assert.match(registrarAdd.person.maid || '', /^MAID-OR-\d{8}$/);
});

test('DGAOS enforces agency permissions, role-specific workspaces, case clearance filtering, and authorized TRACE access', () => {
  // 1. Unverified ordinary citizen -> civic_observer
  const citizenAuth = resolveDGAAuthority({
    isLoggedIn: true,
    player: { isAdmin: false, clearanceLevel: 1, dgaVerified: false, organizationMemberships: {} },
  });
  assert.equal(citizenAuth.role, 'civic_observer');
  assert.equal(citizenAuth.isAuthorizedAgent, false);
  assert.equal(canAccessDgaWorkspace('services', citizenAuth).allowed, true);
  assert.equal(canAccessDgaWorkspace('investigation', citizenAuth).allowed, false);
  assert.equal(canAccessDgaWorkspace('intelligence', citizenAuth).allowed, false);
  assert.equal(canAccessTraceLab(citizenAuth).allowed, false);
  assert.equal(
    filterAuthorizedDgaCases([{ id: 'C1', classification: 'UNCLASSIFIED // FOUO' }], citizenAuth).length,
    0
  );

  // 2. Field Investigator -> investigation workspace & field TRACE modules, no forensic morgue or lab finding transmission
  const fieldAuth = resolveDGAAuthority({
    isLoggedIn: true,
    player: {
      isAdmin: false,
      clearanceLevel: 3,
      dgaVerified: true,
      organizationMemberships: { dga: { status: 'active', issuedAt: '2026-03-06', issuedBy: 'DGA' } },
    },
  });
  assert.equal(fieldAuth.role, 'field_investigator');
  assert.equal(fieldAuth.defaultWorkspace, 'investigation');
  assert.equal(canAccessDgaWorkspace('investigation', fieldAuth).allowed, true);
  assert.equal(canAccessDgaWorkspace('government', fieldAuth).allowed, false);
  assert.equal(canAccessTraceLab(fieldAuth).allowed, true);
  assert.equal(canAccessTraceLab(fieldAuth).canTransmitFindings, false);
  assert.equal(authorizeTraceView('Crime Scene (CSI)', fieldAuth).allowed, true);
  assert.equal(authorizeTraceView('Forensic Morgue', fieldAuth).allowed, false);

  // 3. Forensic Examiner -> laboratory TRACE modules & can transmit findings
  const forensicAuth = resolveDGAAuthority({
    isLoggedIn: true,
    roleOverride: 'forensic_examiner',
    player: {
      isAdmin: false,
      clearanceLevel: 3,
      dgaVerified: true,
      organizationMemberships: { dga: { status: 'active', issuedAt: '2026-03-06', issuedBy: 'DGA' } },
    },
  });
  assert.equal(forensicAuth.role, 'forensic_examiner');
  assert.equal(canAccessTraceLab(forensicAuth).canTransmitFindings, true);
  assert.equal(authorizeTraceView('Forensic Morgue', forensicAuth).allowed, true);
  assert.equal(authorizeTraceView('Laboratory', forensicAuth).allowed, true);

  // 4. Medical Liaison -> medstat workspace & clinical forensic access
  const medAuth = resolveDGAAuthority({
    isLoggedIn: true,
    player: {
      isAdmin: false,
      clearanceLevel: 2,
      organizationMemberships: { medical: { status: 'active', issuedAt: '2026-03-06', issuedBy: 'Faith Med' } },
    },
  });
  assert.equal(medAuth.role, 'medical_liaison');
  assert.equal(medAuth.defaultWorkspace, 'medstat');
  assert.equal(canAccessDgaWorkspace('medstat', medAuth).allowed, true);
  assert.equal(canAccessDgaWorkspace('intelligence', medAuth).allowed, false);
  assert.equal(authorizeTraceView('Forensic Morgue', medAuth).allowed, true);

  // 5. Case clearance filtering respects agent clearance level
  const sampleCases = [
    { id: 'C-CONF', classification: 'CONFIDENTIAL' },
    { id: 'C-SEC', classification: 'SECRET // NOFORN' },
    { id: 'C-TS', classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED' },
  ];
  assert.deepEqual(
    filterAuthorizedDgaCases(sampleCases, fieldAuth).map((c) => c.id),
    ['C-CONF', 'C-SEC']
  );
});

test('Creator Studio state foundations support world pause/resume, draft staging, controlled publishing, and checkpoint restoration with historical preservation', async () => {
  setupStorage();
  const os = await freshOS();

  // Non-admin cannot pause world or create Creator Studio drafts
  os.getState().loginUser({ name: 'Regular Citizen', isAdmin: false });
  assert.equal(pauseWorld('Unauthorized pause').ok, false);
  assert.equal(
    saveCreatorDraft({ title: 'Unauthorized Event', category: 'world_event', summary: 'Should fail' }).ok,
    false
  );

  // Login as World Administrator
  os.getState().loginUser({ name: 'Creative Director', isAdmin: true });
  const startSegment = os.getState().gameplay.timeSegmentIndex;

  // 1. Pause world -> freezes advanceTime
  const pauseRes = pauseWorld('Inspecting Cycle 28 state');
  assert.equal(pauseRes.ok, true);
  assert.equal(isWorldPaused(), true);
  os.getState().advanceTime();
  assert.equal(os.getState().gameplay.timeSegmentIndex, startSegment);

  // Resume world -> advanceTime progresses normally
  const resumeRes = resumeWorld();
  assert.equal(resumeRes.ok, true);
  assert.equal(isWorldPaused(), false);
  os.getState().advanceTime();
  assert.equal(os.getState().gameplay.timeSegmentIndex, (startSegment + 1) % 4);

  // 2. Capture manual checkpoint at current credits (99999)
  const checkpointRes = captureWorldCheckpoint('Before experimental credit grant');
  assert.equal(checkpointRes.ok, true);
  const checkpointId = checkpointRes.checkpoint.id;

  // 3. Stage a Creator Studio draft -> does not mutate worldEventLog until published
  const logCountBeforeDraft = os.getState().gameplay.worldEventLog.length;
  const draftRes = saveCreatorDraft({
    title: 'Orynvell Solar Convergence',
    summary: 'Crown archival beacon synchronized across all Glassline relays.',
    category: 'world_event',
    payload: { institution: 'Royal Archives', eventCategory: 'civic' },
  });
  assert.equal(draftRes.ok, true);
  assert.equal(listCreatorDrafts().length, 1);
  assert.equal(os.getState().gameplay.worldEventLog.length, logCountBeforeDraft);

  // Validate and publish draft
  const valRes = validateCreatorDraft(draftRes.draft.id);
  assert.equal(valRes.ok, true);
  assert.equal(valRes.draft.status, 'validated');

  const pubRes = publishCreatorDraft(draftRes.draft.id);
  assert.equal(pubRes.ok, true);
  assert.equal(getPublishedHistory().length, 1);

  // Published drafts are sealed and cannot be discarded or overwritten
  assert.equal(discardCreatorDraft(draftRes.draft.id).ok, false);
  assert.equal(
    saveCreatorDraft({ id: draftRes.draft.id, title: 'Overwrite Attempt', category: 'world_event' }).ok,
    false
  );

  // 4. Mutate live state AND register a new canonical citizen MAID, then restore the earlier checkpoint
  os.getState().addCredits(5000);
  const newCitizenRes = await MaidIdentityService.addPerson({
    ...MaidIdentityService.generateCharacterDraft('civic', 909),
    name: 'Historical Preservation Citizen',
    dob: '1991-02-14',
  });
  assert.equal(newCitizenRes.success, true);

  const restoreRes = restoreWorldCheckpoint(checkpointId);
  assert.equal(restoreRes.ok, true);

  // Verify the newly issued MAID and published event history were preserved across checkpoint restore
  const postRestorePersons = await MaidIdentityService.readExistingPersons();
  assert.ok(
    postRestorePersons.some((p) => p.maid === newCitizenRes.person.maid),
    'Canonical MAID must be preserved across checkpoint restore'
  );
  const restoredOsRaw = JSON.parse(globalThis.localStorage.getItem('miraverse-os-progress'));
  assert.ok(
    restoredOsRaw.state.gameplay.worldEventLog.some(
      (evt) => evt.id === pubRes.publishedRecord.historicalEventId
    ),
    'Published historical event must be preserved across checkpoint restore'
  );
});
