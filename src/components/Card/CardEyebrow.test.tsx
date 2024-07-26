import React from 'react'
import { render, screen } from '@testing-library/react'
import CardEyebrow from './CardEyebrow'

describe('CardEyebrow', () => {
  it('renders correctly', () => {
    render(<CardEyebrow decorate>Eyebrow Content</CardEyebrow>)
    const eyebrowElement = screen.getByText('Eyebrow Content')
    expect(eyebrowElement).toBeInTheDocument()
    expect(eyebrowElement).toHaveClass('pl-3.5')
  })
})
