"use client";

import { usePreloadedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SharedHeader } from "@/components/shared-header";
import { Preloaded } from "convex/react";
import { buildTrackedAppUrl, slugify } from "@/lib/utils";
import { useMemo } from "react";
import { AppLogo } from "@/components/app-logo";

interface AppProfileContentProps {
  appName: string;
  preloadedApp: Preloaded<typeof api.apps.getAppByName>;
}

export default function AppProfileContent({ appName, preloadedApp }: AppProfileContentProps) {
  const app = usePreloadedQuery(preloadedApp);
  const categoryApps = useQuery(
    api.apps.getAppsBySameCategory,
    app ? { appId: app._id } : "skip"
  ) ?? [];

  const suggestedApps = useMemo(() => {
    if (categoryApps.length === 0) return [];
    const shuffled = [...categoryApps].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  // Re-randomize on every mount by not memoizing on stable deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryApps.length]);

  const generateStructuredData = (app: any) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "description": app.description,
    "url": app.url,
    "image": app.image,
    "applicationCategory": "SportsApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "ratingCount": "100" },
    "publisher": { "@type": "Organization", "name": "SportsDeck" },
    "datePublished": new Date(app.createdAt).toISOString(),
    "keywords": app.tags?.join(", ") || "sports app"
  });

  if (app === undefined) {
    return (
      <div className="min-h-screen bg-white">
        <SharedHeader />
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-200 rounded-2xl" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (app === null) {
    return (
      <div className="min-h-screen bg-white">
        <SharedHeader />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">App not found</h1>
          <p className="text-gray-500 mb-8">The app you're looking for doesn't exist.</p>
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData(app)) }}
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          All apps
        </Link>

        {/* Hero */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <AppLogo
              src={app.image}
              appUrl={app.url}
              alt={app.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0"
              fallback={
                <div className="w-20 h-20 rounded-2xl bg-gray-100 shadow-sm shrink-0 flex items-center justify-center text-3xl font-bold text-gray-400">
                  {app.name[0]}
                </div>
              }
            />
            <div>
              <h1 className="font-display text-3xl uppercase tracking-wide text-gray-900 mb-1">{app.name}</h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">{app.description}</p>
            </div>
          </div>

          <a
            href={buildTrackedAppUrl(app.url, app.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea590e] text-white text-sm font-semibold hover:bg-[#d44e0b] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit
          </a>
        </div>

        {/* Tags */}
        {((app.tags && app.tags.length > 0) || (app.primarySport && app.primarySport.length > 0)) && (
          <div className="flex items-center gap-2 flex-wrap mb-10">
            {app.tags?.map((tag: string, i: number) => (
              <span key={tag} className="font-display text-xs uppercase tracking-widest text-gray-500">
                {i > 0 && <span className="mr-2 text-gray-300">·</span>}{tag}
              </span>
            ))}
            {app.primarySport && app.primarySport.length > 0 && (app.tags?.length ?? 0) > 0 && (
              <span className="text-gray-300">·</span>
            )}
            {app.primarySport?.map((sport: string, i: number) => (
              <span key={sport} className="font-display text-xs uppercase tracking-widest text-[#ea590e]">
                {i > 0 && <span className="mr-2 text-gray-300">·</span>}{sport}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 mb-10" />

        {/* Review Sections */}
        {(app.reviewWhatIs || app.reviewHowItWorks) && (
          <div className="space-y-8 mb-12">
            {app.reviewWhatIs && (
              <div>
                <h2 className="font-display text-xl uppercase tracking-wide text-gray-900 mb-2">Overview</h2>
                <p className="text-gray-600 leading-relaxed">{app.reviewWhatIs}</p>
              </div>
            )}
            {app.reviewHowItWorks && (
              <div>
                <h2 className="font-display text-xl uppercase tracking-wide text-gray-900 mb-2">How it works</h2>
                <p className="text-gray-600 leading-relaxed">{app.reviewHowItWorks}</p>
              </div>
            )}
          </div>
        )}

        {/* You may also like */}
        {suggestedApps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-6 bg-[#ea590e] rounded-full inline-block" />
              <h2 className="font-display text-2xl uppercase tracking-wide text-gray-900">You may also like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {suggestedApps.map((suggested) => (
                <Link
                  key={suggested._id}
                  href={`/apps/${slugify(suggested.name)}`}
                  className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#ea590e] hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Orange accent bar */}
                  <div className="h-1 w-full bg-[#ea590e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  <div className="p-4 flex flex-col flex-1">
                    <AppLogo
                      src={suggested.image}
                      appUrl={suggested.url}
                      alt={suggested.name}
                      className="w-12 h-12 rounded-xl object-cover mb-3 group-hover:scale-110 transition-transform duration-200"
                      fallback={
                        <div className="w-12 h-12 rounded-xl bg-gray-100 mb-3 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:scale-110 transition-transform duration-200">
                          {suggested.name[0]}
                        </div>
                      }
                    />
                    <p className="font-display text-base uppercase tracking-wide text-gray-900 mb-1">
                      {suggested.name}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
                      {suggested.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#ea590e]">
                      Visit <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
