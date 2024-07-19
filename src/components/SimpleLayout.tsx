import ReactMarkdown from 'react-markdown'
import { Suspense } from 'react'

// local imports
import { Container } from '@/components/Container'
import SearchBox from '@/components/SearchBox'
import { Prose } from '@/components/Prose'

export function SimpleLayout({
  subtitle,
  content,
  seachBox = false,
  children,
}: {
  subtitle?: string
  content?: string
  seachBox?: boolean
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      {subtitle && (
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          {subtitle}
        </h1>
      )}
      {content && (
        <Prose className="mt-8" data-mdx-content>
          <ReactMarkdown className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {content}
          </ReactMarkdown>
        </Prose>
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
