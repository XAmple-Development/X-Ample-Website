export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function getProp(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

export function getIn(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    cur = getProp(cur, k);
  }
  return cur;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

