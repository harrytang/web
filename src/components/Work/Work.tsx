import { getWorks } from '@/lib/works'
import { BriefcaseIcon } from '@heroicons/react/20/solid'
import Role from './Role'

const Work = async () => {
  const works = await getWorks()

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {works.data.map((work) => (
          <Role key={work.id} role={work} />
        ))}
      </ol>
    </div>
  )
}

export default Work
