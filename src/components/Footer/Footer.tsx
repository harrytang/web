import NavLink from './NavLink'
import ContainerOuter from '../Container/ContainerOuter'
import ContainerInner from '../Container/ContainerInner'

const Footer: React.FC = () => {
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
                &copy; {new Date().getFullYear()}{' '}
                {process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}

export default Footer
