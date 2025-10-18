import React from "react";
import type { CaseItem } from "../../types";
import { recordToPairs } from "../../utils/transform";
import CaseDrawer from "../CaseDrawer";                    
import { filterCasesByDimension, type Dimension } from "../../utils/caseFilters";
import { isAllUnknown } from "../../utils/validate";
import type { Pair } from "../../utils/transform";
import SummaryBar from "./SummaryBar";
import SummaryPie from "./SummaryPie";
import SummaryTable from "./SummaryTable";
import SummaryMap from "./SummaryMap";
import InfoTip from "../InfoTip";
import { MobileUsers } from "../../hooks/MobileUsers";

type Mode = "bar" | "pie" | "table" | "map";

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

export default function SummaryPanel({
  title,
  summary,
  totalCases,
  defaultMode = "bar",
  modes = ["bar", "pie", "table"],
  defaultOpen = false,
  description,
  cases,                         
  dim,                         
  topJudgeNames,
  year, 
  type
}: {
  title: string;
  summary: Record<string, number>;
  totalCases: number;
  defaultMode?: Mode;
  modes?: Mode[];
  defaultOpen?: boolean;
  description?: string;
  cases?: CaseItem[];
  dim?: Dimension;
  topJudgeNames?: string[]; 
  year?: number;
  type?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [selected, setSelected] = React.useState<Mode[]>([defaultMode]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);        
  const [drawerTitle, setDrawerTitle] = React.useState("");         
  const [drawerItems, setDrawerItems] = React.useState<CaseItem[]>([]);
  const data: Pair[] = React.useMemo(() => recordToPairs(summary), [summary]);
  const contentId = React.useId();
  const viewers: React.ReactNode[] = [];

  const isMobile = MobileUsers(640);
  const sidePad = isMobile ? 6 : 14; 
const headPad = isMobile ? 8 : 12; 

const nonZero = React.useMemo(() => filterNonZeroPairs(data), [data]);
const categoryCount = nonZero.length;
const canUsePie = categoryCount <= 25;

  if (selected.includes("bar"))  viewers.push(<SummaryBar key="bar" data={filterNonZeroPairs(data)} />);
  if (selected.includes("pie") && canUsePie) viewers.push(<SummaryPie key="pie" data={nonZero} />);
  if (selected.includes("table")) viewers.push(<SummaryTable key="table" data={data} title={title} dim={dim}/>);
  if (selected.includes("map"))  viewers.push(<SummaryMap key="map" summary={summary} title="Province Map" />);

  const onSelectBucket = (label: string) => {       
    if (!cases || !dim) return;
    const items = filterCasesByDimension(cases, dim, label, { topJudgeNames });
    const provLabel =
      dim === "province" ? (PROVINCE_NAMES[label] ?? label) : label;
      setDrawerTitle(`${type}: ${provLabel} — ${year}`);
    setDrawerItems(items);
    setDrawerOpen(true);
  };

  
  function filterNonZeroPairs(pairs: Pair[]): Pair[] {
    return pairs.filter(p => Number(p.value) > 0);
  }

  const toggleMode = (m: Mode) => {
    if (m === "pie" && !canUsePie) return; 
  setSelected(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]))};
  
  const effectiveModes = React.useMemo(
    () => (canUsePie ? modes : modes.filter(m => m !== "pie")),
    [modes, canUsePie]
  );
  
  React.useEffect(() => {
    if (!canUsePie) {
      setSelected(prev => {
        const next = prev.filter(m => m !== "pie");
        return next.length ? next : ["bar"]; 
      });
    }
  }, [canUsePie]);
  
  const allUnknown = isAllUnknown(summary, totalCases);


  return (
    <section
      style={{
        marginBottom: 16,
        background: "#fff",
        borderRadius: 12,
        overflow: "visible",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: `${headPad}px ${sidePad}px`,
          background: "transparent",
          border: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
          style={{ transition: "transform 600ms ease", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <path d="M9 6l6 6-6 6" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <span style={{ fontSize: 18, display: "inline-flex", alignItems: "center", gap: 8 }}>
          {title}
          {description && (
                        <InfoTip text={description} />)}
                  </span>
      </button>

      <div
        id={contentId}
        style={{
          display: open ? "block" : "none",
          padding: `${headPad}px ${sidePad}px`,
        }}
      >
        {allUnknown ? (
          <div style={{ color: "#666", fontSize: "14px" }}>
            No categorized data available for this year.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "left",
                marginBottom: 10,
              }}
              role="group"
              aria-label="View options"
            >
              {effectiveModes.map((m) => {
                const id = `${title.replace(/\s+/g, "-").toLowerCase()}-${m}`;
                const checked = selected.includes(m as Mode);
                return (
                  <label
                    key={m}
                    htmlFor={id}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMode(m as Mode)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ textTransform: "uppercase", fontSize: 12 }}>{m}</span>
                  </label>
                );
              })}
            </div>

            {selected.length === 0 ? (
              <div style={{ color: "#666", fontSize: 15 }}>Select one or more views to display.</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                  ? "1fr"                                   
                  : viewers.length > 1
                    ? "repeat(2, minmax(280px, 1fr))"     
                    : "1fr",
                  gap: isMobile ? 8 : 16,
                  alignItems: "stretch",
                  marginInline: isMobile ? "-2px" : 0,
                }}
              >
                {selected.includes("bar") && <SummaryBar data={filterNonZeroPairs(data)} onBarClick={onSelectBucket}  />}
                {selected.includes("pie") && <SummaryPie data={filterNonZeroPairs(data)} onSliceClick={onSelectBucket} />}
                {selected.includes("table") && <SummaryTable data={data} title={title} dim={dim}/>}
                {selected.includes("map") && <SummaryMap
    summary={summary}
    title="Province Map"
    cases={cases ?? []}
    onOpenCases={(mapTitle, items) => {
      setDrawerTitle(mapTitle);
      setDrawerItems(items);
      setDrawerOpen(true);
    }}
  />}
              </div>
            )}
            <CaseDrawer
    open={drawerOpen}
    title={drawerTitle}
    items={drawerItems}
    onClose={() => setDrawerOpen(false)}
  />
          </>
        )}
      </div>
    </section>
  );
}
