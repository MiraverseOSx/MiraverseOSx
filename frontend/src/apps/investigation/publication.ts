import publication from '../../data/broad-street-public.json' with { type: 'json' };
export { publication };
export function publicCaseSearch(query: string) {
  const normalized = query.trim().toLowerCase();
  return ['first federal', 'firstfederal', 'broad street', 'maintenance', 'depository'].some(term => normalized.includes(term)) ? [{ id: 'public:broadstreet-maintenance', type: 'site', title: publication.title, summary: 'Published facilities arrangements and limits of public attendance information.', url: publication.url, publisher: publication.publisher }] : [];
}
