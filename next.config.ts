import type { NextConfig } from "next";

// Старые категории, которые были на корневом уровне (/armatura → /catalog/armatura)
const oldCategorySlugs = [
  "armatura", "balka", "shveller", "ugolok", "kvadrat", "polosa", "prut", "provoloka",
  "profnastil", "listy", "list-goryachekatanyj", "list-ocinkovannyj", "list-pvl",
  "list-riflenyj", "list-xk-gk", "truba-profilnaya", "truba-kruglaya", "truba-kvadratnaya",
  "truba-pryamougolnaya", "truba-vgp", "truba-ocinkovannaya", "truba-elektrosvarnaya",
  "sortovoj-prokat", "krovlya-i-fasad", "metizy-i-furnitura", "samorezy", "elektrody-i-diski",
  "otvody", "petli", "zadvizhki", "zaglushki",
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  async redirects() {
    return [
      // === Статические редиректы (301 permanent) ===

      // /categories → /catalog
      { source: "/categories", destination: "/catalog", permanent: true },

      // /login → /admin/login
      { source: "/login", destination: "/admin/login", permanent: true },

      // /adminpanel/:path* → /admin/:path*
      { source: "/adminpanel", destination: "/admin", permanent: true },
      { source: "/adminpanel/:path*", destination: "/admin/:path*", permanent: true },

      // Удалённые страницы → главная
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
      { source: "/cities", destination: "/", permanent: true },
      { source: "/cities/:city*", destination: "/", permanent: true },
      { source: "/faq", destination: "/", permanent: true },
      { source: "/terms", destination: "/", permanent: true },

      // === Старые категории на корневом уровне → /catalog/[slug] ===
      ...oldCategorySlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/catalog/${slug}`,
        permanent: true as const,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
