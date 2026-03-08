import type { Metadata } from "next";
import { Montserrat, Geist_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

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

export const metadata: Metadata = {
  title: "ТрубМаркет — Трубы, фитинги и инженерные системы",
  description:
    "Интернет-магазин труб, фитингов и инженерных систем. Более 2300 товаров для водоснабжения, канализации и отопления. Доставка по Москве и МО.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${montserrat.variable} ${geistMono.variable} ${archivoBlack.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
