import { ImageResponse } from "next/og";

export const alt = "Damaso Magno — Desenvolvedor Full Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          backgroundColor: "#121214",
          color: "#e1e1e6",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#8257e6",
            marginBottom: 24,
          }}
        >
          FULL STACK DEVELOPER
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
          Damaso Magno
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#a8a8b3",
            maxWidth: 860,
            lineHeight: 1.4,
          }}
        >
          React · Next.js · React Native · Nest · Java · Spring Boot
        </div>
      </div>
    ),
    { ...size },
  );
}
