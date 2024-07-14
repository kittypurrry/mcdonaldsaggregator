import './App.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { JobListing } from './components/Job/Joblist'
import { jobs } from './lib/data/sample'
import { Layout } from './lib/components/Layout'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { EditProfile } from './components/User/EditProfile'
import { ProtectedRoute } from './components/Routes/Protected'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { http, type Chain } from 'viem'

export const inco = {
  id: 9090,
  name: 'Inco',
  nativeCurrency: { name: 'INCO', symbol: 'INCO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.inco.org'] },
  },
} as const satisfies Chain

const evmNetworks = [
  {
    blockExplorerUrls: ['https://etherscan.io/'],
    chainId: 9090,
    chainName: 'Ethereum Mainnet',
    iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
    name: 'INCO',
    nativeCurrency: {
      decimals: 18,
      name: 'INCO',
      symbol: 'INCO',
    },
    networkId: 1,

    rpcUrls: ['https://testnet.inco.org/'],
    vanityName: 'INCO',
  },
]

const config = createConfig({
  chains: [inco],
  multiInjectedProviderDiscovery: false,
  transports: {
    [inco.id]: http(),
  },
});

function App() {


  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId: import.meta.env.VITE_DYNAMIC_ID,
          walletConnectors: [EthereumWalletConnectors],
          overrides: { evmNetworks },
          events: {
            onAuthSuccess: (args) => {
              console.log(args.user)
            }
          }
        }}
      >
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<JobListing jobs={jobs} />} />
                  <Route path="edit"
                    element={
                      <ProtectedRoute>
                        <EditProfile />
                      </ProtectedRoute>
                    } />
                </Route>
              </Routes>
            </Router>
          </DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </QueryClientProvider>
  )
}

export default App
