import '@rainbow-me/rainbowkit/styles.css'
import '../../styles/globals.css'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import { config, myCustomTheme } from '@/hooks/rainbowKitProvider'
import { Analytics } from '@vercel/analytics/react'
import { NotificationProvider } from '@/context/NotificationContext'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter()
  return (
    <NotificationProvider>
      <WagmiProvider config={config}>
        <Analytics />
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={myCustomTheme} locale={locale}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NotificationProvider>
  )
}

export default MyApp
