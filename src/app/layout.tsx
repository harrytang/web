import { type Metadata } from 'next'
import PlausibleProvider from 'next-plausible'
import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'
import '@/styles/custom.css'
import { getProfile } from '@/lib/profile'

type RootLayoutProps = {
  children: React.ReactNode
}

export const metadata = async (): Promise<Metadata> => {
  const profile = await getProfile()
  return {
    title: {
      template: `%s - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      default: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${profile.data.attributes.title}`,
    },
    description: profile.data.attributes.seo.metaDescription,
  }
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <PlausibleProvider
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN!}
          customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_SITE!}
          enabled={process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === 'true'}
        />
      </head>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
