"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#ffffff",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "28rem", width: "100%" }}>
            <div
              style={{
                margin: "0 auto 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "4rem",
                height: "4rem",
                borderRadius: "9999px",
                backgroundColor: "#FEF2F2",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                marginTop: 0,
              }}
            >
              Что-то пошло не так
            </h1>
            <p
              style={{
                color: "#6B7280",
                marginBottom: "2rem",
                fontSize: "1rem",
              }}
            >
              Произошла ошибка при загрузке страницы
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.5rem",
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "14rem",
                }}
              >
                Попробовать снова
              </button>
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.5rem",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "1px solid #D1D5DB",
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "14rem",
                  boxSizing: "border-box",
                }}
              >
                На главную
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
