import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from network IPs for mobile development
  allowedDevOrigins: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://192.168.88.235:3001',
    'http://192.168.1.7:3001',
  ],
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in development for localhost
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/uploads/**',
      },
      // Allow uploads from network IPs
      {
        protocol: 'http',
        hostname: '192.168.88.235',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.7',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
