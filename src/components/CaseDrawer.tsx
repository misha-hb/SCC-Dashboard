import React from "react";
import type { CaseItem } from "../types";
import { isUnknownKey } from "../utils/validate";

type Props = {
  open: boolean;
  title: string;
  items: CaseItem[];
  onClose: () => void;
};

const norm = (s?: string) => (s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

const WIDTH_KEY = "caseDrawerWidthPx";
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 320;    
const MAX_VW = 95;              

function clampWidth(px: number) {
  const maxPx = Math.floor((window.innerWidth * MAX_VW) / 100);
  return Math.max(MIN_WIDTH, Math.min(px, maxPx));
}

export default function CaseDrawer({ open, title, items, onClose }: Props) {
    const [openJudgeRows, setOpenJudgeRows] = React.useState<Set<string>>(new Set());
    const [openSubjectRows, setOpenSubjectRows] = React.useState<Set<string>>(new Set());
    
    const [widthPx, setWidthPx] = React.useState<number>(() => {
      if (typeof window === "undefined") return DEFAULT_WIDTH;
      const saved = Number(localStorage.getItem(WIDTH_KEY));
      return Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_WIDTH;
    });

    React.useEffect(() => {
      function onResize() {
        setWidthPx((w) => clampWidth(w));
      }
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
React.useEffect(() => {
  if (!open) return;

  const allIds = new Set(items.map(c => c.case_number));
  setOpenJudgeRows(allIds);
  setOpenSubjectRows(allIds);
}, [open, items]);

  
    React.useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(WIDTH_KEY, String(widthPx));
      }
    }, [widthPx]);
  
    // --- NEW: drag to resize (handle on the left edge) ---
    const dragState = React.useRef<{ startX: number; startW: number } | null>(null);
  
    const startDrag = (clientX: number) => {
      dragState.current = { startX: clientX, startW: widthPx };
      // attach listeners to the whole document for smooth drag
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", endDrag);
    };
  
    const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    };
  
    const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
      if (e.touches.length > 0) {
        startDrag(e.touches[0].clientX);
      }
    };
  
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      e.preventDefault();
      const dx = dragState.current.startX - e.clientX; // moving left makes width bigger
      setWidthPx(clampWidth(dragState.current.startW + dx));
    };
  
    const onTouchMove = (e: TouchEvent) => {
      if (!dragState.current || e.touches.length === 0) return;
      e.preventDefault(); // prevent scrolling while resizing
      const dx = dragState.current.startX - e.touches[0].clientX;
      setWidthPx(clampWidth(dragState.current.startW + dx));
    };
  
    const endDrag = () => {
      dragState.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", endDrag);
    };
  
    // double-click (or Enter key) to reset to default
    const resetWidth = () => setWidthPx(clampWidth(DEFAULT_WIDTH));

    const toggleSubjects = (id: string) =>
    setOpenSubjectRows(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleJudges = (id: string) =>
        setOpenJudgeRows((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const pickDecisionText = (c: CaseItem) => {
        const fd = (c.final_decision ?? "").trim();
        const isMultiWord = fd.split(/\s+/).filter(Boolean).length > 1;
        return isMultiWord ? fd : (c.decision_category || "—");
      };
    
      function parseCitation(cite?: string) {
        const m = (cite ?? "").match(/(\d{4})\s*SCC\s+(\d+)/i);
        return m ? { year: Number(m[1]), num: Number(m[2]) } : null;
      }

    const formatDecision = (raw: string) => {
        const clean = raw.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
        if (!clean) return "—";
      
        const capWord = (w: string) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w);
        const parts = clean.split(" ");
      
        if (parts.length === 1) return capWord(parts[0]);
        if (parts.length === 2) return `${capWord(parts[0])} ${parts[1].toLowerCase()}`;
        return clean[0].toUpperCase() + clean.slice(1).toLowerCase();
      };
      const sortedItems = React.useMemo(() => {
        return items
          .map((it, idx) => ({ it, idx, meta: parseCitation(it.citation) }))
          .sort((a, b) => {
            const A = a.meta, B = b.meta;
            if (A && B) {
              if (A.year !== B.year) return A.year - B.year; 
              if (A.num !== B.num)   return A.num - B.num;   
              return a.idx - b.idx;                         
            }
            if (A && !B) return -1; 
            if (!A && B) return 1;   
            return a.idx - b.idx;    
          })
          .map(x => x.it);
      }, [items]);
  return (
    <>
    {console.log(items)}
      <div
        onClick={onClose}
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 150ms",
            zIndex: 1190, 
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: `${widthPx}px`,          // ← dynamic width
            minWidth: `${MIN_WIDTH}px`,
            maxWidth: `${MAX_VW}vw`,
            background: "#fff",
            color: "#000",
            boxShadow: "-12px 0 24px rgba(0,0,0,0.15)",
            transform: open ? "translateX(0)" : "translateX(100%)",
            transition: "transform 200ms",
            zIndex: 1200,             
            display: "flex",
            flexDirection: "column",
        }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          title="Drag to resize (double-click to reset)"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onDoubleClick={resetWidth}
          onKeyDown={(e) => { if (e.key === "Enter") resetWidth(); }}
          tabIndex={0}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 8,                 // grab area size
            height: "100%",
            cursor: "ew-resize",
            // a subtle visual cue (optional)
            background:
              "linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.00))",
          }}
        />
        <header style={{ padding: "14px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onClose} aria-label="Close" style={{ fontSize: 18, background: "transparent", border: 0, cursor: "pointer" }}>✕</button>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>{items.length} judgments</span>
        </header>
        <div style={{ padding: 12, overflow: "auto" }}>
          {sortedItems.map((c) => {
            const decision = formatDecision(pickDecisionText(c));
            const subjects = (c.subject ?? []).filter(s => s && !isUnknownKey(s));
            const uniqueSubjects = Array.from(new Set(subjects.map(s => s.trim()))).filter(Boolean);
            const hasSubjects = uniqueSubjects.length > 0;
            const rowSubjectsOpen = openSubjectRows.has(c.case_number);
            const judges = (c.judges ?? []).map(norm).filter(Boolean);
            const rowOpen = openJudgeRows.has(c.case_number);
            const caseBroughtRaw = (c.case_brought ?? "");
  const caseBrought = norm(caseBroughtRaw);               // trims, collapses spaces
  const showCaseBrought =
    !!caseBrought && caseBrought !== "—" && !isUnknownKey(caseBrought);


            return (
            <div key={c.case_number} style={{ padding: "10px 8px", borderBottom: "1px solid #f1f1f1" }}>
              <div style={{ fontWeight: 600 }}>{c.title} {c.case_number && `(${c.case_number})`}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                {c.citation} • {c.date} • {c.province || "—"}
              </div>
              <div style={{ opacity: 0.7, marginTop: 3 }}>Decision: {decision}</div>
              {showCaseBrought && (
        <div style={{ opacity: 0.7, marginTop: 3 }}>
          Case brought: {caseBrought}
        </div>
      )}              
               <div
                  style={{
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: 0.7,
                  }}
                >
                  <span>Judges: {c.num_judges ?? judges.length}</span>
                  {judges.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleJudges(c.case_number)}
                      aria-expanded={rowOpen}
                      aria-controls={`judges-${c.case_number}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        padding: 0,
                        color: "inherit",
                        fontSize: 12,
                      }}
                      title={rowOpen ? "" : ""}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{
                          transition: "transform 200ms ease",
                          transform: rowOpen ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      >
                        <path
                          d="M9 6l6 6-6 6"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {rowOpen ? "" : ""}
                    </button>
                  )}
                </div>

                {rowOpen && judges.length > 0 && (
                  <div
                    id={`judges-${c.case_number}`}
                    style={{
                      marginTop: 6,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      fontSize: 12,
                    }}
                  >
                    {judges.map((j) => (
                      <span
                        key={j}
                        style={{
                          padding: "2px 6px",
                          background: "#f3f3f3",
                          borderRadius: 8,
                        }}
                      >
                        {j}
                      </span>
                    ))}
                  </div>
                )}
{hasSubjects && (
<div
  style={{
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    opacity: 0.7,
  }}
>
  <span>Subjects: {uniqueSubjects.length}</span>
    <button
      type="button"
      onClick={() => toggleSubjects(c.case_number)}
      aria-expanded={rowSubjectsOpen}
      aria-controls={`subjects-${c.case_number}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: 0,
        cursor: "pointer",
        padding: 0,
        color: "inherit",
        fontSize: 12,
      }}
      title={rowSubjectsOpen ? "" : ""}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ transition: "transform 200ms ease", transform: rowSubjectsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
      >
        <path
          d="M9 6l6 6-6 6"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {rowSubjectsOpen ? "" : ""}
    </button>
    </div>
  )}

{rowSubjectsOpen && uniqueSubjects.length > 0 && (
  <div
    id={`subjects-${c.case_number}`}
    style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 }}
  >
    {uniqueSubjects.map((s) => (
      <span key={s} style={{ padding: "2px 6px", background: "#f3f3f3", borderRadius: 8 }}>
        {s}
      </span>
    ))}
  </div>
)}
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
                <a href={c.case_url} target="_blank" rel="noreferrer">View judgment ↗</a>
                {c.pdf_url && <a href={c.pdf_url} target="_blank" rel="noreferrer">PDF ↗</a>}
              </div>
            </div>
          );})}
          {sortedItems.length === 0 && <div style={{ padding: 16, opacity: 0.7 }}></div>}
        </div>
      </aside>
    </>
  );
}