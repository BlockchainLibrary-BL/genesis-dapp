'use client'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from '@wagmi/core'
import { polygon } from 'viem/chains'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
// Move to: pages/components/ClientOnly.jsx
import ClientOnly from './components/ClientOnly'
const inter = Inter({ subsets: ['latin'] })

const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY
        ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY}`
        : 'https://polygon-rpc.com'
    ),
  },
  ssr: true
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000
    }
  }
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
            projectId={process.env.NEXT_PUBLIC_REWON_PROJECT_ID}
            theme={darkTheme({
              accentColor: '#4f46e5',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            })}
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