import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Latin text only: the default OG font has no Persian glyphs, and loading a remote font
// at build time would make builds depend on the network.
export const alt = "Pasha Academy — Study, Residence & Dormitory in Türkiye";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={120} height={120} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800 }}>Pasha Academy</div>
            <div style={{ fontSize: 24, color: "#eac677", letterSpacing: 6 }}>STUDY IN TÜRKİYE</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>University Admission · Scholarships · Student Dormitory</div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>Istanbul · Ankara · Izmir</div>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%", borderRadius: 10, background: "linear-gradient(90deg, #129f98, #deaf52, #e30a17)" }} />
      </div>
    ),
    size,
  );
}
