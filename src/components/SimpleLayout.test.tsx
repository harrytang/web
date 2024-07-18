import React from 'react'
import { render, screen } from '@testing-library/react'
import { SimpleLayout } from './SimpleLayout'

// Mock the Container and SearchBox components
jest.mock('@/components/Container', () => ({
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className: string
  }) => <div className={className}>{children}</div>,
}))

jest.mock('./SearchBox', () => () => <div>SearchBox</div>)

describe('SimpleLayout component', () => {
  it('renders the description and content when provided', () => {
    const description = 'Test Description'
    const content = 'Test Content'

    render(<SimpleLayout description={description} content={content} />)

    const descElement = screen.getByText(description)
    const contentElement = screen.queryByText(content)

    expect(descElement).toBeInTheDocument()
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
