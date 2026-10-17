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
}

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
    },
  ];
