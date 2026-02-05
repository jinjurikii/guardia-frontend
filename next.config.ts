import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/demo/:slug',
        destination: '/demo/:slug/index.html',
      },
      {
        source: '/demo/:slug/',
        destination: '/demo/:slug/index.html',
      },
      {
        source: '/pitch/:slug',
        destination: '/pitch/:slug/index.html',
      },
      {
        source: '/pitch/:slug/',
        destination: '/pitch/:slug/index.html',
      },
    ];
  },
};

export default nextConfig;
