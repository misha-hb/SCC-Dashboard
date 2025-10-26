import React from "react";
import type { CaseItem } from "../../types";
import { buildCaseTimeline, toCumulative } from "../../utils/timeline";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter
} from "recharts";
import InfoTip from "../InfoTip";
import CaseDrawer from "../CaseDrawer";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;


function casesUpToMonth(cases: CaseItem[], label: string, year: number) {
  const m = MONTHS.indexOf(label as (typeof MONTHS)[number]);
  if (m < 0) return [];
  return (cases ?? []).filter((c) => {
    const s = c.date ?? "";
    if (s.length < 7) return false;
    const y = Number(s.slice(0, 4));
    const mm = Number(s.slice(5, 7)) - 1; 
    return y === year && mm <= m; 
  });
}

function casesForMonth(cases: CaseItem[], label: string, year: number) {
  const m = MONTHS.indexOf(label as (typeof MONTHS)[number]);
  if (m < 0) return [];
  return (cases ?? []).filter((c) => {
    const s = c.date ?? "";
    if (s.length < 7) return false;
    const y = Number(s.slice(0, 4));
    const mm = Number(s.slice(5, 7)) - 1; 
    return y === year && mm === m;
  });
}


type Mode = "line" | "scatter" | "table";

export default function TimelinePanel({
  title,
  cases,
  year,
  defaultMode = "line",
  modes = ["line", "scatter", "table"],
  defaultOpen = false,
  description
}: {
  title: string;
  cases: CaseItem[];
  year: number;
  defaultMode?: Mode;
  modes?: Mode[];
  defaultOpen?: boolean;
  description?: string
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [selected, setSelected] = React.useState<Mode[]>([defaultMode]);
  const contentId = React.useId();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
const [drawerTitle, setDrawerTitle] = React.useState("");
const [drawerItems, setDrawerItems] = React.useState<CaseItem[]>([]);

const ClickDot = (props: any) => {
  const { cx, cy, payload, stroke, fill, series } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  const color: string = stroke || fill || "#8884d8";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}                     
      fill={color}             
      fillOpacity={1}         
      stroke="#c4c2c2"       
      strokeWidth={1}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        const label = payload?.label;
        if (!label) return;

        const items =
          series === "cumulative"
            ? casesUpToMonth(cases, label, year)
            : casesForMonth(cases, label, year);

        const titlePrefix = series === "cumulative" ? `Up to ${label}` : label;
        setDrawerTitle(`${titlePrefix} ${year}`);
        setDrawerItems(items);
        setDrawerOpen(true);
      }}
    />
  );
};



  const monthly = React.useMemo(
    () => buildCaseTimeline(cases, { granularity: "month", fillMissing: true, yearHint: year }),
    [cases, year]
  );
  const daily = React.useMemo(
    () => buildCaseTimeline(cases, { granularity: "day", fillMissing: false }),
    [cases]
  );
  const cumulative = React.useMemo(() => toCumulative(monthly), [monthly]);

  const toggleMode = (m: Mode) =>
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  
  return (
    <section style={{ marginBottom: 16, background: "#fff", borderRadius: 12, overflow: "visible" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                 background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
      >
        
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
             style={{ transition: "transform 180ms ease", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
          <path d="M9 6l6 6-6 6" fill="currentColor" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 18, display: "inline-flex", alignItems: "center", gap: 8 }}>
          {title}
          {description && (
              <InfoTip text={description} />)}
        </span>
      </button>

      <div id={contentId} style={{ display: open ? "block" : "none", padding: "10px 14px 14px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}
             role="group" aria-label="View options">
          {modes.map((m) => {
            const id = `${title.replace(/\s+/g, "-").toLowerCase()}-${m}`;
            const checked = selected.includes(m as Mode);
            return (
              <label key={m} htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input id={id} type="checkbox" checked={checked} onChange={() => toggleMode(m as Mode)} style={{ cursor: "pointer" }} />
                <span style={{ textTransform: "uppercase", fontSize: 12 }}>{m}</span>
              </label>
            );
          })}
        </div>

        {selected.length === 0 ? (
          <div style={{ color: "#666", fontSize: 15 }}>Select one or more views to display.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
            {selected.includes("line") && (
              <div style={{ width: "100%", height: 360, background: "#fff", borderRadius: 12, padding: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulative} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: "Open Sans"}} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: "Open Sans" }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Monthly"
                      stroke="#8884d8"
                      dot={(p) => <ClickDot {...p} series="monthly" />}
                      activeDot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name="Cumulative"
                      stroke="#82ca9d"
                      dot={(p) => <ClickDot {...p} series="cumulative" />}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {selected.includes("scatter") && (
              <div style={{ width: "100%", height: 360, background: "#fff", borderRadius: 12, padding: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="ts"
                      tickFormatter={(v) => new Date(v).toISOString().slice(0, 10)}
                      domain={["dataMin", "dataMax"]}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis dataKey="count" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(v) => new Date(Number(v)).toISOString().slice(0, 10)} />
                    <Scatter data={daily} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {selected.includes("table") && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Period</th>
                      <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Judgments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map((p) => (
                      <tr key={p.key}>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{p.label}</td>
                        <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eee" }}>{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <CaseDrawer
  open={drawerOpen}
  title={drawerTitle}
  items={drawerItems}
  onClose={() => setDrawerOpen(false)}
/>
    </section>
    
  );
}
