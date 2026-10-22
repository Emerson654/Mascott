// Owned by Camille. Default social card (1200x630) for every page, generated at build time.
import { ImageResponse } from "next/og";

export const alt = "Mascott: AI mascots that guide your visitors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1B1D3A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          background: "linear-gradient(135deg, #EEF0FF 0%, #FFE6F3 55%, #FFF1DB 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700, color: INK }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: "#7C8CFF", marginRight: 14 }} />
            Mascott
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36, fontSize: 72, fontWeight: 800, lineHeight: 1.05, color: INK, letterSpacing: -2 }}>
            <span>Give your website</span>
            <span style={{ color: "#6E5BFF" }}>a cute AI guide</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#4a4e78", maxWidth: 620 }}>
            It answers your visitors and walks new users to their next step.
          </div>
        </div>

        {/* The mascot: a round, friendly blob with a speech bubble. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 380 }}>
          <div
            style={{
              display: "flex",
              padding: "14px 24px",
              borderRadius: 28,
              background: "white",
              color: INK,
              fontSize: 28,
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(27,29,58,0.12)",
              marginBottom: 22,
            }}
          >
            Hi! Need a hand?
          </div>
          <div
            style={{
              width: 300,
              height: 280,
              borderRadius: "150px 150px 130px 130px",
              background: "linear-gradient(160deg, #9AA6FF 0%, #FF8FC7 70%, #FFC46B 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 60px rgba(124,140,255,0.35)",
            }}
          >
            <div style={{ display: "flex", gap: 70 }}>
              <div style={{ width: 34, height: 44, borderRadius: 20, background: INK, display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: "white", margin: "8px 6px 0 0" }} />
              </div>
              <div style={{ width: 34, height: 44, borderRadius: 20, background: INK, display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: "white", margin: "8px 6px 0 0" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 120, marginTop: 10 }}>
              <div style={{ width: 36, height: 18, borderRadius: 9, background: "rgba(255,90,140,0.45)" }} />
              <div style={{ width: 36, height: 18, borderRadius: 9, background: "rgba(255,90,140,0.45)" }} />
            </div>
            <div style={{ width: 60, height: 28, marginTop: 4, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, background: INK }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
