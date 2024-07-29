'use client'

import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/20/solid'

// local imports
import { AppContext } from '@/app/providers'
import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'
import { Blog } from '@/lib/blogs'
import { formatDate } from '@/lib/helper'

// dynamic imports
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

type BlogLayoutProps = {
  blog: Blog
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ blog }) => {
  let router = useRouter()
  let { previousPathname } = useContext(AppContext)

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          {previousPathname && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to articles"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          )}
          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {blog.attributes.title}
              </h1>
              <time
                dateTime={blog.attributes.publishedAt}
                className="order-first flex items-center text-base text-zinc-500 dark:text-zinc-500"
              >
                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                <span className="ml-3">
                  {formatDate(blog.attributes.publishedAt)}
                </span>
              </time>
            </header>
            <Prose className="mt-8" data-mdx-content>
              {blog.attributes.mediaUrl && (
                <div className="player-wrapper">
                  <ReactPlayer
                    className="react-player"
                    url={blog.attributes.mediaUrl}
                    width="100%"
                    height="100%"
                  />
                </div>
              )}

              <figure className="mt-16">
                <Image
                  className="rounded-md bg-gray-50 object-cover"
                  src={blog.attributes.seo.metaImage.data.attributes.url}
                  alt={blog.attributes.seo.metaImage.data.attributes.caption}
                  width={blog.attributes.seo.metaImage.data.attributes.width}
                  height={blog.attributes.seo.metaImage.data.attributes.height}
                />
                <figcaption className="mt-4 flex justify-center gap-x-2 text-sm leading-6 text-gray-500">
                  <InformationCircleIcon
                    className="mt-0.5 h-5 w-5 flex-none text-gray-300"
                    aria-hidden="true"
                  />
                  {blog.attributes.seo.metaImage.data.attributes.caption}
                </figcaption>
              </figure>

              <ReactMarkdown>{blog.attributes.content}</ReactMarkdown>
            </Prose>
          </article>
        </div>
      </div>
    </Container>
  )
}

export default BlogLayout
