import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SportsDeck - Sports App Directory',
    short_name: 'SportsDeck',
    description: 'Find and explore top sports apps for fantasy sports, betting, score tracking, simulators, analytics, and communities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['sports', 'entertainment', 'productivity'],
    lang: 'en',
    orientation: 'portrait-primary',
  }
}