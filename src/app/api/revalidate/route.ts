import Webhook from '@/types/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

// tracking event/paths
const track = {
  events: ['entry.create', 'entry.update'],
  models: {
    blog: ['/articles', '/'],
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

export async function POST(req: NextRequest) {
  authenticate(req)

  const { event, model, entry }: Webhook = await req.json()

  if (track.events.includes(event)) {
    revalidate(model, entry)
    await purgeCFCache()
  }

  return Response.json({
    message: 'On-Demand Revalidation complete. Cloudflare Cache purged.',
  })
}
