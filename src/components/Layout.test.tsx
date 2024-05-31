import React from 'react'
import { render, screen } from '@testing-library/react'
import { Layout } from '@/components/Layout'

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

jest.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

describe('Layout', () => {
  it('renders the Layout component with Header, Footer, and children', () => {
    const childrenContent = 'Test children content'

    render(
      <Layout>
        <div data-testid="children">{childrenContent}</div>
      </Layout>,
    )

    // Check if Header is rendered
    expect(screen.getByTestId('header')).toBeInTheDocument()

    // Check if Footer is rendered
    expect(screen.getByTestId('footer')).toBeInTheDocument()

    // Check if children content is rendered
    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByText(childrenContent)).toBeInTheDocument()
  })

  it('has the correct structure and styles', () => {
    render(
      <Layout>
        <div data-testid="children">Test children content</div>
      </Layout>,
    )

    const fixedDiv = document.querySelector(
      '.fixed.inset-0.flex.justify-center.sm\\:px-8',
    )
    const relativeDiv = document.querySelector('.relative.flex.w-full.flex-col')
    const mainElement = document.querySelector('main.flex-auto')

    // Check if the fixed div is rendered correctly
    expect(fixedDiv).toBeInTheDocument()

    // Check if the relative div is rendered correctly
    expect(relativeDiv).toBeInTheDocument()

    // Check if the main element is rendered correctly
    expect(mainElement).toBeInTheDocument()
  })
})
