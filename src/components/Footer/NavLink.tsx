import Link from 'next/link'

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="transition hover:text-amber-600 dark:hover:text-amber-600"
    >
      {children}
    </Link>
  )
}

export default NavLink
