import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/register',
        permanent: false, // временный редирект (307)
      },
    ];
  },
};

export default nextConfig;
