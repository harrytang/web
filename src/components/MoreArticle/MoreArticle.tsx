'use client'

import { useState } from 'react'

// local imports
import ArticleList from '@/components/ArticleList'
import Button from '@/components/Button'
import { Blog, getBlogs } from '@/lib/blogs'

type MoreArticleProps = {
  total: number
  type: 'compact' | 'full'
}

const MoreArticle: React.FC<MoreArticleProps> = ({ total, type }) => {
  const limit = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE!)
  const [start, setStart] = useState(limit)
  const [articles, setArticles] = useState<Blog[]>([])
  const [disabled, setDisabled] = useState(total <= limit)

  const loadMore = async () => {
    setStart(start + limit)
    const res = await getBlogs(start, limit)
    setArticles((prevArticles) => [...prevArticles, ...res.data])
    setDisabled(
      res.data.length < limit || res.meta.pagination.total <= start + limit,
    )
  }

  return (
    <>
      {articles.map((article) => {
        return (
          <ArticleList
            article={article}
            key={article.attributes.slug}
            type={type}
          />
        )
      })}

      {!disabled && (
        <div className="col-span-1 mx-auto mt-5 text-center sm:col-span-2 lg:col-span-3">
          <Button
            onClick={loadMore}
            type="button"
            variant="primary"
            className="group mt-6 w-full"
          >
            Load more
          </Button>
        </div>
      )}
    </>
  )
}

export default MoreArticle
