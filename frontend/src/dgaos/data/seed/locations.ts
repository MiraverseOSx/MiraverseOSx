export interface SeedLocation {
  id: string;
  name: string;
  type: 'Embassy' | 'Hospital' | 'Industrial Facility' | 'Safehouse' | 'Federal Complex';
  coordinates: string;
  threatLevel: 'Low' | 'Guarded' | 'Elevated' | 'High' | 'Severe';
  accessRestrictions: string;
  description: string;
}

export const seedLocations: SeedLocation[] = [
  {
    id: 'LOC-01',
    name: 'DGA Headquarters (Node HQ-04)',
    type: 'Federal Complex',
    coordinates: '38.8977° N, 77.0365° W',
    threatLevel: 'Low',
    accessRestrictions: 'Level 5 Biometric Badge & Smart-Card Cryptographic Token Required',
    description: 'Central operations center and command enclave housing DGA command consoles, classified server stacks, and direct satellite uplinks.'
  },
  {
    id: 'LOC-02',
    name: 'Metropolitan Embassy Row - Suite 400',
    type: 'Embassy',
    coordinates: '38.9100° N, 77.0450° W',
    threatLevel: 'Elevated',
    accessRestrictions: 'Diplomatic Immunity Enclave / Diplomatic Security Escort Mandatory',
    description: 'Site of the bilateral trade summit where Ambassador Vance suffered catastrophic chemical collapse. Under active forensic seal.'
  },
  {
    id: 'LOC-03',
    name: 'St. Jude Isolation Ward 4-B',
    type: 'Hospital',
    coordinates: '38.9244° N, 77.0167° W',
    threatLevel: 'Guarded',
    accessRestrictions: 'DGA Armed Sentry Stationed Outside Room 412',
    description: 'High-security biological isolation suite housing comatose diplomat. Airflow filtered through positive-pressure HEPA and charcoal scrubs.'
  },
  {
    id: 'LOC-04',
    name: 'Harbor Free-Trade Zone Warehouse 18',
    type: 'Industrial Facility',
    coordinates: '38.8680° N, 77.0120° W',
    threatLevel: 'High',
    accessRestrictions: 'Restricted Industrial Zone / Port Authority Tactical Perimeter',
    description: 'Suspected dead-drop site where missing Courier Marcus Vance was last spotted. Trace evidence of chemical decanting discovered.'
  },
  {
    id: 'LOC-05',
    name: 'Cygnus Regional SCADA Substation 14',
    type: 'Industrial Facility',
    coordinates: '38.8820° N, 77.0850° W',
    threatLevel: 'Severe',
    accessRestrictions: 'High Voltage / Armed Guard Guardhouse',
    description: 'Primary power routing hub controlling energy supply to Capitol federal enclaves. Target of active command-injection cyber probe.'
  }
];
