




"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Star, ChevronLeft, ChevronRight, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { slugify, buildTrackedAppUrl } from "@/lib/utils"
import { AppLogo } from "@/components/app-logo"

export function NewArrivalsSection() {
  const newArrivals = useQuery(api.apps.getVisibleAppsByNewest)
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    slidesToScroll: 1, 
    align: "start",
    loop: false,
    dragFree: true
  })

  // Define color schemes for the cards
  const colorSchemes = [
    { border: "bg-green-400", badge: "bg-green-100 text-green-800", icon: "bg-green-500" },
    { border: "bg-yellow-400", badge: "bg-purple-100 text-purple-800", icon: "bg-yellow-500" },
    { border: "bg-orange-400", badge: "bg-blue-100 text-blue-800", icon: "bg-orange-500" },
    { border: "bg-purple-400", badge: "bg-blue-100 text-blue-800", icon: "bg-purple-500" },
    { border: "bg-cyan-400", badge: "bg-green-100 text-green-800", icon: "bg-cyan-500" }
  ]

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (newArrivals === undefined) {
    return (
      <section className="py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">New Arrivals</h2>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-1 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (newArrivals.length === 0) {
    return null
  }

  // Take only the first 10 newest apps for the carousel
  const displayApps = newArrivals.slice(0, 10)

  return (
    <section className="py-3 px-4">
      <div className="m-auto py-5 max-w-7xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {displayApps.map((app, index) => {
              const colorScheme = colorSchemes[index % colorSchemes.length]
              
              return (
                <div key={app._id} className="flex-shrink-0 w-80">
                  <Link
                    href={`/apps/${slugify(app.name)}`}
                    className="block"
                  >
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-105 hover:border-gray-300 transition-all duration-200 cursor-pointer group relative ${
                      app.sponsored ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200' : ''
                    }`}>
                      {/* Sponsored tag */}
                      {app.sponsored && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            Sponsored
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6">
                        {/* Header with icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
                            <AppLogo
                              src={app.image}
                              appUrl={app.url}
                              alt={`${app.name} logo`}
                              className="w-full h-full object-cover rounded-xl"
                              fallback={<Star className="w-5 h-5 text-gray-400" />}
                            />
                          </div>
                        </div>

                        {/* App name */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{app.name}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                          {app.description}
                        </p>

                        {/* Visit button */}
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            window.open(buildTrackedAppUrl(app.url, app.name), '_blank', 'noopener,noreferrer');
                          }}
                          className="w-full py-2 font-medium transition-colors flex items-center gap-1.5 text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          Visit website
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {displayApps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < 3 ? 'bg-gray-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}






