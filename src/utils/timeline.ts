import type { CaseItem } from "../types";

export type Granularity = "month" | "day";
export type TimelinePoint = {
  key: string; 
  label: string; 
  date: Date;
  ts: number;
  count: number;
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

function parseISODateUTC(s?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function keyFor(date: Date, granularity: Granularity) {
  const y = date.getUTCFullYear();
  const mIdx = date.getUTCMonth();
  const d = pad2(date.getUTCDate());

  if (granularity === "month") {
    const monthName = MONTHS[mIdx];
    return {
      key: monthName,                 
      label: monthName,           
      bucketStart: new Date(Date.UTC(y, mIdx, 1)),
    };
  }

  const mm = pad2(mIdx + 1);
  return {
    key: `${y}-${mm}-${d}`,
    label: `${y}-${mm}-${d}`,
    bucketStart: new Date(Date.UTC(y, mIdx, +d)),
  };
}

function fillMissingMonths(year: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(year, i, 1));
    const monthName = MONTHS[i];
    return {
      key: monthName,                
      label: monthName,
      date: d,
      ts: d.getTime(),
      count: 0,
    } as TimelinePoint;
  });
}

function fillMissingDays(min: Date, max: Date) {
  const out: TimelinePoint[] = [];
  const cur = new Date(min);
  while (cur <= max) {
    const y = cur.getUTCFullYear();
    const m = pad2(cur.getUTCMonth() + 1);
    const d = pad2(cur.getUTCDate());
    const key = `${y}-${m}-${d}`;
    const dt = new Date(Date.UTC(y, cur.getUTCMonth(), cur.getUTCDate()));
    out.push({ key, label: key, date: dt, ts: dt.getTime(), count: 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function buildCaseTimeline(
  cases: CaseItem[],
  opts?: { granularity?: Granularity; fillMissing?: boolean; yearHint?: number }
): TimelinePoint[] {
  const gran = opts?.granularity ?? "month";
  const valid = cases
    .map((c) => ({ c, d: parseISODateUTC(c.date) }))
    .filter((x): x is { c: CaseItem; d: Date } => !!x.d);

  if (valid.length === 0) return [];

  const year = opts?.yearHint ?? valid[0].d.getUTCFullYear();

  const buckets = new Map<string, TimelinePoint>();
  for (const { d } of valid) {
    const { key, label, bucketStart } = keyFor(d, gran);
    const ex = buckets.get(key);
    if (ex) ex.count += 1;
    else buckets.set(key, { key, label, date: bucketStart, ts: bucketStart.getTime(), count: 1 });
  }

  if (opts?.fillMissing) {
    if (gran === "month") {
      for (const p of fillMissingMonths(year)) {
        if (!buckets.has(p.key)) buckets.set(p.key, p);
      }
    } else {
      const mins = Math.min(...valid.map((x) => x.d.getTime()));
      const maxs = Math.max(...valid.map((x) => x.d.getTime()));
      for (const p of fillMissingDays(new Date(mins), new Date(maxs))) {
        if (!buckets.has(p.key)) buckets.set(p.key, p);
      }
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.ts - b.ts);
}

export function toCumulative(series: TimelinePoint[]) {
  let run = 0;
  return series.map((p) => {
    run += p.count;
    return { ...p, cumulative: run };
  });
}
