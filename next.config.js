/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob:;
              connect-src 'self' https: wss:;
              frame-src 'self' https:;
            `.replace(/\n/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig