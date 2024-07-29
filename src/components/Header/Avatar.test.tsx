import React from 'react'
import { render } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('renders correctly with default props', () => {
    const { getByAltText } = render(<Avatar />)
    const imageElement = getByAltText(process.env.NEXT_PUBLIC_SITE_NAME!)
    expect(imageElement).toHaveAttribute('width', '512')
    expect(imageElement).toHaveAttribute('height', '512')
    expect(imageElement).toHaveClass('h-9 w-9')
  })

  it('renders correctly with large prop', () => {
    const { getByAltText } = render(<Avatar large />)

    const imageElement = getByAltText(process.env.NEXT_PUBLIC_SITE_NAME!)
    expect(imageElement).toHaveClass('h-16 w-16')
  })

  it('renders with additional className', () => {
    const { container } = render(<Avatar className="extra-class" />)

    const linkElement = container.querySelector('a')
    expect(linkElement).toHaveClass('extra-class')
  })

  it('passes additional props to the Link component', () => {
    const { container } = render(<Avatar data-testid="avatar-link" />)

    const linkElement = container.querySelector('a')
    expect(linkElement).toHaveAttribute('data-testid', 'avatar-link')
  })

  it('has pointer-events-auto class', () => {
    const { container } = render(<Avatar />)

    const linkElement = container.querySelector('a')
    expect(linkElement).toHaveClass('pointer-events-auto')
  })
})
