// SummaryMap.tsx
import React from "react";
import L from "leaflet";
import CA_GEO_RAW from "../../assets/ca-provinces.json";
import { MapContainer as RLMap, GeoJSON, useMap } from "react-leaflet";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { CaseItem } from "../../types";  // <-- add this
import "leaflet/dist/leaflet.css";

type Props = {
  summary: Record<string, number>;
  title?: string;
  cases?: CaseItem[];                          // <-- add
  onOpenCases?: (title: string, items: CaseItem[]) => void; // <-- add
};

const provinces = CA_GEO_RAW as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

const POSTAL_TO_PRUID: Record<string, string> = {
  NL:"10", PE:"11", NS:"12", NB:"13", QC:"24", ON:"35",
  MB:"46", SK:"47", AB:"48", BC:"59", YT:"60", NT:"61", NU:"62",
};
const PRUID_TO_POSTAL = Object.fromEntries(
  Object.entries(POSTAL_TO_PRUID).map(([pc, pruid]) => [pruid, pc])
);

// Optional: map full names -> postal codes (helps if your CaseItem.province has names)
const NAME_TO_POSTAL: Record<string, string> = {
  "ALBERTA":"AB","BRITISH COLUMBIA":"BC","MANITOBA":"MB","NEW BRUNSWICK":"NB",
  "NEWFOUNDLAND AND LABRADOR":"NL","NOVA SCOTIA":"NS","ONTARIO":"ON",
  "PRINCE EDWARD ISLAND":"PE","QUEBEC":"QC","SASKATCHEWAN":"SK",
  "NORTHWEST TERRITORIES":"NT","NUNAVUT":"NU","YUKON":"YT",
};

const CANADA_BOUNDS = L.geoJSON(provinces as any).getBounds();

function FitToProvinces({ data }: { data: FeatureCollection }) {
  const map = useMap();
  React.useEffect(() => {
    const b = L.geoJSON(data as any).getBounds();
    map.fitBounds(b, { padding: [20, 20] });
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, data]);
  return null;
}

const baseStroke: Pick<L.PathOptions, "color"|"weight"> = { color: "#000", weight: 1 };

function getProvinceName(p: any): string {
  const en = Array.isArray(p?.prov_name_en) ? p.prov_name_en[0] : p?.prov_name_en;
  const fr = Array.isArray(p?.prov_name_fr) ? p.prov_name_fr[0] : p?.prov_name_fr;
  return en || fr || p?.PRNAME || p?.PRENAME || p?.NAME || "Unknown";
}
function getPruid(feature: any): string | undefined {
  let pruid = feature?.properties?.prov_code;
  if (Array.isArray(pruid)) pruid = pruid[0];
  if (typeof pruid === "number") return String(pruid);
  if (typeof pruid === "string") return pruid;
  return undefined;
}
function makeColorScale(max: number) {
  const maxSafe = Math.max(1, max);
  return (v: number) => {
    const t = Math.min(1, v / maxSafe); // 0..1
    const light = 92 - 62 * t;          // 92% → 30%
    const sat   = 85;
    const hue   = 210;
    return `hsl(${hue} ${sat}% ${light}%)`;
  };
}

function Legend({
  max,
  colorOf,
  buckets = 5,
  title = "Judgments",
}: {
  max: number;
  colorOf: (v: number) => string;
  buckets?: number;
  title?: string;
}) {
  const safeMax = Math.max(1, max);
  const edges = Array.from({ length: buckets + 1 }, (_, i) =>
    Math.round((i * safeMax) / buckets)
  );
  const rows =
    max === 0
      ? [{ label: "0", color: colorOf(0) }]
      : edges.slice(0, -1).map((from, i) => {
          const to = edges[i + 1];
          const mid = (from + to) / 2;
          const label = i === buckets - 1 ? `${from}+` : `${from}–${to}`;
          return { label, color: colorOf(mid) };
        });

  return (
    <div style={{
      position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.95)",
      border: "1px solid #e5e5e5", borderRadius: 8, padding: "8px 10px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)", fontSize: 12, lineHeight: 1.2, pointerEvents: "none",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 14, height: 14, background: r.color, border: "1px solid #0001", borderRadius: 2 }} />
          <span>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function SummaryMap({ summary, cases = [], onOpenCases }: Props) {
  const maxCount = Math.max(0, ...Object.values(summary ?? {}));
  const colorOf = makeColorScale(maxCount);

  const styleByFeature = (feature: any): L.PathOptions => {
    const pruid = getPruid(feature);
    const postal = pruid ? PRUID_TO_POSTAL[pruid] : undefined;
    const count = postal ? summary[postal] ?? 0 : 0;
    return {
      ...baseStroke,
      fillColor: colorOf(count),
      fillOpacity: count > 0 ? 0.9 : 0.8,
    };
  };

  const onEachProvince = (feature: any, layer: L.Layer) => {
    const props = feature?.properties ?? {};
    const name = getProvinceName(props);
    const pruid = getPruid(feature);
    const postal = pruid ? PRUID_TO_POSTAL[pruid] : undefined;
    const count = postal ? summary[postal] ?? 0 : 0;
    const label = `${name}, ${count}`;

    (layer as any).bindTooltip?.(label, {
      sticky: true,
      direction: "top",
      opacity: 0.95,
      className: "prov-tooltip",
    });

    const base = styleByFeature(feature);
    (layer as any).setStyle?.(base);
    (layer as any)._defaultStyle = base;

    (layer as any).on?.("mouseover", () => {
      (layer as any).setStyle?.({ ...base, weight: 2 });
      (layer as any).bringToFront?.();
      (layer as any).openTooltip?.();
    });
    (layer as any).on?.("mouseout", () => {
      (layer as any).setStyle?.(base);
      (layer as any).closeTooltip?.();
    });

    // 🔵 CLICK -> open CaseDrawer via parent callback
    (layer as any).on?.("click", () => {
      if (!postal) return;

      // normalize each case's province to a 2-letter code
      const items = cases.filter((c) => {
        const raw = (c.province ?? "").trim().toUpperCase();
        const code = NAME_TO_POSTAL[raw] ?? raw; // accept full names or codes
        return code === postal;
      });

      const title = `${name} — ${items.length} case${items.length === 1 ? "" : "s"}`;
      onOpenCases?.(title, items);
    });
  };

  return (
    <div style={{ width: "100%", height: 420 }}>
      <RLMap
        bounds={CANADA_BOUNDS}
        boundsOptions={{ padding: [20, 20] }}
        style={{ width: "100%", height: "100%", background: "white" }}
        scrollWheelZoom={false}
      >
        <FitToProvinces data={provinces} />
        <Legend max={maxCount} colorOf={colorOf} />
        <GeoJSON data={provinces} onEachFeature={onEachProvince} />
      </RLMap>
    </div>
  );
}
