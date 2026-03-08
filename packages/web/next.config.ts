import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
    domains: ["images.unsplash.com", "images.pexels.com"],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ]
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
