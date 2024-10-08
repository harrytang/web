import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import { ComponentPropsWithoutRef } from 'react'

type AvatarProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  large?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({
  large = false,
  className,
  ...props
}) => {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={clsx(className, 'pointer-events-auto')}
      as={'/'}
      {...props}
    >
      <Image
        src={process.env.NEXT_PUBLIC_AVATAR_URL!}
        width="512"
        height="512"
        alt={process.env.NEXT_PUBLIC_SITE_NAME!}
        sizes={large ? '4rem' : '2.25rem'}
        className={clsx(
          'rounded-full bg-zinc-100 object-cover dark:bg-zinc-800',
          large ? 'h-16 w-16' : 'h-9 w-9',
        )}
        priority
      />
    </Link>
  )
}

export default Avatar
