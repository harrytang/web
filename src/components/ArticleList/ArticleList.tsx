import Card from '@/components/Card'
import { Blog } from '@/lib/blogs'
import { formatDate } from '@/lib/formatDate'
import CardTitle from '../Card/CardTitle'
import CardEyebrow from '../Card/CardEyebrow'
import CardDescription from '../Card/CardDescription'
import CardCta from '../Card/CardCta'

type ArticleListProps = {
  article: Blog
  type: 'compact' | 'full'
}

const ArticleList: React.FC<ArticleListProps> = ({ article, type }) => {
  if (type === 'compact') {
    return (
      <Card as="article">
        <CardTitle href={`/blog/${article.attributes.slug}`}>
          {article.attributes.title}
        </CardTitle>
        <CardEyebrow
          className="text-zinc-500"
          as="time"
          dateTime={article.attributes.publishedAt}
          decorate
        >
          {formatDate(article.attributes.publishedAt)}
        </CardEyebrow>
        <CardDescription>
          {article.attributes.seo.metaDescription}
        </CardDescription>
        <CardCta>Read article</CardCta>
      </Card>
    )
  }
  if (type === 'full') {
    return (
      <article className="md:grid md:grid-cols-4 md:items-baseline">
        <Card className="md:col-span-3">
          <CardTitle href={`/blog/${article.attributes.slug}`}>
            {article.attributes.title}
          </CardTitle>
          <CardEyebrow
            as="time"
            dateTime={article.attributes.publishedAt}
            className="text-zinc-500 md:hidden"
            decorate
          >
            {formatDate(article.attributes.publishedAt)}
          </CardEyebrow>
          <CardDescription>
            {article.attributes.seo.metaDescription}
          </CardDescription>
          <CardCta>Read article</CardCta>
        </Card>
        <CardEyebrow
          as="time"
          dateTime={article.attributes.publishedAt}
          className="mt-1 hidden text-zinc-500 md:block"
        >
          {formatDate(article.attributes.publishedAt)}
        </CardEyebrow>
      </article>
    )
  }
}

export default ArticleList
