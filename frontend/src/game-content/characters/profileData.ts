// Always return a fresh record: app state must not mutate authored content.
// The explicit sentinel preserves JavaScript's original undefined fields in JSON.
export function copyProfile(value: unknown): any {
  if (Array.isArray(value)) return value.map(copyProfile);
  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 1 && Object.hasOwn(value, '$characterUndefined') && (value as any).$characterUndefined === true) return undefined;
    return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,copyProfile(item)]));
  }
  return value;
}
