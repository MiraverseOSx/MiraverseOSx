/**
 * MIRAVERSE OS x — Mission & Operations Director Engine (TypeScript)
 * Generates procedural city operations, tracks multi-tier progression
 * (Journeys, Adventures, Quests, Tasks, Missions), and computes rewards.
 */

export interface OperationReward {
  xp: number;
  credits: number;
  item: string;
}

export interface OperationMission {
  id: string;
  title: string;
  type: string;
  region: string;
  faction: string;
  difficulty: 'Novice' | 'Adept' | 'Master' | 'Overclocked';
  description: string;
  rewards: OperationReward;
  status: 'Available' | 'In Progress' | 'Completed' | 'Locked';
}

export class MissionDirector {
  private readonly MISSION_TYPES = [
    'Infiltration',
    'Aether Purification',
    'Data Retrieval',
    'PRISM Defense',
    'Rune Calibration'
  ];

  private readonly REGIONS = [
    'Aureline Core',
    'Orynvell Shallows',
    'Versenet Verge',
    'Shadow Grid'
  ];

  private readonly FACTIONS = [
    'DGA High Command',
    'Aureline Academy',
    'Shadow Guild',
    'Faith Medical Network'
  ];

  private readonly REWARD_ITEMS = [
    'Aura Credits',
    'Elemental Runes',
    'Encrypted Data Core',
    'PRISM Stabilizer',
    'Celestial Sigil'
  ];

  /**
   * Procedurally generates a field operation or city mission calibrated to player level.
   */
  public generateMission(playerLevel = 1, preferredRegion?: string): OperationMission {
    const id = `MIS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const type = this.MISSION_TYPES[Math.floor(Math.random() * this.MISSION_TYPES.length)];
    const region = preferredRegion && this.REGIONS.includes(preferredRegion)
      ? preferredRegion
      : this.REGIONS[Math.floor(Math.random() * this.REGIONS.length)];
    const faction = this.FACTIONS[Math.floor(Math.random() * this.FACTIONS.length)];

    const difficulties: Array<'Novice' | 'Adept' | 'Master' | 'Overclocked'> = ['Novice', 'Adept', 'Master', 'Overclocked'];
    const difficulty = difficulties[Math.min(difficulties.length - 1, Math.floor(Math.random() * difficulties.length))];

    const xpReward = playerLevel * (Math.floor(Math.random() * 250) + 150);
    const creditReward = playerLevel * (Math.floor(Math.random() * 550) + 250);
    const itemReward = this.REWARD_ITEMS[Math.floor(Math.random() * this.REWARD_ITEMS.length)];

    const titles: Record<string, string> = {
      'Infiltration': `Operation Glass Shadow in ${region}`,
      'Aether Purification': `Purify corrupted aether node in ${region}`,
      'Data Retrieval': `Extract cipher manifest from ${faction}`,
      'PRISM Defense': `Defend Aureline grid array in ${region}`,
      'Rune Calibration': `Harmonize regional rune matrix for ${faction}`
    };

    const descriptions: Record<string, string> = {
      'Infiltration': 'Bypass security firewalls, intercept encrypted telemetry, and return without triggering PRISM alarms.',
      'Aether Purification': 'Use SpellForge elemental protocols to purge corruption spores infecting the regional node.',
      'Data Retrieval': 'Locate lost citizen archives and decrypt sealed biometric manifests.',
      'PRISM Defense': 'Repel PRISM integrity spikes threatening to destabilize local district shields.',
      'Rune Calibration': 'Synthesize a balanced elemental glyph chain to stabilize high-frequency magical currents.'
    };

    return {
      id,
      title: titles[type] || 'Field Operation Directive',
      type,
      region,
      faction,
      difficulty,
      description: descriptions[type] || 'Standard tactical municipal objective.',
      rewards: {
        xp: xpReward,
        credits: creditReward,
        item: itemReward
      },
      status: 'Available'
    };
  }
}

export const missionDirector = new MissionDirector();
