import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_STORAGE_HOST,
        port: '',
      },
    ],
  },
  rewrites: async () => [
    {
      source: '/:slug',
      destination: '/page/:slug',
    },
  ],
  redirects: async () => [
    {
      source: '/page/:slug',
      destination: '/:slug',
      permanent: true,
    },
  ],
  output: 'standalone',
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
})

export default withMDX(nextConfig)
