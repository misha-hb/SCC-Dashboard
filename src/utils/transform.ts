export type Pair = { name: string; value: number };
import type { CaseItem } from "../types";

export function recordToPairs(rec: Record<string, number>, sortDesc = true): Pair[] {
  const out = Object.entries(rec).map(([name, value]) => ({ name, value }));
  return sortDesc ? out.sort((a,b) => b.value - a.value) : out;
}
export function judgeSummaryFromCases(
  cases: CaseItem[],
  topN?: number
): Record<string, number> {
  const norm = (s: string) => s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

  const counts = new Map<string, number>();
  for (const c of cases) {
    for (const j of c.judges || []) {
      const name = norm(j);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }

  // Optionally cap to Top N + "Other"
  if (topN && counts.size > topN) {
    const sorted = Array.from(counts, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const head = sorted.slice(0, topN);
    const rest = sorted.slice(topN).reduce((s, x) => s + x.value, 0);
    const rec = Object.fromEntries(head.map(x => [x.name, x.value]));
    if (rest > 0) (rec as any)["Other"] = rest;
    return rec;
  }

  return Object.fromEntries(counts);
}
export function surnameOf(full: string): string {
  const s = full.replace(/\u00A0/g, " ").trim();
  const comma = s.indexOf(",");
  if (comma !== -1) return s.slice(0, comma).trim(); // "La Forest, Gérard V." -> "La Forest"
  const parts = s.split(/\s+/);
  return parts[parts.length - 1]; // fallback for "Beverley McLachlin" -> "McLachlin"
}
// timeline: counts per YYYY-MM from cases[].date (ISO yyyy-mm-dd)
export function countByMonth(cases: { date: string }[]): Pair[] {
  const m = new Map<string, number>();
  for (const c of cases) {
    const key = (c.date ?? "").slice(0, 7); // YYYY-MM
    if (!key) continue;
    m.set(key, (m.get(key) || 0) + 1);
  }
  return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
}

// judges: frequency across all cases
// utils/transform.ts
export function countJudges(cases: { judges?: string[] }[], topN?: number): Pair[] {
  const norm = (s: string) => s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  const m = new Map<string, number>();
  for (const c of cases) {
    for (const j of c.judges || []) {
      const name = norm(j);
      m.set(name, (m.get(name) || 0) + 1);
    }
  }
  let arr = Array.from(m, ([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value);
  if (topN && arr.length > topN) {
    const head = arr.slice(0, topN);
    const rest = arr.slice(topN).reduce((s, x) => s + x.value, 0);
    return [...head, { name: "Other", value: rest }];
  }
  return arr;
}

