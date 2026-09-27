import { ImageResponse } from "next/og";

// Latin text only: the default OG font has no Persian glyphs, and loading a remote font
// at build time would make builds depend on the network.
export const alt = "Pasha Academy — Study, Residence & Dormitory in Türkiye";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #06142a 0%, #0f2d51 60%, #163a65 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 48 48">
            <rect width="48" height="48" rx="14" fill="#0b2340" />
            <circle cx="21" cy="24" r="12" fill="#deaf52" />
            <circle cx="25.5" cy="24" r="9.6" fill="#0b2340" />
            <path d="M33.5 19.5l1.4 3.3 3.6.3-2.7 2.3.8 3.5-3.1-1.9-3.1 1.9.8-3.5-2.7-2.3 3.6-.3z" fill="#e30a17" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800 }}>Pasha Academy</div>
            <div style={{ fontSize: 24, color: "#eac677", letterSpacing: 6 }}>STUDY IN TÜRKİYE</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>University Admission · Residence Permit · Student Dormitory</div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>Istanbul · Ankara · Izmir</div>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%", borderRadius: 10, background: "linear-gradient(90deg, #129f98, #deaf52, #e30a17)" }} />
      </div>
    ),
    size,
  );
}
