// utils/env.js
export function getEnv() {
  return {
    projectId: process.env.NEXT_PUBLIC_REWON_PROJECT_ID,
    contractAddress: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT,
    isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  }
}