import { 
    Activity, Building, Shield, BookOpen, Globe, Newspaper, 
    FileText, Landmark, Truck, Eye, Grid 
} from 'lucide-react';

export const PORTALS = {
    'versenet.aure': { title: 'Versenet Search Engine', category: 'Search Engine', icon: Globe, accent: 'green', domain: 'versenet.aure' },
    'faithmed.aure': { title: 'Faith Medical Group', category: 'Medical Intranet', icon: Activity, accent: 'emerald', domain: 'faithmed.aure' },
    'dga.gov': { title: 'Digital Governance Agency', category: 'Government Affairs', icon: Shield, accent: 'blue', domain: 'dga.gov' },
    'cyacademy.edu': { title: 'Cycademy of Sciences', category: 'Academic Portal', icon: Building, accent: 'purple', domain: 'cyacademy.edu' },
    'records.orynvell.gov': { title: 'Orynvell Public Records', category: 'Legal & Deeds', icon: FileText, accent: 'amber', domain: 'records.orynvell.gov' },
    'bank.aure': { title: 'First Orynvell Bank', category: 'Financial Portal', icon: Landmark, accent: 'indigo', domain: 'bank.aure' },
    'shipping.aure': { title: 'CargoTrack Logistics', category: 'Cargo & Logistics', icon: Truck, accent: 'orange', domain: 'shipping.aure' },
    'vectornet.onion': { title: 'Vector DarkNet', category: 'Anonymized Darkweb', icon: Eye, accent: 'cyan', domain: 'vectornet.onion' },
    'auresuite.aure': { title: 'AureSuite Cloud Workspace', category: 'Cloud Tools Hub', icon: Grid, accent: 'rose', domain: 'auresuite.aure' },
    'mai.space.aure': { title: 'Mai.space Social Grid', category: 'Public Social Network', icon: Globe, accent: 'purple', domain: 'mai.space.aure' },
};

export const SAMPLE_ARCHIVES = [
    { id: 'ARC-001', title: 'Pre-Collapse AETHERCORE Blueprint Fragment', address: 'records.orynvell.gov/deeds/aethercore-01', type: 'Archive', excerpt: 'Deep energy resonance maps indicating AETHERCORE subterranean conduit lines under the Old Factory Ward.' },
    { id: 'ARC-002', title: 'Purge-Era Student Genealogy Index', address: 'cyacademy.edu/archives/lineage-index', type: 'Archive', excerpt: 'Classified records detailing Lightborn lineage bloodlines and hereditary Veil sensitivities.' },
    { id: 'ARC-003', title: 'PRISM Cult Signal Intercept #88', address: 'dga.gov/intercepts/prism-88', type: 'Security Log', excerpt: 'Intercepted frequency wave containing corrupted binary runes targeting Cycademy node gateways.' },
    { id: 'ARC-004', title: 'Clinical Study: Veilwilt & Sunspire Fever', address: 'faithmed.aure/research/veilwilt-study', type: 'Medical Report', excerpt: 'Telemetry analysis showing direct correlation between elemental spell strain and aura corruption.' },
    { id: 'ARC-005', title: 'Wire Transfer Audit: Account #0994-AURA', address: 'bank.aure/transfers/audit-994', type: 'Financial Record', excerpt: 'Traced wire transfer of 50,000 ₡ to offshore vector address.' },
    { id: 'ARC-006', title: 'Package Manifest #CG-8821 (Dangerous Goods)', address: 'shipping.aure/manifests/cg-8821', type: 'Logistics Manifest', excerpt: 'Cargo manifest listing unrefined mana crystals bound for Sector 3 Warehouse.' },
];
