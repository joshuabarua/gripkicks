// Convex auth is handled via the Better Auth backend (Hono). No Convex auth providers are used here.
// This placeholder config keeps convex build happy without @convex-dev/auth.
import type { AuthConfig } from "convex/server";

const authConfig: AuthConfig = {
  providers: [],
};

export default authConfig;
