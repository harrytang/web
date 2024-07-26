import clsx from 'clsx'

const Prose = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => {
  return (
    <div className={clsx(className, 'prose dark:prose-invert')} {...props} />
  )
}

export default Prose
