import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const inspectApps = query({
  args: {
    // optional category/tag to filter by (e.g. "Writers & Publications")
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let apps: Doc<"apps">[] = await ctx.db.query("apps").collect();

    // Filter by category if provided
    if (args.category) {
      apps = apps.filter((app) => 
        Array.isArray(app.tags) && app.tags.includes(args.category!)
      );
    }

    return apps.map((app) => {
      const desc = typeof app.description === "string" ? app.description : "";
      const newlineCount = (desc.match(/\n/g) || []).length;
      const hasNBSP = desc.includes("\u00A0");
      const containsHtmlTags = /<\/?[a-z][\s\S]*>/i.test(desc);
      
      return {
        _id: app._id,
        name: app.name,
        description: desc,
        length: desc.length,
        newlineCount,
        hasNBSP,
        containsHtmlTags,
        tags: app.tags ?? [],
      };
    });
  },
});
