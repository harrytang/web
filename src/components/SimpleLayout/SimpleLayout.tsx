import ReactMarkdown from 'react-markdown'
import { Suspense } from 'react'

// local imports
import { Container } from '@/components/Container'
import { AlgoliaSearch } from '@/components/AlgoliaSearch'
import { Prose } from '@/components/Prose'

type SimpleLayoutProps = {
  subtitle?: string
  content?: string
  seachBox?: boolean
  children?: React.ReactNode
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  subtitle,
  content,
  seachBox = false,
  children,
}) => {
  return (
    <Container className="mt-16 sm:mt-32">
      {subtitle && (
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          {subtitle}
        </h1>
      )}
      {content && (
        <Prose className="mt-8" data-mdx-content>
          <div className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </Prose>
      )}
      {seachBox && (
        <Suspense>
          <AlgoliaSearch />
        </Suspense>
      )}
      {children && <div className="mt-16 sm:mt-20">{children}</div>}
    </Container>
  )
}

export default SimpleLayout
