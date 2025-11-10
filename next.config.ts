import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyTimeout: 3000,
  },
};

export default nextConfig;
