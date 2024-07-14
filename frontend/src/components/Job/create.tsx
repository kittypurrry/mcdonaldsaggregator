import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import { supabase } from "../../lib/database";
import { SalaryRange } from "../../lib/components/Job/SalaryRange";

export const CreateJob = () => {

    const [ salaryRange, setSalaryRange ] = useState<{min: number, max: number}>({min: 0, max: 0})

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
  
  
    const handleAddJob = async(e: any) => {
      e.preventDefault();
      
      try {   
        const { data, status } = await supabase
          .from('jobs')
          .insert({ wallet_address: primaryWallet?.address, position: jobInfo.position, location: jobInfo.location, department: jobInfo.department, type: jobInfo.type, description: jobInfo.description, date_posted: new Date() })
          .select()
  
        if (status == 201) {
          console.log(data?.[0])
          console.log("Job posted successfully.")
        }
      } catch (error) {
        console.log(error)
      }
    }
  
    return (
    <div className="w-full max-w-[60rem] mx-auto lg:p-8">
      <div className='border border-primaryRed rounded-lg px-4 py-6'>

      <div className="flex flex-col items-start gap-y-6">
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
                <SalaryRange salaryRange={salaryRange} setSalaryRange={setSalaryRange} helpText="The salary range will be secured and hidden from applicants with Fully Homomorphic Encryption (FHE)." />
            </div>
          </div>
    
          <button onClick={(e) => handleAddJob(e)} className={`mt-16 border-0 ring-0 outline-0 transition-all w-full px-4 rounded-md py-2 text-sm text-white hover:bg-accentYellow hover:text-black cursor-pointer
            ${ salaryRange.max < salaryRange.min || salaryRange.min == 0 || salaryRange.max == 0 || !jobInfo.position ? 'pointer-events-none bg-gray-400' : 'bg-primaryRed'}`}>Post a Job</button>
    
        </form>
      </div>
      </div>
    </div>
    )
  }