import React from 'react'
import { render, screen } from '@testing-library/react'
import Card from './Card'

// Mock next/link to render as a simple anchor for testing
jest.mock('next/link', () => {
  return ({ children, ...rest }: any) => <a {...rest}>{children}</a>
})

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

  it('renders Card.Link component', () => {
    render(<Card.Link href="/test-link">Link Content</Card.Link>)
    const linkElement = screen.getByRole('link', { name: 'Link Content' })
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', '/test-link')
  })

  it('renders Card.Title component', () => {
    render(
      <Card.Title as="h1" href="/to-card">
        Card Title
      </Card.Title>,
    )
    const titleElement = screen.getByText('Card Title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement.tagName).toBe('SPAN')
    expect(titleElement).toHaveClass('relative z-10')
  })

  it('renders Card.Title component with default heading', () => {
    render(<Card.Title>Card Title</Card.Title>)
    const titleElement = screen.getByText('Card Title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement.tagName).toBe('H2')
    expect(titleElement).toHaveClass(
      'text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100',
    )
  })

  it('renders Card.Description component', () => {
    render(<Card.Description>Description Content</Card.Description>)
    const descriptionElement = screen.getByText('Description Content')
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement).toHaveClass(
      'relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400',
    )
  })

  it('renders Card.Cta component', () => {
    render(<Card.Cta>Call to Action</Card.Cta>)
    const ctaElement = screen.getByText('Call to Action')
    expect(ctaElement).toBeInTheDocument()
    expect(ctaElement).toHaveClass(
      'relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500',
    )
  })

  it('renders Card.Eyebrow component', () => {
    render(<Card.Eyebrow>Eyebrow Content</Card.Eyebrow>)
    const eyebrowElement = screen.getByText('Eyebrow Content')
    expect(eyebrowElement).toBeInTheDocument()
    expect(eyebrowElement).toHaveClass(
      'relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500',
    )
  })

  it('renders decorated Card.Eyebrow component', () => {
    render(<Card.Eyebrow decorate>Eyebrow Content</Card.Eyebrow>)
    const eyebrowElement = screen.getByText('Eyebrow Content')
    expect(eyebrowElement).toBeInTheDocument()
    expect(eyebrowElement).toHaveClass('pl-3.5')

    // const decorationElement = eyebrowElement.querySelector(
    //   '.h-4\\.w-0\\.5\\.rounded-full',
    // )
    // expect(decorationElement).toBeInTheDocument()
  })
})
