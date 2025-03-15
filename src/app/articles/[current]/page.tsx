import { SimpleLayout } from '@/components/SimpleLayout'
import { getBlogs } from '@/lib/blogs'
import { getPage } from '@/lib/pages'
import {
  generateListArticleJsonLd,
  generateSeoMeta,
  generateWebPageJsonLd,
} from '@/lib/helper'
import { ArticleList } from '@/components/ArticleList'
import { Pagination } from '@/components/Pagination'

export async function generateMetadata({ params }: ArticlesIndexProps) {
  const page = await getPage('articles')
  const { current } = await params
  const seo = {
    ...page.attributes.seo,
    metaTitle: `${page.attributes.seo.metaTitle} - Page ${current}`,
  }
  return generateSeoMeta(
    `articles/${current}`,
    seo,
    'website',
    page.attributes.locale,
  )
}

export async function generateStaticParams(): Promise<{ current: string }[]> {
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE!)
  const blogs = await getBlogs(0, 1) // Fetch total count
  const totalPages = Math.ceil(blogs.meta.pagination.total / pageSize)
  return Array.from({ length: totalPages }, (_, i) => ({
    current: (i + 1).toString(),
  }))
}

interface ArticlesIndexProps {
  params: Promise<{
    current: string
  }>
}

const ArticlesIndex = async ({ params }: ArticlesIndexProps) => {
  console.info('Rendering /articles')

  // article page
  const articlePage = await getPage('articles')
  const pageJsonld = generateWebPageJsonLd({
    name: articlePage.attributes.title,
    description: articlePage.attributes.seo.metaDescription,
  })

  // blogs & pagination
  const { current } = await params
  const pageIdx = parseInt(current || '1', 10) - 1
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE!)
  const start = pageIdx * pageSize
  const blogs = await getBlogs(start, pageSize)
  const articlesJsonld = generateListArticleJsonLd(blogs.data)
  const totalPages = Math.ceil(blogs.meta.pagination.total / pageSize)

  return (
    <div id="blogs">
      <SimpleLayout
        subtitle={articlePage.attributes.subtitle}
        content={articlePage.attributes.content}
        seachBox={true}
      >
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {blogs.data.map((blog) => (
              <ArticleList key={blog.id} article={blog} type="full" />
            ))}
          </div>
        </div>
        <div className="mt-10">
          <Pagination totalPages={totalPages} currentPage={pageIdx + 1} />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonld) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articlesJsonld) }}
        />
      </SimpleLayout>
    </div>
  )
}

export default ArticlesIndex
