import React from 'react'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card component', () => {
  it('renders Card component with default div', () => {
    render(<Card>Test Card Content</Card>)
    const cardElement = screen.getByText('Test Card Content')
    expect(cardElement).toBeInTheDocument()
    expect(cardElement.tagName).toBe('DIV')
    expect(cardElement).toHaveClass('group relative flex flex-col items-start')
  })

  it('renders Card component with custom component', () => {
    render(<Card as="section">Test Card Content</Card>)
    const cardElement = screen.getByText('Test Card Content')
    expect(cardElement).toBeInTheDocument()
    expect(cardElement.tagName).toBe('SECTION')
  })
})
