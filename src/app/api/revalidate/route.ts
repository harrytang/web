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

export async function POST(req: NextRequest) {
  // Check for secret to confirm this is a valid request
  authenticate(req)

  // Revalidate the cache
  const { event, model, entry }: Webhook = await req.json()

  // static paths
  if (track.events.includes(event)) {
    if (track.models[model as keyof typeof track.models]) {
      // dynamic paths
      if (dynamicModels.includes(model)) {
        console.info(`Revalidating tag: ${model}-${entry.slug}`)
        revalidateTag(`${model}-${entry.slug}`)
      }

      // static paths
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
