import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useTheme } from 'next-themes'
import ThemeToggle from './ThemeToggle'

// Mocking next-themes useTheme hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

describe('ThemeToggle', () => {
  let mockSetTheme: jest.Mock
  let mockResolvedTheme: string

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetTheme = jest.fn()
    mockResolvedTheme = 'light'
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: mockResolvedTheme,
      setTheme: mockSetTheme,
    })
  })

  it('renders correctly with light theme', () => {
    const { getByLabelText, getByRole } = render(<ThemeToggle />)

    const buttonElement = getByRole('button')
    expect(buttonElement).toHaveAttribute('aria-label', 'Switch to dark theme')

    const sunIcon = buttonElement.querySelector('svg')
    expect(sunIcon).toHaveClass('h-6 w-6 fill-zinc-100 stroke-zinc-500')
  })

  it('renders correctly with dark theme', () => {
    mockResolvedTheme = 'dark'
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: mockResolvedTheme,
      setTheme: mockSetTheme,
    })

    const { getByRole } = render(<ThemeToggle />)

    const buttonElement = getByRole('button')
    expect(buttonElement).toHaveAttribute('aria-label', 'Switch to light theme')

    const moonIcon = buttonElement.querySelector('svg')
    expect(moonIcon).not.toHaveClass('hidden')
  })

  it('calls setTheme with the correct argument when clicked', () => {
    const { getByRole } = render(<ThemeToggle />)
    const buttonElement = getByRole('button')

    fireEvent.click(buttonElement)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('updates aria-label when theme is toggled', () => {
    const { getByRole, rerender } = render(<ThemeToggle />)

    const buttonElement = getByRole('button')
    expect(buttonElement).toHaveAttribute('aria-label', 'Switch to dark theme')

    // Simulate theme change
    mockResolvedTheme = 'dark'
    ;(useTheme as jest.Mock).mockReturnValue({
      resolvedTheme: mockResolvedTheme,
      setTheme: mockSetTheme,
    })
    rerender(<ThemeToggle />)

    expect(buttonElement).toHaveAttribute('aria-label', 'Switch to light theme')
  })

  it('sets mounted state correctly', () => {
    const { getByRole } = render(<ThemeToggle />)
    const buttonElement = getByRole('button')

    expect(buttonElement).toHaveAttribute('aria-label', 'Switch to dark theme')
  })
})
