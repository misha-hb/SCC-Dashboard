import type { CaseItem } from "../types";
import { isUnknownKey } from "./validate";

const norm = (s?: string) =>
  (s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

export type Dimension =
  | "case_type"
  | "decision_category"
  | "case_brought"
  | "province"
  | "subject"
  | "judge";

export function filterCasesByDimension(
  cases: CaseItem[],
  dim: Dimension,
  label: string,
  extras?: { topJudgeNames?: string[] }
) {
  const Lraw = (label ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  const L = Lraw.toLowerCase();
  const labelIsUnknown = isUnknownKey(Lraw) || isUnknownKey(L);

  const pick = (c: CaseItem) =>
    dim === "case_type" ? c.case_type :
    dim === "decision_category" ? c.decision_category :
    dim === "case_brought" ? c.case_brought :
    dim === "province" ? c.province : "";

  if (dim === "subject") {
    if (labelIsUnknown) {
      return cases.filter((c) => {
        const subs = (c.subject ?? []).map(norm).filter(Boolean);
        if (subs.length === 0) return true;              
        return subs.every((s) => isUnknownKey(s));       
      });
    }
    return cases.filter((c) => (c.subject ?? []).some((s) => norm(s) === L));
  }

  if (dim === "judge") {
    if (L === "other" && extras?.topJudgeNames?.length) {
      const top = new Set(extras.topJudgeNames.map(norm));
      return cases.filter((c) => (c.judges ?? []).some((j) => !top.has(norm(j))));
    }
    return cases.filter((c) => (c.judges ?? []).some((j) => norm(j) === L));
  }

  return cases.filter((c) => {
    const v = pick(c);
    const vNorm = norm(v);
    if (labelIsUnknown) {
      return !vNorm || isUnknownKey(vNorm);
    }
    return vNorm === L;
  });
}
