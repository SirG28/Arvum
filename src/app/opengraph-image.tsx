import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7F8F4",
          gap: 32,
        }}
      >
        <svg width="180" height="180" viewBox="0 0 48 48" fill="none">
          <g transform="rotate(-20 24 38)">
            <rect x="21.5" y="24" width="5" height="14" rx="2.5" fill="#2F7D52" />
          </g>
          <g>
            <rect x="21.5" y="18" width="5" height="20" rx="2.5" fill="#24643F" />
          </g>
          <g transform="rotate(20 24 38)">
            <rect x="21.5" y="12" width="5" height="26" rx="2.5" fill="#1C4E32" />
          </g>
          <circle cx="24" cy="41" r="3.4" fill="#BE6F35" />
        </svg>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#102C1D" }}>
          arvum
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#565B4C" }}>
          Máquinas agrícolas ociosas, transformadas em produtividade
        </div>
      </div>
    ),
    { ...size },
  );
}
