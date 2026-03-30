/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as apps from "../apps.js";
import type * as auth from "../auth.js";
import type * as featured_apps from "../featured_apps.js";
import type * as homepage_sections from "../homepage_sections.js";
import type * as http from "../http.js";
import type * as inspectApps from "../inspectApps.js";
import type * as loops from "../loops.js";
import type * as media from "../media.js";
import type * as newsletter from "../newsletter.js";
import type * as replaceTag from "../replaceTag.js";
import type * as seedData from "../seedData.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  apps: typeof apps;
  auth: typeof auth;
  featured_apps: typeof featured_apps;
  homepage_sections: typeof homepage_sections;
  http: typeof http;
  inspectApps: typeof inspectApps;
  loops: typeof loops;
  media: typeof media;
  newsletter: typeof newsletter;
  replaceTag: typeof replaceTag;
  seedData: typeof seedData;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
