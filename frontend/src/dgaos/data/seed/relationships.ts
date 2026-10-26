import { getProfile as seedRelationshipsProfile } from '../../../game-content/characters/collections/seedRelationships';
export type RelationshipType =
  | 'employed_by'
  | 'related_to'
  | 'suspected_of'
  | 'assigned_to'
  | 'treated_at'
  | 'investigating'
  | 'allied_with'
  | 'hostile_to';

export interface SeedRelationship {
  id: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: RelationshipType;
  notes?: string;
}

export const seedRelationships: SeedRelationship[] = [
  seedRelationshipsProfile("REL-001"),
  seedRelationshipsProfile("REL-002"),
  seedRelationshipsProfile("REL-003"),
  seedRelationshipsProfile("REL-004"),
  seedRelationshipsProfile("REL-005"),
  seedRelationshipsProfile("REL-006"),
  seedRelationshipsProfile("REL-007")
];
