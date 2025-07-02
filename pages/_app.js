'use client'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ClientOnly from './components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

// WalletConnect project ID - required for mobile wallets
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id'

// Create config with WalletConnect v2
const config = createConfig(
  getDefaultConfig({
    appName: 'Genesis Badge',
    projectId: projectId,
    chains: [polygon],
    ssr: true,
    transports: {
      [polygon.id]: http(
        process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY
          ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY}`
          : 'https://polygon-rpc.com'
      ),
    },
  })
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
})

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className={inter.className}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            config={config}
            theme={darkTheme({
              accentColor: '#4f46e5',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            })}
            modalSize="compact"
            appInfo={{
              appName: 'Genesis Badge',
              learnMoreUrl: 'https://yourwebsite.com',
            }}
          >
            <ClientOnly>
              <Component {...pageProps} />
            </ClientOnly>
            <Toaster position="bottom-right" />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}