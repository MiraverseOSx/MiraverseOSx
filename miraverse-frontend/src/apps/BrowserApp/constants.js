import { Activity, Building, Shield, BookOpen, Globe, Newspaper } from 'lucide-react';

export const PORTALS = {
    'faithmed.aure': { title: 'Faith Medical Group', category: 'Medical Services', icon: Activity, accent: 'emerald' },
    'cyacademy.aure': { title: 'Cycademy of Sciences', category: 'Academic Institution', icon: Building, accent: 'purple' },
    'dga.gov.aure': { title: 'Digital Governance Agency', category: 'Government', icon: Shield, accent: 'blue' },
    'library.aure': { title: 'Central Library & Archives', category: 'Lore & Archives', icon: BookOpen, accent: 'amber' },
    'vectornet.aure': { title: 'Vector Underground Net', category: 'Netrunner / Drifters', icon: Globe, accent: 'cyan' },
    'aurelinedaily.aure': { title: 'Aureline Daily', category: 'News & Media', icon: Newspaper, accent: 'red' },
};

export const SAMPLE_ARCHIVES = [
    { id: 'ARC-001', title: 'Pre-Collapse AETHERCORE Blueprint Fragment', address: 'library.aure/archives/aethercore-01', type: 'Archive', excerpt: 'Deep energy resonance maps indicating AETHERCORE subterranean conduit lines under the Old Factory Ward.' },
    { id: 'ARC-002', title: 'Purge-Era Student Genealogy Index', address: 'library.aure/archives/lineage-index', type: 'Archive', excerpt: 'Classified records detailing Lightborn lineage bloodlines and hereditary Veil sensitivities.' },
    { id: 'ARC-003', title: 'PRISM Cult Signal Intercept #88', address: 'dga.gov.aure/intercepts/prism-88', type: 'Security Log', excerpt: 'Intercepted frequency wave containing corrupted binary runes targeting Cycademy node gateways.' },
    { id: 'ARC-004', title: 'Clinical Study: Veilwilt & Sunspire Fever', address: 'faithmed.aure/research/veilwilt-study', type: 'Medical Report', excerpt: 'Telemetry analysis showing direct correlation between elemental spell strain and aura corruption.' },
];
