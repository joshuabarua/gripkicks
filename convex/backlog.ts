import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { backlogStatusValidator } from "./schema";
import { requireAdmin } from "./authorization";
import { filterUndefinedValues } from "./utils/helpers";

const createBacklogItemArgs = {
  title: v.string(),
  notes: v.optional(v.string()),
  status: backlogStatusValidator,
};

async function insertBacklogItem(
  ctx: MutationCtx,
  args: { title: string; notes?: string; status: "not_started" | "in_progress" | "done" },
) {
  const now = Date.now();
  return await ctx.db.insert("backlogItems", {
    title: args.title,
    status: args.status,
    createdAt: now,
    updatedAt: now,
    ...(args.notes !== undefined ? { notes: args.notes } : {}),
  });
}

async function requireBacklogItem(ctx: MutationCtx, id: Id<"backlogItems">) {
  const existingItem = await ctx.db.get(id);
  if (!existingItem) {
    throw new Error("Backlog item not found");
  }
  return existingItem;
}

async function patchBacklogItem(
  ctx: MutationCtx,
  id: Id<"backlogItems">,
  updates: Record<string, unknown>,
) {
  await requireBacklogItem(ctx, id);
  await ctx.db.patch(id, {
    ...filterUndefinedValues(updates),
    updatedAt: Date.now(),
  });
  return id;
}

export const createBacklogItem = mutation({
  args: createBacklogItemArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await insertBacklogItem(ctx, args);
  },
});

export const updateBacklogItem = mutation({
  args: {
    id: v.id("backlogItems"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(backlogStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updateData } = args;
    return await patchBacklogItem(ctx, id, updateData);
  },
});

export const deleteBacklogItem = mutation({
  args: {
    id: v.id("backlogItems"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireBacklogItem(ctx, args.id);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listBacklogItems = query({
  args: {
    statusFilter: v.optional(backlogStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let items = await ctx.db.query("backlogItems").order("desc").collect();

    if (args.statusFilter) {
      items = items.filter(item => item.status === args.statusFilter);
    }

    return items;
  },
});

export const serviceCreateBacklogItem = internalMutation({
  args: createBacklogItemArgs,
  handler: async (ctx, args) => insertBacklogItem(ctx, args),
});

export const serviceSetBacklogStatus = internalMutation({
  args: {
    id: v.id("backlogItems"),
    status: backlogStatusValidator,
  },
  handler: async (ctx, args) => patchBacklogItem(ctx, args.id, { status: args.status }),
});
