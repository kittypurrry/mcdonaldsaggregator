import './App.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { JobListing } from './components/Job/Joblist'
import { jobs } from './lib/data/sample'
import { Layout } from './lib/components/Layout'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { EditProfile } from './components/User/EditProfile'
import { ProtectedRoute } from './components/Routes/Protected'

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
              <Route path="edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }/>
            </Route>
          </Routes>
        </Router>
      </DynamicContextProvider>
    </>
  )
}

export default App
