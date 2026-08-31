import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prayas-sanstha.org";

  const staticRoutes = [
    "",
    "/about",
    "/projects",
    "/blog",
    "/blood-donation",
    "/medical-equipment",
    "/volunteer",
    "/donate",
    "/contact",
  ];

  let postRoutes: string[] = [];
  let projectRoutes: string[] = [];

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    postRoutes = posts.map((p) => `/blog/${p.slug}`);

    const projects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    });
    projectRoutes = projects.map((p) => `/projects/${p.slug}`);
  } catch (e) {
    // Database may be initializing
  }

  const allUrls = [
    ...staticRoutes.map((route) => ({
      loc: `${baseUrl}${route}`,
      lastmod: new Date().toISOString(),
      priority: route === "" ? "1.0" : route === "/blood-donation" || route === "/donate" ? "0.9" : "0.8",
      changefreq: "daily",
    })),
    ...postRoutes.map((route) => ({
      loc: `${baseUrl}${route}`,
      lastmod: new Date().toISOString(),
      priority: "0.7",
      changefreq: "weekly",
    })),
    ...projectRoutes.map((route) => ({
      loc: `${baseUrl}${route}`,
      lastmod: new Date().toISOString(),
      priority: "0.8",
      changefreq: "weekly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (url) => `
    <url>
      <loc>${url.loc}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
