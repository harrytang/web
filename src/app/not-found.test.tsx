import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

jest.mock('@/components/Container', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/Button', () => ({
  Button: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a data-testid="button" href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('not-found page', () => {
  it('renders expected 404 message and home link', () => {
    render(<NotFound />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(
      screen.getByText('Sorry, we couldn’t find the page you’re looking for.'),
    ).toBeInTheDocument()

    const backLink = screen.getByTestId('button')
    expect(backLink).toHaveAttribute('href', '/')
    expect(backLink).toHaveTextContent('Go back home')
  })
})