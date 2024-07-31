'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// local imports
import { Container } from '@/components/Container'
import { getMenus } from '@/lib/menus'
import Avatar from './Avatar'
import AvatarContainer from './AvatarContainer'
import ThemeToggle from './ThemeToggle'
import { clamp } from '@/lib/helper'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'

const Header = () => {
  const isHomePage = usePathname() === '/'
  const headerRef = useRef<React.ElementRef<'div'>>(null)
  const avatarRef = useRef<React.ElementRef<'div'>>(null)
  const isInitial = useRef(true)
  const menus = getMenus()

  const setProperty = useCallback((property: string, value: string) => {
    document.documentElement.style.setProperty(property, value)
  }, [])

  const removeProperty = useCallback((property: string) => {
    document.documentElement.style.removeProperty(property)
  }, [])

  const updateHeaderStyles = useCallback(() => {
    if (!headerRef.current) {
      return
    }

    const { top, height } = headerRef.current.getBoundingClientRect()
    const scrollY = clamp(
      window.scrollY,
      0,
      document.body.scrollHeight - window.innerHeight,
    )
    const downDelay = avatarRef.current?.offsetTop ?? 0
    const upDelay = 64

    if (isInitial.current) {
      setProperty('--header-position', 'sticky')
    }

    setProperty('--content-offset', `${downDelay}px`)

    if (isInitial.current || scrollY < downDelay) {
      setProperty('--header-height', `${downDelay + height}px`)
      setProperty('--header-mb', `${-downDelay}px`)
    } else if (top + height < -upDelay) {
      const offset = Math.max(height, scrollY - upDelay)
      setProperty('--header-height', `${offset}px`)
      setProperty('--header-mb', `${height - offset}px`)
    } else if (top === 0) {
      setProperty('--header-height', `${scrollY + height}px`)
      setProperty('--header-mb', `${-scrollY}px`)
    }

    if (top === 0 && scrollY > 0 && scrollY >= downDelay) {
      setProperty('--header-inner-position', 'fixed')
      removeProperty('--header-top')
      removeProperty('--avatar-top')
    } else {
      removeProperty('--header-inner-position')
      setProperty('--header-top', '0px')
      setProperty('--avatar-top', '0px')
    }
  }, [setProperty, removeProperty])

  const updateAvatarStyles = useCallback(() => {
    if (!isHomePage) {
      return
    }

    const downDelay = avatarRef.current?.offsetTop ?? 0
    const fromScale = 1
    const toScale = 36 / 64
    const fromX = 0
    const toX = 2 / 16
    const scrollY = downDelay - window.scrollY

    let scale = (scrollY * (fromScale - toScale)) / downDelay + toScale
    scale = clamp(scale, fromScale, toScale)

    let x = (scrollY * (fromX - toX)) / downDelay + toX
    x = clamp(x, fromX, toX)

    setProperty(
      '--avatar-image-transform',
      `translate3d(${x}rem, 0, 0) scale(${scale})`,
    )

    const borderScale = 1 / (toScale / scale)
    const borderX = (-toX + x) * borderScale
    const borderTransform = `translate3d(${borderX}rem, 0, 0) scale(${borderScale})`

    setProperty('--avatar-border-transform', borderTransform)
    setProperty('--avatar-border-opacity', scale === toScale ? '1' : '0')
  }, [isHomePage, setProperty])

  const updateStyles = useCallback(() => {
    updateHeaderStyles()
    updateAvatarStyles()
    isInitial.current = false
  }, [updateHeaderStyles, updateAvatarStyles])

  useEffect(() => {
    updateStyles()
    window.addEventListener('scroll', updateStyles, { passive: true })
    window.addEventListener('resize', updateStyles)

    return () => {
      window.removeEventListener('scroll', updateStyles)
      window.removeEventListener('resize', updateStyles)
    }
  }, [updateStyles])

  return (
    <>
      <header
        className="pointer-events-none relative z-50 flex flex-none flex-col"
        style={{
          height: 'var(--header-height)',
          marginBottom: 'var(--header-mb)',
        }}
      >
        {isHomePage && (
          <>
            <div
              ref={avatarRef}
              className="order-last mt-[calc(theme(spacing.16)-theme(spacing.3))]"
            />
            <Container
              className="top-0 order-last -mb-3 pt-3"
              style={{
                position:
                  'var(--header-position)' as React.CSSProperties['position'],
              }}
            >
              <div
                className="top-[var(--avatar-top,theme(spacing.3))] w-full"
                style={{
                  position:
                    'var(--header-inner-position)' as React.CSSProperties['position'],
                }}
              >
                <div className="relative">
                  <AvatarContainer
                    className="absolute left-0 top-3 origin-left transition-opacity"
                    style={{
                      opacity: 'var(--avatar-border-opacity, 0)',
                      transform: 'var(--avatar-border-transform)',
                    }}
                  />
                  <Avatar
                    large
                    className="block h-16 w-16 origin-left"
                    style={{ transform: 'var(--avatar-image-transform)' }}
                  />
                </div>
              </div>
            </Container>
          </>
        )}
        <div
          ref={headerRef}
          className="top-0 z-10 h-16 pt-6"
          style={{
            position:
              'var(--header-position)' as React.CSSProperties['position'],
          }}
        >
          <Container
            className="top-[var(--header-top,theme(spacing.6))] w-full"
            style={{
              position:
                'var(--header-inner-position)' as React.CSSProperties['position'],
            }}
          >
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                {!isHomePage && (
                  <AvatarContainer>
                    <Avatar />
                  </AvatarContainer>
                )}
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <MobileNavigation
                  items={menus}
                  className="pointer-events-auto md:hidden"
                />
                <DesktopNavigation
                  items={menus}
                  className="pointer-events-auto hidden md:block"
                />
              </div>
              <div className="flex justify-end md:flex-1">
                <div className="pointer-events-auto">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>
      {isHomePage && (
        <div
          className="flex-none"
          style={{ height: 'var(--content-offset)' }}
        />
      )}
    </>
  )
}

export default Header
