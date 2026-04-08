import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["remotion", "@remotion/player"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "") ?? "",
      ].filter(Boolean),
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Vercel: prevents bundling issues with Prisma and Node.js-only packages
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
