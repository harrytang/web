import React from 'react'
import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import NavItem from './NavItem'

// Mocking next/navigation usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('NavItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with the active class when the path matches', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/active-path')

    const { getByText } = render(
      <NavItem href="/active-path">Active Link</NavItem>,
    )

    const linkElement = getByText('Active Link')
    expect(linkElement).toHaveClass('text-amber-600 dark:text-amber-500')
    expect(linkElement).not.toHaveClass(
      'hover:text-teal-600 dark:hover:text-teal-500',
    )
    expect(linkElement.querySelector('span')).toBeInTheDocument()
  })

  it('renders correctly with the hover class when the path does not match', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/different-path')

    const { getByText } = render(
      <NavItem href="/inactive-path">Inactive Link</NavItem>,
    )

    const linkElement = getByText('Inactive Link')
    expect(linkElement).toHaveClass(
      'hover:text-amber-600 dark:hover:text-amber-500',
    )
    expect(linkElement).not.toHaveClass('text-amber-600 dark:text-amber-600')
    expect(linkElement.querySelector('span')).not.toBeInTheDocument()
  })

  it('renders children correctly', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/active-path')

    const { getByText } = render(
      <NavItem href="/active-path">
        <span>Child Element</span>
      </NavItem>,
    )

    const childElement = getByText('Child Element')
    expect(childElement).toBeInTheDocument()
  })
})
