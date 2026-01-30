/**
 * Custom Convex Database Adapter for Better Auth
 * 
 * This adapter stores auth data (users, sessions, accounts, verifications) in Convex
 * via HTTP calls to the Convex deployment's HTTP endpoints.
 */

import { createAdapterFactory } from "better-auth/adapters";

interface ConvexAdapterConfig {
  convexUrl: string;
  debugLogs?: boolean;
}

// Helper to convert Convex ID format for Better Auth
function toConvexHttpUrl(url: string): string {
  if (url.includes('.convex.cloud')) {
    return url.replace('.convex.cloud', '.convex.site');
  }
  return url;
}

// Map Better Auth model names to our Convex model names
const modelMap: Record<string, string> = {
  user: 'user',
  session: 'session',
  account: 'account',
  verification: 'verification',
};

export const convexAdapter = (config: ConvexAdapterConfig) => {
  const baseUrl = toConvexHttpUrl(config.convexUrl);
  
  const callConvex = async (model: string, operation: string, data: Record<string, unknown>) => {
    const mappedModel = modelMap[model] || model;
    const url = `${baseUrl}/api/auth-db/${mappedModel}/${operation}`;
    
    if (config.debugLogs) {
      console.log(`[ConvexAdapter] ${operation} on ${model}:`, JSON.stringify(data, null, 2));
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`[ConvexAdapter] Error: ${response.status} ${responseText}`);
        throw new Error(`Convex adapter error: ${response.status} - ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error(`[ConvexAdapter] Failed to parse response:`, responseText);
        throw new Error(`Invalid JSON response from Convex`);
      }
      
      if (config.debugLogs) {
        console.log(`[ConvexAdapter] Result:`, JSON.stringify(result, null, 2));
      }
      
      // Return the data, ensuring it has the expected format
      return result.data;
    } catch (error) {
      console.error(`[ConvexAdapter] Failed to call ${url}:`, error);
      throw error;
    }
  };

  return createAdapterFactory({
    config: {
      adapterId: "convex-http",
      adapterName: "Convex HTTP Adapter",
      usePlural: false,
      debugLogs: config.debugLogs ?? false,
      supportsJSON: true,
      supportsDates: false, // Convex uses timestamps (numbers)
      supportsBooleans: true,
      supportsNumericIds: false, // Convex uses string IDs
      disableIdGeneration: false, // Let Better Auth generate IDs
    },
    adapter: () => {
      return {
        create: async ({ model, data }) => {
          if (config.debugLogs) {
            console.log(`[ConvexAdapter] CREATE ${model}:`, data);
          }
          const result = await callConvex(model, 'create', data as Record<string, unknown>);
          return result;
        },

        update: async ({ model, where, update }) => {
          // Better Auth passes where clause with field conditions
          // We need to find the record first, then update by ID
          const id = where[0]?.value;
          if (!id) {
            throw new Error('Update requires an ID');
          }
          
          const result = await callConvex(model, 'update', { id, data: update });
          return result;
        },

        updateMany: async ({ model, where, update }) => {
          // For updateMany, we'd need to find all matching records and update them
          // This is a simplified implementation
          console.warn('[ConvexAdapter] updateMany not fully implemented');
          return 0;
        },

        delete: async ({ model, where }) => {
          const id = where[0]?.value;
          if (!id) {
            throw new Error('Delete requires an ID');
          }
          
          await callConvex(model, 'delete', { id });
        },

        deleteMany: async ({ model, where }) => {
          // Handle special cases for session deletion
          if (model === 'session' && where.length > 0) {
            const field = where[0]?.field;
            const value = where[0]?.value;
            
            if (field === 'token') {
              await callConvex(model, 'deleteByToken', { token: value });
              return 1;
            } else if (field === 'userId') {
              const result = await callConvex(model, 'deleteByUserId', { userId: value });
              return result?.count || 0;
            }
          }
          
          console.warn('[ConvexAdapter] deleteMany not fully implemented for:', model, where);
          return 0;
        },

        findOne: async ({ model, where }) => {
          // Determine the lookup method based on the where clause
          const field = where[0]?.field;
          const value = where[0]?.value;
          
          if (!field || value === undefined) {
            return null;
          }
          
          let operation = 'findById';
          const data: Record<string, unknown> = {};
          
          if (field === 'id' || field === '_id') {
            operation = 'findById';
            data.id = value;
          } else if (field === 'email' && model === 'user') {
            operation = 'findByEmail';
            data.email = value;
          } else if (field === 'token' && model === 'session') {
            operation = 'findByToken';
            data.token = value;
          } else if (field === 'identifier' && model === 'verification') {
            operation = 'findByIdentifier';
            data.identifier = value;
          } else if (field === 'userId') {
            operation = 'findByUserId';
            data.userId = value;
          } else if (model === 'account' && where.length >= 2) {
            // Account lookup by providerId + accountId
            const providerWhere = where.find(w => w.field === 'providerId');
            const accountWhere = where.find(w => w.field === 'accountId');
            if (providerWhere && accountWhere) {
              operation = 'findByProviderAccountId';
              data.providerId = providerWhere.value;
              data.accountId = accountWhere.value;
            }
          }
          
          try {
            const result = await callConvex(model, operation, data);
            return result;
          } catch (error) {
            console.error(`[ConvexAdapter] findOne error:`, error);
            return null;
          }
        },

        findMany: async ({ model, where, limit, offset, sortBy }) => {
          // For findMany, we need specific implementations
          if (model === 'session' && where && where.length > 0) {
            const userIdWhere = where.find((w: { field: string; value: unknown }) => w.field === 'userId');
            if (userIdWhere) {
              const result = await callConvex(model, 'findByUserId', { userId: userIdWhere.value });
              return Array.isArray(result) ? result : [];
            }
          }
          
          if (model === 'account' && where && where.length > 0) {
            const userIdWhere = where.find((w: { field: string; value: unknown }) => w.field === 'userId');
            if (userIdWhere) {
              const result = await callConvex(model, 'findByUserId', { userId: userIdWhere.value });
              return Array.isArray(result) ? result : [];
            }
          }
          
          console.warn('[ConvexAdapter] findMany not fully implemented for:', model, where);
          return [];
        },

        count: async ({ model, where }) => {
          // Simplified count implementation
          const results = await callConvex(model, 'findMany', { where });
          return Array.isArray(results) ? results.length : 0;
        },

        options: config,
      };
    },
  });
};

export default convexAdapter;
