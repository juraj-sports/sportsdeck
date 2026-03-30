import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Query to get featured apps in order
export const getFeaturedApps = query({
  args: {},
  handler: async (ctx) => {
    const featuredEntries = await ctx.db
      .query("featured_apps")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const featuredApps: Array<Doc<"apps"> & { featuredOrder: number; featuredId: Id<"featured_apps"> }> = [];
    for (const entry of featuredEntries) {
      const app = await ctx.db.get(entry.appId);
      if (app) {
        featuredApps.push({
          ...app,
          featuredOrder: entry.order,
          featuredId: entry._id,
        });
      }
    }

    return featuredApps;
  },
});

// Mutation to set featured apps (replaces all existing featured apps)
export const setFeaturedApps = mutation({
  args: {
    appIds: v.array(v.id("apps")),
  },
  handler: async (ctx, args) => {
    // Remove all existing featured apps
    const existingFeatured = await ctx.db.query("featured_apps").collect();
    for (const featured of existingFeatured) {
      await ctx.db.delete(featured._id);
    }

    // Add new featured apps with order
    const now = Date.now();
    for (let i = 0; i < args.appIds.length; i++) {
      await ctx.db.insert("featured_apps", {
        appId: args.appIds[i],
        order: i + 1,
        createdAt: now,
      });
    }

    return { success: true, count: args.appIds.length };
  },
});

// Mutation to add an app to featured list
export const addFeaturedApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    // Check if app is already featured
    const existing = await ctx.db
      .query("featured_apps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .first();

    if (existing) {
      throw new Error("App is already featured");
    }

    // Get the next order number
    const featuredApps = await ctx.db
      .query("featured_apps")
      .withIndex("by_order")
      .order("desc")
      .take(1);

    const nextOrder = featuredApps.length > 0 ? featuredApps[0].order + 1 : 1;

    await ctx.db.insert("featured_apps", {
      appId: args.appId,
      order: nextOrder,
      createdAt: Date.now(),
    });

    return { success: true, order: nextOrder };
  },
});

// Mutation to remove an app from featured list
export const removeFeaturedApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const featured = await ctx.db
      .query("featured_apps")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .first();

    if (!featured) {
      throw new Error("App is not featured");
    }

    await ctx.db.delete(featured._id);

    // Reorder remaining featured apps to fill gaps
    const remainingFeatured = await ctx.db
      .query("featured_apps")
      .withIndex("by_order")
      .order("asc")
      .collect();

    for (let i = 0; i < remainingFeatured.length; i++) {
      await ctx.db.patch(remainingFeatured[i]._id, {
        order: i + 1,
      });
    }

    return { success: true };
  },
});

// Mutation to reorder featured apps
export const reorderFeaturedApps = mutation({
  args: {
    appIds: v.array(v.id("apps")), // Array of app IDs in desired order
  },
  handler: async (ctx, args) => {
    // Get all current featured apps
    const currentFeatured = await ctx.db.query("featured_apps").collect();
    
    // Create a map of appId to featured entry
    const featuredMap = new Map();
    for (const featured of currentFeatured) {
      featuredMap.set(featured.appId, featured);
    }

    // Update order for each app in the new order
    for (let i = 0; i < args.appIds.length; i++) {
      const appId = args.appIds[i];
      const featured = featuredMap.get(appId);
      
      if (featured) {
        await ctx.db.patch(featured._id, {
          order: i + 1,
        });
      }
    }

    return { success: true, count: args.appIds.length };
  },
});

// Mutation to initialize featured apps with specific apps by name
export const initializeFeaturedApps = mutation({
  args: {
    appNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const appIds: Id<"apps">[] = [];
    
    // Find apps by name
    for (const appName of args.appNames) {
      const apps = await ctx.db.query("apps").collect();
      const app = apps.find(a => a.name.toLowerCase().includes(appName.toLowerCase()));
      
      if (app) {
        appIds.push(app._id);
      }
    }

    if (appIds.length === 0) {
      throw new Error("No matching apps found");
    }

    // Remove all existing featured apps
    const existingFeatured = await ctx.db.query("featured_apps").collect();
    for (const featured of existingFeatured) {
      await ctx.db.delete(featured._id);
    }

    // Add new featured apps
    const now = Date.now();
    for (let i = 0; i < appIds.length; i++) {
      await ctx.db.insert("featured_apps", {
        appId: appIds[i],
        order: i + 1,
        createdAt: now,
      });
    }

    return { 
      success: true, 
      count: appIds.length,
      foundApps: args.appNames.slice(0, appIds.length)
    };
  },
});


