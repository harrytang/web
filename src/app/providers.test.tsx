import React, { useContext } from 'react'
import { render, screen } from '@testing-library/react'
import { AppContext, Providers } from './providers'
import { usePathname } from 'next/navigation'
import { usePrevious } from '@/hooks'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  usePrevious: jest.fn(),
}))

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}))

jest.mock('@/components/ThemeWatcher', () => ({
  ThemeWatcher: () => <div data-testid="theme-watcher" />,
}))

const Consumer = () => {
  const ctx = useContext(AppContext)
  return <div data-testid="previous-path">{ctx.previousPathname ?? ''}</div>
}

describe('providers', () => {
  it('provides previousPathname and renders theme wrapper + watcher', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/articles/2')
    ;(usePrevious as jest.Mock).mockReturnValue('/articles/1')

    render(
      <Providers>
        <Consumer />
        <div data-testid="child">child</div>
      </Providers>,
    )

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('theme-watcher')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('previous-path')).toHaveTextContent('/articles/1')
  })
})