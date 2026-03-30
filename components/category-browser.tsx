

















"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { useState, useEffect, useLayoutEffect, useRef } from "react"
import Link from "next/link"
import { SubmitModal } from "@/components/submit-modal"
import { buildTrackedAppUrl } from "@/lib/utils"

export function CategoryBrowser() {
  const categories = ["Scores & News", "Stats & Analytics", "Fantasy & Predictive", "Sports Betting", "Writers & Publications", "Trivia & Games", "Coaching & Training"]
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const isChangingCategoryRef = useRef<boolean>(false)
  
  // Get apps filtered by selected category
  const filteredApps = useQuery(
    api.apps.getVisibleAppsByTag,
    selectedCategory ? { tag: selectedCategory } : "skip"
  )

  // Get custom homepage section apps first
  const homepageSectionApps = useQuery(
    api.homepage_sections.getHomepageSectionApps,
    selectedCategory ? { sectionType: "category", sectionName: selectedCategory } : "skip"
  )

  // Use homepage section apps if available, otherwise fall back to filtered apps
  const displayApps = homepageSectionApps && homepageSectionApps.length > 0 ? homepageSectionApps : filteredApps

  // Restore scroll position after category change
  useLayoutEffect(() => {
    if (isChangingCategoryRef.current && displayApps !== undefined) {
      window.scrollTo(0, scrollPositionRef.current)
      isChangingCategoryRef.current = false
    }
  }, [displayApps])

  // Handle category change with scroll preservation
  const handleCategoryChange = (tag: string) => {
    if (tag === selectedCategory) return
    
    // Store current scroll position
    scrollPositionRef.current = window.scrollY
    isChangingCategoryRef.current = true
    
    // Change category
    setSelectedCategory(tag)
  }

  return (
    <section ref={sectionRef} className="bg-white py-3 px-3.5">
      <div className="mx-auto lg:px-4 sm:px-6 px-4 max-w-7xl">
        <div className="text-center mt-auto mb-5 mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-left mb-5">Browse by Category</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`w-full text-left px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-orange-100 text-orange-800 border-2 border-orange-200 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm border-2 border-transparent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Grid - Apps */}
          <div className="lg:w-3/4">
            {/* Apps Grid */}
            {displayApps === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : displayApps && displayApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayApps.slice(0, 6).map((app) => (
                  <Link
                    key={app._id}
                    href={`/apps/${app._id}`}
                    className="block"
                  >
                    <div className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 hover:border-gray-300 transition-all duration-200 cursor-pointer group h-64 flex flex-col relative ${
                      app.sponsored ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200' : ''
                    }`}>
                      {/* Sponsored tag */}
                      {app.sponsored && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            Sponsored
                          </div>
                        </div>
                      )}
                      
                      {/* Header with icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
                          <img
                            src={app.image}
                            alt={`${app.name} logo`}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg"
                            }}
                          />
                        </div>
                      </div>

                      {/* App name */}
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 overflow-hidden">{app.name}</h4>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {app.description}
                      </p>

                      {/* Visit button */}
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          window.open(buildTrackedAppUrl(app.url, app.name), '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full border py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent hover:from-orange-600 hover:to-red-600 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Visit
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ExternalLink className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No apps in this category yet
                </h4>
                <p className="text-gray-500 mb-6">
                  Suggest something you'll like and we'll add it
                </p>
                <Button 
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Submit App
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Submit Modal */}
      <SubmitModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
    </section>
  )
}






















