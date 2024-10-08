import { render, screen } from '@testing-library/react'
import NavLink from './NavLink'

describe('NavLink', () => {
  it('renders children correctly', () => {
    render(<NavLink href="/test">Test Link</NavLink>)
    expect(screen.getByText('Test Link')).toBeInTheDocument()
  })

  it('applies correct href attribute', () => {
    render(<NavLink href="/test">Test Link</NavLink>)
    expect(screen.getByText('Test Link')).toHaveAttribute('href', '/test')
  })

  it('applies correct classes', () => {
    render(<NavLink href="/test">Test Link</NavLink>)
    const linkElement = screen.getByText('Test Link')
    expect(linkElement).toHaveClass('transition')
    expect(linkElement).toHaveClass('hover:text-amber-600')
    expect(linkElement).toHaveClass('dark:hover:text-amber-600')
  })
})
