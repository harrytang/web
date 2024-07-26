import React from 'react'
import { render, screen } from '@testing-library/react'
import CardTitle from './CardTitle'

describe('CardTitle', () => {
  it('renders with href correctly', () => {
    render(
      <CardTitle as="h1" href="/to-card">
        Card Title
      </CardTitle>,
    )
    const titleElement = screen.getByText('Card Title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement.tagName).toBe('SPAN')
    expect(titleElement).toHaveClass('relative z-10')
  })

  it('renders without href correctly', () => {
    render(<CardTitle>Card Title</CardTitle>)
    const titleElement = screen.getByText('Card Title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement.tagName).toBe('H2')
    expect(titleElement).toHaveClass(
      'text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100',
    )
  })
})
