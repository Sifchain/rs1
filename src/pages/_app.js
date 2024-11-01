
import '@rainbow-me/rainbowkit/styles.css'; // Import RainbowKit styles first
import '../../styles/globals.css'
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider} from '@rainbow-me/rainbowkit';

import { config , myCustomTheme } from '@/hooks/rainbowKitProvider';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const { locale } = useRouter()
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={myCustomTheme} locale={locale}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;