import './App.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { JobListing } from './components/Job/Joblist'
import { jobs } from './lib/data/sample'
import { Layout } from './lib/components/Layout'

function App() {

  return (
    <>
      <DynamicContextProvider
        settings={{
          environmentId: import.meta.env.VITE_DYNAMIC_ID,
          walletConnectors: [ EthereumWalletConnectors ],
        }}>
        <Layout>
          <JobListing jobs={jobs} />
        </Layout>
      </DynamicContextProvider>
    </>
  )
}

export default App
