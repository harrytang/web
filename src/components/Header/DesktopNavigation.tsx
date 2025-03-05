import { Menu } from '@/lib/menus'
import NavItem from './NavItem'

type DesktopNavigationProps = {
  items: Menu[]
} & React.ComponentPropsWithoutRef<'nav'>

const DesktopNavigation: React.FC<DesktopNavigationProps> = (props) => {
  return (
    <nav {...props}>
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
        {props.items.map((item) => (
          <NavItem key={item.path} href={item.path}>
            {item.name}
          </NavItem>
        ))}
      </ul>
    </nav>
  )
}

export default DesktopNavigation
