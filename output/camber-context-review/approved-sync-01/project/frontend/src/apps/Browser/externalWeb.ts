// Keep remote pages outside the fictional network, including its historical aliases.
const INTERNAL_HOSTS = new Set([
  'versenet', 'search.aure', 'services.aure', 'worknet.aure', 'fieldnotes.aure',
  'civinet', 'questnotice', 'royalhistory', 'dga.gov', 'cyacademy.edu',
  'records.orynvell.gov', 'finance.oryn.gov', 'mai.space',
]);

export function isInternalAddress(input: string): boolean {
  try {
    const host = new URL(input).hostname;
    return INTERNAL_HOSTS.has(host) || /\.(aure|mer|onion)$/.test(host);
  } catch { return false; }
}

export function externalWebUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || isInternalAddress(url.href)) return null;
    return url.href;
  } catch { return null; }
}

export function serviceLaunchUrl(input: string): string | null {
  const web = externalWebUrl(input);
  if (web) return web;
  try {
    const url = new URL(input.trim());
    return url.protocol === 'file:' && !url.host && !url.username && !url.password && /\.(html?|HTML?)$/i.test(url.pathname) && !url.search && !url.hash ? url.href : null;
  } catch { return null; }
}

export interface ExternalService { id: string; name: string; category: string; description: string; url: string }
export const SERVICE_STORAGE_KEY = 'miraverse-external-services-v1';
export const SERVICE_DIRECTORY = 'https://services.aure';
export const DEFAULT_SERVICES: ExternalService[] = [
  { id: 'medcore', name: 'MedCore', category: 'Medical & Clinical', description: 'Medical casework and hospital simulation. Add your link or select a downloaded HTML file.', url: '' },
  { id: '12lead', name: '12 Lead Simulator', category: 'Medical & Clinical', description: 'ECG scenarios and 12-lead trace interpretation.', url: 'https://12leadsimulator.com/' },
  { id: 'simcore', name: 'SimCore', category: 'Medical & Clinical', description: 'Patient monitor, observations, and instructor tools.', url: 'https://simcore.app/' },
  { id: 'policecase', name: 'PoliceCase Toolkit', category: 'Police & Law Enforcement', description: 'Police roleplay resources and evidence creation.', url: 'https://dankus.co.uk/index.php' },
  { id: 'guma', name: 'GUMA Tools', category: 'Police & Law Enforcement', description: 'Repository for fictional police and identification documents.', url: 'https://github.com/DamiJJJ/GUMA-tools' },
  { id: 'osintcase', name: 'OSINT Case', category: 'Investigation & Forensics', description: 'Repository for investigative cases, subjects, evidence, and reports.', url: 'https://github.com/emrekybs/osintcase' },
  { id: 'triage', name: 'Forensics Triage Tool', category: 'Investigation & Forensics', description: 'Repository for digital evidence examination and forensic findings.', url: 'https://github.com/SomarGuy/forensics-triage-tool' },
  { id: 'hadmaya', name: 'Hadmaya', category: 'Legal & Courtroom', description: 'Legal case materials and hearing scenarios.', url: 'https://jus-tice.com/' },
  { id: 'bates', name: 'Bates Stamps', category: 'Legal & Courtroom', description: 'Legal PDF and document processing.', url: 'https://batesstamp.com/' },
  { id: 'gral', name: 'GralRPG', category: 'Fictional Documents & Data', description: 'Fictional handouts, records, and roleplay documents.', url: 'https://gralrpg.com/' },
  { id: 'faker', name: 'Faker.tools', category: 'Fictional Documents & Data', description: 'Fictional identities, records, and sample data.', url: 'https://faker.tools/' },
];

export function restoreServices(input: unknown): ExternalService[] {
  if (!Array.isArray(input)) return [];
  const services: ExternalService[] = [];
  for (const raw of input.slice(0, 100)) {
    if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !raw.id || services.some(item => item.id === raw.id)) continue;
    if (typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 100 || typeof raw.category !== 'string' || raw.category.length > 60 || typeof raw.url !== 'string' || raw.url.length > 4096) continue;
    const url = raw.url === '' ? '' : serviceLaunchUrl(raw.url);
    if (url !== null) services.push({ id: raw.id, name: raw.name.trim(), category: raw.category.trim() || 'General', description: typeof raw.description === 'string' ? raw.description.slice(0, 500) : '', url });
  }
  return services;
}

// Only the trusted wrapper shares the app's blob origin. Selected HTML runs in an opaque sandbox.
export function localHtmlWrapper(html: string): string {
  const escaped = html.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Local HTML tool</title><style>html,body{height:100%;margin:0}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe title="Selected local HTML tool" sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" srcdoc="${escaped}"></iframe></body></html>`;
}
