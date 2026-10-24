import { get, set, del, createStore } from 'idb-keyval';

let database: ReturnType<typeof createStore>;
const mediaStore = () => database ||= createStore('miraverse-social-media', 'assets');
export async function storeMedia(file: File, existingBytes: number) {
  const image = /^image\/(png|jpeg|webp|gif)$/.test(file.type);
  const audio = /^audio\/(mpeg|wav|ogg|mp4|webm|x-wav)$/.test(file.type);
  if (!image && !audio) throw new Error('Choose a PNG, JPEG, WebP, GIF, MP3, WAV, OGG, M4A, or WebM audio file.');
  if (!file.size || file.size > (image ? 2 : 8) * 1024 * 1024 || existingBytes + file.size > 32 * 1024 * 1024) throw new Error('Images may be up to 2 MB, audio up to 8 MB, and your collection up to 32 MB.');
  const asset = { id: `social:${crypto.randomUUID()}`, name: file.name, type: file.type, size: file.size };
  await set(asset.id, file, mediaStore());
  return asset;
}
export const removeMedia = (id: string) => del(id, mediaStore());
export const getMedia = (id: string): Promise<Blob | undefined> => get(id, mediaStore());
export function saveDownload(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportMedia(assets: { id: string }[]) {
  const records = [];
  for (const asset of assets) {
    const blob = await getMedia(asset.id);
    if (!blob) continue;
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
    records.push({ id: asset.id, data });
  }
  saveDownload('mai-space-media-backup.json', new Blob([JSON.stringify({ version: 1, assets: records })], { type: 'application/json' }));
  return records.length;
}
export async function importMedia(file: File, allowed: { id: string; type: string; size: number }[]) {
  if (file.size > 48 * 1024 * 1024) throw new Error('The backup exceeds 48 MB.');
  const raw = JSON.parse(await file.text());
  if (raw.version !== 1 || !Array.isArray(raw.assets)) throw new Error('Not a MAI.SPACE media backup.');
  const staged: { id: string; blob: Blob }[] = [];
  const seen = new Set();
  for (const entry of raw.assets) {
    const meta = allowed.find(a => a.id === entry?.id);
    if (!meta || seen.has(entry.id) || typeof entry.data !== 'string') continue;
    const match = entry.data.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1] !== meta.type) throw new Error('A backup asset has invalid media data.');
    const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    if (bytes.length !== meta.size || bytes.length > 8 * 1024 * 1024) throw new Error('A backup asset does not match its saved record.');
    staged.push({ id: entry.id, blob: new Blob([bytes], { type: meta.type }) }); seen.add(entry.id);
  }
  for (const entry of staged) await set(entry.id, entry.blob, mediaStore());
  return staged.length;
}

// Two short original synthesized loops; actual audio, with no network or licensed catalog.
export function originalTrack(bright = false) {
  const rate = 16000, samples = rate * 8, buffer = new ArrayBuffer(44 + samples * 2), view = new DataView(buffer);
  const write = (offset: number, str: string) => [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); write(8, 'WAVE'); write(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, samples * 2, true);
  const notes = bright ? [261.63, 329.63, 392, 523.25] : [174.61, 220, 261.63, 349.23];
  for (let i = 0; i < samples; i++) { const t = i / rate, envelope = Math.min(1, t * 3, (8 - t) * 3); const value = notes.reduce((s, f, n) => s + Math.sin(2 * Math.PI * f * t) * (0.6 + 0.4 * Math.sin(t * .8 + n)), 0) * .055 * envelope; view.setInt16(44 + i * 2, value * 32767, true); }
  return new Blob([buffer], { type: 'audio/wav' });
}

export function illustratedPhoto(id: string) {
  const hue = id === 'jeremie' ? ['#172f49', '#83c4e8', '#c9dce5'] : id === 'aelita' ? ['#b878a1', '#f9d7e8', '#e7e3fa'] : ['#29172e', '#ec87bd', '#ffdfae'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${hue[0]}"/><stop offset="1" stop-color="${hue[1]}"/></linearGradient></defs><path fill="url(#g)" d="M0 0h960v640H0z"/><circle fill="${hue[2]}" cx="700" cy="170" r="85"/><path d="M0 490 260 260 480 500 650 340 960 540V640H0" fill="${hue[0]}" opacity=".6"/><path d="M0 550Q300 420 500 540T960 520V640H0" fill="${hue[2]}" opacity=".45"/><g fill="${hue[2]}"><circle cx="120" cy="110" r="4"/><circle cx="270" cy="160" r="3"/><circle cx="430" cy="80" r="5"/></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
