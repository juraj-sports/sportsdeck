import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

// Subscribe to newsletter
export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const { email } = args
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format")
    }
    
    // Check if email already exists
    const existingSubscriber = await ctx.db
      .query("newsletter_subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
    
    if (existingSubscriber) {
      // If exists but inactive, reactivate
      if (existingSubscriber.isActive === false) {
        await ctx.db.patch(existingSubscriber._id, {
          isActive: true,
          subscribedAt: Date.now()
        })
        return { success: true, message: "Successfully resubscribed!" }
      }
      throw new Error("Email already subscribed")
    }
    
    // Add new subscriber
    await ctx.db.insert("newsletter_subscribers", {
      email,
      subscribedAt: Date.now(),
      isActive: true
    })

    // Sync to Loops as a contact
    await ctx.scheduler.runAfter(0, internal.loops.addContact, {
      email,
      source: "newsletter",
      userGroup: "Newsletter",
    })
    
    return { success: true, message: "Successfully subscribed!" }
  }
})

// Get all active subscribers (for admin use)
export const getActiveSubscribers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("newsletter_subscribers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect()
  }
})

// Get subscriber count
export const getSubscriberCount = query({
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletter_subscribers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()
    
    return subscribers.length
  }
})