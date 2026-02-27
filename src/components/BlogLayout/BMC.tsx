import { InformationCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function BMC() {
  return (
    <div className="rounded-md bg-blue-50 pl-4 pr-4 dark:bg-blue-500/10 dark:outline dark:outline-blue-500/20">
      <div className="flex items-center">
        <div className="shrink-0">
          <InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            If you found this useful, you can <Link href={process.env.NEXT_PUBLIC_BMC_URL!} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">buy me a coffee</Link>! Thanks for the support!
          </p>          
        </div>
      </div>
    </div>
  )
}
