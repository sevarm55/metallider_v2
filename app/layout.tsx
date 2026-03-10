import type { Metadata, Viewport } from "next";
import {
  Montserrat,
  Geist_Mono,
  Archivo_Black,
  Unbounded,
} from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/shared/providers";
import { OrganizationJsonLd, LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/shared/json-ld";
import { YandexMetrika } from "@/components/shared/yandex-metrika";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#171717",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "МеталлЛидер — Металлопрокат оптом и в розницу в Москве",
    template: "%s | МеталлЛидер",
  },
  description:
    "Интернет-магазин металлопроката: трубы профильные и круглые, арматура, листы, уголки, швеллеры, профнастил, метизы. Доставка по Москве и МО. Низкие цены, наличие на складе.",
  keywords: [
    "металлопрокат",
    "купить металлопрокат",
    "трубы профильные",
    "труба круглая",
    "арматура",
    "лист стальной",
    "уголок металлический",
    "швеллер",
    "профнастил",
    "метизы",
    "металлопрокат Москва",
    "металлопрокат оптом",
    "доставка металлопроката",
    "МеталлЛидер",
  ],
  authors: [{ name: "МеталлЛидер" }],
  creator: "МеталлЛидер",
  publisher: "МеталлЛидер",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "МеталлЛидер",
    title: "МеталлЛидер — Металлопрокат оптом и в розницу в Москве",
    description:
      "Трубы, арматура, листы, уголки, швеллеры, профнастил — более 300 наименований на складе. Доставка по Москве и МО.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "МеталлЛидер — Металлопрокат",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "МеталлЛидер — Металлопрокат оптом и в розницу",
    description:
      "Трубы, арматура, листы, уголки, швеллеры — более 300 наименований. Доставка по Москве и МО.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "geo.region": "RU-MOS",
    "geo.placename": "Реутов",
    "geo.position": "55.759;37.856",
    "ICBM": "55.759, 37.856",
  },
  verification: {
    // Add when you have these:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${montserrat.variable} ${geistMono.variable} ${archivoBlack.variable} ${unbounded.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
        <noscript>
          {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          )}
        </noscript>
      </body>
    </html>
  );
}
