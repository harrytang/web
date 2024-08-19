import { notFound } from 'next/navigation'
import { BlogLayout } from '@/components/BlogLayout'
import { getBlog, getBlogSlugs } from '@/lib/blogs'
import { generateArticleJsonLd, generateSeoMeta } from '@/lib/helper'

interface BlogProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: BlogProps) {
  const blog = await getBlog(params.slug)
  if (blog) {
    return generateSeoMeta(
      `blog/${params.slug}`,
      blog.attributes.seo,
      'article',
      blog.attributes.locale,
    )
  }
}

const Blog = async ({ params }: BlogProps) => {
  console.info(`Rendering /blog/${params.slug} page...`)
  const blog = await getBlog(params.slug)
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
