import { mutation, query, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Query to get site stats: total visible apps, unique categories, unique sports
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("apps")
      .filter((q) => q.eq(q.field("visible"), true))
      .collect();

    const categories = new Set<string>();
    const sports = new Set<string>();

    for (const app of apps) {
      if (app.tags) app.tags.forEach((t) => categories.add(t));
      if (app.primarySport) app.primarySport.forEach((s) => sports.add(s));
    }

    return {
      toolsCount: apps.length,
      categoriesCount: categories.size,
      sportsCount: sports.size,
    };
  },
});

// Mutation to create a new app
export const createApp = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    url: v.string(),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    primarySport: v.optional(v.array(v.string())),
    visible: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("submitted"), v.literal("approved"), v.literal("rejected"))),
    reviewWhatIs: v.optional(v.string()),
    reviewHowItWorks: v.optional(v.string()),
    reviewPros: v.optional(v.string()),
    reviewCons: v.optional(v.string()),
    reviewWorthIt: v.optional(v.string()),
    suggestedCategories: v.optional(v.array(v.string())),
    suggestedSports: v.optional(v.array(v.string())),
    notificationEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Resolve storage ID to real URL if provided
    let resolvedImage = args.image;
    if (args.imageStorageId) {
      const url = await ctx.storage.getUrl(args.imageStorageId);
      if (url) resolvedImage = url;
    }

    const appId = await ctx.db.insert("apps", {
      name: args.name,
      description: args.description,
      url: args.url,
      image: resolvedImage,
      createdAt: Date.now(),
      tags: args.tags ?? [],
      primarySport: args.primarySport,
      visible: args.visible ?? true,
      status: args.status ?? "approved",
      reviewWhatIs: args.reviewWhatIs,
      reviewHowItWorks: args.reviewHowItWorks,
      reviewPros: args.reviewPros,
      reviewCons: args.reviewCons,
      reviewWorthIt: args.reviewWorthIt,
      suggestedCategories: args.suggestedCategories,
      suggestedSports: args.suggestedSports,
      notificationEmail: args.notificationEmail,
    });
    return appId;
  },
});

// Query to get all apps
export const getAllApps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apps").order("desc").collect();
  },
});

// Query to get all approved apps (excludes submitted apps)
export const getAllApprovedApps = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").order("desc").collect();
    return apps.filter(app => app.status !== "submitted"); // Exclude submitted apps
  },
});

// Query to get submitted apps (pending approval)
export const getSubmittedApps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apps")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .order("desc")
      .collect();
  },
});

// Query to get all visible apps (for public pages)
export const getAllVisibleApps = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").order("desc").collect();
    return apps.filter(app => app.visible !== false); // Show apps where visible is true or undefined
  },
});

// Query to get apps sorted by newest first
export const getAppsByNewest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
  },
});

// Query to get visible apps sorted by newest first (for public pages)
export const getVisibleAppsByNewest = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return apps.filter(app => app.visible !== false); // Show apps where visible is true or undefined
  },
});

// Query to get top apps launched today, sorted by newest
export const getTopAppsToday = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return allApps.filter(app => app.createdAt >= twentyFourHoursAgo);
  },
});

// Query to get top apps launched this week (excluding today), sorted by newest
export const getTopAppsThisWeek = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return allApps.filter(app => 
      app.createdAt >= sevenDaysAgo && app.createdAt < twentyFourHoursAgo
    );
  },
});

// Query to get top apps launched this month (excluding this week), sorted by newest
export const getTopAppsThisMonth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return allApps.filter(app => 
      app.createdAt >= thirtyDaysAgo && app.createdAt < sevenDaysAgo
    );
  },
});

// Query to get a single app by ID
export const getAppById = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// Query to get a single app by name (slug)
export const getAppByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Convert the slug back to match against app names
    // We'll do a case-insensitive search by converting both to lowercase and comparing slugified versions
    const apps = await ctx.db.query("apps").collect();
    
    const slugify = (text: string): string => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };
    
    const targetSlug = slugify(args.name);
    
    // Find app where slugified name matches the target slug
    const app = apps.find(app => slugify(app.name) === targetSlug);
    
    return app || null;
  },
});

// Query to get apps with filtering and sorting for products page
export const getAppsWithFilters = query({
  args: {
    categories: v.optional(v.array(v.string())),
    primarySport: v.optional(v.array(v.string())),
    sortBy: v.optional(v.union(v.literal("newest"))),
    range: v.optional(v.union(v.literal("today"), v.literal("week"), v.literal("month"))),
    includeHidden: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { categories, primarySport, sortBy = "newest", range, includeHidden = false } = args;
    
    // Get all apps sorted by newest
    let apps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    
    // Filter by visibility unless includeHidden is true (for admin)
    if (!includeHidden) {
      apps = apps.filter(app => app.visible !== false);
    }
    
    // Apply range filtering if specified
    if (range) {
      const now = Date.now();
      let startTime: number;
      let endTime: number | undefined;
      
      if (range === "today") {
        startTime = now - (24 * 60 * 60 * 1000); // Last 24 hours
        endTime = undefined; // No end time, includes everything from startTime to now
      } else if (range === "week") {
        const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
        startTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        endTime = twentyFourHoursAgo; // Exclude today
      } else if (range === "month") {
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        startTime = now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        endTime = sevenDaysAgo; // Exclude this week
      } else {
        startTime = 0; // Default to all time
      }
      
      apps = apps.filter(app => {
        if (endTime) {
          return app.createdAt >= startTime && app.createdAt < endTime;
        } else {
          return app.createdAt >= startTime;
        }
      });
    }
    
    // Filter by categories if provided
    if (categories && categories.length > 0) {
      apps = apps.filter(app => {
        if (!app.tags || app.tags.length === 0) return false;
        return categories.some(category => app.tags!.includes(category));
      });
    }
    
    // Filter by primary sport if provided
    if (primarySport && primarySport.length > 0) {
      apps = apps.filter(app => {
        if (!app.primarySport || app.primarySport.length === 0) return false;
        return primarySport.some(sport => app.primarySport!.includes(sport));
      });
    }
    
    return apps;
  },
});

// Query to get apps filtered by primary sport, sorted by newest
export const getAppsByPrimarySport = query({
  args: { 
    sport: v.string(),
    includeHidden: v.optional(v.boolean()) // For admin use
  },
  handler: async (ctx, args) => {
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    
    // Filter by visibility unless includeHidden is true (for admin)
    let apps = args.includeHidden ? allApps : allApps.filter(app => app.visible !== false);
    
    // Map sport names to their league equivalents
    const sportToLeagueMap: Record<string, string[]> = {
      "Basketball": ["Basketball", "NBA", "WNBA", "College Basketball"],
      "Football": ["Football", "NFL", "College Football"],
      "Hockey": ["Hockey", "NHL"],
      "Baseball": ["Baseball", "MLB"],
      "Soccer": ["Soccer", "MLS", "Premier League", "La Liga", "Champions League", "Ligue 1", "Serie A", "Bundesliga", "World Cup"],
      "Tennis": ["Tennis"],
      "Golf": ["Golf"],
      "Lacrosse": ["Lacrosse"]
    };
    
    const searchTerms = sportToLeagueMap[args.sport] || [args.sport];
    
    return apps.filter(app =>
      app.primarySport &&
      app.primarySport.length > 0 &&
      searchTerms.some(term => app.primarySport!.includes(term))
    );
  },
});

// Query to get all unique primary sports from apps
export const getAllPrimarySports = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").collect();
    const sportSet = new Set<string>();
    
    // Map league names back to sport categories
    const leagueToSportMap: Record<string, string> = {
      "Basketball": "Basketball",
      "NBA": "Basketball", 
      "WNBA": "Basketball",
      "College Basketball": "Basketball",
      "Football": "Football",
      "NFL": "Football",
      "College Football": "Football",
      "Hockey": "Hockey",
      "NHL": "Hockey",
      "Baseball": "Baseball",
      "MLB": "Baseball",
      "Soccer": "Soccer",
      "MLS": "Soccer",
      "Premier League": "Soccer",
      "La Liga": "Soccer",
      "Champions League": "Soccer",
      "Ligue 1": "Soccer",
      "Serie A": "Soccer",
      "Bundesliga": "Soccer",
      "World Cup": "Soccer",
      "Tennis": "Tennis",
      "Golf": "Golf",
      "Lacrosse": "Lacrosse"
    };
    
    apps.forEach(app => {
      if (app.primarySport && app.primarySport.length > 0) {
        app.primarySport.forEach(league => {
          const sport = leagueToSportMap[league];
          if (sport) {
            sportSet.add(sport);
          }
        });
      }
    });
    
    return Array.from(sportSet).sort();
  },
});

// Query to get apps filtered by tag, sorted by newest
export const getAppsByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return allApps.filter(app => app.tags && app.tags.includes(args.tag));
  },
});

// Query to get visible apps filtered by tag, sorted by newest (for public pages)
export const getVisibleAppsByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    return allApps.filter(app => 
      app.visible !== false && // Only show visible apps
      app.tags && app.tags.includes(args.tag)
    );
  },
});

// Query to get all unique tags from apps
export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").collect();
    const tagSet = new Set<string>();
    
    apps.forEach(app => {
      if (app.tags) {
        app.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).sort();
  },
});

// Query to search apps by name and categories
export const searchApps = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const { searchTerm } = args;
    
    if (!searchTerm.trim()) {
      return [];
    }
    
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    return allApps.filter(app => {
      // Search in app name
      const nameMatch = app.name.toLowerCase().includes(normalizedSearchTerm);
      
      // Search in categories/tags
      const categoryMatch = app.tags && app.tags.some(tag => 
        tag.toLowerCase().includes(normalizedSearchTerm)
      );
      
      return nameMatch || categoryMatch;
    });
  },
});

// Query to get live search suggestions (up to 5 apps that start with search term)
export const getSearchSuggestions = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const { searchTerm } = args;
    
    if (!searchTerm.trim()) {
      return [];
    }
    
    const allApps = await ctx.db.query("apps").withIndex("by_created_at").order("desc").collect();
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    return allApps
      .filter(app => app.name.toLowerCase().startsWith(normalizedSearchTerm))
      .slice(0, 5);
  },
});

// Mutation to update an existing app
export const updateApp = mutation({
  args: {
    appId: v.id("apps"),
    name: v.string(),
    description: v.string(),
    url: v.string(),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    primarySport: v.optional(v.array(v.string())),
    visible: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("submitted"), v.literal("approved"), v.literal("rejected"))),
    reviewWhatIs: v.optional(v.string()),
    reviewHowItWorks: v.optional(v.string()),
    reviewPros: v.optional(v.string()),
    reviewCons: v.optional(v.string()),
    reviewWorthIt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { appId, ...updateData } = args;

    // Resolve storage ID to real URL if provided
    let resolvedImage = updateData.image;
    if (updateData.imageStorageId) {
      const url = await ctx.storage.getUrl(updateData.imageStorageId);
      if (url) resolvedImage = url;
    }

    await ctx.db.patch(appId, {
      name: updateData.name,
      description: updateData.description,
      url: updateData.url,
      image: resolvedImage,
      tags: updateData.tags ?? [],
      primarySport: updateData.primarySport,
      visible: updateData.visible,
      status: updateData.status,
      reviewWhatIs: updateData.reviewWhatIs,
      reviewHowItWorks: updateData.reviewHowItWorks,
      reviewPros: updateData.reviewPros,
      reviewCons: updateData.reviewCons,
      reviewWorthIt: updateData.reviewWorthIt,
    });
    
    return appId;
  },
});

// Mutation to approve a submitted app
export const approveApp = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }
    
    await ctx.db.patch(args.appId, {
      status: "approved",
      visible: true, // Make visible when approved
    });

    // Send approval notification via Loops
    await ctx.scheduler.runAfter(0, internal.loops.notifyApproval, { appId: args.appId });
    
    return args.appId;
  },
});

// Mutation to reject a submitted app (keeps record, marks as rejected)
export const rejectApp = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      status: "rejected",
      visible: false,
    });
    return args.appId;
  },
});

// Query to get rejected apps
export const getRejectedApps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("apps")
      .withIndex("by_status", (q) => q.eq("status", "rejected"))
      .order("desc")
      .collect();
  },
});

// Mutation to migrate primarySport from string to array
export const migratePrimarySportToArray = mutation({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").collect();
    let migratedCount = 0;
    
    for (const app of apps) {
      if (app.primarySport && typeof app.primarySport === 'string') {
        await ctx.db.patch(app._id, {
          primarySport: [app.primarySport]
        });
        migratedCount++;
      }
    }
    
    return {
      message: `Migrated ${migratedCount} apps from string to array primarySport`,
      totalApps: apps.length,
      migratedApps: migratedCount
    };
  },
});

// Mutation to delete an app
export const deleteApp = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.appId);
    return args.appId;
  },
});

// Mutation to submit a new app (for public users)
export const submitApp = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    url: v.string(),
    tags: v.optional(v.array(v.string())),
    primarySport: v.optional(v.array(v.string())),
    suggestedCategories: v.optional(v.array(v.string())),
    suggestedSports: v.optional(v.array(v.string())),
    notificationEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appId = await ctx.db.insert("apps", {
      name: args.name,
      description: args.description,
      url: args.url,
      image: "", // Default empty image
      createdAt: Date.now(),
      tags: args.tags ?? [],
      primarySport: args.primarySport,
      suggestedCategories: args.suggestedCategories,
      suggestedSports: args.suggestedSports,
      notificationEmail: args.notificationEmail,
      status: "submitted", // New submissions are pending approval
      visible: false, // Hidden until approved
      submissionNotificationStatus: "pending",
    });

    console.log("New app submitted:", appId);

    // Schedule the admin notification email to be sent
    await ctx.scheduler.runAfter(0, internal.apps.sendAdminNotificationEmail, {
      appId,
    });

    // Add submitter as Loops contact + send confirmation email
    await ctx.scheduler.runAfter(0, internal.loops.notifySubmission, { appId });

    return appId;
  },
});

// Mutation to update app notification email (for post-submission email collection)
export const updateAppEmail = mutation({
  args: {
    appId: v.id("apps"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }
    
    await ctx.db.patch(args.appId, {
      notificationEmail: args.email,
    });
    
    return args.appId;
  },
});

// Mutation to remove "Multi-sport" from all apps
export const removeMultiSportFromApps = mutation({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("apps").collect();
    let updatedCount = 0;
    
    for (const app of apps) {
      if (app.primarySport) {
        let needsUpdate = false;
        let updatedPrimarySport: string[] = [];
        
        // Handle both string and array cases
        if (typeof app.primarySport === 'string') {
          if (app.primarySport === 'Multi-sport') {
            updatedPrimarySport = [];
            needsUpdate = true;
          } else {
            updatedPrimarySport = [app.primarySport];
          }
        } else if (Array.isArray(app.primarySport)) {
          updatedPrimarySport = app.primarySport.filter(sport => sport !== 'Multi-sport');
          needsUpdate = updatedPrimarySport.length !== app.primarySport.length;
        }
        
        if (needsUpdate) {
          await ctx.db.patch(app._id, {
            primarySport: updatedPrimarySport.length > 0 ? updatedPrimarySport : undefined
          });
          updatedCount++;
        }
      }
    }
    
    return {
      message: `Removed "Multi-sport" from ${updatedCount} apps`,
      totalApps: apps.length,
      updatedApps: updatedCount
    };
  },
});

// Mutation to increment upvotes for an app
// upvoteApp removed — upvotes field removed from schema

// Mutation to toggle app visibility
export const toggleAppVisibility = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("App not found");
    }
    
    await ctx.db.patch(args.appId, {
      visible: !(app.visible ?? true), // Toggle visibility, default to true if undefined
    });
    
    return args.appId;
  },
});

// Query to get unique categories and sports for navigation dropdown
export const getUniqueCategoriesAndSports = query({
  args: {},
  handler: async (ctx) => {
    const categories = new Set<string>();
    const sports = new Set<string>();

    // Stream the table to avoid loading everything into memory at once
    for await (const app of ctx.db.query("apps")) {
      if (Array.isArray(app.tags)) {
        for (const t of app.tags) {
          if (typeof t === "string") {
            const norm = t.trim();
            if (norm) categories.add(norm);
          }
        }
      }
      if (Array.isArray(app.primarySport)) {
        for (const s of app.primarySport) {
          if (typeof s === "string") {
            const norm = s.trim();
            if (norm) sports.add(norm);
          }
        }
      }
    }

    return {
      categories: Array.from(categories).sort(),
      sports: Array.from(sports).sort(),
    };
  },
});

// Query to get apps in the same category as a given app (for "You may also like")
export const getAppsBySameCategory = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    // Find the category (sectionType === "category") this app belongs to
    const allSections = await ctx.db
      .query("homepage_sections")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();

    const categorySection = allSections.find((s) => s.sectionType === "category");
    if (!categorySection) return [];

    const categoryName = categorySection.sectionName;
    console.log("getAppsBySameCategory: app", args.appId, "is in category", categoryName);

    // Get all app IDs in this category
    const categoryEntries = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) =>
        q.eq("sectionType", "category").eq("sectionName", categoryName)
      )
      .collect();

    const siblingIds = categoryEntries
      .map((e) => e.appId)
      .filter((id) => id !== args.appId);

    // Fetch each sibling app (visible only)
    const siblingApps = await Promise.all(siblingIds.map((id) => ctx.db.get(id)));
    const result = siblingApps.filter((a): a is NonNullable<typeof a> => a !== null && a.visible !== false);
    console.log("getAppsBySameCategory: returning", result.length, "apps from", categoryName);
    return result;
  },
});

// Internal query to get app submission details
export const getAppSubmissionDetails = internalQuery({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// Internal mutation to update submission notification status
export const updateSubmissionNotificationStatus = internalMutation({
  args: {
    appId: v.id("apps"),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      submissionNotificationStatus: args.status,
    });
  },
});

// Internal action to send admin notification email when app is submitted
export const sendAdminNotificationEmail = internalAction({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    "use node";

    // Get the app submission details
    const app = await ctx.runQuery(internal.apps.getAppSubmissionDetails, {
      appId: args.appId,
    });

    if (!app) {
      console.error("App not found:", args.appId);
      return;
    }

    console.log("Sending admin notification for app:", app.name);

    try {
      const response = await fetch(process.env.EMAIL_NOTIFICATION_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: process.env.RECIPIENT_EMAIL!,
          subject: `New App Submission: ${app.name}`,
          message: `A new app has been submitted to Sports Deck:\n\nApp Name: ${app.name}\n\nDescription:\n${app.description}\n\nApp URL: ${app.url}\n\nCategories: ${app.tags?.join(", ") || "None"}\n\nSports: ${app.primarySport?.join(", ") || "None"}\n\nUser's Email: ${app.notificationEmail || "Not provided"}\n\nSuggested Categories: ${app.suggestedCategories?.join(", ") || "None"}\n\nSuggested Sports: ${app.suggestedSports?.join(", ") || "None"}\n\nSubmitted at: ${new Date(app.createdAt).toLocaleString()}\n\nPlease review this submission in the admin panel.`,
          chatId: process.env.CHAT_ID!,
          appName: process.env.APP_NAME!,
          secretKey: process.env.SECRET_KEY!,
        }),
      });

      if (response.ok) {
        console.log("Admin notification email sent successfully for app:", app.name);
        await ctx.runMutation(internal.apps.updateSubmissionNotificationStatus, {
          appId: args.appId,
          status: "sent",
        });
      } else {
        console.error("Failed to send admin notification email:", response.status, response.statusText);
        await ctx.runMutation(internal.apps.updateSubmissionNotificationStatus, {
          appId: args.appId,
          status: "failed",
        });
      }
    } catch (error) {
      console.error("Error sending admin notification email:", error);
      await ctx.runMutation(internal.apps.updateSubmissionNotificationStatus, {
        appId: args.appId,
        status: "failed",
      });
    }
  },
});

// ─── Category ordering (homepage_sections table) ─────────────────────────────

export const getCategoryOrders = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db
      .query("homepage_sections")
      .filter((q) => q.eq(q.field("sectionType"), "category"))
      .collect();
    console.log("getCategoryOrders: loaded", sections.length, "ordering entries");
    return sections;
  },
});

export const setCategoryOrder = mutation({
  args: {
    categoryName: v.string(),
    appIds: v.array(v.id("apps")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("homepage_sections")
      .withIndex("by_section", (q) =>
        q.eq("sectionType", "category").eq("sectionName", args.categoryName)
      )
      .collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }
    for (let i = 0; i < args.appIds.length; i++) {
      await ctx.db.insert("homepage_sections", {
        sectionType: "category",
        sectionName: args.categoryName,
        appId: args.appIds[i],
        order: i,
        createdAt: Date.now(),
      });
    }
    console.log("setCategoryOrder: saved", args.appIds.length, "apps for", args.categoryName);
  },
});

// Internal mutation to update only the tags of an app
export const updateAppTags = mutation({
  args: {
    appId: v.id("apps"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, { tags: args.tags });
    console.log("updateAppTags:", args.appId, "->", args.tags);
  },
});























































