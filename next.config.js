/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Disable source maps in production
  swcMinify: true, // Enable SWC compiler for better performance
  eslint: {
    ignoreDuringBuilds: true, // Prevent eslint errors from breaking production builds
  },
  typescript: {
    ignoreBuildErrors: true, // Disable TypeScript type errors from failing the build
  },
  env: {
    // These will be embedded at build time
    NEXT_PUBLIC_REWON_PROJECT_ID: process.env.NEXT_PUBLIC_REWON_PROJECT_ID,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_GENESIS_BADGE_CONTRACT: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT,
    NEXT_PUBLIC_POLYGON_RPC_URL: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  }
};

module.exports = nextConfig;