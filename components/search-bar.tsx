"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AppLogo } from "@/components/app-logo"

interface SearchBarProps {
  placeholder?: string
  className?: string
  showButton?: boolean
}

export function SearchBar({ 
  placeholder = "Search for fantasy, betting, analytics apps...", 
  className = "",
  showButton = true 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get all tags for category matching
  const allTags = useQuery(api.apps.getAllTags)
  
  // Get search suggestions for dropdown
  const suggestions = useQuery(api.apps.getSearchSuggestions, 
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  )

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = () => {
    if (!searchTerm.trim()) return
    
    // Clear the search since we don't have a products page anymore
    setSearchTerm("")
    setShowDropdown(false)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.trim().length > 0)
  }

  const handleSuggestionClick = (appId: string) => {
    router.push(`/apps/${appId}`)
    setShowDropdown(false)
    setSearchTerm("")
  }
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={showButton ? 
        "flex items-center bg-white border border-gray-300 rounded-xl p-1.5" :
        "relative"
      }>
        {!showButton && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => searchTerm.trim().length > 0 && setShowDropdown(true)}
          className={showButton ? 
            "flex-1 px-4 py-2 text-gray-700 bg-transparent focus:outline-none text-sm" :
            "w-full pl-10 pr-4 py-4 border border-gray-200 rounded-lg bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          }
        />
        {showButton && (
          <button 
            onClick={handleSearch}
            className="inline-flex whitespace-nowrap items-center justify-center px-5 py-2.5 rounded-lg bg-[#ea590e] text-white text-sm font-semibold hover:bg-[#d44e0b] transition-colors shrink-0"
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown with suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions && suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((app) => (
                <button
                  key={app._id}
                  onClick={() => handleSuggestionClick(app._id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <AppLogo
                    src={app.image}
                    appUrl={app.url}
                    alt={app.name}
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                    fallback={
                      <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                        {app.name[0]}
                      </div>
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{app.name}</div>
                    <div className="text-sm text-gray-500 truncate">{app.description}</div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          ) : searchTerm.trim().length > 0 ? (
            <div className="py-4 px-4 text-gray-500 text-center">
              No matching apps found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}




