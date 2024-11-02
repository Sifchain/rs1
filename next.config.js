/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  },
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://realityspiral.com/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply security headers globally
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS for 2 years
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.walletconnect.org https://*.walletconnect.com; " +
              "connect-src 'self' https://cloudflare-eth.com https://*.walletconnect.org wss://*.walletconnect.org https://*.walletconnect.com wss://*.walletconnect.com; " +
              "img-src 'self' data: https://*.walletconnect.com https://*.walletconnect.org https://registry.walletconnect.com https://explorer-api.walletconnect.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "font-src 'self'; " +
              "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org; " +
              "frame-ancestors 'self';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer', // Ensure referrer info is not sent
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Restrict permissions
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
