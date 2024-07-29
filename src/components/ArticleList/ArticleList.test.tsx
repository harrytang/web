import { render, screen } from '@testing-library/react'
import ArticleList from './ArticleList'
import { Blog } from '@/lib/blogs'

const mockArticle: Blog = {
  attributes: {
    slug: 'test-article',
    title: 'Test Article',
    publishedAt: '2023-06-01T00:00:00.000Z',
    seo: {
      metaDescription: 'This is a test article for testing purposes.',
      id: 0,
      metaTitle: '',
      keywords: '',
      metaRobots: null,
      structuredData: null,
      metaViewport: null,
      canonicalURL: null,
      metaImage: {
        data: {
          id: 0,
          attributes: {
            name: '',
            alternativeText: '',
            caption: '',
            width: 0,
            height: 0,
            formats: {
              large: undefined,
              medium: undefined,
              small: undefined,
              thumbnail: undefined,
            },
            hash: '',
            ext: '',
            mime: '',
            size: 0,
            url: '',
            previewUrl: null,
            provider: '',
            provider_metadata: null,
            createdAt: '',
            updatedAt: '',
          },
        },
      },
      metaSocial: [],
    },
    content: '',
    locale: '',
    createdAt: '',
    updatedAt: '',
  },
  id: 0,
}

describe('ArticleList', () => {
  it('renders compact type correctly', () => {
    render(<ArticleList article={mockArticle} type="compact" />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(
      screen.getByText('This is a test article for testing purposes.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Read article')).toBeInTheDocument()
    expect(screen.getByText(/1 June 2023/)).toBeInTheDocument()
  })

  it('renders full type correctly', () => {
    render(<ArticleList article={mockArticle} type="full" />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(
      screen.getByText('This is a test article for testing purposes.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Read article')).toBeInTheDocument()
    expect(screen.getAllByText(/1 June 2023/)).toHaveLength(2) // One for hidden md:hidden and one for md:block
  })

  it('has correct link in the title', () => {
    render(<ArticleList article={mockArticle} type="compact" />)
    const titleLink = screen.getByRole('link', { name: 'Test Article' })
    expect(titleLink).toHaveAttribute('href', '/blog/test-article')
  })
})
