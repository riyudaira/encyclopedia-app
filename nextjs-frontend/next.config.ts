import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/**",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
