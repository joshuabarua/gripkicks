/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as app from "../app.js";
import type * as auth from "../auth.js";
import type * as authDb from "../authDb.js";
import type * as backlog from "../backlog.js";
import type * as http from "../http.js";
import type * as popularity from "../popularity.js";
import type * as recommendations from "../recommendations.js";
import type * as rubberTechnologies from "../rubberTechnologies.js";
import type * as seed from "../seed.js";
import type * as shoes from "../shoes.js";
import type * as stash from "../stash.js";
import type * as subscriptions from "../subscriptions.js";
import type * as userScores from "../userScores.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  app: typeof app;
  auth: typeof auth;
  authDb: typeof authDb;
  backlog: typeof backlog;
  http: typeof http;
  popularity: typeof popularity;
  recommendations: typeof recommendations;
  rubberTechnologies: typeof rubberTechnologies;
  seed: typeof seed;
  shoes: typeof shoes;
  stash: typeof stash;
  subscriptions: typeof subscriptions;
  userScores: typeof userScores;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
