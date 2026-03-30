"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePreloadedQuery, Preloaded, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, ExternalLink, Star, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { slugify, buildTrackedAppUrl } from "@/lib/utils";



const PREDEFINED_CATEGORIES = [
  "Scores & News",        // #1 — most broadly used, everyone checks scores
  "Fantasy & Predictive", // #2 — massive mainstream category
  "Sports Betting",       // #3 — huge and fast-growing market
  "Stats & Analytics",    // #4 — data-driven fans and analysts
  "Communities & Forums", // #5 — social engagement
  "Writers & Publications", // #6 — content and media
  "Coaching & Training",  // #7 — athletes and coaches
  "Trivia & Games",       // #8 — fun/entertainment niche
];

// ─── App Card ────────────────────────────────────────────────────────────────

const AppCard = ({ app }: { app: any }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out group h-full flex flex-col">
    <div className="p-5 flex flex-col">

      {/* Logo */}
      <Link href={`/apps/${slugify(app.name)}`} className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 shrink-0 mb-3">
        {app.image ? (
          <img src={app.image} alt={`${app.name} logo`} className="w-full h-full object-cover" />
        ) : (
          <Star className="w-4 h-4 text-gray-400" />
        )}
      </Link>

      {/* Name */}
      <Link href={`/apps/${slugify(app.name)}`}>
        <h3 className="font-display text-lg uppercase tracking-wide text-gray-900 leading-snug mb-2 line-clamp-1">{app.name}</h3>
      </Link>

      {/* Description — 2 lines max */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{app.description}</p>

      {/* Visit button */}
      <button
        onClick={() => window.open(buildTrackedAppUrl(app.url, app.name), "_blank", "noopener,noreferrer")}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ea590e] text-white text-sm font-semibold hover:bg-[#d44e0b] transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Visit
      </button>
    </div>
  </div>
);

// ─── Category Row ─────────────────────────────────────────────────────────────

const CategoryRow = ({ category, apps, tinted }: { category: string; apps: any[]; tinted?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll, apps]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  if (apps.length === 0) return null;

  return (
    <section id={`category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`mb-2 rounded-2xl px-5 py-6 ${tinted ? "bg-[#fff6f2]" : "bg-transparent"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 bg-[#ea590e] rounded-full inline-block" />
            <h2 className="font-display text-2xl uppercase tracking-wide text-gray-900">{category}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-1 pt-1 pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {apps.map((app) => (
          <div key={app._id} className="shrink-0 w-[290px]" style={{ scrollSnapAlign: "start" }}>
            <AppCard app={app} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function HomeAppsSection({ preloadedApps }: {
  preloadedApps: Preloaded<typeof api.apps.getAllVisibleApps>;
}) {
  const allApps = usePreloadedQuery(preloadedApps);
  const featuredApps = useQuery(api.featured_apps.getFeaturedApps) ?? [];
  const categoryOrders = useQuery(api.apps.getCategoryOrders) ?? [];

  if (allApps === undefined) {
    return (
      <div className="w-full px-6 lg:px-10 py-12 text-center">
        <Search className="w-12 h-12 mx-auto animate-pulse text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Loading apps...</h3>
      </div>
    );
  }

  // Build a lookup: categoryName -> { appId -> order }
  const orderMap: Record<string, Record<string, number>> = {};
  for (const entry of categoryOrders) {
    if (!orderMap[entry.sectionName]) orderMap[entry.sectionName] = {};
    orderMap[entry.sectionName][entry.appId] = entry.order;
  }

  // Group apps by their primary category, then sort by saved order (fallback: alphabetical)
  const appsByCategory: Record<string, typeof allApps> = {};
  PREDEFINED_CATEGORIES.forEach((cat) => { appsByCategory[cat] = []; });

  allApps.forEach((app) => {
    const primaryCat = app.tags?.find((t: string) => PREDEFINED_CATEGORIES.includes(t));
    if (primaryCat) appsByCategory[primaryCat].push(app);
  });

  PREDEFINED_CATEGORIES.forEach((cat) => {
    const catOrderMap = orderMap[cat] ?? {};
    appsByCategory[cat].sort((a, b) => {
      const aOrder = catOrderMap[a._id] ?? 9999;
      const bOrder = catOrderMap[b._id] ?? 9999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  });

  console.log("HomeAppsSection: loaded", allApps.length, "apps across", PREDEFINED_CATEGORIES.length, "categories");

  const visibleCategories = PREDEFINED_CATEGORIES.filter(cat => appsByCategory[cat].length > 0);
  const hasFeatured = featuredApps.length > 0;

  return (
    <div className="w-full px-6 lg:px-10 py-6">
      {hasFeatured && (
        <CategoryRow key="Popular" category="Popular" apps={featuredApps} tinted={false} />
      )}
      {visibleCategories.map((cat, i) => (
        <CategoryRow key={cat} category={cat} apps={appsByCategory[cat]} tinted={(hasFeatured ? i + 1 : i) % 2 === 1} />
      ))}
    </div>
  );
}
