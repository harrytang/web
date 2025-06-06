import { Media } from '@/types/media'
import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'
import { BLUR_IMAGE } from '@/../const'

type GalleryProps = {
  items: Media[]
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  const rotations = [
    'rotate-2',
    '-rotate-2',
    'rotate-2',
    'rotate-2',
    '-rotate-2',
  ]
  const middleIdx = Math.floor(items.length / 2)

  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {items.map((image, idx) => (
          <div
            key={image.id}
            className={clsx(
              'relative aspect-9/10 w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800',
              idx <= 4
                ? rotations[idx]
                : rotations[Math.floor(Math.random() * rotations.length)],
            )}
          >
            <Image
              src={image.attributes.url}
              alt={image.attributes.caption}
              sizes="(min-width: 640px) 18rem, 11rem"
              className={clsx('absolute inset-0 h-full w-full object-cover')}
              width={image.attributes.width}
              height={image.attributes.height}
              priority={middleIdx === idx}
              placeholder="blur"
              blurDataURL={BLUR_IMAGE}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery
