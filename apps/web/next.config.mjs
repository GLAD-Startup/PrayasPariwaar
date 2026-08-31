/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@prayas/database", "@prayas/utils"],
  images: {
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
