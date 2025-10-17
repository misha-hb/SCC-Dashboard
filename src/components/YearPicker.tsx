import React from "react";
import "./YearPicker.css";
import { MobileUsers } from "../hooks/mobileUsers.ts";

type YearPickerProps = {
  years?: number[];
  onSelect?: (startYear: number, endYear: number | undefined) => void;
  onYearSelect?: (year: number | null) => void;
};

export default function YearPicker({ years, onSelect, onYearSelect }: YearPickerProps) {
  const ticks = years ?? [1970, 1980, 1990, 2000, 2010, 2020, 2025];
  const segCount = Math.max(0, ticks.length - 1);
  const COLORS = ["#343d4e", "#677693", "#8694ad", "#997588", "#7d4c66", "#543344"];
  const [active, setActive] = React.useState<number | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [wipeColor, setWipeColor] = React.useState<string | undefined>(undefined);


  const locked = active !== null;
  const [wipeOrigin, setWipeOrigin] = React.useState<string>("0%");
  const [animating, setAnimating] = React.useState(false);

  const isMobile = MobileUsers(640);

  const renderYearLabel = (y: number) =>
    active != null && isMobile ? String(y).slice(-2) : String(y);

  const activateSegment = (i: number) => {
    if (locked || animating) return;
    const segIndex = Math.max(0, Math.min(i, segCount - 1)); // clamp
    setWipeOrigin(`${(segIndex / Math.max(1, segCount)) * 100}%`);
    setWipeColor(COLORS[segIndex % COLORS.length]);
    setActive(segIndex);
    setSelectedYear(null);
    onSelect?.(ticks[segIndex], ticks[segIndex + 1]);
    onYearSelect?.(null);
  };
  const handleBarClick = (i: number) => activateSegment(i);
  const handleTickClick = (tickIndex: number) => {
    if (locked || animating) return;
    const segIndex = tickIndex === ticks.length - 1 ? tickIndex - 1 : tickIndex;
    if (segIndex >= 0) activateSegment(segIndex);
  };

  const handleClick = (i: number) => {
    if (locked || animating) return;    
    setWipeOrigin(`${(i / Math.max(1, segCount)) * 100}%`);
    setWipeColor(COLORS[i % COLORS.length]);
    setActive(i);
    setSelectedYear(null);            // clear year when changing segment
    onSelect?.(ticks[i], ticks[i + 1]);
    onYearSelect?.(null);
  };

  const activeColor = active != null ? COLORS[active % COLORS.length] : undefined;

  const yearRange = React.useMemo(() => {
    if (active == null) return [];
    const start = ticks[active];
    const end = ticks[active + 1];
    const arr: number[] = [];
    for (let y = start; y <= end; y++) arr.push(y);
    return arr;
  }, [active, ticks]);

  const chooseYear = (y: number) => {
    setSelectedYear(y);
    onYearSelect?.(y);
  };

  const resetAll = () => {
    if (animating) return;
  setAnimating(true);

  setActive(null);
  setSelectedYear(null);
  onYearSelect?.(null);

  window.setTimeout(() => {
    setWipeOrigin("0%");
    setAnimating(false);
  }, 480);
  };
  return (
    <div
      className="yearpicker-wrap"
      style={
        {
          ["--active-color" as any]: activeColor,
          ["--active-color" as any]: wipeColor,
          ["--wipe-origin" as any]: wipeOrigin,
        } as React.CSSProperties
      }
    >
      <div className={`yearpicker-bar ${active != null ? "is-active" : ""}`}>
        {Array.from({ length: segCount }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`yearpicker-segment seg-${i} ${active === i ? "active" : ""}`}
            onClick={() => handleClick(i)}
            aria-pressed={active === i}
            aria-label={`${ticks[i]}–${ticks[i + 1]}`}
          />
        ))}
      </div>

      {active == null ? (
        <div className="yearpicker-labels">
        {ticks.map((t, idx) => (
          <span
            key={t}
            className="year-tick"
            role="button"
            tabIndex={0}
            onClick={() => handleTickClick(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleTickClick(idx);
            }}
            aria-label={
              idx === ticks.length - 1
                ? `Open ${ticks[idx - 1]}–${t}`
                : `Open ${t}–${ticks[idx + 1]}`
            }
          >
            {t}
          </span>
        ))}
      </div>
      ) : (
        <div className="yearpicker-years">
          <div className="yearlist">
            {yearRange.map(y => (
               <span
               key={y}
               role="button"
               tabIndex={0}
               className={`year-item ${selectedYear === y ? "is-selected" : ""}`}
               onClick={() => chooseYear(y)}
               onKeyDown={(e) => {
                 if (e.key === "Enter" || e.key === " ") chooseYear(y);
               }}
               aria-pressed={selectedYear === y}
               aria-label={`Select year ${y}`}
             >
               {renderYearLabel(y)}
             </span>
            ))}
          </div>
          <div className="year-actions">
      <button
        type="button"
        className="back-link"
        onClick={resetAll}
        aria-label="Go back to decade view"
      >
        back
      </button>
    </div>
          
        </div>
      )}
    </div>
  );
}
