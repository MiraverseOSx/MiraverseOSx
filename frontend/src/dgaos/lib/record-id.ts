// New internal records use collision-resistant IDs. Existing issued IDs stay unchanged.
export function createRecordId(prefix: string, caseId?: string): string {
  return `${prefix}-${caseId ? `${caseId}-` : ''}${crypto.randomUUID()}`;
}
