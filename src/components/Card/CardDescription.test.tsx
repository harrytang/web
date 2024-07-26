import React from 'react'
import { render, screen } from '@testing-library/react'
import CardDescription from './CardDescription'

describe('CardDescription.test', () => {
  it('renders correctly', () => {
    render(<CardDescription>Description Content</CardDescription>)
    const descriptionElement = screen.getByText('Description Content')
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement).toHaveClass(
      'relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400',
    )
  })
})
