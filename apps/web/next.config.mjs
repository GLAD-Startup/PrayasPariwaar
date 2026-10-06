/** @type {import('next').NextConfig} */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath =
  rawBasePath && rawBasePath !== ""
    ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`)
    : undefined;

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  transpilePackages: ["@prayas/database", "@prayas/utils"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb",
    },
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  async headers() {
    const isExplicitHttp = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http://");
    const isHstsDisabled = process.env.DISABLE_HSTS === "true";
    const isProduction = process.env.NODE_ENV === "production";

    const globalSecurityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\"), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), midi=()",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
    ];

    // Enforce HSTS (Strict-Transport-Security) for HTTPS production deployments.
    // 1-year duration with includeSubDomains.
    // 'preload' is intentionally omitted to avoid permanent browser preloading of unverified subdomains.
    // Omitted in non-production or when explicit HTTP is configured to prevent breaking local/staging HTTP environments.
    if ((isProduction || process.env.ENABLE_HSTS === "true") && !isExplicitHttp && !isHstsDisabled) {
      globalSecurityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" },
        ],
      },
      {
        source: "/api/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" },
        ],
      },
    ];
  },
  async redirects() {
    if (basePath) {
      return [
        {
          source: "/admin/:path*",
          destination: `${basePath}/admin/:path*`,
          permanent: false,
          basePath: false,
        },
        {
          source: "/admin",
          destination: `${basePath}/admin`,
          permanent: false,
          basePath: false,
        },
        {
          source: "/uploads/:path*",
          destination: `${basePath}/uploads/:path*`,
          permanent: false,
          basePath: false,
        },
        {
          source: "/api/uploads/:path*",
          destination: `${basePath}/api/uploads/:path*`,
          permanent: false,
          basePath: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;


