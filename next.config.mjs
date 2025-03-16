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
      source: '/articles',
      destination: '/articles/1', // Serve content from /articles/1 when visiting /articles
    },
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
    {
      source: '/articles/1',
      destination: '/articles',
      permanent: true,
    },
  ],
  output: 'standalone',
}

export default nextConfig
