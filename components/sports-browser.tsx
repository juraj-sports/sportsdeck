




















"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { useState, useEffect, useLayoutEffect, useRef } from "react"
import Link from "next/link"

export function SportsBrowser() {
  console.log("SportsBrowser component is rendering")
  const allPrimarySports = useQuery(api.apps.getAllPrimarySports)
  console.log("allPrimarySports query result:", allPrimarySports)
  const [selectedSport, setSelectedSport] = useState<string>("")
  const sectionRef = useRef<HTMLElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const isChangingSportRef = useRef<boolean>(false)
  
  // Get apps filtered by selected primary sport
  const filteredApps = useQuery(
    api.apps.getAppsByPrimarySport,
    selectedSport ? { sport: selectedSport, includeHidden: false } : "skip"
  )

  // Get custom homepage section apps first
  const homepageSectionApps = useQuery(
    api.homepage_sections.getHomepageSectionApps,
    selectedSport ? { sectionType: "sport", sectionName: selectedSport } : "skip"
  )

  // Use homepage section apps if available, otherwise fall back to filtered apps
  const displayApps = homepageSectionApps && homepageSectionApps.length > 0 ? homepageSectionApps : filteredApps
  
  console.log("Debug - selectedSport:", selectedSport)
  console.log("Debug - homepageSectionApps:", homepageSectionApps)
  console.log("Debug - filteredApps:", filteredApps)
  console.log("Debug - displayApps:", displayApps)

  // Set default selected sport when primary sports load
  useEffect(() => {
    console.log("allPrimarySports:", allPrimarySports, "selectedSport:", selectedSport)
    if (allPrimarySports && allPrimarySports.length > 0 && !selectedSport) {
      // Filter to only show sports that have apps and are in our predefined list
      const availableSports = ["Basketball", "Hockey", "Football", "Soccer", "Tennis", "Baseball", "Golf", "MMA", "Lacrosse"].filter(sport => 
        allPrimarySports.includes(sport)
      );
      if (availableSports.length > 0) {
        setSelectedSport(availableSports[0])
      }
    }
  }, [allPrimarySports, selectedSport])

  // Restore scroll position after sport change
  useLayoutEffect(() => {
    if (isChangingSportRef.current && displayApps !== undefined) {
      window.scrollTo(0, scrollPositionRef.current)
      isChangingSportRef.current = false
    }
  }, [displayApps])

  // Handle sport change with scroll preservation
  const handleSportChange = (tag: string) => {
    if (tag === selectedSport) return
    
    // Store current scroll position
    scrollPositionRef.current = window.scrollY
    isChangingSportRef.current = true
    
    // Change sport
    setSelectedSport(tag)
  }

  // Always render something to test if the component is being called
  return (
    <section ref={sectionRef} className="bg-white py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Discover by Sport</h2>
        </div>
        {allPrimarySports === undefined ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading sports...</span>
          </div>
        ) : !allPrimarySports || allPrimarySports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sports available yet</h3>
            <p className="text-gray-500">Add some apps to see sport browsing here!</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Sports */}
            <div className="lg:w-1/4">
              <div className="space-y-3">
                {["Basketball", "Hockey", "Football", "Soccer", "Tennis", "Baseball", "Golf", "MMA", "Lacrosse"].filter(sport => 
                  allPrimarySports.includes(sport)
                ).map((sport) => (
                  <button
                    key={sport}
                    onClick={() => handleSportChange(sport)}
                    className={`w-full text-left px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedSport === sport
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-200 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm border-2 border-transparent'
                    }`}
                  >
                    {sport}
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
                        <div className="w-full border py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent hover:from-orange-600 hover:to-red-600">
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
                    No apps in this sport yet
                  </h4>
                  <p className="text-gray-500 mb-6">
                    Suggest something you'll like and we'll add it
                  </p>
                  <Link href="/submit">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Submit App
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}





























