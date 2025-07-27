import React from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import remarkGfm from 'remark-gfm'

/* local imports */
import { BLUR_IMAGE } from '@/../const'
import { isInternalLink } from '@/lib/helper'
import Link from 'next/link'

// Custom Image component for Markdown
const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt || 'Markdown Image'}
      width={0}
      height={0}
      sizes="100vw"
      className="h-auto w-full rounded-md"
      priority={true}
      loading="eager"
      placeholder="blur"
      blurDataURL={BLUR_IMAGE}
    />
  )
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        img: ({ node, src, ...props }) => (
          <MarkdownImage
            src={typeof src === 'string' ? src : undefined}
            {...props}
          />
        ),
        a: ({ href = '', children, ...props }) =>
          isInternalLink(href) ? (
            <Link href={href} {...props}>
              {children}
            </Link>
          ) : (
            <a href={href} target="_blank" {...props}>
              {children}
            </a>
          ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export { MarkdownRenderer }
