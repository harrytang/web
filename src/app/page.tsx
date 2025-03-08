import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

// local imports

import { Container } from '@/components/Container'
import { getProfile } from '@/lib/profile'
import { getBlogs } from '@/lib/blogs'
import { generateSeoMeta, generateProfilePageJsonLd } from '@/lib/helper'
import { ArticleList } from '@/components/ArticleList'
import { Gallery } from '@/components/Gallery'
import Work from '@/components/Work/Work'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const seo = generateSeoMeta('', profile.data.attributes.seo, 'profile', 'en')
  return {
    ...seo,
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${profile.data.attributes.title}`,
  }
}

const Home = async () => {
  const blogs = await getBlogs(
    0,
    parseInt(process.env.NEXT_PUBLIC_HOME_PAGE_SIZE!),
  )
  const profile = await getProfile()

  // jsonlds
  const person = generateProfilePageJsonLd(profile.data, blogs.data)

  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            {profile.data.attributes.title}
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {profile.data.attributes.welcome}
          </p>
          <div className="mt-6 flex gap-6">
            {profile.data.attributes.socials.map((social, idx) => (
              <Link key={idx} className="group -m-1 p-1" href={social.href}>
                <Image
                  src={social.icon.data.attributes.url}
                  alt={social.icon.data.attributes.caption}
                  className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 hover:brightness-75 dark:fill-zinc-400 dark:group-hover:fill-zinc-300 dark:hover:brightness-125"
                  unoptimized
                  width={social.icon.data.attributes.width}
                  height={social.icon.data.attributes.height}
                />
              </Link>
            ))}
          </div>
        </div>
      </Container>
      <Gallery items={profile.data.attributes.photos.data} />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {blogs.data.map((blog) => (
              <ArticleList key={blog.id} article={blog} type="compact" />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Work />
          </div>
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  )
}

export default Home
