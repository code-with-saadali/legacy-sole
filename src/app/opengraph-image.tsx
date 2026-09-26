import { ImageResponse } from "next/og";
export const alt = "Legacy Sole ? Everyday Footwear, Refined";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#E9E2D7",
        color: "#20211e",
        padding: 90,
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 8 }}>LEGACY SOLE</div>
      <div style={{ fontSize: 76, marginTop: 40 }}>Everyday footwear.</div>
      <div style={{ fontSize: 76, color: "#4b5b40" }}>Refined.</div>
      <div style={{ fontSize: 24, marginTop: 40 }}>
        Sneakers ? Boots ? Formal ? Running
      </div>
    </div>,
    size,
  );
}
