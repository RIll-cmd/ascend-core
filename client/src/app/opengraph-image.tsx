import { ImageResponse } from "next/og";

export const alt = "Ascend OS - Continuous Progression Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B1020",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.15) 45%, rgba(11, 16, 32, 0.95) 85%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Subtle decorative border */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "24px",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "9999px",
            backgroundColor: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            color: "#38bdf8",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: "24px",
            textTransform: "uppercase",
          }}
        >
          Continuous Progression Platform
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "16px",
          }}
        >
          ASCEND OS
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Transform daily habits, physical training, and cognitive milestones into an epic RPG progression journey.
        </div>

        {/* Bottom telemetry line */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
            fontSize: 14,
            color: "#64748b",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <span>Level Progression</span>
          <span>•</span>
          <span>AIRA AI Companion</span>
          <span>•</span>
          <span>Muscle Heatmap</span>
          <span>•</span>
          <span>Tower Trials</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
