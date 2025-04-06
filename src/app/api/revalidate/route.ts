import Webhook from '@/types/webhook'
import { algoliasearch } from 'algoliasearch'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

// tracking event/paths
const track = {
  events: ['entry.create', 'entry.update'],
  models: {
    blog: ['/articles/[current]', '/'],
    project: ['/projects'],
    skill: ['/expertise'],
    use: ['/gear'],
    work: ['/'],
    profile: ['/about', '/'],
  },
}
// dynamic paths
const dynamicModels = ['blog', 'page']

const authenticate = (req: NextRequest) => {
  const authorizationHeader = req.headers.get('Authorization')
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return Response.json({
      message: 'Unauthorized: Missing or invalid Bearer token',
    })
  }
  const bearerToken = authorizationHeader.split(' ')[1]
  if (bearerToken !== process.env.REVALIDATE_TOKEN) {
    return Response.json({
      message: 'Unauthorized: Missing or invalid Bearer token',
    })
  }
}

const revalidate = (model: string, entry: any) => {
  // dynamic paths
  if (dynamicModels.includes(model)) {
    console.info(`Revalidating tag: ${model}-${entry.slug}`)
    revalidateTag(`${model}-${entry.slug}`)
  }

  if (track.models[model as keyof typeof track.models]) {
    // static paths
    track.models[model as keyof typeof track.models].forEach((path: string) => {
      console.info(`Revalidating ${model} at ${path}`)
      revalidatePath(path, 'page')
    })
  }
}

const purgeCFCache = async () => {
  console.info('Purging Cloudflare Cache')
  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      },
      body: JSON.stringify({ purge_everything: true }),
    },
  )
}

const algoliaPush = async (model: string, entry: any) => {
  // check strapi event & model
  if (model !== 'blog') {
    console.info(`Skipping Algolia push for ${model} model`)
    return
  }

  // push to algolia
  console.info(`Pushing ${model} to Algolia`)
  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
    process.env.ALGOLIA_API_KEY ?? '',
  )

  // convert entry to algolia object
  const article = {
    objectID: entry.slug,
    title: entry.title,
    description: entry.seo.metaDescription,
    image: {
      url: entry.seo.metaImage.formats.thumbnail.url,
      alt: entry.seo.metaImage.caption,
    },
    keywords: entry.seo.keywords,
    publishedAt: entry.publishedAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }

  const idxName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'articles_index'
  return await client.saveObject({
    indexName: idxName,
    body: article,
  })
}

export async function POST(req: NextRequest) {
  authenticate(req)

  const { event, model, entry }: Webhook = await req.json()

  if (track.events.includes(event)) {
    revalidate(model, entry)
    await algoliaPush(model, entry)
    await purgeCFCache()
  }

  return Response.json({
    message: 'On-Demand Revalidation complete. Cloudflare Cache purged.',
  })
}
