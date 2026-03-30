import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const replaceTagInApps = mutation({
  args: {
    oldTag: v.string(),
    newTag: v.string(),
  },
  handler: async (ctx, args) => {
    let updated = 0;
    // async iteration over the table is memory-efficient
    for await (const app of ctx.db.query("apps")) {
      if (Array.isArray((app as any).tags) && (app as any).tags.includes(args.oldTag)) {
        const tags: string[] = (app as any).tags;
        // Avoid duplicates: if newTag already present, just remove oldTag
        const newTags = tags.includes(args.newTag)
          ? tags.filter((t) => t !== args.oldTag)
          : tags.map((t) => (t === args.oldTag ? args.newTag : t));
        await ctx.db.patch(app._id, { tags: newTags });
        updated++;
      }
    }
    return updated;
  },
});