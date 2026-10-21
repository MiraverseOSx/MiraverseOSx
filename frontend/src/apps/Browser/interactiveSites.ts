export interface SiteField { id: string; label: string; kind: 'text' | 'select' | 'textarea' | 'number'; options?: string[]; required: boolean; min?: number; max: number }
export interface InteractiveSite { id: string; domain: string; name: string; publisher: string; tagline: string; description: string; interests: string[]; formTitle: string; formDescription: string; fields: SiteField[]; topics: string[] }
export const INTERACTIVE_SITES: InteractiveSite[] = [
  { id: 'companion', domain: 'companion.aure', name: 'Aureline Companion', publisher: 'Aureline Companion', tagline: 'A place for the people who share their homes.', description: 'Read neighborhood guides, keep a companion profile, and send a question to the community desk.', interests: ['Dogs', 'Cats', 'Other companions'], formTitle: 'Companion enquiry', formDescription: 'Keep a record of a question for the neighborhood companion desk. A received enquiry is not an adoption or service booking.', fields: [
    { id: 'animal', label: 'Companion type', kind: 'select', options: ['Dog', 'Cat', 'Other'], required: true, max: 30 },
    { id: 'topic', label: 'Enquiry topic', kind: 'select', options: ['Neighborhood walks', 'Shared housing', 'Community information'], required: true, max: 50 },
    { id: 'message', label: 'Your question', kind: 'textarea', required: true, min: 10, max: 1200 },
  ], topics: ['dog','cat','housing'] },
  { id: 'garden', domain: 'gardenreview.aure', name: 'Glassline Garden Review', publisher: 'Glassline Garden Review', tagline: 'A little time among growing things.', description: 'Browse garden notes, create a visitor profile, and request a public garden visit.', interests: ['Plant observation', 'Sketching', 'Community visits'], formTitle: 'Garden visit request', formDescription: 'Request a preferred visit period. Your copy records your preference; a place is not reserved.', fields: [
    { id: 'purpose', label: 'Visit purpose', kind: 'select', options: ['Plant observation', 'Sketch walk', 'Community orientation'], required: true, max: 50 },
    { id: 'period', label: 'Preferred period', kind: 'select', options: ['Morning', 'Afternoon', 'Evening'], required: true, max: 30 },
    { id: 'party', label: 'Visitors in your group', kind: 'number', required: true, min: 1, max: 8 },
    { id: 'notes', label: 'Questions or notes', kind: 'textarea', required: false, max: 1200 },
  ], topics: ['plants','animals','travel'] },
  { id: 'reading', domain: 'readingroom.aure', name: 'Aureline Open Reading Room', publisher: 'Aureline Open Reading Room', tagline: 'Keep a question. Follow a source.', description: 'Build your reader profile and keep research requests beside your public reading collections.', interests: ['Local history', 'Public research', 'Study methods'], formTitle: 'Research request', formDescription: 'Describe a question for the public reading room. Requests concern open collections and do not grant access to sealed archives.', fields: [
    { id: 'subject', label: 'Research subject', kind: 'text', required: true, min: 3, max: 120 },
    { id: 'collection', label: 'Public collection', kind: 'select', options: ['Local history', 'City services', 'Technology'], required: true, max: 50 },
    { id: 'format', label: 'Requested material', kind: 'select', options: ['Reading list', 'Source comparison', 'Document collection'], required: true, max: 50 },
    { id: 'question', label: 'Your research question', kind: 'textarea', required: true, min: 10, max: 1200 },
  ], topics: ['education','history','technology'] },
];
export const siteDefinition = (id: string) => INTERACTIVE_SITES.find(site => site.id === id);
export interface SiteProfile { siteId: string; owner: string; displayName: string; handle: string; about: string; interest: string; createdAt: string; updatedAt: string }
export type SiteValues = Record<string, string>;
export interface SiteSubmission { id: string; siteId: string; owner: string; profileName: string; formTitle: string; values: SiteValues; status: 'Received' | 'Withdrawn'; createdAt: string; updatedAt: string; revisions: number }
export interface SiteDraft { siteId: string; owner: string; editId: string; values: SiteValues; updatedAt: string }
export interface VersenetSites { profiles: Record<string, SiteProfile>; submissions: Record<string, SiteSubmission>; drafts: Record<string, SiteDraft>; nextId: number }
export const emptyVersenetSites = (): VersenetSites => ({ profiles: {}, submissions: {}, drafts: {}, nextId: 1 });
// The game resumes characters by name; a later civic ID must not detach their site records.
export function siteOwner(gameplay: any): string { return `character:${String(gameplay?.player?.name || gameplay?.identity?.citizenId || 'guest').normalize('NFKC').trim().toLowerCase()}`; }
export const siteProfileKey = (siteId: string, owner: string) => `${siteId}::${owner}`;
export const siteDraftKey = (siteId: string, owner: string, editId = '') => `${siteProfileKey(siteId, owner)}::${editId || 'new'}`;
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function validateSiteProfile(site: InteractiveSite, input: unknown) {
  const raw = object(input); const errors: Record<string,string> = {};
  const text = (key: string) => typeof raw[key] === 'string' ? raw[key].trim() : '';
  const profile = { displayName: text('displayName'), handle: text('handle').toLowerCase(), about: text('about'), interest: text('interest') };
  if (!profile.displayName || profile.displayName.length > 60) errors.displayName = 'Enter a display name of 1–60 characters.';
  if (!/^[a-z0-9_]{3,24}$/.test(profile.handle)) errors.handle = 'Use 3–24 letters, numbers, or underscores.';
  if (profile.about.length > 500) errors.about = 'Keep your introduction within 500 characters.';
  if (!site.interests.includes(profile.interest)) errors.interest = 'Choose an interest from this site.';
  return { profile, errors };
}
export function validateSiteValues(site: InteractiveSite, input: unknown, partial = false) {
  const raw = object(input); const values: SiteValues = {}; const errors: Record<string,string> = {};
  for (const field of site.fields) {
    const value = typeof raw[field.id] === 'string' ? raw[field.id].trim() : '';
    values[field.id] = value;
    if (!value) { if (field.required && !partial) errors[field.id] = 'This field is required.'; continue; }
    if (field.kind === 'select' && !field.options?.includes(value)) errors[field.id] = 'Choose one of the available options.';
    else if (field.kind === 'number' && (!/^\d+$/.test(value) || Number(value) < (field.min || 1) || Number(value) > field.max)) errors[field.id] = `Enter a whole number from ${field.min || 1} to ${field.max}.`;
    else if (field.kind !== 'number' && (value.length > field.max || (!partial && value.length < (field.min || 0)))) errors[field.id] = `Use ${field.min || 0}–${field.max} characters.`;
  }
  return { values, errors };
}
export function restoreVersenetSites(saved: unknown): VersenetSites {
  const result = emptyVersenetSites(); const data = object(saved);
  const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  for (const [key, value] of Object.entries(object(data.profiles))) {
    const profile = object(value); const site = siteDefinition(String(profile.siteId));
    if (!site || typeof profile.owner !== 'string' || !profile.owner.startsWith('character:') || key !== siteProfileKey(site.id, profile.owner) || !date(profile.createdAt) || !date(profile.updatedAt)) continue;
    const checked = validateSiteProfile(site, profile); if (Object.keys(checked.errors).length) continue;
    result.profiles[key] = { ...checked.profile, siteId: site.id, owner: profile.owner, createdAt: profile.createdAt as string, updatedAt: profile.updatedAt as string };
  }
  for (const [id, value] of Object.entries(object(data.submissions))) {
    const item = object(value); const site = siteDefinition(String(item.siteId));
    if (!site || item.id !== id || !/^SR-[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id.slice(3))) || typeof item.owner !== 'string' || !result.profiles[siteProfileKey(site.id, item.owner)] || !['Received','Withdrawn'].includes(String(item.status)) || !date(item.createdAt) || !date(item.updatedAt)) continue;
    const checked = validateSiteValues(site, item.values); if (Object.keys(checked.errors).length) continue;
    result.submissions[id] = { id, siteId: site.id, owner: item.owner, profileName: typeof item.profileName === 'string' ? item.profileName.slice(0,60) : result.profiles[siteProfileKey(site.id, item.owner)].displayName, formTitle: site.formTitle, values: checked.values, status: item.status as SiteSubmission['status'], createdAt: item.createdAt as string, updatedAt: item.updatedAt as string, revisions: typeof item.revisions === 'number' && Number.isSafeInteger(item.revisions) && item.revisions >= 0 ? Number(item.revisions) : 0 };
    result.nextId = Math.max(result.nextId, Number(id.slice(3)) + 1);
  }
  for (const [key, value] of Object.entries(object(data.drafts))) {
    const draft = object(value); const site = siteDefinition(String(draft.siteId));
    if (!site || typeof draft.owner !== 'string' || !result.profiles[siteProfileKey(site.id, draft.owner)] || typeof draft.editId !== 'string' || key !== siteDraftKey(site.id, draft.owner, draft.editId) || !date(draft.updatedAt)) continue;
    if (draft.editId && (result.submissions[draft.editId]?.owner !== draft.owner || result.submissions[draft.editId]?.siteId !== site.id)) continue;
    const checked = validateSiteValues(site, draft.values, true); if (Object.keys(checked.errors).length) continue;
    result.drafts[key] = { siteId: site.id, owner: draft.owner, editId: draft.editId, values: checked.values, updatedAt: draft.updatedAt as string };
  }
  return result;
}
