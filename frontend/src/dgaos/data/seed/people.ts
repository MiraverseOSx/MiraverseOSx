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
  {
    id: 'P-101',
    name: 'Ambassador Christian Vance',
    aliases: ['Envoy Vance', 'Subject Raven-1'],
    role: 'Principal Diplomatic Envoy to Central Eurasia',
    affiliation: 'State Department / Foreign Service',
    clearance: 'State Secret',
    status: 'Hospitalized',
    threatLevel: 'None',
    bio: 'Collapsed during closed-door bilateral trade summit. Immediate acute neurotoxic collapse requiring ICU ventilation.'
  },
  {
    id: 'P-102',
    name: 'Dr. Gregory Thorne',
    aliases: ['Chief Toxicology', 'Dr. Thorne'],
    role: 'Chief of Critical Toxicology & Emergency Medicine',
    affiliation: 'St. Jude Metropolitan Hospital',
    status: 'Active',
    threatLevel: 'Low',
    bio: 'Lead physician supervising the diplomat poisoning isolation ward. First medical responder to flag non-standard cholinesterase inhibition.'
  },
  {
    id: 'P-103',
    name: 'Viktor Krell',
    aliases: ['The Glassmaker', 'V. Krellov', 'Contractor K'],
    role: 'Freelance Chemical Synthesis Broker & Smuggler',
    affiliation: 'Black Market / Red Dawn Syndicate',
    status: 'Surveillance',
    threatLevel: 'Severe',
    bio: 'Ex-bloc chemical weapons researcher suspected of brokering organophosphate and fentanyl analogues to non-state actors.'
  },
  {
    id: 'P-104',
    name: 'Courier Marcus Vance (No Relation)',
    aliases: ['Courier 9', 'Runner M'],
    role: 'Diplomatic Pouch Custodian',
    affiliation: 'State Department Diplomatic Security Service',
    status: 'Surveillance',
    threatLevel: 'Moderate',
    bio: 'Missing for 48 hours following an unannounced stopover at a portside warehouse. Last known possessor of classified telemetry tapes.'
  },
  {
    id: 'P-105',
    name: 'Elena Rostova',
    aliases: ['Specter 4', 'E. Rostova'],
    role: 'Senior Cygnus Dynamics SCADA Engineer',
    affiliation: 'Cygnus Dynamics',
    status: 'Active',
    threatLevel: 'Moderate',
    bio: 'Lead architect of power grid industrial controller firmware. Flagged unusual outbound VPN tunnels connecting to foreign IP blocks.'
  }
];
