/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/forms/daily-down', destination: '/daily-down', permanent: true },
      { source: '/forms/equipment-utilization', destination: '/equipment-utilization', permanent: true },
      { source: '/forms/equipment-transfer', destination: '/equipment-transfer', permanent: true },
    ]
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig



