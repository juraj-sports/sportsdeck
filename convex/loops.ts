import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const LOOPS_API_BASE = "https://app.loops.so/api/v1";

// Internal query to get app details for Loops actions
export const getAppForLoops = internalQuery({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// Add or update a contact in Loops
export const addContact = internalAction({
  args: {
    email: v.string(),
    source: v.string(),
    userGroup: v.optional(v.string()),
    firstName: v.optional(v.string()),
    customFields: v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    "use node";

    const apiKey = process.env.LOOPS_API_KEY;
    if (!apiKey) {
      console.error("LOOPS_API_KEY is not set");
      return;
    }

    const body: Record<string, unknown> = {
      email: args.email,
      source: args.source,
    };

    if (args.userGroup) body.userGroup = args.userGroup;
    if (args.firstName) body.firstName = args.firstName;
    if (args.customFields) Object.assign(body, args.customFields);

    console.log("Adding contact to Loops:", args.email, "source:", args.source);

    try {
      const response = await fetch(`${LOOPS_API_BASE}/contacts/upsert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Loops contact added/updated:", args.email, data);
      } else {
        console.error("Loops addContact failed:", response.status, data);
      }
    } catch (error) {
      console.error("Loops addContact error:", error);
    }
  },
});

// Send a transactional email via Loops
export const sendTransactionalEmail = internalAction({
  args: {
    email: v.string(),
    transactionalId: v.string(),
    dataVariables: v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    "use node";

    const apiKey = process.env.LOOPS_API_KEY;
    if (!apiKey) {
      console.error("LOOPS_API_KEY is not set");
      return;
    }

    const body: Record<string, unknown> = {
      transactionalId: args.transactionalId,
      email: args.email,
    };

    if (args.dataVariables) body.dataVariables = args.dataVariables;

    console.log("Sending Loops transactional email to:", args.email, "template:", args.transactionalId);

    try {
      const response = await fetch(`${LOOPS_API_BASE}/transactional`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Loops transactional email sent:", args.email, data);
      } else {
        console.error("Loops sendTransactionalEmail failed:", response.status, data);
      }
    } catch (error) {
      console.error("Loops sendTransactionalEmail error:", error);
    }
  },
});

// Add app submitter as contact + send submission confirmation email
export const notifySubmission = internalAction({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    "use node";

    const app = await ctx.runQuery(internal.loops.getAppForLoops, { appId: args.appId });

    if (!app || !app.notificationEmail) {
      console.log("No notification email for app:", args.appId);
      return;
    }

    const email = app.notificationEmail;

    // Add as a contact in Loops
    await ctx.runAction(internal.loops.addContact, {
      email,
      source: "app_submission",
      userGroup: "App Submitters",
      customFields: {
        submittedApp: app.name,
        submittedAppUrl: app.url,
      },
    });

    // Send submission confirmation email (if template ID is configured)
    const submissionTemplateId = process.env.LOOPS_SUBMISSION_EMAIL_ID;
    if (submissionTemplateId) {
      await ctx.runAction(internal.loops.sendTransactionalEmail, {
        email,
        transactionalId: submissionTemplateId,
        dataVariables: {
          appName: app.name,
          appUrl: app.url,
        },
      });
    } else {
      console.log("LOOPS_SUBMISSION_EMAIL_ID not set, skipping confirmation email");
    }
  },
});

// Send approval notification email to app submitter
export const notifyApproval = internalAction({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    "use node";

    const app = await ctx.runQuery(internal.loops.getAppForLoops, { appId: args.appId });

    if (!app || !app.notificationEmail) {
      console.log("No notification email for app:", args.appId);
      return;
    }

    const email = app.notificationEmail;
    const approvalTemplateId = process.env.LOOPS_APPROVAL_EMAIL_ID;

    if (!approvalTemplateId) {
      console.log("LOOPS_APPROVAL_EMAIL_ID not set, skipping approval email");
      return;
    }

    await ctx.runAction(internal.loops.sendTransactionalEmail, {
      email,
      transactionalId: approvalTemplateId,
      dataVariables: {
        appName: app.name,
        appUrl: app.url,
      },
    });
  },
});
