/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
              style-src 'self' 'unsafe-inline' https:;
              img-src 'self' data: https:;
              font-src 'self' https:;
              connect-src 'self' https: wss:;
              frame-src 'self' https:;
              media-src 'self' https:;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    return config;
  }
}

module.exports = nextConfig