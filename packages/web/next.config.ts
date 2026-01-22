import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ["images.unsplash.com", "images.pexels.com"],
  },

  // Allow importing from the convex folder at the monorepo root
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      convex: path.resolve(__dirname, "../../convex"),
    };
    return config;
  },
};

export default nextConfig;
