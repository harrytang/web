import React from 'react'
import { render, screen } from '@testing-library/react'
import CardCta from './CardCta'

describe('CardCta', () => {
  it('renders correctly', () => {
    render(<CardCta>Call to Action</CardCta>)
    const ctaElement = screen.getByText('Call to Action')
    expect(ctaElement).toBeInTheDocument()
    expect(ctaElement).toHaveClass(
      'relative z-10 mt-4 flex items-center text-sm font-medium text-amber-600',
    )
  })
})
