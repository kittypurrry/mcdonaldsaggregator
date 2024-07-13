import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

export const SalaryRange = ({ salaryRange, setSalaryRange, helpText }: { salaryRange: { min: number, max: number}, setSalaryRange: Function, helpText: string }) => {
  
  const [rangeError, setRangeError] = useState<boolean>(false)

  useEffect(() => {
    if ((salaryRange.max < salaryRange.min)) {
      setRangeError(true)
    } else {
      setRangeError(false)
    }
  }, [salaryRange])

  return (
    <div className="mt-4 max-w-[60rem]">
        <label className="font-bold text-left block mb-2 font-medium leading-6 text-gray-900">
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
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center pr-3">
                    <ExclamationCircleIcon aria-hidden="true" className="h-5 w-5 text-red-500" />
                </div>
                }
            </div>
        </div>
        </div>
        <p className="text-left mt-2 text-sm text-gray-500">
          {helpText}
        </p>
    </div>
  )
}