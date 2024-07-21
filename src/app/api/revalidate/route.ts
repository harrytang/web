import Webhook from '@/types/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // Check for secret to confirm this is a valid request
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

  // Revalidate the cache
  const { event, model, entry }: Webhook = await req.json()

  // dynamic paths
  if (event === 'entry.create' || event === 'entry.update') {
    if (model === 'blog') {
      console.info(`Revalidating tag: blog-${entry.slug}`)
      revalidateTag(`blog-${entry.slug}`)
    }
    if (model === 'page') {
      console.info(`Revalidating tag: page-${entry.slug}`)
      revalidateTag(`page-${entry.slug}`)
    }
  }

  // static paths
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
  if (track.events.includes(event)) {
    if (track.models[model as keyof typeof track.models]) {
      track.models[model as keyof typeof track.models].forEach(
        (path: string) => {
          console.info(`Revalidating ${model} at ${path}`)
          revalidatePath(path, 'page')
        },
      )
    }
  }

  return Response.json({
    message: 'On-Demand Revalidation complete',
  })
}
