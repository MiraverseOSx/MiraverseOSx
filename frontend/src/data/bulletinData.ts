// Bulletin Node content data extracted from BulletinWidget.js

export interface Announcement {
  id: number;
  title: string;
  author: string;
  tag: string;
  date: string;
  body: string;
}

export interface Bulletin {
  id: number;
  title: string;
  reward: string;
  status: string;
  desc: string;
}

export interface LoreEcho {
  id: number;
  source: string;
  text: string;
}

export const CAMPUS_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Orientation Schedule & Dorm Rules',
    author: 'Dean Cassian Rook',
    tag: 'Official Admin',
    date: 'Day 1 • 08:00',
    body: 'All incoming student operatives are requested to verify their Aura Passport records at the Bureau node in Block B before curfew.',
  },
  {
    id: 2,
    title: 'Old Factory Ward Security Warning',
    author: 'Professor Corvin Vale',
    tag: 'DGA Warning',
    date: 'Day 1 • 09:30',
    body: 'Unregistered frequency distortions recorded near Sector 4 dead drop. Do not cross the perimeter line without tactical clearance.',
  },
];

export const DGA_OPS_BULLETINS: Bulletin[] = [
  {
    id: 101,
    title: 'Subnet Patrol Task: Sector 7',
    reward: '200 ₡ • 100 XP',
    status: 'OPEN',
    desc: 'Verify network nodes along Sector 7 boundary for PRISM memory bleed.',
  },
  {
    id: 102,
    title: 'Faith Medical Patient Intake Scan',
    reward: '150 ₡ • 75 XP',
    status: 'ACTIVE',
    desc: 'Complete aura baseline diagnostic at faithmed.aure portal.',
  },
];

export const LORE_ECHOES: LoreEcho[] = [
  {
    id: 201,
    source: 'Subspace Echo #849',
    text: '"The AETHERCORE resonance remains buried underneath the terminal grid..."',
  },
  {
    id: 202,
    source: 'Archivist Selene Note',
    text: '"Lineage keys from the Purge era are reacting to recent Veil fluctuations."',
  },
];
