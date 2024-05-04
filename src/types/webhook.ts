import { Blog } from '@/lib/blogs'
import { Profile } from '@/lib/profile'

type Webhook = {
  event: string
  model: string
  entry: Profile['attributes'] | Blog['attributes']
}

export default Webhook
