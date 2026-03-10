import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/profile",
          "/favorites",
          "/login",
          "/register",
          "/forgot-password",
          "/verify",
          "/*?*sort=",
          "/*?*page=",
        ],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/profile",
          "/favorites",
          "/login",
          "/register",
          "/forgot-password",
          "/verify",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
