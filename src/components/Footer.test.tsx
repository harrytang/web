import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  it('renders menu links correctly', () => {
    render(<Footer />)

    const menuLinks = [
      { name: 'Cookie Policy', path: '/cookie-policy' },
      { name: 'Disclaimer', path: '/disclaimer' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Use', path: '/terms-of-use' },
      { name: 'Credits', path: '/credits' },
    ]

    menuLinks.forEach((menu) => {
      const linkElement = screen.getByText(menu.name)
      expect(linkElement).toBeInTheDocument()
      expect(linkElement).toHaveAttribute('href', menu.path)
    })
  })

  it('renders copyright text correctly', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    const copyrightText = `© ${currentYear} ${process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.`
    expect(screen.getByText(copyrightText)).toBeInTheDocument()
  })
})
