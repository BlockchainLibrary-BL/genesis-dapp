import { createConfig, http } from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { polygon } from 'viem/chains';

const alchemyOrRPC =
  process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY
    ? https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY}
   process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(alchemyOrRPC),
  },
  connectors: [
    new WalletConnectConnector({
      chains: [polygon],
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'Blockchain Library',
          description: 'Genesis Badge Minting DApp',
          url: 'https://genesis.blockchain-library.org',
          icons: ['https://genesis.blockchain-library.org/favicon.ico'],
        },
      },
    }),
  ],
});