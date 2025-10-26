import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { CaseItem } from "../../types";
import { buildCaseTimeline } from "../../utils/timeline";

export default function SummaryScatter({ cases }: { cases: CaseItem[] }) {
  const daily = React.useMemo(() => buildCaseTimeline(cases, { granularity: "day", fillMissing: false }), [cases]);
  return (
    <div style={{ width: "100%", height: 380 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="ts"
            tickFormatter={(v) => new Date(v).toISOString().slice(0, 10)}
            domain={["dataMin", "dataMax"]}
            tick={{ fontSize: 12, color: " #000000", fontFamily: "Open Sans" }}
          />
          <YAxis dataKey="count" allowDecimals={false} tick={{ fontSize: 12, color: " #000000", fontFamily: "Open Sans"  }} />
          <Tooltip
            labelFormatter={(v) => new Date(Number(v)).toISOString().slice(0, 10)}
            formatter={(value) => [value as number, "Cases"]}
          />
          <Scatter data={daily} fill="#82ca9d" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
