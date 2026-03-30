import { MetadataRoute } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { slugify } from '@/lib/utils'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sportsdeck.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ]

  // Dynamic app pages
  try {
    const apps = await convex.query(api.apps.getAllApps)
    const appPages = apps.map((app) => ({
      url: `${baseUrl}/apps/${slugify(app.name)}`,
      lastModified: new Date(app.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...appPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}


