import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://prayaspariwaar.com";
  const baseUrl = rawAppUrl.replace(/\/+$/, "");
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
  const basePath =
    rawBasePath && rawBasePath !== ""
      ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`)
      : "";
  const prefix = basePath ? basePath.replace(/\/+$/, "") : "";

  // Normalized base site URL without trailing slash
  const siteRoot = prefix && !baseUrl.endsWith(prefix) ? `${baseUrl}${prefix}` : baseUrl;

  // Legitimate public informational pages (verified in apps/web/app/(public))
  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/awards", priority: 0.7, changeFrequency: "monthly" },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { path: "/projects/gallery", priority: 0.7, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "daily" },
    { path: "/blood-donation", priority: 0.9, changeFrequency: "daily" },
    { path: "/medical-equipment", priority: 0.9, changeFrequency: "weekly" },
    { path: "/volunteer", priority: 0.8, changeFrequency: "monthly" },
    { path: "/donate", priority: 0.9, changeFrequency: "daily" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" },
    { path: "/media", priority: 0.7, changeFrequency: "weekly" },
    { path: "/partner/individual", priority: 0.7, changeFrequency: "monthly" },
    { path: "/partner/corporate", priority: 0.7, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteRoot}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    postEntries = posts.map((p) => ({
      url: `${siteRoot}/blog/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const projects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    });
    projectEntries = projects.map((p) => ({
      url: `${siteRoot}/projects/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    // Graceful fallback during offline builds or database initialization
    console.warn(
      "[Sitemap] Database unavailable during sitemap generation; serving static routes only:",
      (error as Error)?.message
    );
  }

  return [...staticEntries, ...postEntries, ...projectEntries];
}
