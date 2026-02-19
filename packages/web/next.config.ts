import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ["images.unsplash.com", "images.pexels.com"],
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
