/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ['http://192.168.1.11:3000'], // حط IP + port متاع client
  },
}

export default nextConfig
