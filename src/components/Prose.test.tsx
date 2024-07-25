import React from 'react'
import { render } from '@testing-library/react'
import { Prose } from '@/components/Prose'

describe('Prose', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Prose>Test Content</Prose>)
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default classes correctly', () => {
    const { container } = render(<Prose>Test Content</Prose>)
    expect(container.firstChild).toHaveClass('prose')
    expect(container.firstChild).toHaveClass('dark:prose-invert')
  })

  it('applies additional classes correctly', () => {
    const { container } = render(
      <Prose className="additional-class">Test Content</Prose>,
    )
    expect(container.firstChild).toHaveClass('prose')
    expect(container.firstChild).toHaveClass('dark:prose-invert')
    expect(container.firstChild).toHaveClass('additional-class')
  })

  it('passes additional props correctly', () => {
    const { container } = render(<Prose id="test-id">Test Content</Prose>)
    expect(container.firstChild).toHaveAttribute('id', 'test-id')
  })
})
