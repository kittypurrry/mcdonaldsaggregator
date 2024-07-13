import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/database";

export const EditProfile = () => {

  const { user } = useDynamicContext();

  return (
    <div className="w-full lg:p-8">
      <div className='border border-primaryRed rounded-lg px-4 py-6'>
        {/** @ts-ignore */}
        { user?.metadata.userType == 'company' ?
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
  const [rangeError, setRangeError] = useState<boolean>(false)
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    if ((salaryRange.max < salaryRange.min)) {
      setRangeError(true)
    } else {
      setRangeError(false)
    }
  }, [salaryRange])

  const handleUpdateApplicantInfo = async (e: any) => {
    e.preventDefault();
    
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

    }
    } catch (error) {
      console.log(error)
    }
        
  }

  return (
    <div className="flex flex-col items-start gap-y-6">
      <h2 className="font-bold text-xl">Candiate Registration</h2>

     
      <form className="w-full">
        <div className="mt-6 max-w-[40rem]">
            <label className="font-bold text-left block text-md mb-2 font-medium leading-6 text-gray-900">
            Salary Range (USD)
            </label>
            <div className="mt-2 flex gap-x-4 w-full">
            <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                <label className="text-xs">Min.</label>
                <input
                    name="salaryMin"
                    onInput={(e: any) => setSalaryRange({
                        ...salaryRange,
                        min: Number(e.target.value)
                      })}
                    type="number"
                    min={0}
                    placeholder="80000"
                    aria-describedby="salaryMin"
                    className="px-2 w-full bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            <div className="w-full flex flex-col gap-y-1 items-start flex-grow">
                <label className="text-xs">Max.</label>
                <div className="w-full relative flex flex-grow">
                    <input
                        name="salaryMax"
                        type="number"
                        onInput={(e: any) => setSalaryRange({
                          ...salaryRange,
                          max: Number(e.target.value)
                        })}
                        min={0}
                        max={10000000}
                        placeholder="960000"
                        aria-describedby="salaryMax"
                        className={`px-2 bg-transparent block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${rangeError ? 'ring-red-400' : 'ring-gray-300'}`}
                    />
                
                   { rangeError &&
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon aria-hidden="true" className="h-5 w-5 text-red-500" />
                    </div>
                    }
                </div>
            </div>
            </div>
            <p className="text-left mt-2 text-sm text-gray-500">
            Your desired salary range will be secured and hidden from hiring managers with Fully Homomorphic Encryption (FHE).
            </p>
        </div>

        <div className="mt-6 w-full max-w-[40rem]">
           <label className="font-bold text-left block text-md mb-2 font-medium leading-6 text-gray-900">
            Upload your resume
           </label>
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

        <button onClick={(e) => handleUpdateApplicantInfo(e)} className="mt-16 border-0 ring-0 outline-0 transition-all w-full bg-primaryRed px-4 rounded-md py-2 text-sm text-white hover:bg-accentYellow hover:text-black cursor-pointer">Submit</button>

      </form>
    </div>
  )
}

const EditCompany = () => {
  return (
    <></>
  )
}