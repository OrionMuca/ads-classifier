import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Add empty turbopack config to silence Next.js 16 warning
  // (webpack config is only for dev, production uses Turbopack by default)
  turbopack: {},
  
  // Disable Fast Refresh if it's causing reload issues
  reactStrictMode: false, // Temporarily disable to check if it's causing double renders
  
  // Disable HMR to prevent WebSocket connection issues causing reloads
  // This will make the dev server use full page reloads, but at least they'll be controlled
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
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
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Stabilize HMR WebSocket connection
      config.watchOptions = {
        ...config.watchOptions,
        poll: false, // Disable polling to prevent continuous reconnections
        aggregateTimeout: 300, // Wait 300ms before rebuilding
        ignored: /node_modules/,
      };
      
      // Keep HMR plugin but suppress WebSocket errors in the browser
      // Removing the plugin causes Next.js internal errors
    }
    return config;
  },
};

export default nextConfig;
