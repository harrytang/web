'use client'
import { Media } from '@/types/media'
import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'
import { useEffect, useState } from 'react'
import { BLUR_IMAGE } from '@/../const'

type GalleryProps = {
  items: Media[]
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  // Helper to get photo width and gap based on screen size
  const getPhotoDimensions = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      return { photoWidth: 288, photoGap: 32 }
    }
    return { photoWidth: 176, photoGap: 20 }
  }
  const rotations = [
    'rotate-2',
    '-rotate-2',
    'rotate-2',
    'rotate-2',
    '-rotate-2',
  ]
  const middleIdx = Math.floor(items.length / 2)

  const [displayItems, setDisplayItems] = useState(items)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFading, setIsFading] = useState(false)

  // Animate when new items come in
  useEffect(() => {
    if (items !== displayItems) {
      setDisplayItems(items)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Auto-rotate gallery for small screens
  useEffect(() => {
    const { photoWidth, photoGap } = getPhotoDimensions()
    const totalGalleryWidth = (photoWidth + photoGap) * items.length
    const isSmallScreen = window.matchMedia(
      `(max-width: ${totalGalleryWidth}px)`,
    ).matches
    if (!isSmallScreen || items.length <= 1) {
      console.log('Skipping auto-rotate on large screens')
      return
    }

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIsFading(true)
        setTimeout(() => {
          setDisplayItems((prev) => {
            if (prev.length <= 1) return prev
            return [...prev.slice(1), prev[0]]
          })
          setIsAnimating(false)
          setIsFading(false)
        }, 400) // fade duration
      }, 600) // slide duration
    }, 5000)
    return () => clearInterval(interval)
  }, [items])

  // Helper to get slide style
  const getSlideStyle = (
    isAnimating: boolean,
    isFading: boolean,
    slideDistance: number,
  ) => {
    if (isAnimating) {
      return {
        transform: `translateX(-${slideDistance}px)`,
        opacity: 1,
        transition:
          'transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
      }
    }
    if (isFading) {
      return {
        transform: 'translateX(0px)',
        opacity: 0,
        transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
      }
    }
    // Default: visible and no transform
    return {
      transform: 'translateX(0)',
      opacity: 1,
      transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
    }
  }

  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {displayItems.map((image) => {
          const originalIdx = items.findIndex((item) => item.id === image.id)
          const { photoWidth, photoGap } = getPhotoDimensions()
          const slideDistance = photoWidth + photoGap
          const slideStyle = getSlideStyle(isAnimating, isFading, slideDistance)
          return (
            <div key={image.id} style={slideStyle} className="flex-none">
              <div
                className={clsx(
                  'relative aspect-9/10 w-44 overflow-hidden rounded-xl bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800',
                  rotations[originalIdx % rotations.length],
                )}
              >
                <Image
                  src={image.attributes.url}
                  alt={image.attributes.caption}
                  sizes="(min-width: 640px) 18rem, 11rem"
                  className={clsx(
                    'absolute inset-0 h-full w-full object-cover',
                  )}
                  width={image.attributes.width}
                  height={image.attributes.height}
                  priority={middleIdx === originalIdx}
                  placeholder="blur"
                  blurDataURL={BLUR_IMAGE}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Gallery
