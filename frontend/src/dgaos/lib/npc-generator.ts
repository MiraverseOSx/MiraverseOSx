import npcBank from '@/data/banks/npc-names.json';
import type { CitizenRecord } from './case-schema';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomNpc(
  role: CitizenRecord['role'] = 'Person of Interest',
  forcedLastName?: string
): CitizenRecord {
  const genderKey = Math.random() > 0.5 ? 'masculine' : 'feminine';
  const firstName = randomChoice(npcBank.firstNames[genderKey]);
  const lastName = forcedLastName || randomChoice(npcBank.lastNames);
  const fullName = `${firstName} ${lastName}`;

  const birthYear = randomNumber(1968, 2002);
  const birthMonth = String(randomNumber(1, 12)).padStart(2, '0');
  const birthDay = String(randomNumber(1, 28)).padStart(2, '0');
  const dob = `${birthYear}-${birthMonth}-${birthDay}`;

  const occupation = randomChoice(npcBank.archetypes.suspectsAndPersonsOfInterest.occupations);
  const dlNumber = `DL-MET-${randomNumber(100000, 999999)}`;
  const codisId = `CODIS-${role.toUpperCase().replace(/\s+/g, '_')}-${randomNumber(1000, 9999)}`;
  const ssnMasked = `XXX-XX-${randomNumber(1000, 9999)}`;
  const residence = `${randomNumber(100, 999)} ${randomChoice(npcBank.lastNames)} Avenue, Apt ${randomNumber(1, 12)}B, Metro District`;
  const fingerprintClass = randomChoice(npcBank.demographics.fingerprintClassifications);

  const aliases: string[] = [];
  if (role === 'Primary Suspect' || Math.random() > 0.6) {
    aliases.push(randomChoice(npcBank.archetypes.cyberHandles));
  }

  const phoneNumbers = [
    `+1-555-01${randomNumber(10, 99)}-${randomNumber(1000, 9999)}`,
  ];
  if (aliases.length > 0) {
    phoneNumbers.push(`+1-555-01${randomNumber(10, 99)}-${randomNumber(1000, 9999)} (Burner)`);
  }

  const warrantStatus = role === 'Primary Suspect'
    ? 'Active Felony Warrant'
    : Math.random() > 0.75
    ? 'Subpoena Issued'
    : 'None';

  const alibiClaim = randomChoice(npcBank.demographics.alibiTemplates);
  const alibiVerificationStatus = role === 'Primary Suspect' ? 'Refuted' : 'Corroborated';

  return {
    id: `CIT-${randomNumber(100, 999)}`,
    fullName,
    aliases,
    role,
    dob,
    ssnMasked,
    residence,
    occupation,
    dmvDriverLicense: dlNumber,
    dmvVehicleRegistration: `Sedan (${randomChoice(['Black Audi A4', 'Silver Honda Civic', 'Navy Ford Explorer', 'Charcoal BMW 330i'])}, Lic #${randomNumber(1, 9)}XYZ${randomNumber(10, 99)})`,
    codisDnaProfileId: codisId,
    fingerprintClass,
    phoneNumbers,
    warrantStatus: warrantStatus as CitizenRecord['warrantStatus'],
    alibiClaim,
    alibiVerificationStatus,
  };
}
