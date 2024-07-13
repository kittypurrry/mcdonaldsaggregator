import { getTimeDifference } from "../../lib/helper"
import { Pin } from "../Icons/pin"

export const JobListing = ({ jobs } : { jobs : Job[] }) => {
    return (
    <ul role="list" className="w-full flex flex-col gap-4">
        {jobs.map((job: Job) => (
        <li key={job.company.name} className="flex items-center justify-between gap-x-6 py-5 border border-red rounded-md
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
            <button className="h-fit transition-all bg-red px-4 py-1.5 text-sm text-[#FFF] outline-0 border-0 ring-0 hover:text-[#000] hover:ring-0 hover:outline-0 hover:bg-accentYellow">
              Apply
            </button>
        </li>
        ))}
    </ul>
    )
}