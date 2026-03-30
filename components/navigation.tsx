"use client"

import Link from "next/link"
import { User, Search, X, ChevronDown } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState, useRef, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"
import { slugify } from "@/lib/utils"

const CATEGORIES = [
  "Popular",
  "Scores & News",
  "Fantasy & Predictive",
  "Sports Betting",
  "Stats & Analytics",
  "Communities & Forums",
  "Writers & Publications",
  "Coaching & Training",
  "Trivia & Games",
]

export function Navigation() {
  const isAuthenticated = useQuery(api.auth.isAuthenticated) ?? false
  const allApps = useQuery(api.apps.getAllVisibleApps) ?? []
  const { signOut } = useAuthActions()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const results = query.trim().length > 0
    ? allApps.filter((app) =>
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setShowCategories(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const scrollToCategory = (category: string) => {
    const id = `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const el = document.getElementById(id)
    if (el) {
      const headerOffset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top, behavior: "smooth" })
    }
    setShowCategories(false)
  }

  return (
    <>
      {/* Mobile: Auth */}
      <div className="flex md:hidden items-center gap-3 ml-auto">
        {isAuthenticated && (
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        )}
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultMode={authMode} />
      </div>

    <nav className="hidden md:flex items-center justify-between flex-1 h-full ml-8">

      {/* Left: Admin */}
      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Admin
          </Link>
        )}
      </div>

      {/* Center: Search — absolutely centered */}
      <div className="absolute left-1/2 -translate-x-1/2 w-80" ref={searchRef}>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search apps and tools..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); setShowDropdown(false) }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
            {results.map((app) => (
              <Link
                key={app._id}
                href={`/apps/${slugify(app.name)}`}
                onClick={() => { setShowDropdown(false); setQuery("") }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {app.image
                    ? <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                    : <span className="text-xs text-gray-400">{app.name[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.name}</p>
                  <p className="text-xs text-gray-400 truncate">{app.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right: Profile */}
      <div className="flex items-center space-x-3 ml-4">
        {isAuthenticated && (
          <div
            className="relative"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px] z-50">
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultMode={authMode} />
    </nav>
    </>
  )
}
