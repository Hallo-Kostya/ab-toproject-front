import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // MinIO по hostname 'minio' (для Docker network)
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/curators/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'minio',
        port: '9000',
        pathname: '/curators/avatars/**',
      },
      // MinIO по localhost (для локалки)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/curators/avatars/**',
      },
      // MinIO по IP (для production)
      {
        protocol: 'http',
        hostname: '51.250.17.41',
        port: '9000',
        pathname: '/curators/avatars/**',
      },
    ],
  },
};

export default nextConfig;