import { getTimeDifference } from "../../helper"

export const JobListing = ({ jobs } : { jobs : Job[] }) => {
    return (
    <ul role="list" className="w-full divide-y divide-gray-100">
        {jobs.map((job: Job) => (
        <li key={job.company.name} className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
            <div className="h-12 w-12 flex-none rounded-full bg-gray-500"></div>
            <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">{job.position}</p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">{job.company.name} • {job.department}</p>
            </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900">{job.type}</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {getTimeDifference([new Date(job.datePosted), new Date()])}
            </p>
            </div>
        </li>
        ))}
    </ul>
    )
}