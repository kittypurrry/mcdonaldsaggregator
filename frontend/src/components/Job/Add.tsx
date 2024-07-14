import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import { supabase } from "../../lib/database";
import { SalaryRange } from "../../lib/components/Job/SalaryRange";
import { BrowserProvider, AbiCoder } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';
import { useWriteContract } from 'wagmi'
import { Loading } from "../Icons/Loading";

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

export const CreateJob = () => {

  const [salaryRange, setSalaryRange] = useState<{ min: number, max: number }>({ min: 0, max: 0 })
  const { writeContractAsync } = useWriteContract();
  const [processing, setProcessing] = useState<boolean>(false)

  const [jobInfo, setJobInfo] = useState<Job>({
    company: { name: "" },
    position: "",
    type: "full-time",
    datePosted: new Date(),
    department: "",
    location: "",
    description: ""
  })

  const { primaryWallet } = useDynamicContext();


  const handleAddJob = async (e: any) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { data, status } = await supabase
        .from('jobs')
        .insert({ wallet_address: primaryWallet?.address, position: jobInfo.position, location: jobInfo.location, department: jobInfo.department, type: jobInfo.type, description: jobInfo.description, date_posted: new Date() })
        .select()

      if (status == 201) {
        console.log("Job posted successfully.")

        // job id created ---> data?.[0]
        const jobId = data?.[0].id

        await initFhevm(); 
      const instance = await createFhevmInstance();

      await writeContractAsync({
        address: '0x05D39616DEFD9f2dcC0f0E2f012a9Bc1F4CFAf93',
        abi:
          [{
            "inputs": [
              {
                "internalType": "uint256",
                "name": "jobId",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "_lowerRange",
                "type": "bytes"
              },
              {
                "internalType": "bytes",
                "name": "_higherRange",
                "type": "bytes"
              }
            ],
            "name": "addJobPost",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          ]
        ,
        functionName: 'addJobPost',
        args: [jobId, `0x${toHexString(instance.encrypt32(salaryRange.min))}`, `0x${toHexString(instance.encrypt32(salaryRange.max))}`]
      })
      setProcessing(false)
      }
    } catch (error) {
      setProcessing(false)
      console.log(error)
    }
  }

  return (
    <div className="w-full max-w-[60rem] mx-auto lg:p-8">
      <div className='border border-primaryRed rounded-lg px-4 py-6'>

        <div className="flex flex-col items-start gap-y-6 max-w-[60rem] mx-auto">
          <div className="items-start flex flex-col gap-y-0.5">
            <h2 className="font-bold text-2xl">Post a Job</h2>
            <p className="font-medium">Enter the details below to post a new job listing.</p>
          </div>


          <form className="w-full">
            <div className="mt-4 max-w-[60rem]">
              <div className="flex flex-col gap-y-6">
                <div className="mt-2 flex gap-x-4 w-full">
                  <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                    <label className="text-xs">Position*</label>
                    <input
                      name="jobPosition"
                      onInput={(e: any) => setJobInfo({
                        ...jobInfo,
                        position: e.target.value
                      })}
                      placeholder="Fry Master"
                      type="text"
                      maxLength={150}
                      required
                      className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                    <label className="text-xs">Type</label>
                    <select
                      name="jobType"
                      onChange={(e: any) => setJobInfo({
                        ...jobInfo,
                        type: e.target.value
                      })}
                      className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value={"full-time"}>Full-Time</option>
                      <option value={"part-time"}>Part-Time</option>
                      <option value={"contract"}>Contract</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 flex gap-x-4 w-full">
                  <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                    <label className="text-xs">Location</label>
                    <input
                      name="jobLocation"
                      onInput={(e: any) => setJobInfo({
                        ...jobInfo,
                        location: e.target.value
                      })}
                      type="text"
                      maxLength={150}
                      placeholder="New York, US"
                      className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                    <label className="text-xs">Department</label>
                    <input
                      name="jobDepartment"
                      onInput={(e: any) => setJobInfo({
                        ...jobInfo,
                        department: e.target.value
                      })}
                      type="text"
                      maxLength={150}
                      placeholder="Fry Station"
                      className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                  <label className="text-xs">Job Description</label>
                  <textarea
                    name="jobDescription"
                    onInput={(e: any) => setJobInfo({
                      ...jobInfo,
                      description: e.target.value
                    })}
                    placeholder="Do you live for fries? Become our Fries Fanatic and take charge of the fry station. Cook up crispy, golden fries that our customers love and keep the orders coming."
                    className="h-[10rem] px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>

                {/** Salary Range */}
                <SalaryRange allowRangeUpdate={true} salaryRange={salaryRange} setSalaryRange={setSalaryRange} helpText="The salary range will be secured and hidden from applicants with Fully Homomorphic Encryption (FHE)." />
              </div>
            </div>

            <button onClick={(e) => handleAddJob(e)} className={`flex items-center mt-16 border-0 ring-0 outline-0 transition-all w-full px-4 rounded-md py-2 text-sm text-white hover:bg-accentYellow hover:text-black cursor-pointer
            ${salaryRange.max < salaryRange.min || salaryRange.min == 0 || salaryRange.max == 0 || !jobInfo.position ? 'pointer-events-none bg-gray-400' : 'bg-primaryRed'}`}>
             { processing ? <Loading /> : 'Post a Job' }
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}