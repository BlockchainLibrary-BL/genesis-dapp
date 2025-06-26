import { createConfig, http } from 'wagmi'
import { polygon } from 'viem/chains'

export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY 
        ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY}`
        : process.env.NEXT_PUBLIC_POLYGON_RPC_URL
    ),
  },
})