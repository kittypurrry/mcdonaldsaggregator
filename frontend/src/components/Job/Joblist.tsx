import { useQuery } from "@tanstack/react-query";
import { getTimeDifference } from "../../lib/helper"
import { Pin } from "../Icons/pin"
import { BrowserProvider, AbiCoder } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';
import { useConfig, useReadContract } from 'wagmi'
import { supabase } from "../../lib/database";
import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

// Contract address of TFHE.sol.
// From https://github.com/zama-ai/fhevmjs/blob/c4b8a80a8783ef965973283362221e365a193b76/bin/fhevm.js#L9
const FHE_LIB_ADDRESS = "0x000000000000000000000000000000000000005d";

// @ts-ignore
export const toHexString = (bytes) =>
  bytes.reduce((str: any, byte: any) => str + byte.toString(16).padStart(2, "0"), "");

const createFhevmInstance = async () => {
  // Make sure your MetaMask is connected to Inco Gentry Testnet
  // @ts-ignore
  const provider = new BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString(); // 9090

  const ret = await provider.call({
    to: FHE_LIB_ADDRESS,
    // first four bytes of keccak256('fhePubKey(bytes1)') + 1 byte for library
    data: "0xd9d47bb001",
  });
  const decoded = AbiCoder.defaultAbiCoder().decode(["bytes"], ret);
  const publicKey = decoded[0];

  return createInstance({ chainId, publicKey });
};

export const JobListing = () => {  

  const { user, primaryWallet } = useDynamicContext()
  const config = useConfig();
 
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
          <button onClick={(e) => handleApplyJob(e, job.id)} className="h-fit transition-all bg-primaryRed px-4 py-1.5 text-sm text-[#FFF] outline-0 border-0 ring-0 hover:text-[#000] hover:ring-0 hover:outline-0 hover:bg-accentYellow">
            Apply
          </button>
        </li>
      ))}
    </ul>
  )
}