import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { Id } from "./_generated/dataModel"

// Query to get apps for a specific homepage section (category or sport)
export const getHomepageSectionApps = query({
  args: { 
    sectionType: v.string(), // "category" or "sport"
    sectionName: v.string() // e.g., "Scores & News", "Basketball"
  },
  handler: async (ctx, args) => {
    // Get the section entries ordered by display order
    const sectionEntries = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section_order", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .order("asc")
      .collect()

    // Get the actual app data for each entry, filtering out hidden apps
    const apps: any[] = []
    for (const entry of sectionEntries) {
      const app = await ctx.db.get(entry.appId)
      if (app && app.visible !== false) { // Only include visible apps
        apps.push(app)
      }
    }

    return apps
  },
})

// Query to get all homepage section configurations
export const getAllHomepageSections = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db.query("homepage_sections").collect()
    
    // Group by section type and name
    const grouped: Record<string, Record<string, Array<{ appId: Id<"apps">, order: number }>>> = {}
    
    for (const section of sections) {
      if (!grouped[section.sectionType]) {
        grouped[section.sectionType] = {}
      }
      if (!grouped[section.sectionType][section.sectionName]) {
        grouped[section.sectionType][section.sectionName] = []
      }
      grouped[section.sectionType][section.sectionName].push({
        appId: section.appId,
        order: section.order
      })
    }
    
    // Sort each section by order
    for (const sectionType in grouped) {
      for (const sectionName in grouped[sectionType]) {
        grouped[sectionType][sectionName].sort((a, b) => a.order - b.order)
      }
    }
    
    return grouped
  },
})

// Mutation to set apps for a specific homepage section
export const setHomepageSectionApps = mutation({
  args: {
    sectionType: v.string(),
    sectionName: v.string(),
    appIds: v.array(v.id("apps"))
  },
  handler: async (ctx, args) => {
    // First, remove all existing entries for this section
    const existingEntries = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .collect()
    
    for (const entry of existingEntries) {
      await ctx.db.delete(entry._id)
    }
    
    // Add new entries with proper ordering
    for (let i = 0; i < args.appIds.length; i++) {
      await ctx.db.insert("homepage_sections", {
        sectionType: args.sectionType,
        sectionName: args.sectionName,
        appId: args.appIds[i],
        order: i + 1,
        createdAt: Date.now()
      })
    }
    
    return { success: true, count: args.appIds.length }
  },
})

// Mutation to add an app to a homepage section
export const addAppToHomepageSection = mutation({
  args: {
    sectionType: v.string(),
    sectionName: v.string(),
    appId: v.id("apps")
  },
  handler: async (ctx, args) => {
    // Check if app is already in this section
    const existing = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first()
    
    if (existing) {
      throw new Error("App is already in this section")
    }
    
    // Get the highest order number for this section
    const sectionEntries = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .collect()
    
    const maxOrder = sectionEntries.reduce((max, entry) => Math.max(max, entry.order), 0)
    
    // Add the app with the next order number
    await ctx.db.insert("homepage_sections", {
      sectionType: args.sectionType,
      sectionName: args.sectionName,
      appId: args.appId,
      order: maxOrder + 1,
      createdAt: Date.now()
    })
    
    return { success: true }
  },
})

// Mutation to remove an app from a homepage section
export const removeAppFromHomepageSection = mutation({
  args: {
    sectionType: v.string(),
    sectionName: v.string(),
    appId: v.id("apps")
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .filter((q) => q.eq(q.field("appId"), args.appId))
      .first()
    
    if (!entry) {
      throw new Error("App not found in this section")
    }
    
    await ctx.db.delete(entry._id)
    
    // Reorder remaining apps to fill the gap
    const remainingEntries = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) => 
        q.eq("sectionType", args.sectionType).eq("sectionName", args.sectionName)
      )
      .collect()
    
    // Sort by current order and reassign sequential order numbers
    remainingEntries.sort((a, b) => a.order - b.order)
    for (let i = 0; i < remainingEntries.length; i++) {
      await ctx.db.patch(remainingEntries[i]._id, { order: i + 1 })
    }
    
    return { success: true }
  },
})

