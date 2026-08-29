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
import type * as authorization from "../authorization.js";
import type * as backlog from "../backlog.js";
import type * as http from "../http.js";
import type * as popularity from "../popularity.js";
import type * as recommendations from "../recommendations.js";
import type * as router_authDb from "../router/authDb.js";
import type * as router_helpers from "../router/helpers.js";
import type * as router_shoes from "../router/shoes.js";
import type * as router_stash from "../router/stash.js";
import type * as router_users from "../router/users.js";
import type * as rubberTechnologies from "../rubberTechnologies.js";
import type * as seed from "../seed.js";
import type * as shoeHelpers from "../shoeHelpers.js";
import type * as shoes from "../shoes.js";
import type * as stash from "../stash.js";
import type * as userScores from "../userScores.js";
import type * as users from "../users.js";
import type * as utils_helpers from "../utils/helpers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  app: typeof app;
  auth: typeof auth;
  authDb: typeof authDb;
  authorization: typeof authorization;
  backlog: typeof backlog;
  http: typeof http;
  popularity: typeof popularity;
  recommendations: typeof recommendations;
  "router/authDb": typeof router_authDb;
  "router/helpers": typeof router_helpers;
  "router/shoes": typeof router_shoes;
  "router/stash": typeof router_stash;
  "router/users": typeof router_users;
  rubberTechnologies: typeof rubberTechnologies;
  seed: typeof seed;
  shoeHelpers: typeof shoeHelpers;
  shoes: typeof shoes;
  stash: typeof stash;
  userScores: typeof userScores;
  users: typeof users;
  "utils/helpers": typeof utils_helpers;
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
