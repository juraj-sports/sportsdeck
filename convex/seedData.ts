import { mutation } from "./_generated/server"

export const seedSampleApps = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have apps
    const existingApps = await ctx.db.query("apps").collect()
    if (existingApps.length > 0) {
      return "Database already has apps. Skipping seed."
    }

    const sampleApps = [
      {
        name: "ESPN Fantasy Sports",
        description: "Manage your fantasy teams across all major sports with real-time updates and expert analysis.",
        url: "https://fantasy.espn.com",
        image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg",
        tags: ["Fantasy & Predictive"],
        primarySport: ["Football", "Basketball", "Baseball"],
        createdAt: Date.now() - 86400000 * 7,
      },
      {
        name: "DraftKings",
        description: "Daily fantasy sports and sports betting platform with contests and real money prizes.",
        url: "https://draftkings.com",
        image: "https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg",
        tags: ["Fantasy & Predictive", "Sports Betting"],
        primarySport: ["Football", "Basketball", "Baseball"],
        createdAt: Date.now() - 86400000 * 6,
      },
      {
        name: "The Athletic",
        description: "Premium sports journalism with in-depth coverage, analysis, and exclusive stories.",
        url: "https://theathletic.com",
        image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
        tags: ["Writers & Publications"],
        primarySport: ["Football", "Basketball", "Baseball", "Soccer"],
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        name: "Bleacher Report",
        description: "Breaking sports news, highlights, and personalized content for your favorite teams.",
        url: "https://bleacherreport.com",
        image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg",
        tags: ["Scores & News"],
        primarySport: ["Football", "Basketball", "Baseball"],
        createdAt: Date.now() - 86400000 * 4,
      },
      {
        name: "Strava",
        description: "Track your runs, rides, and workouts. Connect with athletes and join challenges.",
        url: "https://strava.com",
        image: "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg",
        tags: ["Coaching & Training"],
        primarySport: ["Running", "Cycling"],
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        name: "FanDuel",
        description: "Daily fantasy sports and sportsbook with easy contests and competitive odds.",
        url: "https://fanduel.com",
        image: "https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg",
        tags: ["Fantasy & Predictive", "Sports Betting"],
        primarySport: ["Football", "Basketball", "Baseball"],
        createdAt: Date.now() - 86400000 * 2,
      }
    ]

    const insertedApps: any[] = []

    // Insert all apps
    for (const app of sampleApps) {
      const appId = await ctx.db.insert("apps", {
        name: app.name,
        description: app.description,
        url: app.url,
        image: app.image,
        tags: app.tags,
        primarySport: app.primarySport,
        createdAt: app.createdAt,
      });
      insertedApps.push(appId);
    }

    // Set some apps as featured
    const featuredAppNames = ["ESPN Fantasy Sports", "DraftKings", "The Athletic"];
    for (let i = 0; i < featuredAppNames.length; i++) {
      const app = sampleApps.find(a => a.name === featuredAppNames[i]);
      if (app) {
        const appIndex = sampleApps.indexOf(app);
        await ctx.db.insert("featured_apps", {
          appId: insertedApps[appIndex],
          order: i + 1,
          createdAt: Date.now(),
        });
      }
    }

    return {
      message: "Successfully seeded database with sample apps",
      count: insertedApps.length,
      featured: featuredAppNames.length
    };
  },
});
