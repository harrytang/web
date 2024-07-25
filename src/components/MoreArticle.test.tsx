import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// local imports
import MoreArticle from '@/components/MoreArticle'
import listBlogs2 from '@/../__test__/fixtures/listBlogs2.json'
import listBlogs3 from '@/../__test__/fixtures/listBlogs3.json'
import { Blog, getBlogs } from '@/lib/blogs'

jest.mock('@/lib/blogs', () => ({
  getBlogs: jest.fn(),
}))

jest.mock(
  '@/components/ArticleList',
  () =>
    ({ article, type }: { article: any; type: string }) => (
      <div>{article.attributes.slug}</div>
    ),
)

describe('MoreArticle', () => {
  const mockGetBlogs = getBlogs as jest.Mock

  it('renders correctly', async () => {
    render(<MoreArticle total={6} type="compact" />)

    // Initially, no articles should be displayed
    listBlogs2.forEach((blog) => {
      expect(screen.queryByText(blog.attributes.slug)).not.toBeInTheDocument()
    })

    // Load more articles (#1)
    mockGetBlogs.mockResolvedValue({
      data: listBlogs2 as Blog[],
      meta: { pagination: { total: 11 } },
    })
    const button = screen.getByText('Load more')
    await userEvent.click(button)

    listBlogs2.forEach((blog) => {
      expect(screen.getByText(blog.attributes.slug)).toBeInTheDocument()
    })

    // Button should be present as not all articles are loaded
    expect(screen.queryByText('Load more')).toBeInTheDocument()

    // Load more articles (#2)
    mockGetBlogs.mockResolvedValue({
      data: listBlogs3 as Blog[],
      meta: { pagination: { total: 11 } },
    })
    await userEvent.click(button)

    listBlogs3.forEach((blog) => {
      expect(screen.getByText(blog.attributes.slug)).toBeInTheDocument()
    })

    // Button should not be present as all articles are loaded
    expect(screen.queryByText('Load more')).not.toBeInTheDocument()
  })
})
