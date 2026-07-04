import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://griffy.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contractors", "/labour", "/materials", "/projects", "/estimate", "/search"],
        disallow: ["/dashboard", "/admin", "/profile", "/checkout", "/cart", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
