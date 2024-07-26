import React from 'react'
import { render, screen } from '@testing-library/react'
import CardLink from './CardLink'

describe('CardLink', () => {
  it('renders correctly', () => {
    render(<CardLink href="/test-link">Link Content</CardLink>)
    const linkElement = screen.getByRole('link', { name: 'Link Content' })
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', '/test-link')
  })
})
