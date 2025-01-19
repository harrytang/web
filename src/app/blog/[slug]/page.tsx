import { notFound } from 'next/navigation'
import { BlogLayout } from '@/components/BlogLayout'
import { getBlog, getBlogSlugs } from '@/lib/blogs'
import { generateArticleJsonLd, generateSeoMeta } from '@/lib/helper'

interface BlogProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: BlogProps) {
  const { slug } = await params
  const blog = await getBlog(slug)
  if (blog) {
    return generateSeoMeta(
      `blog/${slug}`,
      blog.attributes.seo,
      'article',
      blog.attributes.locale,
    )
  }
}

const Blog = async ({ params }: BlogProps) => {
  const { slug } = await params
  console.info(`Rendering /blog/${slug}`)
  const blog = await getBlog(slug)
  if (!blog) {
    return notFound()
  }
  const jsonld = generateArticleJsonLd(blog)
  return (
    <>
      <BlogLayout blog={blog} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </>
  )
}

export default Blog
