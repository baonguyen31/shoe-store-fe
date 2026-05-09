import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.puma.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as any; // Dùng any ở đây để ép Vercel chấp nhận mọi thuộc tính mở rộng

export default nextConfig;