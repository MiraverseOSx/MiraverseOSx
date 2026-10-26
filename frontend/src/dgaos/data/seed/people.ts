import { getProfile as seedPeopleProfile } from '../../../game-content/characters/collections/seedPeople';
export interface SeedPerson {
  id: string;
  name: string;
  aliases: string[];
  role: string;
  affiliation: string;
  clearance?: string;
  status: 'Active' | 'In Custody' | 'Deceased' | 'Surveillance' | 'Hospitalized';
  threatLevel: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  bio: string;
}

export const seedPeople: SeedPerson[] = [
  seedPeopleProfile("P-101"),
  seedPeopleProfile("P-102"),
  seedPeopleProfile("P-103"),
  seedPeopleProfile("P-104"),
  seedPeopleProfile("P-105")
];
