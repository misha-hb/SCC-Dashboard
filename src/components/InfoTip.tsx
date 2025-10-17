import React from "react";

export default function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <span
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-label="More info"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        marginLeft: 6,
        cursor: "help",
        color: "#666",
        outline: "none",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" />
        <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
      </svg>

      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "140%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            fontSize: 12,
            padding: "6px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,.15)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
