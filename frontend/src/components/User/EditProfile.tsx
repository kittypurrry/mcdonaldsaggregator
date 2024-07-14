import { useDynamicContext, useUserUpdateRequest } from "@dynamic-labs/sdk-react-core"
import { useEffect, useState } from "react";
import { supabase } from "../../lib/database";
import { useQuery } from "@tanstack/react-query";
import { BrowserProvider, AbiCoder } from 'ethers';
import { initFhevm, createInstance } from 'fhevmjs';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { SalaryRange } from "../../lib/components/Job/SalaryRange";
import { Loading } from "../Icons/Loading";
import { allowRangeUpdate } from "../../lib/helper";

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

export const EditProfile = () => {

  const { user } = useDynamicContext();

  return (
    <div className="w-full lg:p-8 max-w-[60rem] mx-auto">
      <div className='border border-primaryRed rounded-lg px-4 py-6'>
        {/** @ts-ignore */}
        {user?.metadata.userType == 'company' ?
          <EditCompany /> :
          <EditApplicant />
        }
      </div>
    </div>
  )
}

const EditApplicant = () => {

  const [salaryRange, setSalaryRange] = useState<{ min: number, max: number }>({ min: 0, max: 0 })
  const [resume, setResume] = useState<File>()
  const [processing, setProcessing] = useState<boolean>(false)

  const { primaryWallet } = useDynamicContext();
  const { data: hash, writeContractAsync } = useWriteContract();
  const { isSuccess, isError } = useWaitForTransactionReceipt({hash: hash})

  const { user } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();

  const { data: resumeUrl } = useQuery({
    queryKey: ['getUserResume', primaryWallet?.address],
    queryFn: async () => {
      const { data } = await supabase.from('applicant_resumes').select().eq('wallet_address', primaryWallet?.address)

      return data?.[0].resume_url
    },
    enabled: !!primaryWallet?.address
  })

  useEffect(() => {

    // update last salary to prevent user from changing salary within 3 months
    // @ts-ignore
    if (hash && isSuccess && user?.metadata?.userType == 'user') {
      updateUser({
        metadata: {
          ...user.metadata,
          lastSalaryUpdate: new Date().getTime()
        }
      })
      setProcessing(false)
    } else if (isError) {
      setProcessing(false)
    }
  }, [isSuccess, isError])

  const handleUpdateApplicantInfo = async (e: any) => {

    e.preventDefault();
    setProcessing(true)

    // @ts-ignore
    if (salaryRange.min > 0 && salaryRange.max > 0 && (!user?.metadata?.lastSalaryUpdate || allowRangeUpdate(user?.metadata?.lastSalaryUpdate))) {

      await initFhevm(); // Load TFHE
      const instance = await createFhevmInstance();
      
      await writeContractAsync({
        address: '0x50fE56C3d91B7C5F7B2d0f25a994D2b0576f89e1',
        abi:
          [
            {
              "inputs": [
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
              "name": "addApplicant",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
          ]
        ,
        functionName: 'addApplicant',
        args: [`0x${toHexString(instance.encrypt32(salaryRange.min))}`, `0x${toHexString(instance.encrypt32(salaryRange.max))}`]
      })
    }


    try {
      if (resume) {
        const ext = resume.name.split('.')[1]

        // upload resume to supabase using primarywalletaddress.ext
        const { data: uploadResume } = await supabase
          .storage
          .from('resume')
          .upload(`${primaryWallet?.address}.${ext}`, resume, {
            cacheControl: '3600',
            upsert: true
          })

        // upload returned path to supabase 
        if (uploadResume?.fullPath) {
          const { status } = await supabase
            .from('applicant_resumes')
            .upsert({ wallet_address: primaryWallet?.address, resume_url: uploadResume.fullPath })
            .select()

          if (status == 201) {
            console.log("Resume uploaded successfully")
          }
        }

        setProcessing(true)
      }
    } catch (error) {
      setProcessing(false)
      console.log(error)
    }
  }

  useEffect(() => {
    console.log(user?.metadata)
  }, [user])

  return (
    <div className="flex flex-col items-start gap-y-6 max-w-[60rem] mx-auto">
      <div className="items-start flex flex-col gap-y-0.5">
        <h2 className="font-bold text-2xl">Applicant Registration</h2>
        <p className="font-medium">Create your account to apply for jobs and get matched with employers.</p>
      </div>


      <form className="w-full">
        {/** @ts-ignore */}
        <SalaryRange allowRangeUpdate={(!!!user?.metadata?.lastSalaryUpdate || (!!user?.metadata.lastSalaryUpdate && allowRangeUpdate(user?.metadata?.lastSalaryUpdate)))} salaryRange={salaryRange} setSalaryRange={setSalaryRange} helpText="Your desired salary range will be secured and hidden from hiring managers with Fully Homomorphic Encryption (FHE).<br /> Note: You can only update your salary every 3 months." />

        <div className="mt-6 w-full max-w-[60rem]">
           <label className="font-bold text-left block text-md mb-2 font-medium leading-6 text-gray-900">
            Upload your resume
          </label>
          {!!resumeUrl &&
            <p className="text-xs my-1 text-left">View curent resume <a href={`https://apqicdmwnqgdjirankkd.supabase.co/storage/v1/object/public/${resumeUrl}`} target="_blank" rel="noreferrer" className="font-medium cursor-pointer text-primaryRed hover:text-black underline">here</a></p>
          }
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-red/25 p-6">
            <input
              onChange={(e: React.FormEvent) => {
                const files = (e.target as HTMLInputElement).files
                if (files && files.length > 0) {
                  setResume(files[0])
                }
              }}
              name="file-upload" type="file"
              accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf"
              className="bg-transparent relative cursor-pointer rounded-md text-black font-semibold border-0 outline-0 ring-0 hover:text-red-500"
            >
            </input>
          </div>

          <p className="text-left mt-2 text-sm text-gray-500">
            We will only share your resume to companies you have applied for.
          </p>
        </div>

        <button onClick={(e) => handleUpdateApplicantInfo(e)} className={`flex justify-center mt-16 border-0 !ring-none !border-0 !outline-none transition-all w-full bg-primaryRed px-4 rounded-md py-2 text-sm text-white hover:bg-accentYellow hover:text-black ${ processing ? 'pointer-events-none' : 'cursor-pointer' }`}>
          { processing ? <Loading /> :
          'Update Profile'
          }
        </button>

        { isSuccess && hash &&
          <p className="text-xs text-center mt-1">Salary range updated successfully! <a className="cursor-pointer underline" href={`https://explorer.testnet.inco.org/tx/${hash}`} target="_blank" rel="noreferrer">View transaction here</a></p>
        }
      </form>
    </div>
  )
}

const EditCompany = () => {

  const [companyInfo, setCompanyInfo] = useState<Company>({ name: '' })
  const [logo, setLogo] = useState<File>()
  const { primaryWallet } = useDynamicContext();
  const [processing, setProcessing] = useState<boolean>(false)

  useQuery({
    queryKey: ['getCompanyInfo', primaryWallet?.address],
    queryFn: async () => {
      const { data } = await supabase.from('companies').select().eq('wallet_address', primaryWallet?.address)

      if (!!data?.[0]) {
        let dbInfo = data[0]
        setCompanyInfo({
          name: dbInfo.name,
          logo: dbInfo.logo,
          website: dbInfo.website,
          description: dbInfo.description
        })
      }

      return true;
    },
    enabled: !!primaryWallet?.address
  })



  const handleUpdateCompanyInfo = async (e: any) => {
    e.preventDefault();
    let logoUrl = companyInfo.logo
    setProcessing(true)

    try {
      if (!!logo) {
        const ext = logo.name.split('.')[1]

        // upload resume to supabase using primarywalletaddress.ext
        const { data: uploadedLogo } = await supabase
          .storage
          .from('companyLogos')
          .upload(`${primaryWallet?.address}.${ext}`, logo, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadedLogo?.fullPath) {
          logoUrl = uploadedLogo.fullPath
        }
      }

      const { status } = await supabase
        .from('companies')
        .upsert({ wallet_address: primaryWallet?.address, logo: logoUrl, name: companyInfo.name, website: companyInfo.website, description: companyInfo.description, last_edited: new Date() })
        .select()

      if (status == 201 || status == 200) {
        setProcessing(false)

        window.location.href = "/job/create"
        console.log("Logo uploaded successfully")
      }

      setProcessing(false)
    } catch (error) {
      console.log(error)
      setProcessing(false)
    }
  }

  return (
  <div className="flex flex-col items-start gap-y-6 max-w-[60rem] mx-auto">
    <div className="items-start flex flex-col gap-y-0.5">
      <h2 className="font-bold text-2xl">Company Registration</h2>
      <p className="font-medium">Set up your company in order to post jobs and find qualified candidates</p>
    </div>

   
    <form className="w-full">
      <div className="mt-6 max-w-[60rem] w-full">
          <label className="font-bold text-left block text-lg mb-2 font-medium leading-6 text-gray-900">
            Company Details
          </label>
          <p className="text-sm text-left mb-4">Provide details about your company</p>
          <div className="flex flex-col gap-y-6">
            <div className="mt-2 flex gap-x-4 w-full">
              <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                <label className="text-xs">Company Name</label>
                <input
                  name="companyName"
                  onInput={(e: any) => setCompanyInfo({
                    ...companyInfo,
                    name: e.target.value
                  })}
                  value={companyInfo.name}
                  type="text"
                  maxLength={150}
                  className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                <label className="text-xs">Company Website</label>
                <input
                  name="companyWebsite"
                  onInput={(e: any) => setCompanyInfo({
                    ...companyInfo,
                    website: e.target.value
                  })}
                  value={companyInfo.website}
                  type="text"
                  maxLength={100}
                  className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
              <label className="text-xs">Company Logo</label>

              <div className="flex gap-x-4 items-center mt-2">
                {!!companyInfo.logo &&
                  <div className="flex flex-col items-center gap-y-2">
                    <img src={`https://apqicdmwnqgdjirankkd.supabase.co/storage/v1/object/public/${companyInfo.logo}`} className="bg-gray-400 rounded-full w-16 h-16" />
                  </div>
                }
                <div className="flex justify-center rounded-lg border border-dashed border-red/25 p-6">
                  <input
                    onChange={(e: React.FormEvent) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files && files.length > 0) {
                        setLogo(files[0])
                      }
                    }}
                    name="file-upload" type="file"
                    accept="images/*"
                    className="bg-transparent relative cursor-pointer rounded-md text-black font-semibold border-0 outline-0 ring-0 hover:text-red-500"
                  >
                  </input>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
              <label className="text-xs">Company Description</label>
              <textarea
                name="companyDescription"
                onInput={(e: any) => setCompanyInfo({
                  ...companyInfo,
                  description: e.target.value
                })}
                value={companyInfo.description}
                maxLength={400}
                className="h-[10rem] px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <button onClick={(e) => handleUpdateCompanyInfo(e)} className={`flex justify-center mt-16 border-0 ring-0 outline-0 transition-all w-full bg-primaryRed px-4 rounded-md py-2 text-sm text-white hover:bg-accentYellow hover:text-black  ${ processing ? 'pointer-events-none' : 'cursor-pointer' }`}>
          { processing ? <Loading />
          : 'Complete Registration'
          }
        </button>

      </form>
    </div>
  )
}