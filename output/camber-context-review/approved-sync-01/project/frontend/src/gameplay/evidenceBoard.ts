export interface EvidenceBoard { positions: Record<string, { x: number; y: number }>; connections: { id: string; source: string; target: string; label: string }[] }
export function restoreEvidenceBoard(value: unknown, acquired: readonly string[]): EvidenceBoard {
  const raw = value as Partial<EvidenceBoard> | null;
  const allowed = new Set(acquired);
  const positions = Object.fromEntries(Object.entries(raw?.positions || {}).filter(([id, point]) => allowed.has(id) && point && Number.isFinite(point.x) && Number.isFinite(point.y)).map(([id, point]) => [id, { x: Math.max(-2000, Math.min(4000, point.x)), y: Math.max(-2000, Math.min(4000, point.y)) }]));
  const pairs = new Set<string>();
  const connections: EvidenceBoard['connections'] = [];
  for (const edge of Array.isArray(raw?.connections) ? raw.connections.slice(0, 60) : []) {
    if (!edge || !allowed.has(edge.source) || !allowed.has(edge.target) || edge.source === edge.target) continue;
    const id = `${edge.source}:${edge.target}`;
    if (pairs.has(id)) continue;
    pairs.add(id);
    connections.push({ id, source: edge.source, target: edge.target, label: typeof edge.label === 'string' ? edge.label.slice(0, 120) : 'Player hypothesis' });
  }
  return { positions, connections };
}
