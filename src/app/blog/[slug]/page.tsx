import notFound from '@/app/not-found'
import { BlogLayout } from '@/components/BlogLayout'
import { getBlog } from '@/lib/blogs'
import { generateArticleJsonLd, generateSeoMeta } from '@/lib/hepler'
import { Metadata } from 'next'

interface BlogProps {
  params: {
    slug: string
  }
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
