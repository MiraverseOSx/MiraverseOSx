export interface TreasuryStats {
  blocks?: number;
  transactions?: number;
  mempool_transactions?: number;
  difficulty?: number;
  hashrate_24h?: string;
  suggested_transaction_fee_per_byte_sat?: number;
}

function positiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function hashrate(value: unknown): string | undefined {
  if (typeof value === 'string' && /^\d+(?:\.\d+)?\s*[kMGTPEZY]?H(?:\/s)?$/i.test(value.trim())) return value.trim();
  const rate = positiveNumber(value);
  if (rate === undefined) return undefined;
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s'];
  const index = rate > 0 ? Math.min(units.length - 1, Math.floor(Math.log10(rate) / 3)) : 0;
  const unit = Math.max(0, index);
  return `${(rate / 1000 ** unit).toLocaleString('en-US', { maximumFractionDigits: 1 })} ${units[unit]}`;
}

/** The gateway can return HTTP 200 with an error envelope; never render that as live stats. */
export function parseTreasuryTelemetry(payload: unknown): TreasuryStats | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const envelope = payload as Record<string, unknown>;
  if (envelope.error) return null;
  const context = envelope.context as { code?: unknown } | undefined;
  const code = positiveNumber(context?.code);
  if (code !== undefined && code >= 400) return null;
  const data = Object.hasOwn(envelope, 'data') ? envelope.data : envelope;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const source = data as Record<string, unknown>;
  const parsed: TreasuryStats = {
    blocks: positiveNumber(source.blocks),
    transactions: positiveNumber(source.transactions),
    mempool_transactions: positiveNumber(source.mempool_transactions),
    difficulty: positiveNumber(source.difficulty),
    suggested_transaction_fee_per_byte_sat: positiveNumber(source.suggested_transaction_fee_per_byte_sat),
    hashrate_24h: hashrate(source.hashrate_24h),
  };
  return Object.values(parsed).some(value => value !== undefined) ? parsed : null;
}
