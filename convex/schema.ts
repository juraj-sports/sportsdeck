import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  // Core apps table
  apps: defineTable({
    name: v.string(),
    description: v.string(),
    url: v.string(),
    image: v.string(),
    createdAt: v.number(),
    tags: v.optional(v.array(v.string())),
    primarySport: v.optional(v.array(v.string())),
    visible: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("submitted"), v.literal("approved"), v.literal("rejected"))),
    suggestedCategories: v.optional(v.array(v.string())),
    suggestedSports: v.optional(v.array(v.string())),
    reviewWhatIs: v.optional(v.string()),
    reviewHowItWorks: v.optional(v.string()),
    reviewPros: v.optional(v.string()),
    reviewCons: v.optional(v.string()),
    reviewWorthIt: v.optional(v.string()),
    notificationEmail: v.optional(v.string()),
    submissionNotificationStatus: v.optional(v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"))),
    // Legacy fields — kept optional so existing documents validate while we migrate
    leagues: v.optional(v.array(v.string())),
    screenshots: v.optional(v.array(v.string())),
    platform: v.optional(v.array(v.string())),
    monetization: v.optional(v.array(v.string())),
    targetUser: v.optional(v.array(v.string())),
    upvotes: v.optional(v.number()),
    sponsored: v.optional(v.boolean()),
  }).index("by_created_at", ["createdAt"])
    .index("by_status", ["status"]),

  // Featured apps — homepage carousel
  featured_apps: defineTable({
    appId: v.id("apps"),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_app", ["appId"]),

  // Homepage sections — category/sport section ordering
  homepage_sections: defineTable({
    sectionType: v.string(),
    sectionName: v.string(),
    appId: v.id("apps"),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_section", ["sectionType", "sectionName"])
    .index("by_app", ["appId"])
    .index("by_section_order", ["sectionType", "sectionName", "order"]),

  // Newsletter subscribers
  newsletter_subscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    isActive: v.optional(v.boolean()),
  }).index("by_email", ["email"]),
})
