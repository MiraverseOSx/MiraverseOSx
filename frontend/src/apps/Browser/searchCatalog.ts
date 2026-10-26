import { TOPIC_PACKS, type TopicPack } from './searchTopics';

export const SEARCH_VERSION = 1;
export const SEARCH_FILTERS = ['All', 'Sites', 'Images', 'Files', 'Maps', 'People', 'Archives'] as const;
export type SearchFilter = typeof SEARCH_FILTERS[number];
export interface WebRecord {
  id: string; url: string; type: 'site' | 'image' | 'document' | 'folder' | 'map'; title: string;
  summary: string; publisher: string; paragraphs: string[]; children?: string[];
  art?: string; seed?: number; photo?: string; credit?: string; source?: string;
  places?: { name: string; description: string; x: number; y: number; url: string }[];
}
export interface SearchBundle { key: string; query: string; topic: string; label: string; version: number; records: WebRecord[] }
export interface WebFile { id: string; name: string; type: string; size: string; desc: string; dir: string; body: string; webUrl: string; publisher: string }
export interface VersenetContent { catalog: Record<string, SearchBundle>; savedFiles: Record<string, WebFile> }
export interface ExternalSearchLink { id: string; title: string; url: string; keywords: string[]; description: string }
// User-selected links can be added here. This is not a public-web search service.
export const EXTERNAL_SEARCH_LINKS: ExternalSearchLink[] = [];
export function canSearchArchive(id: string, player: any): boolean {
  if (id === 'ARC-004') return true; // Public clinical-study catalog entry, not a patient chart.
  if (id === 'ARC-001') return Boolean(player?.worldJournal?.entries?.['old-factory-lead']);
  return false; // Sealed, financial, and operational records have no public release rule.
}
export function matchingExternalLinks(query: string, links = EXTERNAL_SEARCH_LINKS) {
  const q = normalizeSearch(query);
  return q ? links.filter(link => /^https?:\/\//.test(link.url) && link.keywords.some(word => q.includes(normalizeSearch(word)) && normalizeSearch(word))) : [];
}
export function normalizeSearch(query: unknown): string { return String(query ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase().slice(0, 512); }
export function searchHash(text: string): number { let hash = 2166136261; for (const char of text) { hash ^= char.codePointAt(0)!; hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function topicFor(query: string) {
  const words: string[] = query.match(/[\p{L}\p{N}]+/gu) ?? [];
  return TOPIC_PACKS.find(pack => pack.aliases.includes(query)) || TOPIC_PACKS.find(pack => pack.aliases.some(alias => words.includes(alias)));
}
export function searchKey(input: string): string {
  const query = normalizeSearch(input); const topic = topicFor(query);
  return topic?.id || `query-${searchHash(query).toString(36)}-${searchHash([...query].reverse().join('')).toString(36)}`;
}
function researchPack(query: string, seed: number): TopicPack {
  const approaches = [
    { title: 'An observation notebook', intro: 'Start with what can be seen, described, and compared.', steps: ['Describe one observable detail.', 'Record where the observation came from.', 'Compare it with a second source.', 'Keep interpretations separate from observations.'] },
    { title: 'A source trail', intro: 'Follow a name through catalogs, references, and public collections.', steps: ['Record the original spelling and context.', 'Look for alternate names in public indexes.', 'Compare the authors behind two references.', 'Keep a source list with unresolved questions.'] },
    { title: 'A comparison folio', intro: 'Build understanding by comparing explanations rather than guessing.', steps: ['Write a focused comparison question.', 'Choose two accounts with named sources.', 'Note their agreements and differences.', 'Record which evidence would resolve the difference.'] },
  ];
  const approach = approaches[seed % approaches.length];
  return { id: 'research', label: query, aliases: [], publisher: 'Aureline Open Reading Room', headline: `${query} — ${approach.title.toLowerCase()}`, introduction: approach.intro,
    paragraphs: [`This reading-room collection keeps the search phrase “${query}” as a research heading. It is a place to organize a question, not a claim that the phrase names an established person, place, or event in Aureline.`,
      `${approach.intro} The collection supplies a working method, a source sheet, and public places to continue looking. Its artwork is an abstract study from the visual archive; it is not a photograph of “${query}”.`,
      `Use the notebook to preserve what you find about “${query}”. The public library and civic information desk offer starting points without exposing sealed records or private systems.`],
    guide: `${query} — working source sheet`, steps: approach.steps, places: seed % 2 ? ['Aureline City Library', 'CIVINET public desk', 'Glassline Botanical Garden'] : ['CIVINET public desk', 'Glassline transit platform', 'Aureline City Library'], related: ['education', 'history', 'technology'][seed % 3] };
}
export function generateSearchBundle(input: string): SearchBundle | null {
  const query = normalizeSearch(input); if (!query) return null;
  const key = searchKey(query); const seed = searchHash(key); const topic = topicFor(query); const pack = topic || researchPack(query, seed);
  const records: WebRecord[] = [];
  const add = (slug: string, type: WebRecord['type'], title: string, summary: string, paragraphs: string[], extra: Partial<WebRecord> = {}) => {
    const id = `${key}:${slug}`;
    const address = new URL(`https://fieldnotes.aure/${key}/${slug}`); address.searchParams.set('title', title);
    records.push({ id, url: address.href, type, title, summary, publisher: pack.publisher, paragraphs, ...extra });
    return id;
  };
  add('overview', 'site', pack.headline, pack.introduction, pack.paragraphs);
  add('field-guide', 'site', pack.guide, pack.steps[0], [`${pack.introduction} This practical notebook accompanies the ${pack.label} collection.`, ...pack.steps.map((step, index) => `${index + 1}. ${step}`)]);
  const document = add('notebook', 'document', `${pack.label} — notebook.txt`, 'A printable observation and planning sheet.', ['Collection: ' + pack.label, 'Purpose: ' + pack.introduction, ...pack.steps.map(step => `□ ${step}`), 'Notes: Keep your observations and source references here.']);
  const sourceSheet = add('sources', 'document', `${pack.label} — sources.txt`, 'A source card for comparing public references.', ['Research heading: ' + pack.label, 'Source title: ____________________', 'Author or organization: ____________________', 'Public address: ____________________', 'What the source says: ____________________', 'What remains uncertain: ____________________']);
  add('collection', 'folder', `${pack.label} — reading folder`, 'Two documents, their source pages, and a place to keep notes.', ['This collection contains a working notebook and a source-comparison sheet. Save the folder to keep both documents in File Explorer.'], { children: [document, sourceSheet] });
  if (pack.id === 'lyria' || pack.id === 'plants') add('sunflower', 'image', 'Botanical Flora — reference study', 'A crystalline flora study from the Lyrian botanical library.', [], { photo: '/images/versenet/sunflower.jpg', art: 'lyria', credit: 'Miraverse Botanical Collection · Archival record', source: 'https://faithmed.aure/botany' });
  add('study', 'image', topic ? `${pack.label} — illustrated study` : `${query} — abstract study`, topic ? 'An original illustration from the collection.' : 'Abstract artwork accompanying this research heading, not a literal depiction.', [], { art: pack.id, seed, credit: 'Miraverse visual collection · Original SVG illustration' });
  add('diagram', 'image', topic ? `${pack.label} — visual notebook` : `${query} — visual connections`, 'A second illustration from the visual notebook.', [], { art: pack.id, seed: seed + 1, credit: 'Miraverse visual collection · Original SVG illustration' });
  const places = pack.places.map((name, index) => {
    const description = name.includes('Garden') || name.includes('Grove')
      ? 'Public paths for botanical observation, bio-aura restoration, and quiet study.'
      : name.includes('Archive') || name.includes('Library')
      ? 'Public reading room and source-comparison historical resources.'
      : name.includes('Citadel') || name.includes('Bastion')
      ? 'Civic administration and security verification gateway.'
      : name.includes('Warehouse') || name.includes('Spire') || name.includes('Factory')
      ? 'Industrial logistics sector; check transit clearance before entry.'
      : 'Public information and municipal access desk.';
    const id = add(`place-${index}`, 'site', name, description, [description, `This public listing accompanies the ${pack.label} reading collection. The schematic map provides orientation rather than a measured route. Consult the location’s posted guidance when visiting.`, name.includes('Archive') ? 'The open reading room offers public catalogs and space to compare sources. Sealed collections are not part of this listing.' : 'Only public areas are described here. Browsing this listing does not visit the location, start an assignment, or change your world progress.']);
    return { name, x: [24, 66, 49][index], y: [32, 49, 77][index], description, url: records.find(record => record.id === id)!.url };
  });
  add('map', 'map', topic ? `${pack.label} — places in Aureline` : `${query} — public research map`, topic ? 'Public places associated with this collection.' : 'Public starting points for research, not exact matches for this phrase.', ['Schematic city map. Positions and distances are illustrative; no hidden places or restricted interiors are shown.'], { places });
  add('related', 'site', `Continue reading: ${pack.label}`, 'Follow the collection into related public reading.', [`The ${pack.label} collection can be read alongside the ${pack.related} notebook. Compare the methods, places, and observations rather than assuming a shared label proves a connection.`, 'The documents in the reading folder keep a record of your own comparisons. All public browsing here is separate from assignments and formal progression.']);
  return { key, query: topic ? topic.aliases[0] : query, topic: pack.id, label: pack.label, version: SEARCH_VERSION, records };
}
export const emptyVersenetContent = (): VersenetContent => ({ catalog: {}, savedFiles: {} });
export function getSearchBundle(content: VersenetContent, query: string) { const key = searchKey(query); return Object.hasOwn(content.catalog, key) ? content.catalog[key] : generateSearchBundle(query); }
export function findWebRecord(content: VersenetContent, url: string) { return Object.values(content.catalog).flatMap(bundle => bundle.records).find(record => record.url === url); }
export function webFilesFor(content: VersenetContent, id: string): WebFile[] {
  const bundle = Object.values(content.catalog).find(bundle => bundle.records.some(record => record.id === id));
  const record = bundle?.records.find(record => record.id === id);
  if (!bundle || !record || !['folder', 'document'].includes(record.type)) return [];
  const folder = bundle.records.find(item => item.type === 'folder');
  if (!folder) return [];
  const dir = `/downloads/versenet/${bundle.key}`;
  const documents = record.type === 'folder' ? bundle.records.filter(item => item.type === 'document' && record.children?.includes(item.id)) : [record];
  const file = (item: WebRecord, directory: string): WebFile => ({ id: `web:${item.id}`, name: `${bundle.label.slice(0, 80)} — ${item.type === 'folder' ? 'reading folder' : `${item.id.split(':').at(-1)}.txt`}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_'), type: item.type === 'folder' ? 'folder' : 'txt', dir: directory, size: item.type === 'folder' ? `${documents.length} files` : `${Math.max(1, Math.ceil(item.paragraphs.join('\n').length / 1024))} KB`, desc: item.summary, body: `${item.title}\n\n${item.paragraphs.join('\n\n')}\n\nPublisher: ${item.publisher}\nSource: ${item.url}`, webUrl: item.url, publisher: item.publisher });
  return [file(folder, '/downloads/versenet'), ...documents.map(item => file(item, dir))];
}
export function countWebFolders(files: Record<string, WebFile>): Record<string, WebFile> {
  return Object.fromEntries(Object.entries(files).map(([id, file]) => {
    if (file.type !== 'folder') return [id, file];
    const dir = `/downloads/versenet/${id.slice(4).split(':')[0]}`;
    const count = Object.values(files).filter(child => child.type !== 'folder' && child.dir === dir).length;
    return [id, { ...file, size: `${count} ${count === 1 ? 'file' : 'files'}` }];
  }));
}
function validWebRecord(record: WebRecord, key: string): boolean {
  if (!record || typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.summary !== 'string' || typeof record.publisher !== 'string') return false;
  if (typeof record.url !== 'string' || !record.url.startsWith(`https://fieldnotes.aure/${key}/`) || !['site','image','document','folder','map'].includes(record.type)) return false;
  if (!Array.isArray(record.paragraphs) || !record.paragraphs.every(text => typeof text === 'string')) return false;
  if (record.children !== undefined && (!Array.isArray(record.children) || !record.children.every(id => typeof id === 'string'))) return false;
  if (record.places !== undefined && (!Array.isArray(record.places) || !record.places.every(place => place && typeof place.name === 'string' && typeof place.description === 'string' && typeof place.url === 'string' && place.url.startsWith(`https://fieldnotes.aure/${key}/`) && Number.isFinite(place.x) && Number.isFinite(place.y)))) return false;
  if (record.photo !== undefined && !['/images/versenet/labrador.jpg','/images/versenet/sunflower.jpg'].includes(record.photo)) return false;
  if (record.source !== undefined && (typeof record.source !== 'string' || !record.source.startsWith('https://commons.wikimedia.org/wiki/'))) return false;
  return ['art','credit'].every(field => record[field] === undefined || typeof record[field] === 'string') && (record.seed === undefined || Number.isFinite(record.seed));
}
function validCollection(bundle: SearchBundle): boolean {
  const records = bundle.records;
  if (!records.every(record => validWebRecord(record, bundle.key) && record.id.startsWith(`${bundle.key}:`))) return false;
  if (new Set(records.map(record => record.id)).size !== records.length || new Set(records.map(record => record.url)).size !== records.length) return false;
  if (records.some(record => record.type === 'document') && !records.some(record => record.type === 'folder')) return false;
  return records.every(record =>
    (record.children || []).every(id => records.some(child => child.id === id && child.type === 'document')) &&
    (record.places || []).every(place => records.some(target => target.url === place.url && target.type === 'site')));
}
export function restoreVersenetContent(saved: unknown): VersenetContent {
  const result = emptyVersenetContent(); if (!saved || typeof saved !== 'object') return result;
  const data = saved as Partial<VersenetContent>;
  for (const [key, bundle] of Object.entries(data.catalog || {})) {
    if (!/^(dog|cat|animals|plants|food|housing|travel|technology|education|health|work|history|query-[a-z0-9]+-[a-z0-9]+)$/.test(key) || !bundle || bundle.key !== key || !Array.isArray(bundle.records) || !bundle.records.length) continue;
    if (typeof bundle.label !== 'string' || typeof bundle.query !== 'string' || typeof bundle.topic !== 'string' || !Number.isFinite(bundle.version)) continue;
    if (validCollection(bundle)) result.catalog[key] = bundle;
  }
  // Rebuild saved files from their source records rather than accepting executable or assignment-like fields.
  for (const value of Object.values(data.savedFiles || {})) {
    if (value && typeof value.id === 'string' && value.id.startsWith('web:')) {
      for (const file of webFilesFor(result, value.id.slice(4))) if (file.id === value.id) result.savedFiles[file.id] = file;
    }
  }
  result.savedFiles = countWebFolders(result.savedFiles);
  return result;
}
