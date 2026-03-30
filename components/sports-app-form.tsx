"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

export function SportsAppForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [image, setImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const createApp = useMutation(api.apps.createApp)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !description.trim() || !url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(url.trim())
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createApp({
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        image: image.trim() || "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg", // Default app icon
      })
      
      // Reset form
      setName("")
      setDescription("")
      setUrl("")
      setImage("")
      
      toast({
        title: "Success! 🎉",
        description: "App added successfully to the directory",
      })
    } catch (error) {
      console.error("Error creating app:", error)
      toast({
        title: "Error",
        description: "Failed to add app. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 sticky top-8">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Plus className="w-6 h-6 text-blue-600" />
          Add New App
        </CardTitle>
        <CardDescription className="text-base">
          Submit your favorite app to share with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              App Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Notion, Figma, Spotify"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this app does and why it's useful..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              App URL *
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting}
              className="h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Image URL (optional)
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={isSubmitting}
              className="h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use a default app icon
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding App...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add App</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}