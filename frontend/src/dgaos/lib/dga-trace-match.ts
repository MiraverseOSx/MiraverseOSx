import { DGACase, ForensicRequest } from './dga-types';
import { modules as traceModules } from './modules';

const PROTOCOL_TO_TRACE_MODULE: Record<string, string> = {
  toxicology: 'toxicology',
  spectroscopy: 'toxicology',
  microscopy: 'trace',
  trace: 'trace',
  digital: 'digital',
  dna: 'biology',
  biology: 'biology',
  prints: 'prints',
  firearms: 'firearms',
  documents: 'documents'
};

export interface ResolvedTraceModule {
  id: string;
  method: string;
  requestedAs: string;
}

export function resolveRequestedTraceModules(requestedModules: string[]): {
  modules: ResolvedTraceModule[];
  unsupported: string[];
} {
  const unsupported: string[] = [];
  const modules: ResolvedTraceModule[] = [];
  const seen = new Set<string>();

  for (const requested of requestedModules) {
    const key = requested.trim().toLowerCase();
    const known = PROTOCOL_TO_TRACE_MODULE[key];
    const moduleId = known || (traceModules.some((mod) => mod.id === key) ? key : '');
    if (!moduleId) {
      unsupported.push(requested);
      continue;
    }
    if (seen.has(moduleId)) continue;
    seen.add(moduleId);
    const mod = traceModules.find((item) => item.id === moduleId);
    if (!mod?.methods[0]) {
      unsupported.push(requested);
      continue;
    }
    modules.push({ id: moduleId, method: mod.methods[0], requestedAs: requested });
  }

  return { modules, unsupported };
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const bag = new Set(right);
  return left.every((item) => bag.has(item));
}

function normalizedModuleIds(labels: string[]): string[] {
  return resolveRequestedTraceModules(labels).modules.map((mod) => mod.id).sort();
}

export function findReusableForensicRequest(
  dgaCase: DGACase,
  evidenceIds: string[],
  requestedModules: string[]
): ForensicRequest | undefined {
  const wanted = normalizedModuleIds(requestedModules);
  return dgaCase.forensicRequests.find((request) => {
    const status = String(request.status || '').toUpperCase();
    if (status === 'CANCELLED' || status === 'REJECTED') return false;
    return (
      sameMembers([...request.evidenceIds].sort(), [...evidenceIds].sort()) &&
      sameMembers(normalizedModuleIds(request.targetModules), wanted)
    );
  });
}
