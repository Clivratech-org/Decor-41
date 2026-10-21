import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Storefront reads live product/settings data from SQLite — keep routes dynamic.
  cacheComponents: false,
};

export default nextConfig;
