'use client'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http, fallback } from '@wagmi/core'
import { polygon } from 'viem/chains'
import { RainbowKitProvider, darkTheme, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ClientOnly from './components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

// Enhanced wallet connection configuration
const { wallets } = getDefaultWallets({
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  appName: 'Genesis Badge',
  chains: [polygon],
})

const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: fallback([
      // Primary RPC with Alchemy
      http(
        process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY
          ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY}`
          : 'https://polygon-rpc.com'
      ),
      // Fallback RPCs for reliability
      http('https://polygon.llamarpc.com'),
      http('https://polygon-rpc.com'),
    ]),
  },
  ssr: true,
  // Enable WalletConnect v2
  enableWalletConnect: true,
  // Enable Coinbase Wallet
  enableCoinbase: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: 2,
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
            chains={[polygon]}
            wallets={wallets}
            projectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}
            theme={darkTheme({
              accentColor: '#4f46e5',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
            modalSize="compact"
            appInfo={{
              appName: 'Genesis Badge',
              learnMoreUrl: 'https://yourwebsite.com/about',
            }}
            coolMode // Adds confetti effect on successful connection
          >
            <ClientOnly>
              <Component {...pageProps} />
            </ClientOnly>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#4f46e5',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}