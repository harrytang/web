import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import Link from 'next/link'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export default function Pagination({
  totalPages,
  currentPage,
}: PaginationProps) {
  if (totalPages <= 1) return null // No pagination needed if only one page

  // Determine the range of page numbers to show
  let startPage = Math.max(1, currentPage - 1)
  let endPage = Math.min(totalPages, currentPage + 1)

  if (currentPage === 1) {
    endPage = Math.min(3, totalPages) // Show first three pages if at the beginning
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2) // Show last three pages if at the end
  }

  const pagesToShow = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  )

  return (
    <nav className="flex items-center justify-center space-x-2 px-4 sm:px-0">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={
            currentPage === 2 ? '/articles' : `/articles/${currentPage - 1}`
          }
          className="inline-flex items-center border-t-2 border-transparent px-2 pt-4 text-sm font-medium text-zinc-600 hover:border-zinc-300 dark:text-zinc-500 dark:hover:border-zinc-700"
          aria-label="Previous"
        >
          <ArrowLongLeftIcon
            aria-hidden="true"
            className="mr-1 size-5 text-gray-400"
          />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex space-x-2">
        {/* First Page Link (if needed) */}
        {startPage > 1 && (
          <>
            <Link
              href="/articles"
              className="inline-flex items-center border-t-2 border-transparent px-2 pt-4 text-sm font-medium text-zinc-600 hover:border-zinc-300 dark:text-zinc-500 dark:hover:border-zinc-700"
            >
              1
            </Link>
            {startPage > 2 && (
              <span className="px-2 pt-4 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Middle Pages */}
        {pagesToShow.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={pageNumber === 1 ? '/articles' : `/articles/${pageNumber}`}
            className={clsx(
              'inline-flex items-center border-t-2 px-2 pt-4 text-sm font-medium',
              pageNumber === currentPage
                ? 'border-amber-700 font-bold text-amber-700 dark:border-amber-500 dark:text-amber-500'
                : 'border-transparent text-zinc-600 hover:border-zinc-300 dark:text-zinc-500 dark:hover:border-zinc-700',
            )}
          >
            {pageNumber}
          </Link>
        ))}

        {/* Last Page Link (if needed) */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 pt-4 text-gray-500">...</span>
            )}
            <Link
              href={`/articles/${totalPages}`}
              className="inline-flex items-center border-t-2 border-transparent px-2 pt-4 text-sm font-medium text-zinc-600 hover:border-zinc-300 dark:text-zinc-500 dark:hover:border-zinc-700"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={`/articles/${currentPage + 1}`}
          className="inline-flex items-center border-t-2 border-transparent px-2 pt-4 text-sm font-medium text-zinc-600 hover:border-zinc-300 dark:text-zinc-500 dark:hover:border-zinc-700"
          aria-label="Next"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowLongRightIcon
            aria-hidden="true"
            className="ml-1 size-5 text-gray-400"
          />
        </Link>
      )}
    </nav>
  )
}
