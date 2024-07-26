import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import Layout from '@/components/Layout'

import '@/styles/tailwind.css'
import '@/styles/custom.css'
import { getProfile } from '@/lib/profile'

export const metadata = async (): Promise<Metadata> => {
  const profile = await getProfile()
  return {
    title: {
      template: `%s - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      default: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${profile.data.attributes.title}`,
    },
    description: profile.data.attributes.seo.metaDescription,

    alternates: {
      types: {
        'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`,
      },
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
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
