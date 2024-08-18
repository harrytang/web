'use client'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItemProps = {
  href: string
  children: React.ReactNode
}

const NavItem: React.FC<NavItemProps> = ({ href, children }) => {
  let isActive = usePathname() === href

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block px-3 py-2 transition',
          isActive
            ? 'text-amber-600 dark:text-amber-500'
            : 'dark:hover:amber-teal-500 hover:text-amber-600',
        )}
      >
        {children}
        {isActive && (
          <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-teal-500/0 via-amber-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-amber-400/40 dark:to-teal-400/0" />
        )}
      </Link>
    </li>
  )
}

export default NavItem
