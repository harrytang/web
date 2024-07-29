import React from 'react'
import { render } from '@testing-library/react'
// import '@testing-library/jest-dom'
import MobileNavItem from './MobileNavItem'

// Mocking next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mocking @headlessui/react PopoverButton
jest.mock('@headlessui/react', () => {
  const originalModule = jest.requireActual('@headlessui/react')
  return {
    ...originalModule,
    PopoverButton: ({ as: Component, children, ...props }: any) => (
      <Component {...props}>{children}</Component>
    ),
  }
})

describe('MobileNavItem', () => {
  it('renders correctly with the provided href and children', () => {
    const { getByText } = render(
      <MobileNavItem href="/test-path">Test Link</MobileNavItem>,
    )

    const linkElement = getByText('Test Link')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', '/test-path')
  })

  // it('applies the correct class to the PopoverButton', () => {
  //   const { getByText } = render(
  //     <MobileNavItem href="/test-path">Test Link</MobileNavItem>,
  //   )

  //   const linkElement = getByText('Test Link')
  //   expect(linkElement).toHaveClass('block py-2')
  // })

  it('renders within a list item', () => {
    const { container } = render(
      <MobileNavItem href="/test-path">Test Link</MobileNavItem>,
    )

    const liElement = container.querySelector('li')
    expect(liElement).toBeInTheDocument()
    const linkElement = container.querySelector('a')
    expect(liElement).toContainElement(linkElement)
  })
})
