import Image from 'next/image'
import { Work } from '@/lib/works'

const Role = async ({ role }: { role: Work }) => {
  const endLabel = role.attributes.end ?? 'Present'
  const endDate = role.attributes.end ?? new Date().getFullYear().toString()

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        <Image
          src={role.attributes.logo.data.attributes.url}
          alt={role.attributes.logo.data.attributes.caption}
          className="h-7 w-7"
          width={role.attributes.logo.data.attributes.width}
          height={role.attributes.logo.data.attributes.height}
        />
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">Role</dt>
        <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {role.attributes.title}
        </dd>
        <dt className="sr-only">Company</dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.attributes.company} | {role.attributes.place}
        </dd>
        <dt className="sr-only">Date</dt>
        <dd
          className="ml-auto text-xs text-zinc-500 dark:text-zinc-400"
          aria-label={`${role.attributes.start} until ${endLabel}`}
        >
          <time dateTime={role.attributes.start}>{role.attributes.start}</time>{' '}
          <span aria-hidden="true">—</span>{' '}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  )
}

export default Role
