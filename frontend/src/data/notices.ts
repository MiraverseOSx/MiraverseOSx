export interface NoticeItem {
  id: string;
  category: 'tasks' | 'quests' | 'missions' | 'adventures' | 'journey';
  title: string;
  description: string;
  priority: 'Normal' | 'Elevated' | 'Critical' | 'Archival';
  isPinned?: boolean;
  completed: boolean;
  tag: string;
  rewardXP?: number;
  rewardCredits?: number;
  rewardBits?: number;
  objectiveHint?: string;
  targetAppId?: string;
}

export interface NoticeObjectiveEvaluation {
  met: boolean;
  current: number;
  required: number;
  progressText: string;
  hint: string;
  targetAppId: string;
}

export const ALL_SHRINE_REGIONS = [
  'Fross',
  'Lumia',
  'Marlowe',
  'Brisland',
  'Kaji',
  'Nephele',
  'Orynvell',
  'Core',
] as const;

export const NOTICES: NoticeItem[] = [
  {
    id: 'n-01',
    category: 'missions',
    title: 'Aureline Civic Onboarding Registration',
    description: 'Complete provisional resident intake forms via .osform and confirm Faith Medical portal synchronization.',
    priority: 'Critical',
    isPinned: true,
    completed: true,
    tag: 'DGA-01',
    rewardXP: 100,
    rewardCredits: 150,
    rewardBits: 0,
    objectiveHint: 'Verify citizen biometrics in MIRROR or inspect registration form.',
    targetAppId: 'passport',
  },
  {
    id: 'n-02',
    category: 'quests',
    title: 'Investigate Old Factory Ward Anomalies',
    description: 'Trace erratic background process signatures near the Supercomputer lower levels for AETHERCORE file remnants.',
    priority: 'Elevated',
    isPinned: true,
    completed: false,
    tag: 'PRISM-WARN',
    rewardXP: 250,
    rewardCredits: 300,
    rewardBits: 2,
    objectiveHint: 'Quarantine an anomalous PRISM/AETHERCORE process in SYSTEM Process Monitor or inspect AETHERCORE.sys in VAULT.',
    targetAppId: 'process',
  },
  {
    id: 'n-03',
    category: 'tasks',
    title: 'Starter House Room Calibration',
    description: 'Unpack starter assignment box, configure terminal dock, and inspect wall port integrity in residential sector.',
    priority: 'Normal',
    isPinned: false,
    completed: false,
    tag: 'RES-04',
    rewardXP: 50,
    rewardCredits: 75,
    rewardBits: 0,
    objectiveHint: 'Rest, study, or install a suite upgrade in HOMECRAFT // Housing.',
    targetAppId: 'housing',
  },
  {
    id: 'n-04',
    category: 'adventures',
    title: 'Founding Day Protocol: March 6 Archive Unlock',
    description: 'Prepare ceremonial decryption keys for Maeryn Seraphima historical records across district mainframes.',
    priority: 'Archival',
    isPinned: true,
    completed: false,
    tag: 'ORYNVELL',
    rewardXP: 500,
    rewardCredits: 600,
    rewardBits: 5,
    objectiveHint: 'Inspect Purge_Record_01.arch in VAULT File Explorer or complete an Archivist WorkNet directive.',
    targetAppId: 'files',
  },
  {
    id: 'n-05',
    category: 'journey',
    title: 'Discover All 8 Regional Shrines',
    description: 'Visit Fross, Lumia, Marlowe, Brisland, Kaji, Nephele, Orynvell and Core to calibrate full environmental harmony.',
    priority: 'Archival',
    isPinned: false,
    completed: false,
    tag: 'AURA-ALL',
    rewardXP: 800,
    rewardCredits: 1000,
    rewardBits: 10,
    objectiveHint: 'Attune all 8 regional shrines in ATLAS // Lore Explorer (Locations tab).',
    targetAppId: 'lore',
  },
];

export function evaluateNoticeObjective(player: any, noticeId: string): NoticeObjectiveEvaluation {
  if (!player) {
    return { met: false, current: 0, required: 1, progressText: '0 / 1', hint: 'Initialize citizen profile', targetAppId: 'passport' };
  }

  switch (noticeId) {
    case 'n-01': {
      return {
        met: true,
        current: 1,
        required: 1,
        progressText: '1 / 1 Verified',
        hint: 'Civic Onboarding Verified',
        targetAppId: 'passport',
      };
    }
    case 'n-02': {
      const quarantinedCount = Array.isArray(player.quarantinedProcessPids) ? player.quarantinedProcessPids.length : 0;
      const hackedCount = Number(player.hackedNodes || 0);
      const inspectedAethercore = Array.isArray(player.inspectedFiles) && (
        player.inspectedFiles.includes('aethercore-sys') ||
        player.inspectedFiles.includes('prism-bleed') ||
        player.inspectedFiles.includes('system-audit')
      );
      const current = quarantinedCount > 0 || hackedCount > 0 || inspectedAethercore ? 1 : 0;
      return {
        met: current >= 1,
        current,
        required: 1,
        progressText: `${current} / 1 Anomaly Traced`,
        hint: 'Quarantine a corrupted thread in SYSTEM Process Monitor or inspect AETHERCORE.sys in VAULT.',
        targetAppId: 'process',
      };
    }
    case 'n-03': {
      const upgradesCount = Array.isArray(player.unlockedHousingUpgrades) ? player.unlockedHousingUpgrades.length : 1;
      const calibrated = Boolean(player.housingCalibrated) || upgradesCount > 1 || Number(player.dormComfort || 50) > 50;
      const current = calibrated ? 1 : 0;
      return {
        met: calibrated,
        current,
        required: 1,
        progressText: `${current} / 1 Suite Calibrated`,
        hint: 'Rest, study coursework, or install a suite upgrade in HOMECRAFT // Housing.',
        targetAppId: 'housing',
      };
    }
    case 'n-04': {
      const inspectedPurge = Array.isArray(player.inspectedFiles) && player.inspectedFiles.includes('purge-archive');
      const archivistRank = Number(player.careers?.archivist?.rankIndex || 0) > 0 || Number(player.careers?.archivist?.xp || 0) > 0;
      const decrypted = Boolean(player.lineageDecrypted) || inspectedPurge || archivistRank;
      const current = decrypted ? 1 : 0;
      return {
        met: decrypted,
        current,
        required: 1,
        progressText: `${current} / 1 Archive Decrypted`,
        hint: 'Open Purge_Record_01.arch in VAULT File Explorer or complete an Archivist directive in WORKNET.',
        targetAppId: 'files',
      };
    }
    case 'n-05': {
      const shrines = Array.isArray(player.discoveredShrines) ? player.discoveredShrines : [];
      const current = Math.min(8, shrines.length);
      return {
        met: current >= 8,
        current,
        required: 8,
        progressText: `${current} / 8 Shrines Attuned`,
        hint: 'Calibrate all 8 regional shrines in ATLAS // Lore Explorer -> Locations.',
        targetAppId: 'lore',
      };
    }
    default:
      return { met: false, current: 0, required: 1, progressText: '0 / 1', hint: 'Unknown directive', targetAppId: 'board' };
  }
}

