import type { DGASystem } from '@/lib/dga-types';
import type { DgaSystemAdapter } from './system-contract';
import { BaseDgaSystemAdapter, TraceSystemAdapter } from './system-adapter';
import { INTEGRATED_SYSTEMS } from './system-profiles';

const adapters = new Map<DGASystem, DgaSystemAdapter>();

export function registerSystemAdapter(adapter: DgaSystemAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getSystemAdapter(system: DGASystem): DgaSystemAdapter | undefined {
  return adapters.get(system);
}

export function listSystemAdapters(): DgaSystemAdapter[] {
  return [...adapters.values()];
}

for (const system of INTEGRATED_SYSTEMS) {
  registerSystemAdapter(system === 'TRACE' ? new TraceSystemAdapter() : new BaseDgaSystemAdapter(system));
}
