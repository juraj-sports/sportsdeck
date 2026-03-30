import type { Metadata } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import AppProfileContent from '@/components/app-profile-content';
import { Suspense } from 'react';
import { slugify } from '@/lib/utils';
import { preloadQuery } from "convex/nextjs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  
  try {
    const app = await convex.query(api.apps.getAppByName, { name });
    
    if (!app) {
      return {
        title: 'App Not Found - SportsDeck',
        description: 'The sports app you are looking for could not be found.',
        robots: { index: false, follow: false }
      };
    }

    const appTitle = `${app.name} - Sports App Review | SportsDeck`;
    const appDescription = app.description.length > 160 
      ? `${app.description.substring(0, 157)}...` 
      : app.description;
    
    const appSlug = slugify(app.name);

    return {
      title: appTitle,
      description: appDescription,
      keywords: [
        app.name.toLowerCase(),
        'sports app',
        'app review',
        ...(app.tags || []).map(tag => tag.toLowerCase()),
        'sportsdeck'
      ],
      openGraph: {
        title: appTitle,
        description: appDescription,
        type: 'article',
        url: `/apps/${appSlug}`,
        images: [
          {
            url: app.image,
            width: 1200,
            height: 630,
            alt: `${app.name} - Sports App Screenshot`,
          },
        ],
        siteName: 'SportsDeck',
      },
      twitter: {
        card: 'summary_large_image',
        title: appTitle,
        description: appDescription,
        images: [app.image],
      },
      alternates: {
        canonical: `/apps/${appSlug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for app:', error);
    return {
      title: 'Sports App - SportsDeck',
      description: 'Discover amazing sports apps on SportsDeck.',
      robots: { index: false, follow: true }
    };
  }
}

export default async function AppProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  
  // Preload the app data on the server
  const preloadedApp = await preloadQuery(api.apps.getAppByName, { name });
  
  return (
    <Suspense fallback={<div />}> 
      <AppProfileContent appName={name} preloadedApp={preloadedApp} />
    </Suspense>
  );
}



