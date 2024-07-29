import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import AvatarContainer from './AvatarContainer'

describe('AvatarContainer', () => {
  it('renders correctly with default classes', () => {
    const { container } = render(<AvatarContainer />)

    const divElement = container.querySelector('div')
    expect(divElement).toHaveClass(
      'h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:ring-white/10',
    )
  })

  it('applies additional className correctly', () => {
    const { container } = render(<AvatarContainer className="extra-class" />)

    const divElement = container.querySelector('div')
    expect(divElement).toHaveClass('extra-class')
    expect(divElement).toHaveClass(
      'h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:ring-white/10',
    )
  })

  it('passes additional props to the div element', () => {
    const { container } = render(
      <AvatarContainer data-testid="avatar-container" />,
    )

    const divElement = container.querySelector('div')
    expect(divElement).toHaveAttribute('data-testid', 'avatar-container')
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <AvatarContainer>
        <span>Child Element</span>
      </AvatarContainer>,
    )

    const childElement = getByText('Child Element')
    expect(childElement).toBeInTheDocument()
  })
})
