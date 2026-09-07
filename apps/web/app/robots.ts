import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://prayaspariwaar.com";
  const baseUrl = rawAppUrl.replace(/\/+$/, "");
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
  const basePath =
    rawBasePath && rawBasePath !== ""
      ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`)
      : "";
  const prefix = basePath ? basePath.replace(/\/+$/, "") : "";

  const sitemapUrl =
    prefix && !baseUrl.endsWith(prefix)
      ? `${baseUrl}${prefix}/sitemap.xml`
      : `${baseUrl}/sitemap.xml`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        prefix ? `${prefix}/admin/` : "/admin/",
        prefix ? `${prefix}/api/` : "/api/",
      ],
    },
    sitemap: sitemapUrl,
  };
}
