import { BlogLayout } from '@/components/BlogLayout'
import { getBlog } from '@/lib/blogs'
import { generateSeoMeta } from '@/lib/hepler'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface BlogProps {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string) {
  const res = await getBlog(slug)
  if (res.data.length === 0) {
    notFound()
  }
  return res.data[0]
}

export async function generateMetadata({
  params,
}: BlogProps): Promise<Metadata> {
  const blog = await getBlogPost(params.slug)
  const seo = blog.attributes.seo
  return generateSeoMeta(
    `blog/${params.slug}`,
    seo,
    'article',
    blog.attributes.locale,
  )
}

const Blog = async ({ params }: BlogProps) => {
  const blog = await getBlogPost(params.slug)
  return <BlogLayout blog={blog} />
}

export default Blog
