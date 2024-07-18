import { SimpleLayout } from '@/components/SimpleLayout'
import { getBlogs } from '@/lib/blogs'
import { getPage } from '@/lib/pages'
import { generateSeoMeta } from '@/lib/hepler'
import { ArticleList } from '@/components/ArticleList'
import MoreArticle from '@/components/MoreArticle'

export async function generateMetadata() {
  const page = await getPage('articles')
  return generateSeoMeta(
    'articles',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function ArticlesIndex() {
  const page = await getPage('articles')
  const blogs = await getBlogs(0, parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE!))

  return (
    <SimpleLayout
      description={page.attributes.description}
      content={page.attributes.content}
      seachBox={true}
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {blogs.data.map((blog) => (
            <ArticleList key={blog.id} article={blog} type="full" />
          ))}
          <MoreArticle total={blogs.meta.pagination.total} type="full" />
        </div>
      </div>
    </SimpleLayout>
  )
}
