// Treat common variants as "unknown"
const UNKNOWN_KEYS = new Set([
    "unknown", "n/a", "na", "unspecified", "not specified", "other/unknown"
  ]);
  
  export function isUnknownKey(key: string) {
    const k = key.trim().toLowerCase().replace(/\s+/g, " ");
    if (UNKNOWN_KEYS.has(k)) return true;
    return k.includes("unknown"); // catch "Other / Unknown", etc.
  }
  
  /** true if all nonzero counts are "Unknown" and it equals total */
  export function isAllUnknown(
    summary: Record<string, number> | null | undefined,
    totalCases: number
  ): boolean {
    if (!summary) return false;
    const entries = Object.entries(summary);
    if (entries.length === 0) return false;
  
    let unknown = 0;
    let anyNonUnknown = false;
  
    for (const [k, v] of entries) {
      if (!v) continue;
      if (isUnknownKey(k)) unknown += v;
      else anyNonUnknown = true;
    }
  
    return !anyNonUnknown && unknown === totalCases;
  }
  