import { PopoverButton } from '@headlessui/react'
import Link from 'next/link'

type MobileNavItemProps = {
  href: string
  children: React.ReactNode
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ href, children }) => {
  return (
    <li>
      <PopoverButton as={Link} href={href} className="block py-2">
        {children}
      </PopoverButton>
    </li>
  )
}

export default MobileNavItem
