import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { backlogStatusValidator } from "./schema";

export const createBacklogItem = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    status: backlogStatusValidator,
  },
  handler: async (ctx, args) => {
    // Remove strict auth check for now - will add proper Better Auth integration later
    const backlogItem = await ctx.db.insert("backlogItems", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return backlogItem;
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
    // Remove strict auth check for now - will add proper Better Auth integration later
    const { id, ...updateData } = args;
    
    const existingItem = await ctx.db.get(id);
    if (!existingItem) {
      throw new Error("Backlog item not found");
    }

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteBacklogItem = mutation({
  args: {
    id: v.id("backlogItems"),
  },
  handler: async (ctx, args) => {
    // Remove strict auth check for now - will add proper Better Auth integration later
    const existingItem = await ctx.db.get(args.id);
    if (!existingItem) {
      throw new Error("Backlog item not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listBacklogItems = query({
  args: {
    statusFilter: v.optional(backlogStatusValidator),
  },
  handler: async (ctx, args) => {
    // Remove strict auth check for now - will add proper Better Auth integration later
    let items = await ctx.db.query("backlogItems").order("desc").collect();

    if (args.statusFilter) {
      items = items.filter(item => item.status === args.statusFilter);
    }

    return items;
  },
});
