import React from "react";
import type { Pair } from "../../utils/transform";

const PROVINCE_NAMES: Record<string, string> = {
  NL: "Newfoundland and Labrador",
  PE: "Prince Edward Island",
  NS: "Nova Scotia",
  NB: "New Brunswick",
  QC: "Quebec",
  ON: "Ontario",
  MB: "Manitoba",
  SK: "Saskatchewan",
  AB: "Alberta",
  BC: "British Columbia",
  YT: "Yukon",
  NT: "Northwest Territories",
  NU: "Nunavut",
};

type Props = {
  data: Pair[];
  title?: string;               // optional, for backwards compatibility
  dim?: "judge" | "province" | "subject" | "case_brought" | "case_type" | "decision_category" | string;
};

export default function SummaryTable({ data, title, dim }: Props) {
  // Prefer dim when available; fall back to title matching
  let header: string = "Category";
  if (dim === "judge" || title === "Justice Participation") header = "Judge";
  else if (dim === "province" || title === "Summary of the Provinces on Appeal") header = "Province";
  else if (dim === "subject" || title === "Subject Summary") header = "Subject";

  return (
    <div style={{ width: "100%", background: "#fff", borderRadius: 12, padding: 12, overflowX: "auto", fontSize: 14, fontFamily: "sans-serif" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px", fontFamily: "sans-serif" }}>{header}</th>
            <th style={{ textAlign: "right", padding: "8px", fontFamily: "sans-serif" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const displayName =
              (dim === "province" || title === "Summary of the Provinces on Appeal")
                ? (PROVINCE_NAMES[row.name] ?? row.name)
                : row.name;

            return (
              <tr key={row.name}>
                <td style={{ padding: "8px", borderTop: "1px solid #eee", color: "#000", fontFamily: "sans-serif" }}>
                  {displayName}
                </td>
                <td style={{ padding: "8px", borderTop: "1px solid #eee", textAlign: "right", color: "#000", fontFamily: "sans-serif" }}>
                  {row.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
