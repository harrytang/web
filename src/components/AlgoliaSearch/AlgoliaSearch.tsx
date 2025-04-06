'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/20/solid'

import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { SearchBox, Hits, Highlight, Configure } from 'react-instantsearch'
import { InstantSearchNext } from 'react-instantsearch-nextjs'

type BaseHit = {
  objectID: string
  __position: number
  __queryID?: string
}

interface ArticleHit extends BaseHit {
  objectID: string
  title: string
  description: string
  image?: string
}

const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
)

const searchClient = {
  ...algoliaClient,
  search<TObject>(
    requests: { indexName: string; params: { query?: string } }[],
  ) {
    if (requests.every(({ params }) => !params.query?.trim())) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 0,
          exhaustiveNbHits: false,
          query: '',
          params: '',
        })),
      })
    }
    return algoliaClient.search<TObject>(requests)
  },
}

function Hit({ hit }: { hit: ArticleHit }) {
  return (
    <article className="space-y-1 rounded-md p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700">
      <Link href={`blog/${hit.objectID}`}>
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <Highlight
            attribute="title"
            hit={hit}
            classNames={{
              root: 'whitespace-normal',
              highlighted:
                'bg-amber-200 text-amber-900 dark:bg-amber-400/20 dark:text-amber-300 font-medium',
            }}
          />
        </h1>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Highlight
            attribute="description"
            hit={hit}
            classNames={{
              root: 'whitespace-normal',
              highlighted:
                'bg-amber-100 text-amber-900 dark:bg-amber-300/10 dark:text-amber-200 font-medium',
            }}
          />
        </p>
      </Link>
    </article>
  )
}

const AlgoliaSearch = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const idxName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'articles_index'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen && e.key === 'Tab') {
        e.preventDefault()
      }
    }

    if (modalOpen) {
      document.body.classList.add('overflow-hidden')
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', handleKeyDown)
    }

    // Cleanup on unmount or modal close
    return () => {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalOpen])

  return (
    <>
      {!modalOpen && (
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400"
            />
            <input
              onFocus={() => setModalOpen(true)}
              name="search"
              type="search"
              placeholder="Search articles"
              className="w-full appearance-none rounded-md border border-zinc-900/10 bg-white py-2 pr-3 pl-10 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:outline-none sm:text-sm dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-20 backdrop-blur-xs dark:bg-white/25"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="m-3 w-full max-w-2xl rounded-lg bg-zinc-50 p-5 shadow-lg dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <InstantSearchNext
              searchClient={searchClient}
              indexName={idxName}
              future={{ preserveSharedStateOnUnmount: true }}
            >
              <div className="relative w-full">
                <Configure hitsPerPage={10} />
                <SearchBox
                  autoFocus={true}
                  placeholder="Type your search here..."
                  submitIconComponent={() => (
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  )}
                  resetIconComponent={() => null}
                  loadingIconComponent={() => (
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin text-zinc-400" />
                    </div>
                  )}
                  classNames={{
                    input:
                      'w-full rounded-md border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-amber-400 dark:focus:ring-amber-400/20',
                  }}
                />
              </div>

              <div className="mt-4 max-h-[70vh] overflow-y-scroll pr-1">
                <Hits hitComponent={Hit} classNames={{ list: 'space-y-2' }} />
              </div>
            </InstantSearchNext>
          </div>
        </div>
      )}
    </>
  )
}

export default AlgoliaSearch
