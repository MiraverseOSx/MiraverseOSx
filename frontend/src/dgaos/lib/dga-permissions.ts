import { DGAAgentProfile, Classification } from './dga-types';

export function hasRequiredClearance(
  profile: DGAAgentProfile,
  requiredClassification: Classification
): boolean {
  const clearanceLevel = profile.clearanceLevel;

  switch (requiredClassification) {
    case 'UNCLASSIFIED // FOUO':
      return clearanceLevel >= 1;
    case 'CONFIDENTIAL':
      return clearanceLevel >= 2;
    case 'SECRET // NOFORN':
      return clearanceLevel >= 3;
    case 'TOP SECRET // NOFORN':
      return clearanceLevel >= 4;
    case 'TOP SECRET // SPECIAL ACCESS REQUIRED':
      return clearanceLevel >= 5;
    default:
      return false;
  }
}
