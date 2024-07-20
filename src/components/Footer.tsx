import Link from 'next/link'

import { ContainerInner, ContainerOuter } from '@/components/Container'

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="transition hover:text-teal-500 dark:hover:text-teal-400"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  const menus = [
    {
      name: 'Cookie Policy',
      path: '/cookie-policy',
    },
    {
      name: 'Disclaimer',
      path: '/disclaimer',
    },
    {
      name: 'Privacy Policy',
      path: '/privacy-policy',
    },
    {
      name: 'Terms of Use',
      path: '/terms-of-use',
    },
    {
      name: 'Credits',
      path: '/credits',
    },
  ]
  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {menus.map((menu) => (
                  <NavLink key={menu.path} href={menu.path}>
                    {menu.name}
                  </NavLink>
                ))}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} Harry Tang. All rights
                reserved.
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}
