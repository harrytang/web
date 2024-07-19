import { render } from '@testing-library/react'
import CSE from '@/components/CSE'

describe('CSE Component', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV, NEXT_PUBLIC_CSE_ID: 'test-cse-id' }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('should render the searchbox when type is "searchbox"', () => {
    const { container } = render(<CSE type="searchbox" />)
    expect(container.getElementsByClassName('gcse-searchbox-only').length).toBe(
      1,
    )
  })

  it('should render the search results when type is "searchresults"', () => {
    const { container } = render(<CSE type="searchresults" />)
    expect(
      container.getElementsByClassName('gcse-searchresults-only').length,
    ).toBe(1)
  })

  it('should include the correct script URL', () => {
    render(<CSE type="searchbox" />)
    const script = document.querySelector(
      'script[src="https://cse.google.com/cse.js?cx=test-cse-id"]',
    )
    expect(script).toBeDefined()
    expect(script?.getAttribute('src')).toBe(
      'https://cse.google.com/cse.js?cx=test-cse-id',
    )
  })
})
