import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker Standalone mode for production
  output: 'standalone',
  
  // Disable telemetry
  poweredByHeader: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;
