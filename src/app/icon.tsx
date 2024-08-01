import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={process.env.NEXT_PUBLIC_ICON_URL!}
        alt={process.env.NEXT_PUBLIC_SITE_NAME!}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    ),
    {
      ...size,
    },
  )
}
