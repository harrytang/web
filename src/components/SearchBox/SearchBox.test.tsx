import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import SearchBox from './SearchBox'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams('')),
}))

describe('SearchBox', () => {
  const originalLocation = window.location

  beforeAll(() => {
    delete (window as any).location
    global.window.location = { assign: jest.fn() } as any
  })

  afterAll(() => {
    global.window.location = originalLocation
  })

  beforeEach(() => {
    ;(window.location.assign as jest.Mock).mockClear()
  })

  it('renders the search input with the default value', () => {
    render(<SearchBox />)
    const inputElement = screen.getByPlaceholderText('Search Articles')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue('')
  })

  it('submits the form and navigates to the search results page', async () => {
    render(<SearchBox />)
    const inputElement = screen.getByPlaceholderText('Search Articles')
    await userEvent.type(inputElement, 'test search{enter}')
    expect(window.location.href).toBe('/search?q=test search')
  })

  it('displays the correct default value from search params', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('q=default search'),
    )
    render(<SearchBox />)
    const inputElement = screen.getByPlaceholderText('Search Articles')
    expect(inputElement).toHaveValue('default search')
  })

  it('prevents form submission with an empty input', async () => {
    render(<SearchBox />)
    const inputElement = screen.getByPlaceholderText('Search Articles')
    await userEvent.type(inputElement, '{enter}')
    expect(window.location.assign).not.toHaveBeenCalled()
  })
})
