import './App.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { JobListing } from './components/Job/Joblist'
import { jobs } from './lib/data/sample'
import { Layout } from './lib/components/Layout'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

function App() {

  return (
    <>
      <DynamicContextProvider
        settings={{
          environmentId: import.meta.env.VITE_DYNAMIC_ID,
          walletConnectors: [ EthereumWalletConnectors ],
          events: {
            onAuthSuccess: (args) => {
              console.log(args.user)
            }
          }
        }}
        >
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<JobListing jobs={jobs} />} />

            </Route>
          </Routes>
        </Router>
      </DynamicContextProvider>
    </>
  )
}

export default App
