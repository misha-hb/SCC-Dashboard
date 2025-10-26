import React from "react";
import { ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";
import type { Pair } from "../../utils/transform";
import { surnameOf } from "../../utils/transform";
import { Mobile } from "../../hooks/Mobile";

const COLORS = [ "#7a475b","#c36161"," #df8a34","#e5d178","#cbcca0", "#5c9375",  "#356054", "#1a366b","#86bbc0",
  "#8b8db3", "#9e73af", "#eac8e4",];

  type Props = { data: Pair[]; onBarClick?: (label: string, value: number) => void };
  

  export default function SummaryBar({ data, onBarClick }: Props) {
    const isMobile = Mobile(640);
    const maxVal = React.useMemo(
      () => Math.max(0, ...data.map(d => Number(d.value) || 0)),
      [data]
    );
    const pad = maxVal <= 10 ? 1 : Math.ceil(maxVal * 0.1); 
  
    return (
      <div style={{ width: "100%", height: isMobile ? 300 : 520, background: "#fff", borderRadius: 12, padding: isMobile ? "6px 6px 6px 2px" : "12px", fontSize: 15 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: isMobile ? 16 : 28,     
              right: isMobile ? 4 : 16,
              left: isMobile ? 0 : 8,
              bottom: isMobile ? 4 : 8, }} 
              barCategoryGap={isMobile ? "10%" : "10%"}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 12 : 14, fontFamily: 'Open Sans', fill: '#000' }}
              interval="preserveStartEnd"
              tickMargin={isMobile ? 6 : 10}
              tickFormatter={(l: any) =>
                typeof l === 'string' && l.includes(',') ? surnameOf(l) : l
              }
            />
            <YAxis
              allowDecimals={false}
              width={isMobile ? 22 : 40}
              tickMargin={isMobile ? 2 : 6}
              tick={{ fontSize: isMobile ? 11 : 12, fontFamily: 'Open Sans', fill: '#000' }}
              domain={[0, (dataMax: number) => Math.max(1, dataMax) + pad]}
            />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="black" style={{ fontFamily: 'Open Sans' }}>
              {data.map((d, i) => (
                <Cell
                  key={d.name}
                  fill={COLORS[i % COLORS.length]}
                  onClick={() => onBarClick?.(d.name, d.value)}
                  cursor="pointer"
                />
              ))}
              <LabelList dataKey="value" position="top" fill="#000" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
