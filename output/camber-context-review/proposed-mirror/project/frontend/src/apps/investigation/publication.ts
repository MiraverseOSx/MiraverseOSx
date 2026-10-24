import publication from '../../data/broad-street-public.json' with { type: 'json' };
import { createPublicSearch } from '../Browser/publicSearch';
export { publication };
const search = createPublicSearch([{ id: 'public:broadstreet-maintenance', type: 'site', title: publication.title, summary: 'Published facilities arrangements and limits of public attendance information.', url: publication.url, publisher: publication.publisher, keywords: 'first federal firstfederal broad street maintenance depository' }]);
export function publicCaseSearch(query: string) {
  return search(query).map(({ keywords, ...record }) => record);
}
