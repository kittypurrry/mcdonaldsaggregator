import { useQuery } from "@tanstack/react-query";
import { getTimeDifference } from "../../lib/helper"
import { Pin } from "../Icons/pin"
import { useConfig } from 'wagmi'
import { supabase } from "../../lib/database";
import { readContract } from "wagmi/actions";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
// @ts-ignore
export const toHexString = (bytes) =>
  bytes.reduce((str: any, byte: any) => str + byte.toString(16).padStart(2, "0"), "");


export const JobListing = () => {  

  const { primaryWallet } = useDynamicContext()
  const config = useConfig();
  const isLoggedIn = useIsLoggedIn();
  const [showDoesNotMatchModal, setShowDoesNotMatchModal] = 

 
  const { data:jobs } = useQuery({
    queryKey: ['getAllJobs'],
    queryFn: async() => {
      let allJobs = (await supabase.from('jobs').select()).data
      let allCompanies = (await supabase.from('companies').select()).data
      allJobs = (allJobs || []).map((job: any) => {
        let company = allCompanies?.find((company: Company & { wallet_address: string} ) => company.wallet_address == job.wallet_address)

        return {
          ...job,
          company: company,
          datePosted: job.date_posted
        }
      })
      
      return allJobs
    }
  })


  const handleApplyJob = async (e: any, jobId: number) => {
    e.preventDefault();

    try {
      const result = await readContract(config, {
        address: '0x05D39616DEFD9f2dcC0f0E2f012a9Bc1F4CFAf93',
        abi:
          [
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "jobId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "applicantAddress",
                  "type": "address"
                }
              ],
              "name": "isMatchingSalaryRange",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
          ]
        ,
        functionName: 'isMatchingSalaryRange',
        args: [BigInt(jobId), primaryWallet?.address as `0x${string}`]
      })

      // if does not match, show to user
      if (!result) {
        showDoesNotMatchModal()
      }

      console.log(result)
    } catch( error: any) {
      console.log(error)
      console.log(error.message)
      return error
    }
  }


  return (
    <ul role="list" className="w-full flex flex-col gap-4 min-h-[70vh]">
      {(jobs || []).map((job: Job & { id: number }) => (
        <li key={job.company.name + job.id} className="flex items-center justify-between gap-x-6 py-5 border border-primaryRed rounded-md
        p-4">
          <div className="flex min-w-0 w-full items-center justify-between gap-x-2">
            <div className="min-w-0">
              <p className="text-lg text-left text-sm font-semibold leading-6 text-gray-900">{job.position}</p>
              <p className="text-left truncate text-xs leading-5 text-gray-500">{job.company.name} • {job.department} </p>
            </div>

            {/** location */}
            <div className="flex w-fit md:flex-row flex-col sm:items-end md:gap-6 md:items-center">
              <div className="flex items-center gap-x-1">
                <Pin />
                <p className="text-left text-sm font-semibold leading-6 text-gray-900">{job.location}</p>
              </div>

              <div className="hidden shrink-0 sm:flex sm:items-center md:items-end sm:gap-x-2 sm:flex-row md:flex-col sm:items-end">
                <p className="capitalize text-sm leading-6 text-gray-900">{job.type}</p>
                <p className="hidden md:block text-xs leading-5 text-gray-500">
                  {getTimeDifference([new Date(), new Date(job.datePosted)])}
                </p>
              </div>
            </div>
          </div>

          {/** Apply button */}
          <button onClick={(e) => handleApplyJob(e, job.id)} className={`h-fit transition-all px-4 py-1.5 text-sm text-[#FFF] outline-0 border-0 ring-0 hover:text-[#000] hover:ring-0 hover:outline-0 hover:bg-accentYellow ${ !isLoggedIn ? 'pointer-events-none bg-gray-400' : 'bg-primaryRed'}`}>
            { isLoggedIn ? 'Apply' : 'Log in to Apply' } 
          </button>
        </li>
      ))}
    </ul>
  )
}