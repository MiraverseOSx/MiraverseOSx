import {
  DGAState,
  DGAEntityPerson,
  DGAEntityOrganization,
  DGAEntityLocation,
  DGARelationship
} from './dga-types';

export function getEntityRelationships(
  worldState: DGAState,
  entityId: string
): DGARelationship[] {
  return worldState.relationships.filter(
    (r) => r.sourceId === entityId || r.targetId === entityId
  );
}

export function findPersonById(
  worldState: DGAState,
  id: string
): DGAEntityPerson | undefined {
  return worldState.people.find((p) => p.id === id);
}

export function findOrganizationById(
  worldState: DGAState,
  id: string
): DGAEntityOrganization | undefined {
  return worldState.organizations.find((o) => o.id === id);
}

export function findLocationById(
  worldState: DGAState,
  id: string
): DGAEntityLocation | undefined {
  return worldState.locations.find((l) => l.id === id);
}

export function getHighThreatEntities(worldState: DGAState): {
  people: DGAEntityPerson[];
  locations: DGAEntityLocation[];
} {
  return {
    people: worldState.people.filter(
      (p) => p.threatLevel === 'Severe' || p.threatLevel === 'High'
    ),
    locations: worldState.locations.filter(
      (l) => l.threatLevel === 'Severe' || l.threatLevel === 'High'
    )
  };
}
