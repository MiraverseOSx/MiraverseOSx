import { getProfile as primarySeedAgentProfile } from '../../../game-content/characters/collections/primarySeedAgent';
export interface SeedAgentProfile {
  id: string;
  name: string;
  badgeNumber: string;
  title: string;
  division: string;
  department?: string;
  clearanceLevel: number;
  clearanceCode: string;
  callsign: string;
  station: string;
  dateAssigned: string;
  specializations: string[];
  commendations: string[];
}

export const primarySeedAgent: SeedAgentProfile = primarySeedAgentProfile("DGA-SA-8804");
