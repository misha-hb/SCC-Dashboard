import * as React from "react";

export function Mobile(maxWidth = 640) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);

    onChange(mq);
    mq.addEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
    mq.addListener?.(onChange);

    return () => {
      mq.removeEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
      mq.removeListener?.(onChange);
    };
  }, [maxWidth]);

  return isMobile;
}
