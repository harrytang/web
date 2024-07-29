import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Menu } from '@/lib/menus'
import DesktopNavigation from './DesktopNavigation'

const menuItems: Menu[] = [
  { path: '/home', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
]

describe('DesktopNavigation', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<DesktopNavigation items={menuItems} />)

    const navElement = container.querySelector('nav')
    const ulElement = container.querySelector('ul')

    expect(navElement).toBeInTheDocument()
    expect(ulElement).toBeInTheDocument()
    expect(ulElement).toHaveClass(
      'flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10',
    )
  })

  it('renders NavItem components correctly', () => {
    const { getByText } = render(<DesktopNavigation items={menuItems} />)

    menuItems.forEach((item) => {
      const navItemElement = getByText(item.name)
      expect(navItemElement).toBeInTheDocument()
      expect(navItemElement).toHaveAttribute('href', item.path)
    })
  })

  it('passes additional props to the nav element', () => {
    const { container } = render(
      <DesktopNavigation items={menuItems} data-testid="desktop-navigation" />,
    )

    const navElement = container.querySelector('nav')
    expect(navElement).toHaveAttribute('data-testid', 'desktop-navigation')
  })
})
