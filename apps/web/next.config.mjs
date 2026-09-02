/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  transpilePackages: ["@prayas/database", "@prayas/utils"],
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;

