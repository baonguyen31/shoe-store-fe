import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.puma.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
    ],
  },
  // Bỏ qua lỗi ESLint khi build
  eslint: {
    // @ts-ignore
    // @ts-ignore
    ignoreDuringBuilds: true,
  },
  typescript: {
    // @ts-ignore
    ignoreBuildErrors: true,
  },
} as NextConfig;



export default nextConfig;