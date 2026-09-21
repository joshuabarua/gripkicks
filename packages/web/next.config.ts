import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:
      process.env["NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"],
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
      process.env["NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"],
  },

  /* config options here */

  async headers() {
    return [
      {
        source: "/imgs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },

  async rewrites() {
    const apiUrl =
      process.env["API_INTERNAL_URL"] ||
      process.env["NEXT_PUBLIC_API_URL"] ||
      "http://localhost:3001";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Allow importing generated Convex types from monorepo root
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "convex/_generated": path.resolve(__dirname, "../../convex/_generated"),
    };
    return config;
  },
};

export default nextConfig;
