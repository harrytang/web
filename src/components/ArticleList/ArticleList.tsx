import Card from '@/components/Card'
import { Blog } from '@/lib/blogs'
import { formatDate } from '@/lib/formatDate'

type ArticleListProps = {
  article: Blog
  type: 'compact' | 'full'
}

const ArticleList: React.FC<ArticleListProps> = ({ article, type }) => {
  if (type === 'compact') {
    return (
      <Card as="article">
        <Card.Title href={`/blog/${article.attributes.slug}`}>
          {article.attributes.title}
        </Card.Title>
        <Card.Eyebrow
          className="text-zinc-500"
          as="time"
          dateTime={article.attributes.publishedAt}
          decorate
        >
          {formatDate(article.attributes.publishedAt)}
        </Card.Eyebrow>
        <Card.Description>
          {article.attributes.seo.metaDescription}
        </Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
    )
  }
  if (type === 'full') {
    return (
      <article className="md:grid md:grid-cols-4 md:items-baseline">
        <Card className="md:col-span-3">
          <Card.Title href={`/blog/${article.attributes.slug}`}>
            {article.attributes.title}
          </Card.Title>
          <Card.Eyebrow
            as="time"
            dateTime={article.attributes.publishedAt}
            className="text-zinc-500 md:hidden"
            decorate
          >
            {formatDate(article.attributes.publishedAt)}
          </Card.Eyebrow>
          <Card.Description>
            {article.attributes.seo.metaDescription}
          </Card.Description>
          <Card.Cta>Read article</Card.Cta>
        </Card>
        <Card.Eyebrow
          as="time"
          dateTime={article.attributes.publishedAt}
          className="mt-1 hidden text-zinc-500 md:block"
        >
          {formatDate(article.attributes.publishedAt)}
        </Card.Eyebrow>
      </article>
    )
  }
}

export default ArticleList
