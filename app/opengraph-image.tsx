import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "МеталлЛидер — Металлопрокат оптом и в розницу";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #171717 0%, #262626 50%, #171717 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Decorative accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            background: "#f97316",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            top: 40,
            fontSize: "180px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.03)",
            lineHeight: 1,
          }}
        >
          ML
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "28px",
              borderRadius: "4px",
              background: "#f97316",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "3px",
            }}
          >
            Металлопрокат
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          Металл
          <span style={{ color: "#f97316" }}>Лидер</span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "24px",
            color: "#a3a3a3",
            lineHeight: 1.5,
            maxWidth: "700px",
          }}
        >
          Трубы, арматура, листы, уголки, швеллеры — более 300 наименований. Доставка по Москве и МО.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#737373",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#d4d4d4" }}>
                metallider.ru
              </span>
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#737373",
              }}
            >
              +7 (495) 760-55-39
            </div>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#525252",
              background: "rgba(255,255,255,0.05)",
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            Реутов, Москва
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
