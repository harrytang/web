import React from 'react'
import { render, screen } from '@testing-library/react'
import MobileNavigation from './MobileNavigation'
import { Menu } from '@/lib/menus'

// Mock data for the menu items
const menuItems: Menu[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

describe('MobileNavigation', () => {
  it('renders the menu button', () => {
    render(<MobileNavigation items={menuItems} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })
})
