import Link from 'next/link'

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const isExternal = /^(https?:|mailto:|tel:|\/\/)/.test(href)

  const className = 'transition hover:text-amber-600 dark:hover:text-amber-600'

  if (isExternal) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export default NavLink
