const API_VERSION = import.meta.env.VITE_API_VERSION ?? "v1";

export async function fetchYearStats(year: number, signal?: AbortSignal) {
  const res = await fetch(`https://year-in-judgments.onrender.com/api/v1/stats/${year}`, { signal });
  if (!res.ok) throw new Error(`Failed to load ${year} (${res.status})`);
  return res.json();
}
