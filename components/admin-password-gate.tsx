"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Mail, LogOut } from "lucide-react"

// Context so the admin content can trigger logout
const AdminAuthContext = createContext<{ logout: () => Promise<void> }>({
  logout: async () => {},
})

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/auth")
      .then(res => setAuthenticated(res.ok))
      .catch(() => setAuthenticated(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      if (res.ok) {
        setAuthenticated(true)
      } else {
        const data = await res.json()
        setError(data.error ?? "Login failed")
        setPassword("")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    setAuthenticated(false)
    setEmail("")
    setPassword("")
  }

  // Still checking session
  if (authenticated === null) {
    return <div className="min-h-screen bg-gray-50" />
  }

  // Authenticated — provide logout context to children
  if (authenticated) {
    return (
      <AdminAuthContext.Provider value={{ logout }}>
        {children}
      </AdminAuthContext.Provider>
    )
  }

  // Not authenticated — login form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Sportsdeck.io accounts only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="you@sportsdeck.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              className="h-12 pl-9"
            />
          </div>

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-12"
          />

          {error && (
            <p className="text-sm text-red-500 text-center -mt-1">{error}</p>
          )}

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                rememberMe ? "bg-gray-900 border-gray-900" : "border-gray-300"
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600">Keep me logged in for 30 days</span>
          </label>

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
