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
  it('renders the title and intro when provided', () => {
    const title = 'Test Title'
    const intro = 'Test Intro'

    render(<SimpleLayout title={title} intro={intro} />)

    const titleElement = screen.getByText(title)
    const introElement = screen.getByText(intro)

    expect(titleElement).toBeInTheDocument()
    expect(introElement).toBeInTheDocument()
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
