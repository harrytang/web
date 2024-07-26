import CardLink from './CardLink'

export default function CardTitle<T extends React.ElementType = 'h2'>({
  as,
  href,
  children,
}: Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'href'> & {
  as?: T
  href?: string
}) {
  let Component = as ?? 'h2'

  return (
    <Component className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
      {href ? <CardLink href={href}>{children}</CardLink> : children}
    </Component>
  )
}
