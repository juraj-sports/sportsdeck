




"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, ArrowLeft, Check } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

const PREDEFINED_CATEGORIES = [
  "Scores & News",
  "Stats & Analytics", 
  "Fantasy & Predictive",
  "Sports Betting",
  "Writers & Publications",
  "Communities & Forums",
  "Trivia & Games",
  "Coaching & Training"
]

const PRIMARY_SPORT_OPTIONS = [
  "Basketball", "Hockey", "Baseball", "Football", "Soccer", "Tennis", "Golf", "MMA", "Lacrosse"
]

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

interface SubmitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitModal({ open, onOpenChange }: SubmitModalProps) {
  const [step, setStep] = useState(1)
  const [appName, setAppName] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomSportInput, setShowCustomSportInput] = useState(false)
  const [customSport, setCustomSport] = useState("")

  const submitApp = useMutation(api.apps.submitApp)

  const resetForm = () => {
    setStep(1)
    setAppName("")
    setSelectedCategories([])
    setSelectedSports([])
    setUrl("")
    setDescription("")
    setEmail("")
    setShowCustomCategoryInput(false)
    setCustomCategory("")
    setShowCustomSportInput(false)
    setCustomSport("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetForm, 300)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleContinue = () => {
    if (step === 1 && !appName.trim()) {
      toast.error("Please enter an app name")
      return
    }
    if (step === 2 && selectedCategories.length === 0) {
      toast.error("Please select at least one category")
      return
    }
    // Silently add custom category if present before continuing (suggestions don't count toward limit)
    if (step === 2 && customCategory.trim()) {
      setSelectedCategories([...selectedCategories, customCategory.trim()])
      setCustomCategory("")
      setShowCustomCategoryInput(false)
    }
    if (step === 3 && selectedSports.length === 0) {
      toast.error("Please select at least one sport")
      return
    }
    // Silently add custom sport if present before continuing
    if (step === 3 && customSport.trim()) {
      setSelectedSports([...selectedSports, customSport.trim()])
      setCustomSport("")
      setShowCustomSportInput(false)
    }
    if (step === 4 && !url.trim()) {
      toast.error("Please enter a URL")
      return
    }
    if (step === 5 && !description.trim()) {
      toast.error("Please tell us what's good about it")
      return
    }
    if (step === 6 && !email.trim()) {
      toast.error("Please enter your email address")
      return
    }
    if (step === 6 && !isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }
    
    if (step < 6) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please tell us what's good about it")
      return
    }
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }
    if (!isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    // Separate predefined and custom categories/sports
    const predefinedCategories = selectedCategories.filter(
      cat => PREDEFINED_CATEGORIES.includes(cat)
    )
    const suggestedCategories = selectedCategories.filter(
      cat => !PREDEFINED_CATEGORIES.includes(cat)
    )
    const predefinedSports = selectedSports.filter(
      sport => PRIMARY_SPORT_OPTIONS.includes(sport)
    )
    const suggestedSports = selectedSports.filter(
      sport => !PRIMARY_SPORT_OPTIONS.includes(sport)
    )

    setIsSubmitting(true)
    try {
      const appId = await submitApp({
        name: appName,
        description: description,
        url: url,
        tags: predefinedCategories,
        primarySport: predefinedSports,
        suggestedCategories: suggestedCategories.length > 0 ? suggestedCategories : undefined,
        suggestedSports: suggestedSports.length > 0 ? suggestedSports : undefined,
        notificationEmail: email.trim()
      })
      toast.success("App submitted successfully! We'll notify you at " + email.trim())
      handleClose()
    } catch (error) {
      toast.error("Failed to submit app. Please try again.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotifyMe = () => {
    // This is now unused, keeping for backwards compatibility
    if (email.trim()) {
      toast.success("We'll notify you when your app goes live!")
    } else {
      toast.success("Your app has been submitted!")
    }
    handleClose()
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      toast.error("You can select up to 3 categories")
    }
  }

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport))
    } else {
      setSelectedSports([...selectedSports, sport])
    }
  }

  const handleCustomCategorySubmit = () => {
    if (!customCategory.trim()) {
      toast.error("Please enter a category name")
      return
    }
    setSelectedCategories([...selectedCategories, customCategory.trim()])
    setCustomCategory("")
    setShowCustomCategoryInput(false)
  }

  const handleCustomSportSubmit = () => {
    if (!customSport.trim()) {
      toast.error("Please enter a sport name")
      return
    }
    setSelectedSports([...selectedSports, customSport.trim()])
    setCustomSport("")
    setShowCustomSportInput(false)
    toast.success("Custom sport added")
  }

  const handleCustomCategoryEnter = () => {
    if (!customCategory.trim()) {
      toast.error("Please enter a category name")
      return
    }
    setSelectedCategories([...selectedCategories, customCategory.trim()])
    setCustomCategory("")
    setShowCustomCategoryInput(false)
    // Proceed to next step after state update
    setTimeout(() => {
      setStep(step + 1)
    }, 0)
  }

  const handleCustomSportEnter = () => {
    if (!customSport.trim()) {
      toast.error("Please enter a sport name")
      return
    }
    setSelectedSports([...selectedSports, customSport.trim()])
    setCustomSport("")
    setShowCustomSportInput(false)
    // Proceed to next step after state update
    setTimeout(() => {
      setStep(step + 1)
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/60" />
      <DialogContent className="max-w-xl p-0 border-0 bg-transparent shadow-none">
        <div className="bg-white rounded-3xl p-8 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Back button */}
          {step > 1 && (
            <button
              onClick={handleBack}
              className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Content */}
          <div className="mt-8">
            {/* Step 1: App Name */}
            {step === 1 && (
              <div className="text-center">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Which app, tool or creator<br />should I feature?</h2>
                </div>
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Type app, tool, or creator name"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-14 rounded-xl text-center text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleContinue()
                  }}
                />
              </div>
            )}

            {/* Step 2: Categories */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm mb-2">Step 2 of 6</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select category</h2>
                  <p className="text-gray-600 text-sm">Select up to 3 categories</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category)
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`p-4 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  })}
                </div>
                
                {/* Suggest new category button or input */}
                <div className="mt-3">
                  {!showCustomCategoryInput ? (
                    <button
                      onClick={() => setShowCustomCategoryInput(true)}
                      className="w-full p-4 rounded-xl text-sm font-medium transition-all text-gray-900"
                    >
                      + Suggest new category</button>
                  ) : (
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type your category name"
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-14 rounded-xl text-center text-base"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCustomCategoryEnter()
                      }}
                      onBlur={() => {
                        if (!customCategory.trim()) {
                          setShowCustomCategoryInput(false)
                          setCustomCategory("")
                        }
                      }}
                      autoFocus
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Sports */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm mb-2">Step 3 of 6</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select sports</h2>
                  <p className="text-gray-600 text-sm">You can select as many as you want</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PRIMARY_SPORT_OPTIONS.map((sport) => {
                    const isSelected = selectedSports.includes(sport)
                    return (
                      <button
                        key={sport}
                        onClick={() => toggleSport(sport)}
                        className={`p-4 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {sport}
                      </button>
                    )
                  })}
                </div>
                
                {/* Suggest new sport button or input */}
                <div className="mt-3">
                  {!showCustomSportInput ? (
                    <button
                      onClick={() => setShowCustomSportInput(true)}
                      className="w-full p-4 rounded-xl text-sm font-medium transition-all text-gray-900"
                    >
                      Suggest new sport
                    </button>
                  ) : (
                    <Input
                      value={customSport}
                      onChange={(e) => setCustomSport(e.target.value)}
                      placeholder="Type your sport name"
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-14 rounded-xl text-center text-base"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCustomSportEnter()
                      }}
                      onBlur={() => {
                        if (!customSport.trim()) {
                          setShowCustomSportInput(false)
                          setCustomSport("")
                        }
                      }}
                      autoFocus
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 4: URL */}
            {step === 4 && (
              <div className="text-center">
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-2">Step 4 of 6</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    What's the URL?
                  </h2>
                </div>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.example.com/"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-14 rounded-xl text-center text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleContinue()
                  }}
                />
              </div>
            )}

            {/* Step 5: Description */}
            {step === 5 && (
              <div className="text-center">
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-2">Step 5 of 6</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    What do you like about it?</h2>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Tell us more about ${appName || 'the app'}`}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl min-h-32 text-base resize-none"
                />
              </div>
            )}

            {/* Step 6: Email */}
            {step === 6 && (
              <div className="text-center">
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-2">Step 6 of 6</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    What's your email?</h2>
                  <p className="text-gray-600 text-sm">We'll notify you when your app goes live</p>
                </div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-14 rounded-xl text-center text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSubmit()
                  }}
                />
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8">
              {step < 6 ? (
                <Button
                  onClick={handleContinue}
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl text-base font-semibold"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl text-base font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </Button>
              )}
            </div>

            {/* Progress indicator */}
            {step < 7 && (
              <div className="flex justify-center gap-2 mt-6">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-all ${
                      s === step ? "w-8 bg-gray-900" : "w-1 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}








