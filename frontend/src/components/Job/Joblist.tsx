import { getTimeDifference } from "../../lib/helper"
import { Pin } from "../Icons/pin"
import { BrowserProvider, AbiCoder } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';
import { useReadContract } from 'wagmi'

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

export const JobListing = ({ jobs }: { jobs: Job[] }) => {
  const result = useReadContract({
    abi: [
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
    ],
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    functionName: 'isMatchingSalaryRange',
    args: [1n, "0x46EA78EFC79aed85B0DE4d4dcecB53633d5E3445"]
  })

  console.log("result: ", result);

  const handleApplyJob = async (e: any) => {
    e.preventDefault();

    await initFhevm(); // Load TFHE
    const instance = await createFhevmInstance();

    const result = await writeContractAsync({
      address: '0xEC3676fd25A7d5D0B885C8c0f3083B15aaC597DA',
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
      args: [1, "0x46EA78EFC79aed85B0DE4d4dcecB53633d5E3445"]
    })
    console.log(result);
  }

  return (
    <ul role="list" className="w-full flex flex-col gap-4">
      {jobs.map((job: Job) => (
        <li key={job.company.name} className="flex items-center justify-between gap-x-6 py-5 border border-primaryRed rounded-md
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
          <button onClick={(e) => handleApplyJob(e)} className="h-fit transition-all bg-primaryRed px-4 py-1.5 text-sm text-[#FFF] outline-0 border-0 ring-0 hover:text-[#000] hover:ring-0 hover:outline-0 hover:bg-accentYellow">
            Apply
          </button>
        </li>
      ))}
    </ul>
  )
}