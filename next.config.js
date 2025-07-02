/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Compiler options (replaces swcMinify in newer versions)
  compiler: {
    // Remove if causing issues in your environment
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack configuration to handle ethers.js and other dependencies
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add support for .svg imports if needed
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_GENESIS_BADGE_CONTRACT: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT,
  },

  // Enable static exports if you're doing static site generation
  // output: 'export', // Uncomment if needed

  // Image optimization configuration
  images: {
    domains: ['your-image-domain.com'], // Add domains for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com', // Adjust for your image sources
      },
    ],
  },
};

module.exports = nextConfig;