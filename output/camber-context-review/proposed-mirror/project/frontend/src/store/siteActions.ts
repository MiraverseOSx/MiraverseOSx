import { siteDefinition, siteOwner, siteProfileKey, siteDraftKey, validateSiteProfile, validateSiteValues, type SiteSubmission } from '../apps/Browser/interactiveSites';
export interface SiteActionResult { ok: boolean; message: string; id?: string; errors?: Record<string,string> }
export interface SiteActions {
  registerSiteProfile: (siteId: string, input: unknown) => SiteActionResult;
  updateSiteProfile: (siteId: string, input: unknown) => SiteActionResult;
  saveSiteDraft: (siteId: string, input: unknown, editId?: string) => SiteActionResult;
  submitSiteForm: (siteId: string, input: unknown, editId?: string) => SiteActionResult;
  setSiteSubmissionStatus: (id: string, status: SiteSubmission['status']) => SiteActionResult;
}
export function createSiteActions(set: any, get: any): SiteActions {
  const unavailable = (): SiteActionResult => ({ ok: false, message: 'This page or record is not available for this character.' });
  const context = (siteId: string) => {
    const state = get(); const site = siteDefinition(siteId); const owner = siteOwner(state.gameplay);
    return { state, site, owner, key: siteProfileKey(siteId, owner), profile: state.versenetSites.profiles[siteProfileKey(siteId, owner)] };
  };
  const profileAction = (siteId: string, input: unknown, updating: boolean): SiteActionResult => {
    const { state, site, owner, key, profile } = context(siteId);
    if (!state.isLoggedIn || !site) return unavailable();
    if (!updating && profile) return { ok: false, message: 'You already have a profile here. Open My profile to edit it.' };
    if (updating && !profile) return unavailable();
    const checked = validateSiteProfile(site, input);
    if (Object.values(state.versenetSites.profiles).some((item: any) => item.siteId === siteId && item.owner !== owner && item.handle === checked.profile.handle)) checked.errors.handle = 'That handle is already in use on this site.';
    if (Object.keys(checked.errors).length) return { ok: false, message: 'Check the highlighted profile fields.', errors: checked.errors };
    const now = new Date().toISOString();
    set((s: any) => ({ versenetSites: { ...s.versenetSites, profiles: { ...s.versenetSites.profiles, [key]: { ...checked.profile, siteId, owner, createdAt: profile?.createdAt || now, updatedAt: now } } } }));
    return { ok: true, message: updating ? 'Profile updated.' : 'Your site profile is ready.' };
  };
  const owns = (record: SiteSubmission | undefined, siteId: string, owner: string) => record?.owner === owner && record?.siteId === siteId;
  return {
    registerSiteProfile: (siteId, input) => profileAction(siteId, input, false),
    updateSiteProfile: (siteId, input) => profileAction(siteId, input, true),
    saveSiteDraft: (siteId, input, editId = '') => {
      const { state, site, owner, profile } = context(siteId);
      if (!state.isLoggedIn || !site || !profile || (editId && (!owns(state.versenetSites.submissions[editId], siteId, owner) || state.versenetSites.submissions[editId].status !== 'Received'))) return unavailable();
      const checked = validateSiteValues(site, input, true);
      if (Object.keys(checked.errors).length) return { ok: false, message: 'Check the highlighted fields before saving.', errors: checked.errors };
      const key = siteDraftKey(siteId, owner, editId);
      set((s: any) => ({ versenetSites: { ...s.versenetSites, drafts: { ...s.versenetSites.drafts, [key]: { siteId, owner, editId, values: checked.values, updatedAt: new Date().toISOString() } } } }));
      return { ok: true, message: 'Draft saved. You can return to it later.' };
    },
    submitSiteForm: (siteId, input, editId = '') => {
      const { state, site, owner, profile } = context(siteId);
      const previous = editId ? state.versenetSites.submissions[editId] : undefined;
      if (!state.isLoggedIn || !site || !profile || (editId && (!owns(previous, siteId, owner) || previous.status !== 'Received'))) return unavailable();
      const checked = validateSiteValues(site, input);
      if (Object.keys(checked.errors).length) return { ok: false, message: 'Check the highlighted fields before submitting.', errors: checked.errors };
      const duplicate = !editId && Object.values(state.versenetSites.submissions).find((record: any) => owns(record, siteId, owner) && record.status === 'Received' && JSON.stringify(record.values) === JSON.stringify(checked.values)) as SiteSubmission | undefined;
      const id = duplicate?.id || previous?.id || `SR-${state.versenetSites.nextId}`;
      const now = new Date().toISOString();
      const unchanged = previous && JSON.stringify(previous.values) === JSON.stringify(checked.values);
      const record: SiteSubmission = duplicate || (unchanged ? previous : { id, siteId, owner, profileName: profile.displayName, formTitle: site.formTitle, values: checked.values, status: 'Received', createdAt: previous?.createdAt || now, updatedAt: now, revisions: previous ? previous.revisions + 1 : 0 });
      set((s: any) => {
        const drafts = { ...s.versenetSites.drafts }; delete drafts[siteDraftKey(siteId, owner, editId)];
        return { versenetSites: { ...s.versenetSites, submissions: { ...s.versenetSites.submissions, [id]: record }, nextId: !previous && !duplicate ? s.versenetSites.nextId + 1 : s.versenetSites.nextId, drafts } };
      });
      return { ok: true, id, message: duplicate ? 'This request is already in your records.' : previous ? 'Request updated.' : 'Request received. A copy is in My records.' };
    },
    setSiteSubmissionStatus: (id, status) => {
      const state = get(); const record = state.versenetSites.submissions[id]; const owner = siteOwner(state.gameplay);
      if (!state.isLoggedIn || !record || record.owner !== owner || !['Received','Withdrawn'].includes(status)) return unavailable();
      set((s: any) => ({ versenetSites: { ...s.versenetSites, submissions: { ...s.versenetSites.submissions, [id]: { ...record, status, updatedAt: new Date().toISOString() } } } }));
      return { ok: true, id, message: status === 'Withdrawn' ? 'Request withdrawn. Your copy is retained.' : 'Request reopened.' };
    },
  };
}
