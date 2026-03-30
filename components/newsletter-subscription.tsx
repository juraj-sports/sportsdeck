





"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface NewsletterSubscriptionProps {
  placeholder?: string
  className?: string
}

export function NewsletterSubscription({ 
  placeholder = "Enter your email", 
  className = "" 
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  
  const subscribe = useMutation(api.newsletter.subscribe)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage("Please enter your email address")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)
    setMessage("")
    
    try {
      const result = await subscribe({ email: email.trim() })
      setMessage(result.message)
      setMessageType("success")
      setEmail("") // Clear the input on success
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear message when user starts typing
    if (message) {
      setMessage("")
      setMessageType("")
    }
  }

  return (
    <div className={`relative w-full max-w-lg ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1.5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-transparent focus:outline-none text-sm sm:hidden"
          />
          <input
            type="email"
            placeholder="Enter your email for weekly picks"
            value={email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-transparent focus:outline-none text-sm hidden sm:block"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex whitespace-nowrap items-center justify-center px-5 py-2.5 rounded-lg bg-[#ea590e] text-white text-sm font-semibold hover:bg-[#d44e0b] transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>
      </form>

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-3 text-sm ${
          messageType === "success" 
            ? "text-green-600" 
            : "text-red-600"
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}













