const allowed = new Set(['p', 'div', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'blockquote']);
export const escapeMailText = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function decode(value: string) {
  return value.replace(/&(amp|lt|gt|quot|apos|nbsp|#\d+|#x[0-9a-f]+);/gi, (match, entity) => {
    const known: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    if (known[entity.toLowerCase()]) return known[entity.toLowerCase()];
    const code = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}
// Only formatting tags survive. No attributes, scripts, remote resources or executable URLs.
export function sanitizeMailHtml(value: unknown): string {
  if (typeof value !== 'string') return '';
  const input = value.slice(0, 100000).replace(/<!--[^]*?-->/g, '').replace(/<(script|style|iframe|object|svg|math|template)\b[^>]*>[^]*?<\/\1\s*>/gi, '');
  return (input.match(/<[^>]*>|[^<]+|</g) || []).map(token => {
    if (!token.startsWith('<')) return escapeMailText(decode(token));
    const tag = token.match(/^<(\/?)([a-z][a-z0-9]*)\b[^>]*>$/i);
    return tag && allowed.has(tag[2].toLowerCase()) ? `<${tag[1]}${tag[2].toLowerCase()}>` : '';
  }).join('');
}
export function mailHtmlToText(value: string): string { return decode(sanitizeMailHtml(value).replace(/<br>|<\/(?:p|div|li|blockquote)>/g, '\n').replace(/<[^>]*>/g, '')).trim(); }
