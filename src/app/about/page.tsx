import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'

// local imports
import Container from '@/components/Container'
import { getProfile } from '@/lib/profile'
import { Media } from '@/types/media'
import { generateProfilePageJsonLd, generateSeoMeta } from '@/lib/hepler'

function SocialLink({
  className,
  href,
  children,
  icon,
}: {
  className?: string
  href: string
  icon: Media
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Image
          src={icon.attributes.url}
          alt={icon.attributes.caption}
          className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"
          unoptimized
          width={icon.attributes.width}
          height={icon.attributes.height}
        />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  return generateSeoMeta('about', profile.data.attributes.seo, 'profile', 'en')
}

const About: React.FC = async () => {
  console.info('Rendering /about page...')
  const profile = await getProfile()
  const jsonld = generateProfilePageJsonLd(profile.data)
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={profile.data.attributes.portraitPhoto.data.attributes.url}
              alt={
                profile.data.attributes.portraitPhoto.data.attributes.caption
              }
              width={
                profile.data.attributes.portraitPhoto.data.attributes.width
              }
              height={
                profile.data.attributes.portraitPhoto.data.attributes.height
              }
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            {profile.data.attributes.about}
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <ReactMarkdown>{profile.data.attributes.biography}</ReactMarkdown>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            {profile.data.attributes.socials.map((social, idx) => (
              <SocialLink
                key={idx}
                href={social.href}
                icon={social.icon.data}
                className="mt-4"
              >
                {social.title}
              </SocialLink>
            ))}
          </ul>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      ></script>
    </Container>
  )
}

export default About
