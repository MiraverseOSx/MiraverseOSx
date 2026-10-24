import MiniSearch from 'minisearch';

export interface PublicSearchDocument { id: string; title: string; summary: string; publisher: string; keywords?: string }
/** Callers must supply public/authorized records only. This module never reads player saves. */
export function createPublicSearch<T extends PublicSearchDocument>(documents: T[]) {
  const records = new Map(documents.map(document => [document.id, document]));
  const index = new MiniSearch({ fields: ['title', 'summary', 'publisher', 'keywords'], searchOptions: { boost: { title: 3, keywords: 2 }, prefix: true, fuzzy: 0.3, combineWith: 'AND' } });
  index.addAll([...records.values()]);
  return (query: string): T[] => query.trim() ? index.search(query.slice(0, 512)).map(hit => records.get(String(hit.id))!).filter(Boolean) : [];
}
