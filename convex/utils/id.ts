import { v } from "convex/values";
import type { Id, TableNames } from "../_generated/dataModel";

// Type definitions for different ID types
export type BetterAuthId = string; // String ID from Better Auth
export type ConvexId<T extends TableNames> = Id<T>; // Convex document ID

// Validation schemas
export const betterAuthIdSchema = v.string();
export const convexIdSchema = v.id("users");

// Utility functions for ID validation and conversion
export class IdUtils {
  /**
   * Validates if a string is a valid Better Auth ID
   */
  static isValidBetterAuthId(id: unknown): id is BetterAuthId {
    return typeof id === "string" && id.length > 0;
  }

  /**
   * Validates if a value is a valid Convex ID for a given table
   */
  static isValidConvexId<T extends TableNames>(
    id: unknown,
    table: T
  ): id is Id<T> {
    return typeof id === "string" && id.length > 0;
  }

  /**
   * Type guard to check if an object has a Better Auth ID
   */
  static hasBetterAuthId(obj: unknown): obj is { betterAuthId: BetterAuthId } {
    return (
      obj !== null &&
      typeof obj === "object" &&
      "betterAuthId" in obj &&
      this.isValidBetterAuthId((obj as any).betterAuthId)
    );
  }

  /**
   * Type guard to check if an object has a Convex _id
   */
  static hasConvexId<T extends TableNames>(
    obj: unknown,
    table: T
  ): obj is { _id: Id<T> } {
    return (
      obj !== null &&
      typeof obj === "object" &&
      "_id" in obj &&
      this.isValidConvexId((obj as any)._id, table)
    );
  }

  /**
   * Extract Better Auth ID from various sources
   */
  static extractBetterAuthId(source: {
    id?: string;
    betterAuthId?: string;
    userId?: string;
  }): BetterAuthId | null {
    // Priority order: betterAuthId > id > userId
    if (source.betterAuthId && this.isValidBetterAuthId(source.betterAuthId)) {
      return source.betterAuthId;
    }
    if (source.id && this.isValidBetterAuthId(source.id)) {
      return source.id;
    }
    if (source.userId && this.isValidBetterAuthId(source.userId)) {
      return source.userId;
    }
    return null;
  }

  /**
   * Format error message for invalid IDs
   */
  static idValidationError(field: string, expectedType: string): string {
    return `Invalid ${field}: expected ${expectedType}`;
  }
}

// Helper function to validate and extract IDs with proper error handling
export function validateAndExtractId(
  source: Record<string, unknown>,
  field: string = "id"
): BetterAuthId {
  const id = IdUtils.extractBetterAuthId(source);
  if (!id) {
    throw new Error(IdUtils.idValidationError(field, "valid Better Auth ID"));
  }
  return id;
}
