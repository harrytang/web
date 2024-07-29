import React from 'react'
import { render, screen } from '@testing-library/react'
import Section from './Section'

describe('Section', () => {
  it('renders the title and children correctly', () => {
    const title = 'Test Title'
    const children = <p>Test Children</p>

    render(<Section title={title}>{children}</Section>)

    const heading = screen.getByRole('heading', { level: 2, name: title })
    const childrenElement = screen.getByText('Test Children')

    expect(heading).toBeInTheDocument()
    expect(childrenElement).toBeInTheDocument()
  })

  it('assigns a unique id to the title', () => {
    const { container } = render(
      <Section title="Title with ID">
        <p>Child element</p>
      </Section>,
    )

    const section = container.querySelector('section')
    const heading = screen.getByRole('heading', { level: 2 })

    expect(section).toHaveAttribute('aria-labelledby', heading.id)
  })
})
