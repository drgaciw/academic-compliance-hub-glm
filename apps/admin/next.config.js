/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aah/ui'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3002'],
    },
  },
}

module.exports = nextConfig
