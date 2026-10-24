import { createBrowserActions } from './browserActions';
import { createSocialActions, type SocialActions } from './socialActions';
import { grantLocalCredentials, isLocalWorld } from '../gameplay/localCredentials';
import { createSiteActions, type SiteActions } from './siteActions';
import { emptyVersenetSites, restoreVersenetSites, type VersenetSites } from '../apps/Browser/interactiveSites';
import { createVersenetActions, type VersenetActions } from './versenetActions';
import { emptyVersenetContent, restoreVersenetContent, type VersenetContent } from '../apps/Browser/searchCatalog';
import { restoreDesktopPreferences, type DesktopPreferences } from './desktopPreferences';
import { resolveAppDestination, retiredWindowDestination, type WorkspaceRequest } from './appNavigation';
import { canAcceptInvitation, invitationForOrganization, membershipSource, organization, registerCommunicationsAuthority } from '../integration/communicationsAccess';
import { isWorldPaused } from '../integration/worldStateManager';
import { initialBrowserState, restoreBrowserState, type BrowserState } from '../apps/Browser/browserModel';
export type { BrowserState, BrowserTab, TabHistory } from '../apps/Browser/browserModel';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { NOTICES, evaluateNoticeObjective } from '../data/notices';
import { mergeSavedProgress, osStorage } from './osPersistence';
import { createWorknetActions } from './worknetActions';
import { createFieldActions } from './fieldActions';
import { createBroadStreetActions, type BroadStreetActions } from './broadStreetActions';
import { createAssignmentActions, type AssignmentFlowActions } from './assignmentActions';
import { emptyAssignmentJournal } from '../gameplay/AssignmentFlow';
import { createProgressionActions, type ProgressionActions } from './progressionActions';
import { emptyWorldJournal } from '../gameplay/ProgressionEngine';
import type { WorkOrder, WorkValues, TaskResult } from '../gameplay/ActivityEngine';
import {
  worldEventEngine,
  PATIENT_CARE_ASSIGNMENTS,
  CAREER_TRACK_SPECS,
  calculateRestOutcome,
  evaluateCareerPromotion,
  type SleepDuration,
  type WorldNarrativeEvent,
  type WorldEventCategory,
} from '../gameplay/WorldEventEngine';

// Activities / missions — seeded by MissionDirector TypeScript engine or future DataGrip pipeline.
const missionsData: any[] = [];


const MENU_BAR_HEIGHT = 70;
const DEFAULT_WINDOW_SIZE = { width: 960, height: 640 };

const spawnPosition = (count: number) => ({
  x: 140 + (count % 6) * 32,
  y: MENU_BAR_HEIGHT + 32 + (count % 6) * 32,
});

export interface OSWindow {
  id: string;
  title: string;
  contentKey: string;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  windowOffset: { x: number; y: number };
  size: { width: number; height: number };
  [key: string]: any;
}

export interface OSStoreState extends AssignmentFlowActions, ProgressionActions, VersenetActions, SiteActions, BroadStreetActions, SocialActions {
  isLoggedIn: boolean;
  isSanctuary: boolean;
  toggleSanctuary: () => void;
  windows: OSWindow[];
  activeWindowId: string | null;
  wallpaper: string;
  desktopPreferences: DesktopPreferences;
  workspaceRequests: Record<string, WorkspaceRequest>;
  workspaceRequestSequence: number;
  openAppWorkspace: (id: string, section?: string) => void;
  consumeWorkspaceRequest: (id: string, revision: number) => void;
  linkCitizenHubIdentity: (id: string) => Promise<{ ok: boolean; message: string }>;
  setOrganizationMembership: (id: string, status: 'active' | 'suspended' | 'revoked') => { ok: boolean; message: string };
  inviteToOrganization: (id: string, note?: string) => { ok: boolean; message: string };
  acceptOrganizationInvitation: (id: string) => { ok: boolean; message: string };
  declineOrganizationInvitation: (id: string) => { ok: boolean; message: string };
  removeOrganizationMembership: (id: string, reason?: string) => { ok: boolean; message: string };
  leaveOrganizationMembership: (id: string) => { ok: boolean; message: string };
  setDesktopShortcuts: (ids: string[]) => void;
  resetDesktopShortcuts: () => void;
  setDesktopTheme: (id: string) => void;
  browserUrl: string | null;
  browserState: BrowserState;
  versenetContent: VersenetContent;
  versenetSites: VersenetSites;

  setBrowserUrl: (url: string | null) => void;
  openBrowserTab: (url?: string, title?: string) => void;
  closeBrowserTab: (id: number) => void;
  setActiveBrowserTab: (id: number) => void;
  navigateBrowserTab: (url: string, title?: string) => void;
  goBrowserBack: () => void;
  goBrowserForward: () => void;
  toggleBrowserBookmark: () => void;
  removeBrowserBookmark: (url: string) => void;
  clearBrowserHistory: () => void;

  loginUser: (userData: any) => void;
  grantLocalFullAccess: () => { ok: boolean; message: string };
  logoutUser: () => void;

  gameplay: any;

  advanceTime: () => void;
  restInDorm: (duration?: SleepDuration) => {
    ok: boolean;
    staminaRecovered: number;
    auraRecovered: number;
    unlockedSpecialDream: any;
    message: string;
  };
  studyInHousing: () => { ok: boolean; message: string };
  purchaseHousingUpgrade: (upgradeId: string, cost: number, bitCost?: number) => { ok: boolean; message: string };
  advanceWorknetMissionStep: (missionId: string, stepKey: string) => void;
  completeWorknetDomainTask: (missionId: string, selectedOptionId: string) => { ok: boolean; message: string };
  acceptEmployment: (track: string) => { ok: boolean; message: string };
  openWorknetOrder: (missionId: string) => { ok: boolean; message: string };
  fieldAction: (action: 'move' | 'interact' | 'record', payload?: any) => { ok: boolean; message: string };
  saveWorknetDraft: (missionId: string, stageId: string, values: WorkValues) => void;
  submitWorknetStage: (missionId: string, stageId: string, values: WorkValues) => { ok: boolean; message: string };
  remediateWorknetOrder: (missionId: string, note: string) => { ok: boolean; message: string };
  completeWorknetMission: (mission: { id: string; track: string; rewardCredits: number; rewardBits?: number; rewardXP: number; primaryAttribute?: string }) => { ok: boolean; reason?: string };
  resetWorknetMissionsAdmin: () => void;
  compileSpellProtocol: (spell: { name: string; combo?: string; comboLabel?: string; type: string; desc: string; power: number; isCanonical: boolean; regions?: string[] }) => { ok: boolean; isNewDiscovery: boolean; status: 'mastered_new' | 'recast' | 'insufficient_stamina'; message: string };
  quarantineProcess: (pid: number) => boolean;
  recordFileInspection: (mockKey: string) => void;
  discoverRegionalShrine: (regionName: string) => boolean;
  recordWorldEvent: (params: { category: WorldEventCategory; title: string; summary: string; institution: string; citizenMaid?: string; tags?: string[]; impact?: WorldNarrativeEvent['impact'] }) => WorldNarrativeEvent;
  runFaithDiagnosticScan: () => { ok: boolean; message: string };
  treatFaithCondition: (conditionName: string) => { ok: boolean; message: string };
  completePatientCareAssignment: (patientCaseId: string, diagnosisId: string, treatmentId: string) => { ok: boolean; message: string };
  acceptMaiSpaceFriend: (friendId: string) => { ok: boolean; message: string };
  updateMaiSpaceProfile: (updates: { handle?: string; statusThought?: string; headerFont?: string }) => void;
  postMaiSpaceBulletin: (content: string) => { ok: boolean; message: string };
  pingMaiSpaceFriend: (friendId: string) => { ok: boolean; message: string };
  claimPortalAction: (actionId: string, rewardCredits: number, rewardBits?: number, rewardXP?: number, label?: string) => { ok: boolean; message: string };
  submitInvestigationCase: (caseId: string, selectedEvidenceIds: string[], hypothesisId: string) => { ok: boolean; verified: boolean; message: string };
  updateNPCVector: (npcId: string, vectorName: string, delta: number) => void;
  updateReputationTrack: (trackName: string, delta: number) => void;
  startSession: (gameId: string, initialState?: Record<string, any>) => void;
  updateSession: (gameId: string, sessionData: Record<string, any>) => void;
  endSession: (gameId: string) => void;
  addCredits: (amount: number) => void;
  addBits: (amount: number) => void;
  addXP: (amount: number) => void;
  completeActivity: (id: string) => void;
  completeNotice: (id: string) => boolean;
  claimCommsAttachment: (commId: string, credits?: number, xp?: number) => void;
  advanceAppRank: (appKey: string) => void;
  completeStarterLoop: (loopKey: string) => void;
  purgePrismCorruption: (amount: number) => void;
  verifyDGAIdentity: () => void;
  unlockApp: (appId: string) => void;
  completeIdentityScan: (data: any) => void;
  createPulseProfile: (profileData: any) => void;
  selectMAITone: (tone: string) => void;
  completeQuest: (questId: string) => void;
  incrementHackedNodes: () => void;
  damageAura: (amount: number) => void;
  healAura: (amount: number) => void;
  addCondition: (name: string) => void;
  removeCondition: (name: string) => void;
  clearConditions: () => void;
  addForgedSpell: (name: string) => void;
  decryptLineage: () => void;
  addSkillXP: (skillName: string, amount: number) => void;
  addCareerXP: (track: string, amount: number) => void;
  requestCareerPromotion: (track: string) => {
    ok: boolean;
    newRankIndex?: number;
    newTitle?: string;
    pathwayLabel?: string;
    message: string;
  };
  advanceStarterPhase: (targetPhase?: number) => void;
  setHouseAffiliation: (house: string) => void;
  updateActivityStatus: (activityId: string, status: string) => void;
  setMonth: (monthIndex: number) => void;
  advanceMonth: () => void;
  claimDailyReward: () => void;
  joinWorldEvent: (eventId: string) => void;
  incrementAppRank: (appName: string) => void;

  addWindow: (app: any) => void;
  toggleApp: (app: any) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  clearActive: () => void;
  setWallpaper: (url: string) => void;
}

export const useOSStore = create<OSStoreState>()(persist((set, get) => ({
  isLoggedIn: false,
  isSanctuary: false,
  toggleSanctuary: () => set((s) => ({ isSanctuary: !s.isSanctuary })),
  windows: [],
  activeWindowId: null,
  wallpaper: '',
  desktopPreferences: restoreDesktopPreferences(undefined),
  workspaceRequests: {},
  workspaceRequestSequence: 0,
  setOrganizationMembership: (id, status) => {
    const current = get();
    if (!current.isLoggedIn || !current.gameplay.player.isAdmin) return { ok: false, message: 'Membership changes require the signed-in world administrator.' };
    const institution = organization(id);
    if (!institution || !['active', 'suspended', 'revoked'].includes(status)) return { ok: false, message: 'Unknown organization or membership status.' };
    set(s => ({ gameplay: { ...s.gameplay, player: { ...s.gameplay.player, organizationMemberships: {
      ...s.gameplay.player.organizationMemberships,
      [id]: { status, issuedAt: new Date().toISOString(), issuedBy: s.gameplay.player.name },
    } } } }));
    return { ok: true, message: `${institution.name} membership ${status}. Email issuance is separate.` };
  },
  inviteToOrganization: (id, note) => {
    const current = get();
    if (!current.isLoggedIn || !current.gameplay.player.isAdmin) return { ok: false, message: 'Organization invitations require the signed-in world administrator.' };
    const institution = organization(id);
    if (!institution) return { ok: false, message: 'Unknown organization.' };
    if (membershipSource(current.gameplay.player, id)) return { ok: false, message: `${institution.name} membership is already active.` };
    const invitation = {
      id: `INV:${institution.id}:${Date.now()}`,
      organizationId: institution.id,
      status: 'pending' as const,
      invitedAt: new Date().toISOString(),
      invitedBy: current.gameplay.player.name || 'World Administrator',
      note: typeof note === 'string' && note.trim() ? note.trim() : `Official channel membership invitation from ${institution.name}.`,
    };
    set(s => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          organizationInvitations: {
            ...(s.gameplay.player.organizationInvitations || {}),
            [institution.id]: invitation,
          },
        },
      },
    }));
    return { ok: true, message: `Invitation issued for ${institution.name}. The player must accept the invitation to activate Comms access.` };
  },
  acceptOrganizationInvitation: (id) => {
    const current = get();
    if (!current.isLoggedIn) return { ok: false, message: 'Sign in to accept an organization invitation.' };
    const institution = organization(id);
    if (!institution) return { ok: false, message: 'Unknown organization.' };
    const invite = invitationForOrganization(current.gameplay.player, id);
    if (!invite || !canAcceptInvitation(current.gameplay.player, id)) {
      return { ok: false, message: `No pending invitation found for ${institution.name}.` };
    }
    const now = new Date().toISOString();
    set(s => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          organizationInvitations: {
            ...(s.gameplay.player.organizationInvitations || {}),
            [institution.id]: { ...invite, status: 'accepted', respondedAt: now },
          },
          organizationMemberships: {
            ...(s.gameplay.player.organizationMemberships || {}),
            [institution.id]: { status: 'active', issuedAt: now, issuedBy: invite.invitedBy, via: 'invitation' },
          },
        },
      },
    }));
    return { ok: true, message: `Joined ${institution.name}. Organization Comms channels are now accessible; institutional email requires separate issuance.` };
  },
  declineOrganizationInvitation: (id) => {
    const current = get();
    if (!current.isLoggedIn) return { ok: false, message: 'Sign in to respond to an organization invitation.' };
    const institution = organization(id);
    if (!institution) return { ok: false, message: 'Unknown organization.' };
    const invite = invitationForOrganization(current.gameplay.player, id);
    if (!invite || invite.status !== 'pending') {
      return { ok: false, message: `No pending invitation found for ${institution.name}.` };
    }
    const now = new Date().toISOString();
    set(s => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          organizationInvitations: {
            ...(s.gameplay.player.organizationInvitations || {}),
            [institution.id]: { ...invite, status: 'declined', respondedAt: now },
          },
        },
      },
    }));
    return { ok: true, message: `Declined ${institution.name} invitation.` };
  },
  removeOrganizationMembership: (id, reason) => {
    const current = get();
    if (!current.isLoggedIn || !current.gameplay.player.isAdmin) return { ok: false, message: 'Removing a member from an organization requires the signed-in world administrator.' };
    const institution = organization(id);
    if (!institution) return { ok: false, message: 'Unknown organization.' };
    const now = new Date().toISOString();
    const existingInvite = invitationForOrganization(current.gameplay.player, id);
    set(s => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          organizationInvitations: existingInvite
            ? { ...(s.gameplay.player.organizationInvitations || {}), [institution.id]: { ...existingInvite, status: 'revoked', respondedAt: now } }
            : s.gameplay.player.organizationInvitations,
          organizationMemberships: {
            ...(s.gameplay.player.organizationMemberships || {}),
            [institution.id]: { status: 'revoked', issuedAt: now, issuedBy: s.gameplay.player.name, via: 'admin', ...(reason ? { reason } : {}) },
          },
        },
      },
    }));
    return { ok: true, message: `Removed from ${institution.name}. Channel and institutional sender access closed; existing work and history remain intact.` };
  },
  leaveOrganizationMembership: (id) => {
    const current = get();
    if (!current.isLoggedIn) return { ok: false, message: 'Sign in to leave an organization.' };
    const institution = organization(id);
    if (!institution) return { ok: false, message: 'Unknown organization.' };
    if (!membershipSource(current.gameplay.player, id)) {
      return { ok: false, message: `You do not have an active membership with ${institution.name}.` };
    }
    const now = new Date().toISOString();
    set(s => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          organizationMemberships: {
            ...(s.gameplay.player.organizationMemberships || {}),
            [institution.id]: { status: 'revoked', issuedAt: now, issuedBy: s.gameplay.player.name || 'Player Citizen', via: 'self_left' },
          },
        },
      },
    }));
    return { ok: true, message: `Left ${institution.name}. Organization Comms channels are now locked.` };
  },
  linkCitizenHubIdentity: async (id) => {
    const before = get();
    if (!before.isLoggedIn || !before.gameplay.player.isAdmin) return { ok: false, message: 'Only the signed-in world administrator can link a player to an AURA identity.' };
    const { MaidIdentityService } = await import('../services/maidIdentityService');
    const persons = await MaidIdentityService.readExistingPersons();
    const matches = persons.filter(candidate => candidate && typeof candidate.id === 'string' && candidate.id === id && !candidate.isRestricted);
    const person = matches.length === 1 ? matches[0] : undefined;
    if (!person) return { ok: false, message: 'Choose an existing unrestricted AURA identity.' };
    const current = get();
    if (!current.isLoggedIn || !current.gameplay.player.isAdmin || current.gameplay.identity !== before.gameplay.identity || current.gameplay.player.name !== before.gameplay.player.name) {
      return { ok: false, message: 'The player identity changed. Review the link again.' };
    }
    set(s => ({ gameplay: { ...s.gameplay, identity: { ...s.gameplay.identity, canonicalPersonId: person.id } } }));
    return { ok: true, message: `Citizen Hub linked to ${person.name}. AURA records and issued documents are unchanged.` };
  },
  openAppWorkspace: (id, section) => {
    const destination = resolveAppDestination(id);
    const target = section || destination.section;
    if (target) set(s => ({
      workspaceRequestSequence: s.workspaceRequestSequence + 1,
      workspaceRequests: {
        ...s.workspaceRequests,
        [destination.appId]: { section: target, revision: s.workspaceRequestSequence + 1 },
      },
    }));
    if (get().windows.some(window => window.id === destination.appId)) get().focusWindow(destination.appId);
    else get().addWindow({ id: destination.appId, contentKey: destination.appId });
  },
  consumeWorkspaceRequest: (id, revision) => set(s => {
    if (s.workspaceRequests[id]?.revision !== revision) return {};
    const workspaceRequests = { ...s.workspaceRequests };
    delete workspaceRequests[id];
    return { workspaceRequests };
  }),
  setDesktopShortcuts: (ids) => set(s => ({ desktopPreferences: restoreDesktopPreferences({ ...s.desktopPreferences, shortcutIds: ids }) })),
  resetDesktopShortcuts: () => set(s => ({ desktopPreferences: restoreDesktopPreferences({ ...s.desktopPreferences, shortcutIds: undefined }) })),
  setDesktopTheme: (themeId) => set(s => ({ desktopPreferences: restoreDesktopPreferences({ ...s.desktopPreferences, themeId }) })),
  browserUrl: null,
  browserState: initialBrowserState(),
  versenetContent: emptyVersenetContent(),
  versenetSites: emptyVersenetSites(),
  ...createSiteActions(set, get),
  ...createVersenetActions(set, get),
  ...createBrowserActions(set, get),
  ...createSocialActions(set, get),

  grantLocalFullAccess: () => {
    const current = get();
    if (!current.isLoggedIn || !isLocalWorld(globalThis.location?.hostname || '')) return { ok: false, message: 'Full-access credentials are available in your signed-in local world.' };
    set(s => ({ gameplay: grantLocalCredentials(s.gameplay, new Date().toISOString()) }));
    return { ok: true, message: 'Full access enabled. Clearance 5, all institutions, DGAOS and TRACE are available. Your progress is preserved.' };
  },
  loginUser: (userData) =>
    set((s) => {
      // Login resumes this browser's saved character without reapplying starter rewards.
      if (s.gameplay.player.name && s.gameplay.player.name.toLowerCase() === userData.name?.trim().toLowerCase()) {
        return { isLoggedIn: true };
      }
      const isAdmin = !!(
        userData.isAdmin ||
        userData.name?.toLowerCase().includes('admin') ||
        (userData.clearance && userData.clearance >= 4)
      );

      if (isAdmin) {
        return {
          isLoggedIn: true,
          gameplay: {
            ...s.gameplay,
            lockedApps: [], // ALL apps completely unlocked
            onboardingPhase: 6, // Completed onboarding
            identity: {
              fingerprint: true,
              facial: true,
              auraBaseline: true,
              citizenId: 'CIT-ROOT-0001',
              barcode: 'AURE-SYS-ROOT-001',
              signalSignature: 'Root-Resonance-Omni (Master)',
              profileTags: ['#RootAdmin', '#Netrunner', '#MasterArchivist', '#SystemsArchitect', '#TacticalShield'],
              declaredRegion: 'Orynvell Upper Sanctum',
            },
            pulseProfile: {
              displayName: 'ADMINISTRATOR // Root',
              houseTag: 'Vertex (Master)',
              visibility: 'Public',
              theme: 'gold',
            },
            player: {
              ...s.gameplay.player,
              name: userData.name || 'ADMINISTRATOR',
              isAdmin: true,
              clearanceLevel: 5,
              level: userData.level !== undefined ? userData.level : 99,
              credits: userData.credits !== undefined ? userData.credits : 99999,
              bits: userData.bits !== undefined ? userData.bits : 9999,
              xp: 99999,
              dgaVerified: true,
              lineageDecrypted: true,
              auraHealth: 100,
              conditions: [], // No debuffs or Veilwilt
              hackedNodes: 99,
              starterPhase: 5,
              dormComfort: 100,
              reputation: {
                campus: 100,
                dga: 100,
                faith: 100,
                archive: 100,
                vector: 100,
                delegation: 100,
                orynvell: 100,
              },
              skills: {
                Programming: { level: 10, xp: 9999 },
                Networking: { level: 10, xp: 9999 },
                Spellcasting: { level: 10, xp: 9999 },
                Engineering: { level: 10, xp: 9999 },
                Communication: { level: 10, xp: 9999 },
                Creativity: { level: 10, xp: 9999 },
                Research: { level: 10, xp: 9999 },
                CyberSecurity: { level: 10, xp: 9999 },
                Cryptography: { level: 10, xp: 9999 },
              },
              careers: {
                archivist: { rankIndex: 5, xp: 100, title: 'Grand Master of Records' },
                engineer: { rankIndex: 5, xp: 100, title: 'Chief Systems Synthesizer' },
                diplomat: { rankIndex: 5, xp: 100, title: 'Plenipotentiary Ambassador' },
                enforcer: { rankIndex: 5, xp: 100, title: 'Warden of the Shield' },
                artist: { rankIndex: 5, xp: 100, title: 'Paragon of the Arts' },
                medical: { rankIndex: 5, xp: 100, title: 'Grand Sanctum Physician' },
                warden: { rankIndex: 5, xp: 100, title: 'Guardian of Arcadia' },
                finance: { rankIndex: 5, xp: 100, title: 'Master of the Treasury' },
                questnotice: { rankIndex: 5, xp: 100, title: 'Aureline Fixer' },
                dga: { rankIndex: 5, xp: 100, title: 'DGA High Commander' },
                gov: { rankIndex: 5, xp: 100, title: 'Supreme Council Regent' },
              },
              npcVectors: {
                jeremie: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                sissi: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                aelita: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                odd: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                voss: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                riven: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                mara: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                tali: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                liora: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                ember: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                ulrich: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                franz: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                rowan: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                ilyra: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                maris: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                kael: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                nyx: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
                null: { friendship: 100, trust: 100, rivalry: 0, sync: 100, corruption: 0 },
              },
              rewardItems: [
                'Master Root Security Key',
                'DGA Level 5 High Clearance Card',
                'AETHERCORE Prime Crystal',
                'Royal Seal of Orynvell Archive',
                'Faith Medical Bio-Aura Master Caduceus',
                'Universal Hex Debugger',
                'Arcadia Master Seed Vault Pass'
              ],
            },
          },
        };
      }

      return {
        isLoggedIn: true,
        gameplay: {
          ...s.gameplay,
          player: {
            ...s.gameplay.player,
            name: userData.name || s.gameplay.player.name,
            clearanceLevel: userData.clearance || 1,
            credits: userData.credits !== undefined ? userData.credits : s.gameplay.player.credits,
            bits: userData.bits !== undefined ? userData.bits : s.gameplay.player.bits,
            level: userData.level !== undefined ? userData.level : s.gameplay.player.level,
          },
        },
      };
    }),

  logoutUser: () => set({ isLoggedIn: false }),

  // ------------------------------------------------------------------
  // Gameplay State Lane (Cross-App Progression & Mechanics)
  // ------------------------------------------------------------------
  gameplay: {
    sessions: {},
    activeGameId: null,
    prismCorruptionLevel: 14.8,
    claimedComms: [],
    worldEventLog: [
      {
        id: 'EVT-BOOT-01',
        category: 'civic',
        title: 'Aureline Municipal Grid Synchronized',
        summary: 'Directive 14-B biometric telemetry and citizen registry links initialized across all 9 institutions.',
        institution: 'Aureline Civic Grid',
        cycle: 28,
        timestamp: '2026-03-06T08:00:00.000Z',
        tags: ['civic', 'boot'],
      },
    ],
    timeSegmentIndex: 2, // 0: Morning, 1: Afternoon, 2: Evening, 3: Night
    timeCycleCount: 28,
    onboardingPhase: 1, // 1: Boot, 2: Emails Read, 3: Identity Verified, 4: Pulse Created, 5: Comms Unlocked, 6: Completed
    lockedApps: ['passport', 'pulse', 'comms'], // Apps locked until onboarding steps are completed
    identity: {
      fingerprint: false,
      facial: false,
      auraBaseline: false,
      citizenId: null,
      canonicalPersonId: null,
      barcode: null,
      signalSignature: 'Aura-Code-Alpha',
      profileTags: ['#Netrunner', '#Scholar'],
      declaredRegion: 'Aureline Central',
    },
    pulseProfile: {
      displayName: null,
      houseTag: 'Vector',
      visibility: 'Public',
      theme: 'purple',
    },
    maiTone: null, // 'friendly' | 'neutral' | 'cold'
    player: {
      level: 1,
      credits: 500,
      bits: 25,
      xp: 0,
      stamina: 85,
      rewardItems: [],
      completedQuests: [],
      completedNoticeIds: NOTICES.filter((notice) => notice.completed).map((notice) => notice.id),
      completedWorknetMissionIds: [],
      worknetMissionProgress: {},
      employmentContracts: {},
      organizationMemberships: {},
      organizationInvitations: {},
      worknetOrders: {},
      assignmentJournal: emptyAssignmentJournal(),
      worldJournal: emptyWorldJournal(),
      rewardedWorkOrderIds: [],
      taskResults: {},
      unlockedHousingUpgrades: ['banner'],
      housingCalibrated: false,
      unlockedDreamIds: [],
      dreamLogs: [
        'DREAM_ENTRY #04: A mirrored cathedral under coastal rain. A woman with silver hair whispers: "The code was never code, it was memory."',
        'DREAM_ENTRY #03: Falling through the Supercomputer factory floor. Glowing blue lines trace my pulse.',
      ],
      hackedNodes: 0,
      quarantinedProcessPids: [],
      inspectedFiles: [],
      discoveredShrines: [],
      auraHealth: 100,
      conditions: ['Veilwilt'],
      faithDiagnosed: false,
      lastFaithDiagnosticCycle: 0,
      treatedConditionsHistory: [],
      completedPatientCareIds: [],
      maiSpaceProfile: {
        handle: 'Aureline_Netrunner',
        statusThought: 'Exploring the digital conduits of Aureline Central ✨',
        headerFont: 'Cookie',
        acceptedFriends: [],
        pingedFriendsCycle: {},
        lastBulletinPostCycle: 0,
        bulletinPosts: [
          { id: 1, author: 'Odd Della Robbia', time: '12m ago', content: 'Who replaced the cafeteria synth-juice with cryogenic coolant? My mouth is glowing blue.', likes: 14 },
          { id: 2, author: 'Jeremie Belpois', time: '34m ago', content: 'Observing unusual spectral noise in the Sub-Conduit frequency band (88.2 MHz). Keep your firewall up.', likes: 29 },
          { id: 3, author: 'Elisabeth Delmas (Sissi)', time: '1h ago', content: 'Reminder: Cycademy Gala dress code is strictly Silver & Obsidian. Do not embarrass us.', likes: 8 },
          { id: 4, author: 'Aelita Schaeffer', time: '3h ago', content: 'The melody in the Veil towers sounds like a pre-Collapse lullaby...', likes: 45 },
        ],
      },
      claimedPortalActionIds: [],
      solvedInvestigationCaseIds: [],
      investigationCaseDrafts: {},
      forgedSpells: ['Reflect Shield'],
      forgedSpellHistory: [
        { name: 'Reflect Shield', combo: 'Firewall.mod + Routing.mod', type: 'Combat Defense', power: 120, date: 'Cycle 28', mastered: true },
      ],
      lineageDecrypted: false,
      dgaVerified: false,
      npcVectors: {
        jeremie: { friendship: 60, trust: 75, rivalry: 10, sync: 80, corruption: 0 },
        sissi: { friendship: 30, trust: 40, rivalry: 75, sync: 40, corruption: 0 },
        aelita: { friendship: 85, trust: 90, rivalry: 5, sync: 85, corruption: 5 },
        odd: { friendship: 95, trust: 85, rivalry: 15, sync: 80, corruption: 0 },
        voss: { friendship: 50, trust: 80, rivalry: 20, sync: 90, corruption: 0 },
        riven: { friendship: 65, trust: 60, rivalry: 45, sync: 75, corruption: 10 },
        mara: { friendship: 55, trust: 75, rivalry: 30, sync: 65, corruption: 0 },
        tali: { friendship: 80, trust: 70, rivalry: 10, sync: 70, corruption: 0 },
        liora: { friendship: 40, trust: 50, rivalry: 65, sync: 55, corruption: 0 },
        ember: { friendship: 45, trust: 45, rivalry: 70, sync: 60, corruption: 0 },
        ulrich: { friendship: 50, trust: 55, rivalry: 80, sync: 70, corruption: 0 },
        franz: { friendship: 60, trust: 85, rivalry: 0, sync: 90, corruption: 15 },
        rowan: { friendship: 70, trust: 90, rivalry: 5, sync: 65, corruption: 0 },
        ilyra: { friendship: 75, trust: 85, rivalry: 0, sync: 75, corruption: 0 },
        maris: { friendship: 65, trust: 70, rivalry: 10, sync: 60, corruption: 0 },
        kael: { friendship: 55, trust: 65, rivalry: 25, sync: 70, corruption: 5 },
        nyx: { friendship: 20, trust: 40, rivalry: 50, sync: 45, corruption: 60 },
        null: { friendship: 10, trust: 30, rivalry: 60, sync: 30, corruption: 85 },
      },
      reputation: {
        campus: 50,
        dga: 40,
        faith: 50,
        archive: 30,
        vector: 35,
        delegation: 25,
        orynvell: 10,
      },
      skills: {
        Programming: { level: 1, xp: 0 },
        Networking: { level: 1, xp: 0 },
        Spellcasting: { level: 1, xp: 0 },
        Engineering: { level: 1, xp: 0 },
        Communication: { level: 1, xp: 0 },
        Creativity: { level: 1, xp: 0 },
        Research: { level: 1, xp: 0 },
        CyberSecurity: { level: 1, xp: 0 },
        Cryptography: { level: 1, xp: 0 },
      },
      careers: {
        archivist: { rankIndex: 0, xp: 0, title: 'Archivist / Researcher' },
        engineer: { rankIndex: 0, xp: 0, title: 'Systems Engineer' },
        diplomat: { rankIndex: 0, xp: 0, title: 'Council Diplomat' },
        enforcer: { rankIndex: 0, xp: 0, title: 'Enforcer / Guardian' },
        artist: { rankIndex: 0, xp: 0, title: 'Artist / Performer' },
        medical: { rankIndex: 0, xp: 0, title: 'Healer / Medical Support' },
        warden: { rankIndex: 0, xp: 0, title: 'Ecological Warden' },
        finance: { rankIndex: 0, xp: 0, title: 'Finance Clerk / Banking Support' },
        questnotice: { rankIndex: 0, xp: 0, title: 'QUESTNOTICE Odd Jobs' },
        dga: { rankIndex: 0, xp: 0, title: 'Department of Global Affairs' },
        gov: { rankIndex: 0, xp: 0, title: 'Governmental Civic Administration' },
      },
      starterPhase: 0,
      houseAffiliation: null,
      dormComfort: 50,
      roomComfort: 50,
      starterCompletedLoops: [],
      currentMonthIndex: 2, // Default: March (Early Spring / Founding Day)
      dailyRewardLastClaimed: 0,
      worldEvents: [
        { id: 'EVT-MAR6', name: 'Founding Day Protocol (March 6)', monthReq: 'March', active: true, desc: 'Unlocks Orynvell archives, coronation lore, ceremonial quests, and hidden AETHERCORE records.', reward: 'Orynvell Key + 500 Credits' },
        { id: 'EVT-FLUX', name: 'Aura Flux Outbreak', monthReq: 'July', active: true, desc: 'Faith Medical diagnostic emergency. Triage student aura profiles and collect recovery materials.', reward: 'Faith Medical Commendation + 300 XP' },
        { id: 'EVT-HACK', name: 'Cyacademy Netrunner Hackathon', monthReq: 'All', active: true, desc: 'Competitive coding event with Credit prizes, Programming XP, and rare exploit tools.', reward: '400 Credits + Rare Exploit' },
        { id: 'EVT-LEAK', name: 'Purge Archive Leak', monthReq: 'November', active: true, desc: 'Lightborn genealogy history leak. Encrypted files appear in Central Library archives.', reward: 'Lineage Fragment #09' },
        { id: 'EVT-EXCH', name: 'Regional Exchange Week', monthReq: 'September', active: true, desc: 'Delegates from Fross, Lumia, Marlowe, Brisland, and Kaji visit Cyacademy.', reward: 'Regional Reputation Boost' }
      ],
      activities: missionsData,
      appRanks: {
        explorer: 1,
        weaver: 1,
        investigator: 1,
        research: 1,
        influence: 1,
        clearance: 1,
      },
    },
  },

  advanceTime: () =>
    set((state) => {
      if (isWorldPaused()) return state;
      const nextIndex = (state.gameplay.timeSegmentIndex + 1) % 4;
      const isNight = nextIndex === 3;
      const nextCycle = nextIndex === 0 ? state.gameplay.timeCycleCount + 1 : state.gameplay.timeCycleCount;
      const newCorruption = isNight
        ? Number((state.gameplay.prismCorruptionLevel + 5.0).toFixed(1))
        : state.gameplay.prismCorruptionLevel;
      const newAura = isNight
        ? Math.max(20, state.gameplay.player.auraHealth - 5)
        : state.gameplay.player.auraHealth;

      return {
        gameplay: {
          ...state.gameplay,
          timeSegmentIndex: nextIndex,
          timeCycleCount: nextCycle,
          prismCorruptionLevel: newCorruption,
          player: {
            ...state.gameplay.player,
            auraHealth: newAura,
          },
        },
      };
    }),

  restInDorm: (duration = 'full') => {
    const state = get();
    const player = state.gameplay.player;
    const currentDreams = Array.isArray(player.dreamLogs) ? player.dreamLogs : [];
    const outcome = calculateRestOutcome(state.gameplay, duration);

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        timeSegmentIndex: outcome.nextTimeSegmentIndex,
        timeCycleCount: outcome.nextTimeCycleCount,
        prismCorruptionLevel: outcome.nextCorruption,
        player: {
          ...s.gameplay.player,
          auraHealth: outcome.nextAuraHealth,
          stamina: outcome.nextStamina,
          housingCalibrated: true,
          conditions: outcome.nextConditions,
          unlockedDreamIds: outcome.nextUnlockedDreamIds,
          dreamLogs: [outcome.dreamText, ...currentDreams.slice(0, 14)],
        },
      },
    }));

    if (outcome.unlockedSpecialDream) {
      get().recordWorldEvent({
        category: 'veil',
        title: `Special Lore Dream: ${outcome.unlockedSpecialDream.title}`,
        summary: outcome.unlockedSpecialDream.loreSummary,
        institution: 'HOMECRAFT // Subconscious Veil',
      });
    }

    return {
      ok: true,
      staminaRecovered: outcome.staminaRecovered,
      auraRecovered: outcome.auraRecovered,
      unlockedSpecialDream: outcome.unlockedSpecialDream,
      message: outcome.summaryMessage,
    };
  },

  studyInHousing: () => {
    const state = get();
    const player = state.gameplay.player;
    const unlocked = Array.isArray(player.unlockedHousingUpgrades) ? player.unlockedHousingUpgrades : ['banner'];
    const staminaCost = unlocked.includes('mattress') ? 15 : 20;
    const currentStamina = typeof player.stamina === 'number' ? player.stamina : 85;
    if (currentStamina < staminaCost) {
      return { ok: false, message: `Too exhausted to study! Requires ${staminaCost} Stamina. Rest in your bed first.` };
    }

    const xpGain = unlocked.includes('desk') ? 160 : 120;
    const newXP = player.xp + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          stamina: Math.max(0, currentStamina - staminaCost),
          housingCalibrated: true,
          xp: newXP,
          level: newLevel,
        },
      },
    }));
    get().addSkillXP('Research', 25);
    get().addSkillXP('Programming', 20);
    return { ok: true, message: `Completed 2 hours of Cyacademy Syntax coursework (-${staminaCost} Stamina). +${xpGain} Academic XP gained!` };
  },

  purchaseHousingUpgrade: (upgradeId, cost, bitCost = 0) => {
    const state = get();
    const player = state.gameplay.player;
    const unlocked: string[] = Array.isArray(player.unlockedHousingUpgrades) ? player.unlockedHousingUpgrades : ['banner'];
    if (unlocked.includes(upgradeId)) {
      return { ok: false, message: 'Upgrade already installed in your housing unit.' };
    }

    if (bitCost > 0) {
      if ((player.bits || 0) < bitCost) {
        return { ok: false, message: `Insufficient BITS! Requires ${bitCost} ◈ BITS.` };
      }
    } else {
      if ((player.credits || 0) < cost) {
        return { ok: false, message: `Insufficient CREDITS! Requires ${cost} ₢ Credits.` };
      }
    }

    const newXP = player.xp + 40;
    const newLevel = Math.floor(newXP / 100) + 1;
    const currentComfort = typeof player.roomComfort === 'number' ? player.roomComfort : (player.dormComfort || 50);
    const nextComfort = currentComfort + 10;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          credits: bitCost > 0 ? s.gameplay.player.credits : Math.max(0, s.gameplay.player.credits - cost),
          bits: bitCost > 0 ? Math.max(0, (s.gameplay.player.bits || 0) - bitCost) : s.gameplay.player.bits,
          unlockedHousingUpgrades: [...unlocked, upgradeId],
          housingCalibrated: true,
          roomComfort: nextComfort,
          dormComfort: nextComfort,
          xp: newXP,
          level: newLevel,
        },
      },
    }));
    get().recordWorldEvent({
      category: 'housing',
      title: `Installed Housing Upgrade: ${upgradeId}`,
      summary: `Citizen upgraded residential Suite 4B with ${upgradeId} (+40 XP, +10 Room Comfort → ${nextComfort}).`,
      institution: 'HOMECRAFT // Housing',
      impact: { reputationTrack: 'campus', reputationDelta: 2 },
    });
    return { ok: true, message: `Upgrade unlocked & permanently installed! Granted +40 XP and +10 Room Comfort (Comfort: ${nextComfort}).` };
  },

  advanceWorknetMissionStep: (missionId, stepKey) =>
    set((state) => {
      const player = state.gameplay.player;
      const progressMap: Record<string, string[]> = { ...(player.worknetMissionProgress || {}) };
      const existingSteps = Array.isArray(progressMap[missionId]) ? progressMap[missionId] : [];
      if (existingSteps.includes(stepKey)) return state;
      progressMap[missionId] = [...existingSteps, stepKey];

      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...player,
            worknetMissionProgress: progressMap,
          },
        },
      };
    }),

  ...createWorknetActions(set, get),
  ...createFieldActions(set, get),
  ...createBroadStreetActions(set, get),
  ...createAssignmentActions(set, get),
  ...createProgressionActions(set, get),

  compileSpellProtocol: (spell) => {
    const state = get();
    const player = state.gameplay.player;
    const currentStamina = typeof player.stamina === 'number' ? player.stamina : 85;
    if (currentStamina < 15) {
      return {
        ok: false,
        isNewDiscovery: false,
        status: 'insufficient_stamina',
        message: 'Insufficient Stamina (requires 15 Stamina). Rest in HOMECRAFT // Housing to recover.',
      };
    }

    const forgedSpells: string[] = Array.isArray(player.forgedSpells) ? player.forgedSpells : [];
    const history = Array.isArray(player.forgedSpellHistory) ? player.forgedSpellHistory : [];
    const alreadyForged = forgedSpells.includes(spell.name);
    const comboStr = spell.comboLabel || spell.combo || 'Module Synthesis';

    const discoveredShrines: string[] = Array.isArray(player.discoveredShrines) ? [...player.discoveredShrines] : [];
    if (Array.isArray(spell.regions)) {
      for (const reg of spell.regions) {
        if (reg && !discoveredShrines.includes(reg)) {
          discoveredShrines.push(reg);
        }
      }
    }

    if (!alreadyForged) {
      const xpGain = spell.isCanonical ? 150 : 60;
      const creditGain = spell.isCanonical ? 200 : 50;
      const newXP = player.xp + xpGain;
      const newLevel = Math.floor(newXP / 100) + 1;
      const nextCorruption = Math.max(2.0, Number((state.gameplay.prismCorruptionLevel - 2.0).toFixed(1)));

      set((s) => ({
        gameplay: {
          ...s.gameplay,
          prismCorruptionLevel: nextCorruption,
          player: {
            ...s.gameplay.player,
            stamina: Math.max(0, currentStamina - 15),
            credits: s.gameplay.player.credits + creditGain,
            xp: newXP,
            level: newLevel,
            forgedSpells: [...forgedSpells, spell.name],
            discoveredShrines,
            forgedSpellHistory: [
              { name: spell.name, combo: comboStr, type: spell.type, power: spell.power, date: `Cycle ${s.gameplay.timeCycleCount}`, mastered: true },
              ...history.slice(0, 14),
            ],
          },
        },
      }));
      get().addSkillXP('Spellcasting', 35);
      get().recordWorldEvent({
        category: 'veil',
        title: `Synthesized New Spell Protocol: ${spell.name}`,
        summary: `Compiled ${comboStr} (${spell.power} PWR) in SpellForge, reducing PRISM corruption.`,
        institution: 'SpellForge Compiler',
      });
      return {
        ok: true,
        isNewDiscovery: true,
        status: 'mastered_new',
        message: `First-Time Protocol Discovery! +${creditGain} ₢, +${xpGain} XP, -2.0% PRISM Corruption.`,
      };
    } else {
      const nextCorruption = Math.max(2.0, Number((state.gameplay.prismCorruptionLevel - 1.0).toFixed(1)));
      set((s) => ({
        gameplay: {
          ...s.gameplay,
          prismCorruptionLevel: nextCorruption,
          player: {
            ...s.gameplay.player,
            stamina: Math.max(0, currentStamina - 15),
            auraHealth: Math.min(100, (s.gameplay.player.auraHealth || 100) + 5),
            discoveredShrines,
          },
        },
      }));
      get().addSkillXP('Spellcasting', 15);
      return {
        ok: true,
        isNewDiscovery: false,
        status: 'recast',
        message: `Channeled mastered protocol "${spell.name}" (-15 Stamina). Stabilized Veil (-1.0% PRISM Corruption, +5 Aura, +15 Spellcasting XP).`,
      };
    }
  },

  quarantineProcess: (pid) => {
    const state = get();
    const player = state.gameplay.player;
    const quarantined: number[] = Array.isArray(player.quarantinedProcessPids) ? player.quarantinedProcessPids : [];
    if (quarantined.includes(pid)) return false;

    const newXP = player.xp + 150;
    const newLevel = Math.floor(newXP / 100) + 1;
    const nextCorruption = Math.max(2.0, Number((state.gameplay.prismCorruptionLevel - 2.5).toFixed(1)));

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        prismCorruptionLevel: nextCorruption,
        player: {
          ...s.gameplay.player,
          quarantinedProcessPids: [...quarantined, pid],
          hackedNodes: (s.gameplay.player.hackedNodes || 0) + 1,
          credits: s.gameplay.player.credits + 250,
          xp: newXP,
          level: newLevel,
        },
      },
    }));
    get().addSkillXP('CyberSecurity', 30);
    get().recordWorldEvent({
      category: 'forensic',
      title: `Quarantined Rogue Kernel Process PID ${pid}`,
      summary: `Isolated anomalous PRISM/AETHERCORE thread PID ${pid} in Process Monitor (-2.5% Corruption).`,
      institution: 'Process Monitor',
      impact: { reputationTrack: 'dga', reputationDelta: 5 },
    });
    return true;
  },

  recordFileInspection: (mockKey) =>
    set((state) => {
      if (!mockKey) return state;
      const player = state.gameplay.player;
      const inspected: string[] = Array.isArray(player.inspectedFiles) ? player.inspectedFiles : [];
      const alreadyInspected = inspected.includes(mockKey);
      const nextInspected = alreadyInspected ? inspected : [...inspected, mockKey];
      const unlocksLineage = mockKey === 'purge-archive';
      const xpGain = alreadyInspected ? 0 : 25;
      const newXP = player.xp + xpGain;

      const currentEvents: WorldNarrativeEvent[] = Array.isArray(state.gameplay.worldEventLog) ? state.gameplay.worldEventLog : [];
      const nextEvents = alreadyInspected
        ? currentEvents
        : [
            worldEventEngine.createEvent({
              category: unlocksLineage ? 'archive' : 'forensic',
              title: `Inspected Archive File: ${mockKey}`,
              summary: unlocksLineage
                ? `Decrypted restricted pre-Collapse lineage file (${mockKey}).`
                : `Reviewed system record (${mockKey}) in File Explorer.`,
              institution: 'File Explorer // Archives',
              cycle: state.gameplay.timeCycleCount,
            }),
            ...currentEvents.slice(0, 29),
          ];

      return {
        gameplay: {
          ...state.gameplay,
          worldEventLog: nextEvents,
          player: {
            ...player,
            inspectedFiles: nextInspected,
            lineageDecrypted: player.lineageDecrypted || unlocksLineage,
            xp: newXP,
            level: Math.floor(newXP / 100) + 1,
          },
        },
      };
    }),

  discoverRegionalShrine: (regionName) => {
    if (!regionName) return false;
    const state = get();
    const player = state.gameplay.player;
    const shrines: string[] = Array.isArray(player.discoveredShrines) ? player.discoveredShrines : [];
    if (shrines.includes(regionName)) return false;

    const newXP = player.xp + 35;
    const newLevel = Math.floor(newXP / 100) + 1;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          discoveredShrines: [...shrines, regionName],
          xp: newXP,
          level: newLevel,
        },
      },
    }));
    get().addSkillXP('Research', 15);
    get().recordWorldEvent({
      category: 'veil',
      title: `Attuned ${regionName} Elemental Shrine`,
      summary: `Synchronized regional resonance node for ${regionName} (${shrines.length + 1}/8 Shrines).`,
      institution: 'Reality Registry // Shrines',
    });
    return true;
  },

  recordWorldEvent: (params) => {
    const state = get();
    const evt = worldEventEngine.createEvent({
      ...params,
      cycle: state.gameplay.timeCycleCount ?? 28,
    });
    set((s) => {
      const existing: WorldNarrativeEvent[] = Array.isArray(s.gameplay.worldEventLog) ? s.gameplay.worldEventLog : [];
      const currentCorruption = s.gameplay.prismCorruptionLevel ?? 14.8;
      const nextCorruption = params.impact?.corruptionDelta
        ? Math.max(2.0, Math.min(100, Number((currentCorruption + params.impact.corruptionDelta).toFixed(1))))
        : currentCorruption;

      const currentRep = s.gameplay.player.reputation || {};
      const nextRep =
        params.impact?.reputationTrack && params.impact?.reputationDelta
          ? {
              ...currentRep,
              [params.impact.reputationTrack]: Math.max(
                0,
                Math.min(100, (currentRep[params.impact.reputationTrack] || 50) + params.impact.reputationDelta)
              ),
            }
          : currentRep;

      return {
        gameplay: {
          ...s.gameplay,
          prismCorruptionLevel: nextCorruption,
          worldEventLog: [evt, ...existing.slice(0, 29)],
          player: {
            ...s.gameplay.player,
            reputation: nextRep,
          },
        },
      };
    });
    return evt;
  },

  runFaithDiagnosticScan: () => {
    const state = get();
    const player = state.gameplay.player;
    const currentCycle = state.gameplay.timeCycleCount ?? 28;
    if (player.faithDiagnosed && player.lastFaithDiagnosticCycle === currentCycle) {
      return {
        ok: false,
        message: `Personal bio-aura diagnostic already completed for Cycle ${currentCycle}. Rest or advance cycle before rescanning.`,
      };
    }

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          faithDiagnosed: true,
          lastFaithDiagnosticCycle: currentCycle,
          auraHealth: Math.min(100, (s.gameplay.player.auraHealth || 100) + 20),
        },
      },
    }));

    const activeConds: string[] = Array.isArray(player.conditions) ? player.conditions : [];
    get().recordWorldEvent({
      category: 'medical',
      title: `Faith Medical Personal Bio-Aura Diagnostic (Cycle ${currentCycle})`,
      summary: activeConds.length
        ? `Personal telemetry scan confirmed active condition(s): ${activeConds.join(', ')}. Personal treatment protocols unlocked.`
        : 'Personal telemetry scan confirmed stable bio-aura baseline (+20% Aura Integrity).',
      institution: 'Faith Medical Group',
    });

    return {
      ok: true,
      message: 'Personal Bio-Aura Diagnostic Complete (+20% Aura Integrity). Active personal conditions calibrated for targeted treatment.',
    };
  },

  treatFaithCondition: (conditionName) => {
    const state = get();
    const player = state.gameplay.player;
    if (!player.faithDiagnosed) {
      return {
        ok: false,
        message: 'Clinical prerequisite unmet: Run your Personal Baseline Aura Diagnostic scan before administering personal treatment.',
      };
    }

    const currentConditions: string[] = Array.isArray(player.conditions) ? player.conditions : [];
    if (!currentConditions.includes(conditionName)) {
      return {
        ok: false,
        message: `No active "${conditionName}" detected in your personal bio-aura telemetry. Treatment unnecessary.`,
      };
    }

    const history: string[] = Array.isArray(player.treatedConditionsHistory) ? player.treatedConditionsHistory : [];
    const currentStamina = typeof player.stamina === 'number' ? player.stamina : 85;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          conditions: currentConditions.filter((c) => c !== conditionName),
          treatedConditionsHistory: [...history, `${conditionName}@Cycle${s.gameplay.timeCycleCount}`],
          auraHealth: Math.min(100, (s.gameplay.player.auraHealth || 100) + 25),
          stamina: Math.min(100, currentStamina + 10),
        },
      },
    }));

    get().recordWorldEvent({
      category: 'medical',
      title: `Personal Healthcare: Treated ${conditionName}`,
      summary: `Faith Medical personal care cleared ${conditionName} from citizen bio-aura (+25% Aura Integrity, +10 Stamina).`,
      institution: 'Faith Medical Group',
      impact: { corruptionDelta: -0.5 },
    });

    return {
      ok: true,
      message: `Personal clinical treatment applied! Cleared "${conditionName}" and restored +25% Aura Integrity & +10 Stamina.`,
    };
  },

  completePatientCareAssignment: (patientCaseId, diagnosisId, treatmentId) => {
    const state = get();
    const player = state.gameplay.player;
    const completedCare: string[] = Array.isArray(player.completedPatientCareIds) ? player.completedPatientCareIds : [];
    if (completedCare.includes(patientCaseId)) {
      return {
        ok: false,
        message: `Patient chart ${patientCaseId} has already been treated and signed off.`,
      };
    }

    const caseDef = PATIENT_CARE_ASSIGNMENTS.find((p) => p.id === patientCaseId);
    if (!caseDef) {
      return { ok: false, message: `Unknown patient chart ID: ${patientCaseId}.` };
    }

    const diagObj = caseDef.diagnoses.find((d) => d.id === diagnosisId);
    const txObj = caseDef.treatments.find((t) => t.id === treatmentId);
    if (!diagObj?.isCorrect || !txObj?.isCorrect) {
      return {
        ok: false,
        message: `Clinical mismatch for ${caseDef.patientName}: Re-evaluate presenting vitals (${caseDef.presentingVitals}) before administering treatment.`,
      };
    }

    const newXP = player.xp + caseDef.rewardXP;
    const newLevel = Math.floor(newXP / 100) + 1;
    const missionId = caseDef.linkedWorknetMissionId;
    const workOrder: WorkOrder | undefined = missionId ? player.worknetOrders?.[missionId] : undefined;
    const careReceipt: TaskResult | undefined = missionId ? {
      id: `WORK:${missionId}:once:care`, workOrderId: `WORK:${missionId}:once`,
      definitionId: missionId, stageId: 'care', subject: patientCaseId, mechanic: 'diagnostics',
      output: { diagnosis: diagObj.label, treatment: txObj.label }, completedAt: new Date().toISOString(), compensationPaid: true,
    } : undefined;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          completedPatientCareIds: [...completedCare, patientCaseId],
          taskResults: careReceipt ? { ...player.taskResults, [careReceipt.id]: careReceipt } : player.taskResults,
          worknetOrders: workOrder && careReceipt && missionId ? { ...player.worknetOrders, [missionId]: {
            ...workOrder, resultIds: [...new Set([...workOrder.resultIds, careReceipt.id])], timeRemaining: workOrder.timeRemaining - 1,
          } } : player.worknetOrders,
          credits: s.gameplay.player.credits + caseDef.rewardCredits,
          xp: newXP,
          level: newLevel,
        },
      },
    }));

    get().addCareerXP('medical', caseDef.rewardCareerXP);
    get().addSkillXP('Communication', 20);
    get().recordWorldEvent({
      category: 'medical',
      title: `Completed Inpatient Care: ${caseDef.patientName}`,
      summary: `Diagnosed "${diagObj.label}" and administered "${txObj.label}" (+${caseDef.rewardCareerXP} Medical Career XP, +${caseDef.rewardCredits} ₢).`,
      institution: 'Faith Medical Group // Clinical Care',
      citizenMaid: caseDef.patientMaid,
      impact: { reputationTrack: 'faith', reputationDelta: 10, corruptionDelta: -0.5 },
    });

    return {
      ok: true,
      message: `✓ Patient Care Completed for ${caseDef.patientName}! Earned +${caseDef.rewardCareerXP} Medical Career XP, +${caseDef.rewardCredits} ₢, and +10 Faith Medical Reputation.`,
    };
  },

  acceptMaiSpaceFriend: (friendId) => get().socialAction({ type: 'friend', person: friendId, decision: 'accept' }),
  updateMaiSpaceProfile: (updates) => set(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, maiSpaceProfile: { ...state.gameplay.player.maiSpaceProfile,
    ...(typeof updates.handle === 'string' ? { handle: updates.handle.slice(0, 80) } : {}),
    ...(typeof updates.statusThought === 'string' ? { statusThought: updates.statusThought.slice(0, 300) } : {}),
    ...(['Cookie', 'Yeseva One', 'Esteban'].includes(updates.headerFont) ? { headerFont: updates.headerFont } : {}),
  } } } })),
  postMaiSpaceBulletin: content => get().socialAction({ type: 'post', kind: 'bulletin', title: 'Bulletin', html: `<p>${String(content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`, audience: 'public' }),
  pingMaiSpaceFriend: () => ({ ok: false, message: 'Friendship grows through conversations and shared experiences. Open a profile or personal Messages.' }),

  claimPortalAction: (actionId, rewardCredits, rewardBits = 0, rewardXP = 0, label = 'Institutional Portal Action') => {
    const state = get();
    const player = state.gameplay.player;
    const claimed: string[] = Array.isArray(player.claimedPortalActionIds) ? player.claimedPortalActionIds : [];
    if (claimed.includes(actionId)) {
      return { ok: false, message: 'This institutional directive or stipend has already been claimed.' };
    }

    const newXP = player.xp + rewardXP;
    const newLevel = Math.floor(newXP / 100) + 1;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          claimedPortalActionIds: [...claimed, actionId],
          credits: s.gameplay.player.credits + rewardCredits,
          bits: (s.gameplay.player.bits || 0) + rewardBits,
          xp: newXP,
          level: newLevel,
        },
      },
    }));

    get().recordWorldEvent({
      category: 'civic',
      title: label,
      summary: `Verified portal action (${actionId}) for +${rewardCredits} ₢.`,
      institution: 'Aureline Intranet Portal',
    });

    return { ok: true, message: `${label} verified (+${rewardCredits} ₢).` };
  },

  submitInvestigationCase: (caseId, selectedEvidenceIds, hypothesisId) => {
    const state = get();
    const player = state.gameplay.player;
    const solvedIds: string[] = Array.isArray(player.solvedInvestigationCaseIds) ? player.solvedInvestigationCaseIds : [];
    if (solvedIds.includes(caseId)) {
      return { ok: false, verified: true, message: `Case ${caseId} has already been formally validated and closed.` };
    }

    const evalRes = worldEventEngine.evaluateCaseSubmission(caseId, selectedEvidenceIds, hypothesisId);
    if (!evalRes.ok || !evalRes.verified || !evalRes.caseDef) {
      return { ok: false, verified: false, message: evalRes.message };
    }

    const caseDef = evalRes.caseDef;
    const newXP = player.xp + caseDef.rewardXP;
    const newLevel = Math.floor(newXP / 100) + 1;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          solvedInvestigationCaseIds: [...solvedIds, caseId],
          credits: s.gameplay.player.credits + caseDef.rewardCredits,
          bits: (s.gameplay.player.bits || 0) + caseDef.rewardBits,
          xp: newXP,
          level: newLevel,
        },
      },
    }));

    get().addSkillXP('Research', 35);
    get().recordWorldEvent({
      category: 'forensic',
      title: `Validated Case Resolution: ${caseDef.title}`,
      summary: evalRes.message,
      institution: caseDef.institution,
      citizenMaid: caseDef.subjectMaid,
      impact: {
        reputationTrack: caseDef.reputationTrack,
        reputationDelta: 12,
        corruptionDelta: -1.5,
      },
    });

    return {
      ok: true,
      verified: true,
      message: `${evalRes.message} Awarded +${caseDef.rewardCredits} ₢, +${caseDef.rewardBits} ◈, and +${caseDef.rewardXP} XP.`,
    };
  },

  updateNPCVector: (npcId, vectorName, delta) =>
    set((state) => {
      const current = state.gameplay.player.npcVectors[npcId] || { friendship: 50, trust: 50, rivalry: 0, sync: 50, corruption: 0 };
      const val = Math.max(0, Math.min(100, (current[vectorName] || 0) + delta));
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            npcVectors: {
              ...state.gameplay.player.npcVectors,
              [npcId]: {
                ...current,
                [vectorName]: val,
              },
            },
          },
        },
      };
    }),

  updateReputationTrack: (trackName, delta) =>
    set((state) => {
      const currentReps = state.gameplay.player.reputation || { campus: 50, dga: 40, faith: 50, archive: 30, vector: 35, delegation: 25, orynvell: 10 };
      const val = Math.max(0, Math.min(100, (currentReps[trackName] || 0) + delta));
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            reputation: {
              ...currentReps,
              [trackName]: val,
            },
          },
        },
      };
    }),

  startSession: (gameId, initialState = {}) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        activeGameId: gameId,
        sessions: {
          ...state.gameplay.sessions,
          [gameId]: state.gameplay.sessions[gameId] || {
            startedAt: Date.now(),
            score: 0,
            ...initialState,
          },
        },
      },
    })),

  updateSession: (gameId, sessionData) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        sessions: {
          ...state.gameplay.sessions,
          [gameId]: {
            ...(state.gameplay.sessions[gameId] || {}),
            ...sessionData,
            updatedAt: Date.now(),
          },
        },
      },
    })),

  endSession: (gameId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        activeGameId: state.gameplay.activeGameId === gameId ? null : state.gameplay.activeGameId,
      },
    })),

  addCredits: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: Math.max(0, state.gameplay.player.credits + amount),
        },
      },
    })),

  addBits: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          bits: Math.max(0, (state.gameplay.player.bits || 0) + amount),
        },
      },
    })),

  addXP: (amount) =>
    set((state) => {
      const newXP = state.gameplay.player.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  completeActivity: (id) =>
    set((state) => {
      const activities = state.gameplay.player.activities || [];
      const item = activities.find((a: any) => a.id === id);
      if (!item || item.status !== 'IN_PROGRESS') return state;

      const newActivities = activities.map((a: any) =>
        a.id === id ? { ...a, status: 'COMPLETED' } : a
      );

      const addedCredits = Number(item.rewards?.credits ?? item.credits ?? 0);
      const addedXP = Number(item.rewards?.xp ?? item.xp ?? 0);
      const rewardItem = item.rewards?.item ?? item.item;
      const rewardItems = state.gameplay.player.rewardItems || [];
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      let newLocked = state.gameplay.lockedApps || [];
      const unlockApp = item.rewards?.unlockApp ?? item.unlockApp;
      if (unlockApp && newLocked.includes(unlockApp)) {
        newLocked = newLocked.filter((app: string) => app !== unlockApp);
      }

      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + addedCredits,
            xp: newXP,
            level: newLevel,
            rewardItems: rewardItem && !rewardItems.includes(rewardItem)
              ? [...rewardItems, rewardItem]
              : rewardItems,
            activities: newActivities,
          },
        },
      };
    }),

  completeNotice: (id) => {
    const state = get();
    const notice = NOTICES.find((candidate) => candidate.id === id);
    const player = state.gameplay.player;
    const completedIds = player.completedNoticeIds || [];
    if (!notice || notice.completed || completedIds.includes(id)) return false;

    const evaluation = evaluateNoticeObjective(player, id);
    if (!evaluation.met) return false;

    const xp = player.xp + (notice.rewardXP || 0);
    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          completedNoticeIds: [...completedIds, id],
          credits: s.gameplay.player.credits + (notice.rewardCredits || 0),
          bits: s.gameplay.player.bits + (notice.rewardBits || 0),
          xp,
          level: Math.floor(xp / 100) + 1,
        },
      },
    }));
    return true;
  },

  claimCommsAttachment: (commId, credits, xp) =>
    set((state) => {
      if (!commId || state.gameplay.claimedComms.includes(commId)) return state;
      const addedCredits = typeof credits === 'number' && credits > 0 ? credits : 0;
      const addedXP = typeof xp === 'number' && xp > 0 ? xp : 0;
      if (addedCredits <= 0 && addedXP <= 0) return state;
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          claimedComms: [...state.gameplay.claimedComms, commId],
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + addedCredits,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  advanceAppRank: (appKey) =>
    set((state) => {
      const currentRanks = state.gameplay.appRanks || { explorer: 1, weaver: 1, investigator: 1, research: 1, influence: 1, clearance: 1 };
      const currentRank = currentRanks[appKey] || 1;
      if (currentRank >= 5) return state;
      const nextRank = currentRank + 1;
      const addedXP = nextRank * 50;
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        gameplay: {
          ...state.gameplay,
          appRanks: {
            ...currentRanks,
            [appKey]: nextRank,
          },
          player: {
            ...state.gameplay.player,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  completeStarterLoop: (loopKey) =>
    set((state) => {
      const completed = state.gameplay.starterCompletedLoops || [];
      if (completed.includes(loopKey)) return state;
      const addedCredits = 150;
      const addedXP = 100;
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        gameplay: {
          ...state.gameplay,
          starterCompletedLoops: [...completed, loopKey],
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + addedCredits,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  purgePrismCorruption: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        prismCorruptionLevel: Math.max(2.0, Number((state.gameplay.prismCorruptionLevel - amount).toFixed(1))),
      },
    })),

  verifyDGAIdentity: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        lockedApps: state.gameplay.lockedApps.filter((a: string) => a !== 'passport' && a !== 'pulse'),
        player: {
          ...state.gameplay.player,
          dgaVerified: true,
          starterPhase: Math.max(1, state.gameplay.player.starterPhase),
        },
      },
    })),

  unlockApp: (appId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        lockedApps: state.gameplay.lockedApps.filter((a: string) => a !== appId),
      },
    })),

  completeIdentityScan: (data) =>
    set((state) => {
      if (state.gameplay.player.dgaVerified) return state;
      const newLocked = state.gameplay.lockedApps.filter((a: string) => a !== 'passport' && a !== 'pulse');
      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          onboardingPhase: Math.max(3, state.gameplay.onboardingPhase),
          identity: {
            ...state.gameplay.identity,
            ...data,
            citizenId: state.gameplay.identity.citizenId || data.citizenId || `CY-${Math.floor(1000 + Math.random() * 9000)}-CITIZEN`,
            barcode: state.gameplay.identity.barcode || data.barcode || `||| |||| || ||| ${Math.floor(100000 + Math.random() * 900000)}`,
            canonicalPersonId: state.gameplay.identity.canonicalPersonId,
          },
          player: {
            ...state.gameplay.player,
            dgaVerified: true,
            credits: state.gameplay.player.credits + 150,
            xp: state.gameplay.player.xp + 100,
            activities: state.gameplay.player.activities.map((act: any) => {
              if (act.id === 'Q_DAY1_3') return { ...act, status: 'COMPLETED' };
              if (act.id === 'Q_DAY1_4') return { ...act, status: 'IN_PROGRESS' };
              return act;
            }),
          },
        },
      };
    }),

  createPulseProfile: (profileData) =>
    set((state) => {
      const newLocked = state.gameplay.lockedApps.filter((a: string) => a !== 'pulse' && a !== 'comms');
      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          onboardingPhase: Math.max(4, state.gameplay.onboardingPhase),
          pulseProfile: {
            ...state.gameplay.pulseProfile,
            ...profileData,
          },
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + 100,
            xp: state.gameplay.player.xp + 75,
            activities: state.gameplay.player.activities.map((act: any) => {
              if (act.id === 'Q_DAY1_4') return { ...act, status: 'COMPLETED' };
              if (act.id === 'Q_DAY1_5') return { ...act, status: 'IN_PROGRESS' };
              return act;
            }),
          },
        },
      };
    }),

  selectMAITone: (tone) =>
    set((state) => {
      let trustDelta = 0;
      let friendshipDelta = 0;
      let rivalryDelta = 0;
      if (tone === 'friendly') { trustDelta = 15; friendshipDelta = 20; }
      else if (tone === 'neutral') { trustDelta = 5; }
      else if (tone === 'cold') { rivalryDelta = 25; trustDelta = -10; }

      return {
        gameplay: {
          ...state.gameplay,
          maiTone: tone,
          onboardingPhase: Math.max(5, state.gameplay.onboardingPhase),
          player: {
            ...state.gameplay.player,
            xp: state.gameplay.player.xp + 100,
            npcVectors: {
              ...state.gameplay.player.npcVectors,
              jeremie: {
                ...state.gameplay.player.npcVectors.jeremie,
                trust: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.trust + trustDelta)),
                friendship: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.friendship + friendshipDelta)),
                rivalry: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.rivalry + rivalryDelta)),
              },
            },
            activities: state.gameplay.player.activities.map((act: any) => {
              if (act.id === 'Q_DAY1_5') return { ...act, status: 'COMPLETED' };
              return act;
            }),
          },
        },
      };
    }),

  completeQuest: (questId) =>
    set((state) => {
      if (state.gameplay.player.completedQuests.includes(questId)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            completedQuests: [...state.gameplay.player.completedQuests, questId],
          },
        },
      };
    }),

  incrementHackedNodes: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          hackedNodes: state.gameplay.player.hackedNodes + 1,
        },
      },
    })),

  damageAura: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          auraHealth: Math.max(0, state.gameplay.player.auraHealth - amount),
        },
      },
    })),

  healAura: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          auraHealth: Math.min(100, state.gameplay.player.auraHealth + amount),
        },
      },
    })),

  addCondition: (name) =>
    set((state) => {
      if (state.gameplay.player.conditions.includes(name)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            conditions: [...state.gameplay.player.conditions, name],
          },
        },
      };
    }),

  removeCondition: (name) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          conditions: state.gameplay.player.conditions.filter((c: string) => c !== name),
        },
      },
    })),

  clearConditions: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          conditions: [],
        },
      },
    })),

  addForgedSpell: (name) =>
    set((state) => {
      if (state.gameplay.player.forgedSpells.includes(name)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            forgedSpells: [...state.gameplay.player.forgedSpells, name],
          },
        },
      };
    }),

  decryptLineage: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          lineageDecrypted: true,
        },
      },
    })),

  addSkillXP: (skillName, amount) =>
    set((state) => {
      const current = state.gameplay.player.skills[skillName] || { level: 1, xp: 0 };
      let newXP = current.xp + amount;
      const nextLevelXP = current.level * 150;
      let newLevel = current.level;
      if (newXP >= nextLevelXP) {
        newXP -= nextLevelXP;
        newLevel += 1;
      }
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            skills: {
              ...state.gameplay.player.skills,
              [skillName]: { level: newLevel, xp: newXP },
            },
          },
        },
      };
    }),

  // GAMEPLAY-013: Career XP measures experience & professional development.
  // Promotions are never automatically granted just for accumulating XP; they require
  // profession-specific qualifications evaluated via requestCareerPromotion(track).
  addCareerXP: (track, amount) =>
    set((state) => {
      const current = state.gameplay.player.careers[track] || {
        rankIndex: 0,
        xp: 0,
        title: CAREER_TRACK_SPECS[track]?.rankTitles?.[0] || track,
      };
      const newXP = Math.max(0, (current.xp || 0) + amount);
      const canonicalTitle =
        CAREER_TRACK_SPECS[track]?.rankTitles?.[current.rankIndex || 0] || current.title || track;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            careers: {
              ...state.gameplay.player.careers,
              [track]: {
                ...current,
                rankIndex: current.rankIndex || 0,
                xp: newXP,
                title: canonicalTitle,
              },
            },
          },
        },
      };
    }),

  requestCareerPromotion: (track) => {
    const state = get();
    const player = state.gameplay.player;
    const evalRes = evaluateCareerPromotion(track, player);
    if (!evalRes.canPromote || evalRes.nextRankIndex === null || !evalRes.nextTitle) {
      return {
        ok: false,
        message: evalRes.reason,
      };
    }

    const current = player.careers?.[track] || { rankIndex: 0, xp: 0 };
    const newPlayerXP = player.xp + 50;
    const newLevel = Math.floor(newPlayerXP / 100) + 1;

    set((s) => ({
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          credits: s.gameplay.player.credits + 150,
          xp: newPlayerXP,
          level: newLevel,
          careers: {
            ...s.gameplay.player.careers,
            [track]: {
              ...current,
              rankIndex: evalRes.nextRankIndex!,
              xp: current.xp || 0,
              title: evalRes.nextTitle!,
            },
          },
        },
      },
    }));

    get().recordWorldEvent({
      category: 'worknet',
      title: `Career Promotion: ${evalRes.nextTitle}`,
      summary: `${evalRes.reason} Promoted to Rank ${evalRes.nextRankIndex} (${evalRes.nextTitle}) in ${track.toUpperCase()}.`,
      institution: `WORKNET // ${track.toUpperCase()}`,
    });

    return {
      ok: true,
      newRankIndex: evalRes.nextRankIndex,
      newTitle: evalRes.nextTitle,
      pathwayLabel: evalRes.qualifiedPathway?.label,
      message: `Promoted to ${evalRes.nextTitle} (Rank ${evalRes.nextRankIndex}) via ${evalRes.qualifiedPathway?.label}! (+150 ₢ Stipend, +50 XP)`,
    };
  },

  advanceStarterPhase: (targetPhase) =>
    set((state) => {
      const current = state.gameplay.player.starterPhase || 0;
      const nextPhase = targetPhase !== undefined ? targetPhase : Math.min(5, current + 1);
      if (nextPhase <= current) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            starterPhase: nextPhase,
            credits: state.gameplay.player.credits + 100,
            xp: state.gameplay.player.xp + 50,
          },
        },
      };
    }),

  setHouseAffiliation: (house) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          houseAffiliation: house,
        },
      },
    })),

  updateActivityStatus: (activityId, status) =>
    set((state) => {
      const allowedStatuses = ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'];
      if (!allowedStatuses.includes(status)) return state;

      const activities = state.gameplay.player.activities || [];
      const activity = activities.find((act: any) => act.id === activityId);
      if (!activity || activity.status === 'COMPLETED' || status === 'COMPLETED') return state;

      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            activities: activities.map((act: any) =>
              act.id === activityId ? { ...act, status } : act
            ),
          },
        },
      };
    }),

  setMonth: (monthIndex) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          currentMonthIndex: (monthIndex + 12) % 12,
        },
      },
    })),

  advanceMonth: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          currentMonthIndex: ((state.gameplay.player.currentMonthIndex || 0) + 1) % 12,
        },
      },
    })),

  claimDailyReward: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: state.gameplay.player.credits + 200,
          xp: state.gameplay.player.xp + 100,
          dailyRewardLastClaimed: Date.now(),
        },
      },
    })),

  joinWorldEvent: (_eventId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: state.gameplay.player.credits + 300,
          xp: state.gameplay.player.xp + 150,
        },
      },
    })),

  incrementAppRank: (appName) =>
    set((state) => {
      const currentRanks = state.gameplay.player.appRanks || {
        explorer: 1,
        weaver: 1,
        investigator: 1,
        research: 1,
        influence: 1,
        clearance: 1,
      };
      const newRank = (currentRanks[appName] || 1) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            appRanks: {
              ...currentRanks,
              [appName]: newRank,
            },
          },
        },
      };
    }),

  // ------------------------------------------------------------------
  // Window Management & OS Controls
  // ------------------------------------------------------------------
  addWindow: (app) => {
    const destination = retiredWindowDestination(app);
    if (destination) { get().openAppWorkspace(destination.appId, destination.section); return; }
    set((state) => {
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, size: DEFAULT_WINDOW_SIZE, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow: OSWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: maxZ + 1,
      isMinimized: false,
      isMaximized: app.isMaximized ?? false,
      position: app.position || spawnPosition(state.windows.length),
      windowOffset: { x: 0, y: 0 },
      size: app.size || DEFAULT_WINDOW_SIZE,
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
    });
  },

  toggleApp: (appOrId: any) => {
    const destination = retiredWindowDestination(appOrId);
    if (destination) { get().openAppWorkspace(destination.appId, destination.section); return; }
    set((state) => {
    const appId = typeof appOrId === 'string' ? appOrId : appOrId?.id;
    if (!appId) return state;
    const appObj = typeof appOrId === 'object' ? appOrId : {};
    
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    const existing = state.windows.find((w) => w.id === appId);
    if (existing) {
      if (state.activeWindowId === appId && !existing.isMinimized) {
        return {
          windows: state.windows.map((w) =>
            w.id === appId ? { ...w, isMinimized: true } : w
          ),
          activeWindowId: state.windows.filter((w) => w.id !== appId && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null,
        };
      }
      return {
        windows: state.windows.map((w) =>
          w.id === appId ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: appId,
      };
    }

    const appTitles: Record<string, string> = {
      dgaos: 'DGAOS Command Center',
      documentStudio: 'Document Studio (Nine Documents)',
      meridionRegistry: 'AURA Citizen Registry',
      traceForensics: 'TRACE Forensic Workstation',
      jobs: 'Career Workstation',
      board: 'Master Notice Board',
      process: 'Process Monitor',
      housing: 'HOMECRAFT // Housing',
      spellforge: 'SpellForge Matrix',
      browser: 'Net Browser',
      mail: 'AureMail Mailbox',
      comms: 'Comms Portal',
      passport: 'Citizen Hub',
      pulse: 'Pulse',
      maispace: 'mai.space',
      files: 'File Explorer',
      lore: 'Lore Explorer (Cloud)',
      terminal: 'System Terminal',
      settings: 'System Settings',
    };

    const newWindow: OSWindow = {
      title: appObj.title || appTitles[appId] || appId,
      contentKey: appObj.contentKey || appId,
      ...appObj,
      id: appId,
      zIndex: maxZ + 1,
      isMinimized: false,
      isMaximized: appObj.isMaximized ?? false,
      position: appObj.position || spawnPosition(state.windows.length),
      windowOffset: { x: 0, y: 0 },
      size: appObj.size || DEFAULT_WINDOW_SIZE,
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
    });
  },

  closeWindow: (id) => set((state) => {
    const remaining = state.windows.filter((w) => w.id !== id);
    return {
      windows: remaining,
      activeWindowId:
        state.activeWindowId === id
          ? (remaining.slice().sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null)
          : state.activeWindowId,
    };
  }),

  focusWindow: (id) => set((state) => {
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    return {
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: DEFAULT_WINDOW_SIZE, zIndex: maxZ + 1, isMinimized: false } : w
      ),
      activeWindowId: id,
    };
  }),

  toggleMinimize: (id) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),

  toggleMaximize: (id) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ),
  })),

  moveWindow: (id, position) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, windowOffset: position } : w
    ),
  })),

  clearActive: () => set({ activeWindowId: null }),

  setWallpaper: (url) => set({ wallpaper: url }),
}), {
  name: 'miraverse-os-progress',
  version: 1,
  storage: createJSONStorage(() => osStorage),
  // Window metadata can contain React icons; recreate windows rather than serializing them.
  partialize: ({ gameplay, wallpaper, isLoggedIn, browserState, desktopPreferences, versenetContent, versenetSites }) => ({ gameplay, wallpaper, isLoggedIn, browserState, desktopPreferences, versenetContent, versenetSites }),
  merge: (persisted, current) => {
    const saved = persisted as Partial<OSStoreState> | null;
    return {
      ...current,
      desktopPreferences: restoreDesktopPreferences(saved?.desktopPreferences),
      versenetContent: restoreVersenetContent(saved?.versenetContent),
      versenetSites: restoreVersenetSites(saved?.versenetSites),
      browserState: restoreBrowserState(saved?.browserState),
      gameplay: mergeSavedProgress(current.gameplay, saved?.gameplay),
      wallpaper: typeof saved?.wallpaper === 'string' ? saved.wallpaper : current.wallpaper,
      isLoggedIn: typeof saved?.isLoggedIn === 'boolean' ? saved.isLoggedIn : current.isLoggedIn,
    };
  },
}));

registerCommunicationsAuthority(() => {
  const state = useOSStore.getState();
  return { player: state.gameplay.player, identity: state.gameplay.identity, isLoggedIn: state.isLoggedIn };
});
