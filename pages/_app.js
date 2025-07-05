'use client'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { http } from 'viem'
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ClientOnly from './components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id'

const config = getDefaultConfig({
  appName: 'Genesis Badge',
  projectId,
  chains: [polygon],
  transports: {
    [polygon.id]: http(),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={inter.className}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#4f46e5',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            })}
          >
            <ClientOnly>
              {mounted && <Component {...pageProps} />}
            </ClientOnly>
            <Toaster position="bottom-right" />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}