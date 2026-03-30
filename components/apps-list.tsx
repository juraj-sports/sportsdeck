"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MessageCircle } from "lucide-react"
import Link from "next/link"
import { slugify } from "@/lib/utils"

export function AppsList() {
  // Get all apps sorted by newest
  const apps = useQuery(api.apps.getAppsByNewest)

  if (apps === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No apps yet!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Be the first to add an amazing app to our directory.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Apps List */}
      {apps?.map((app, index) => (
        <div 
          key={app._id} 
          className="flex items-center space-x-4 py-6 border-b border-gray-100 last:border-b-0"
        >
          {/* Number */}
          <div className="flex-shrink-0 w-8 text-center">
            <span className="text-lg font-bold text-gray-400">
              {index + 1}.
            </span>
          </div>

          {/* App Icon */}
          <div className="flex-shrink-0">
            <img
              src={app.image}
              alt={app.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg"
              }}
            />
          </div>

          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/apps/${slugify(app.name)}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 cursor-pointer">
                    {app.name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {app.description}
                </p>
                
                {/* Tags/Categories */}
                {app.tags && app.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {app.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Right side - Comments only */}
              <div className="flex items-center space-x-4 ml-6">
                {/* Comments */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center p-2 h-auto text-gray-500">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs mt-1 font-medium">47</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}




