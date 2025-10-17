import { useEffect, useState } from "react";
import { fetchYearStats } from "../api";

export function useYearStats(year: number | null) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (year == null) return;
    const ctrl = new AbortController();
    setLoading(true); setError(null);

    fetchYearStats(year, ctrl.signal)
      .then(setData)
      .catch((e) => { if (e.name !== "AbortError") setError(e as Error); })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [year]);

  return { data, loading, error };
}
