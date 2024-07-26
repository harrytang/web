'use client'
import MagnifyingGlassIcon from '@heroicons/react/20/solid/MagnifyingGlassIcon'
import { useSearchParams } from 'next/navigation'

const SearchBox: React.FC = () => {
  const searchParams = useSearchParams()

  const handleSearch = (e: {
    preventDefault: () => void
    currentTarget: HTMLFormElement | undefined
  }) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    if (search) {
      window.location.href = `/search?q=${search}`
    }
  }

  return (
    <div className="mt-16 flex flex-1 items-center justify-center px-2 lg:ml-6">
      <div className="w-full max-w-lg lg:max-w-xs">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <form onSubmit={handleSearch}>
            <input
              id="search"
              name="search"
              className="block w-full rounded-full bg-white/90 py-1.5 pl-10 pr-3 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
              placeholder="Search Articles"
              type="search"
              defaultValue={searchParams.get('q') ?? ''}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default SearchBox
