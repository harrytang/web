import { Card, CardDescription, CardTitle } from '../Card'

type ToolProps = {
  title: string
  href?: string
  children: React.ReactNode
}

const Tool: React.FC<ToolProps> = ({ title, href, children }) => {
  return (
    <Card as="li">
      <CardTitle as="h3" href={href}>
        {title}
      </CardTitle>
      <CardDescription>{children}</CardDescription>
    </Card>
  )
}

export default Tool
