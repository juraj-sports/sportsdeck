import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import { NewsletterSubscription } from "@/components/newsletter-subscription"
import { SharedHeader } from "@/components/shared-header"
import HomeAppsSection from "@/components/home-apps-section"
import { Suspense } from 'react'
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const metadata: Metadata = siteMetadata['/'];

export default async function Home() {
  // Preload apps data on the server for SEO
  const preloadedApps = await preloadQuery(api.apps.getAllVisibleApps);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Suspense fallback={<div />}>
        <SharedHeader />
      </Suspense>

      {/* Hero Section */}
      <section
        className="sm:py-14 py-10"
        style={{ background: "linear-gradient(to bottom, #fff3ee 0%, #ffffff 100%)" }}
      >
        <div className="px-6 lg:px-10 max-w-3xl lg:text-center lg:mx-auto">
          {/* Main Headlines */}
          <div className="mb-5">
            <h1 className="font-display uppercase leading-none tracking-tight text-2xl sm:text-4xl lg:text-5xl text-gray-900 whitespace-nowrap">
              Explore sports apps <span className="text-[#ea590e]">and tools</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 font-body font-medium">
              Find new ways to follow and experience sports</p>
          </div>

          {/* Newsletter Subscription */}
          <div className="max-w-2xl lg:mx-auto mt-6 lg:flex lg:justify-center">
            <NewsletterSubscription />
          </div>
        </div>
      </section>

      {/* Apps Section with Filters */}
      <div className="py-2">
        <Suspense fallback={<div />}>
          <HomeAppsSection preloadedApps={preloadedApps} />
        </Suspense>
      </div>
    </div>
  )
}