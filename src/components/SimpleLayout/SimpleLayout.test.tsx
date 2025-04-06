import React from 'react'
import { render, screen } from '@testing-library/react'
import SimpleLayout from './SimpleLayout'

jest.mock('@/components/AlgoliaSearch/AlgoliaSearch', () => () => (
  <div>SearchBox</div>
))

describe('SimpleLayout component', () => {
  it('renders the description and content when provided', () => {
    const subtitle = 'Test Subtitle'
    const content = 'Test Content'

    render(<SimpleLayout subtitle={subtitle} content={content} />)

    const subtitleElement = screen.getByText(subtitle)
    const contentElement = screen.queryByText(content)

    expect(subtitleElement).toBeInTheDocument()
    expect(contentElement).toBeInTheDocument()
  })

  it('renders the search box when seachBox is true', () => {
    render(<SimpleLayout seachBox={true} />)

    const searchBoxElement = screen.getByText('SearchBox')

    expect(searchBoxElement).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    const children = <p>Test Children</p>

    render(<SimpleLayout>{children}</SimpleLayout>)

    const childrenElement = screen.getByText('Test Children')

    expect(childrenElement).toBeInTheDocument()
  })

  it('renders header only if title or intro are provided', () => {
    const { container } = render(<SimpleLayout />)
    const header = container.querySelector('header')

    expect(header).toBeNull()
  })

  it('does not render search box when seachBox is false', () => {
    render(<SimpleLayout seachBox={false} />)

    const searchBoxElement = screen.queryByText('SearchBox')

    expect(searchBoxElement).not.toBeInTheDocument()
  })
})
