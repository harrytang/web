import { Media } from '@/types/media'
import Image from 'next/image'
import clsx from 'clsx'
import Link from 'next/link'

type SocialLinkProps = {
  className?: string
  href: string
  icon: Media
  children: React.ReactNode
}

const SocialLink: React.FC<SocialLinkProps> = ({
  className,
  href,
  children,
  icon,
}) => {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Image
          src={icon.attributes.url}
          alt={icon.attributes.caption}
          className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"
          unoptimized
          width={icon.attributes.width}
          height={icon.attributes.height}
        />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export default SocialLink
