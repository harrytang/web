import { Container } from '@/components/Container'
import SearchBox from './SearchBox'
import { Suspense } from 'react'

export function SimpleLayout({
  title,
  intro,
  seachBox = false,
  children,
}: {
  title?: string
  intro?: string
  seachBox?: boolean
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      {(title || intro) && (
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            {title}
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {intro}
          </p>
        </header>
      )}
      {seachBox && (
        <Suspense>
          <SearchBox />
        </Suspense>
      )}
      {children && <div className="mt-16 sm:mt-20">{children}</div>}
    </Container>
  )
}
