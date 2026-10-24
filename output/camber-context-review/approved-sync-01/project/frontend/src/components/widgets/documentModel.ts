export const DOCUMENT_KINDS: Record<string, string> = {
  txt: 'note', log: 'log', osform: 'form', map: 'map', node: 'map', grid: 'map',
  diag: 'clinical', aura: 'clinical', arch: 'archive', mod: 'code', spell: 'code', sys: 'code',
  prism: 'alert', corrupt: 'alert', veil: 'alert',
};
export function normalizeDocument(source: any) {
  const name = source.name || source.filename || source.title || 'Untitled document';
  const type = String(source.type || source.extension || name.split('.').pop() || 'doc').replace(/^\./, '').toLowerCase();
  const raw = source.content;
  const sections = Array.isArray(raw?.sections) ? raw.sections.filter(section => section && typeof section.body === 'string') : [];
  const bodyText = typeof raw === 'string' ? raw : typeof raw?.bodyText === 'string' ? raw.bodyText : sections.map(s => `${s.title}\n${s.body}`).join('\n\n');
  return { ...source, name, type, extension: `.${type}`, kind: DOCUMENT_KINDS[type] || 'document',
    meta: { classification: source.category || 'Personal document', author: source.author || 'Not recorded', timestamp: source.date || 'Not recorded', ...source.meta },
    security: { isEncrypted: source.isEncrypted === true, requiredLevel: 3, ...source.security },
    content: { ...(typeof raw === 'object' && raw ? raw : {}), title: raw?.title || source.title || name, subtitle: raw?.subtitle || source.summary || source.desc || '', sections, bodyText },
  };
}
