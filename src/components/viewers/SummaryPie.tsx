import { ResponsiveContainer,LabelList, PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import type { Pair } from "../../utils/transform";
import { MobileUsers } from "../../hooks/mobileUsers";

const COLORS = [ "#7a475b","#c36161"," #df8a34","#e5d178","#cbcca0", "#5c9375",  "#356054", "#1a366b","#86bbc0",
  "#8b8db3", "#9e73af", "#eac8e4",];

  type Props = { data: Pair[]; onSliceClick?: (label: string, value: number) => void };

export default function SummaryPie({ data, onSliceClick }: Props) {
  const isMobile = MobileUsers(640);

    return (
    <div style={{ width: "100%", height: isMobile ? 200 : 500, background: "#fff", borderRadius: 12, padding: 12, fontSize: 15 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius="80%" style={{fontFamily:
      'sans-serif'}}>
            {data.map((p, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} onClick={() => onSliceClick?.(p.name, p.value)}
        cursor="pointer" />)}
            <LabelList dataKey="name" position="top" color="" style={{fontFamily:
      'sans-serif'}}/>

          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{
    color: '#000',                 // legend text color
    fontFamily: 'sans-serif',
    fontSize: isMobile ? 11 : 14,
    lineHeight: '22px',
  }}
  iconType="square" color="black"
  formatter={(value) => <span style={{ color: "#000" }}>{value}</span>} layout="vertical" verticalAlign="top" align="right"
/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
