// src/utils/caseFilters.ts
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
  // Normalize the incoming label once
  const Lraw = (label ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  const L = Lraw.toLowerCase();
  const labelIsUnknown = isUnknownKey(Lraw) || isUnknownKey(L);

  const pick = (c: CaseItem) =>
    dim === "case_type" ? c.case_type :
    dim === "decision_category" ? c.decision_category :
    dim === "case_brought" ? c.case_brought :
    dim === "province" ? c.province : "";

  // SUBJECT: array field + special Unknown bucket
  if (dim === "subject") {
    if (labelIsUnknown) {
      return cases.filter((c) => {
        const subs = (c.subject ?? []).map(norm).filter(Boolean);
        if (subs.length === 0) return true;              // truly missing
        return subs.every((s) => isUnknownKey(s));        // all unknown-ish
      });
    }
    return cases.filter((c) => (c.subject ?? []).some((s) => norm(s) === L));
  }

  // JUDGE: array field (+ optional "Other" bin)
  if (dim === "judge") {
    if (L === "other" && extras?.topJudgeNames?.length) {
      const top = new Set(extras.topJudgeNames.map(norm));
      return cases.filter((c) => (c.judges ?? []).some((j) => !top.has(norm(j))));
    }
    return cases.filter((c) => (c.judges ?? []).some((j) => norm(j) === L));
  }

  // Scalar fields (case_type, decision_category, case_brought, province)
  return cases.filter((c) => {
    const v = pick(c);
    const vNorm = norm(v);
    if (labelIsUnknown) {
      // treat empty, null, dashes, "unknown", etc. as Unknown
      return !vNorm || isUnknownKey(vNorm);
    }
    return vNorm === L;
  });
}
