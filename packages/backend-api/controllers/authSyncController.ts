import { Context } from 'hono';

function toConvexHttpBaseUrl(url: string): string {
  // Convex client URL is typically https://<deployment>.convex.cloud
  // HTTP endpoints are served at https://<deployment>.convex.site
  if (url.includes('.convex.cloud')) {
    return url.replace('.convex.cloud', '.convex.site');
  }
  return url;
}

// Sync user to Convex after authentication
export const syncUserToConvex = async (c: Context) => {
  try {
    const { id, email, name, image, emailVerified } = await c.req.json();
    
    console.log('Backend: Syncing user to Convex:', { id, email, name, image, emailVerified });
    
    // Prefer an explicit HTTP base if provided.
    // Otherwise derive the correct HTTP base from CONVEX_URL (convex.cloud -> convex.site).
    const derivedFromConvexUrl = process.env.CONVEX_URL
      ? toConvexHttpBaseUrl(process.env.CONVEX_URL)
      : undefined;

    const candidates = [
      process.env.CONVEX_HTTP_URL,
      process.env.CONVEX_SITE_URL,
      derivedFromConvexUrl,
      'http://localhost:3210',
    ].filter(Boolean) as string[];

    const possibleUrls = Array.from(new Set(candidates));

    let lastError: Error | null = null;
    
    for (const convexUrl of possibleUrls) {
      try {
        console.log(`Backend: Trying Convex at ${convexUrl}`);
        
        const convexResponse = await fetch(`${convexUrl}/api/sync-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            email,
            name,
            image,
            emailVerified,
          }),
        });
        
        if (convexResponse.ok) {
          const result = await convexResponse.json();
          console.log('Backend: Convex sync successful:', result);
          
          return c.json({ 
            success: true, 
            message: 'User synced to Convex successfully',
            convexUrl,
            convexResult: result
          });
        } else {
          const errorText = await convexResponse.text();
          console.error(`Backend: Convex responded with ${convexResponse.status}:`, errorText);
          lastError = new Error(`Convex ${convexUrl}: ${convexResponse.status} ${errorText}`);
        }
      } catch (error) {
        console.error(`Backend: Failed to connect to Convex at ${convexUrl}:`, error);
        lastError = error as Error;
      }
    }
    
    // If we get here, all URLs failed
    const detail = lastError?.message || 'Convex not reachable. Is `npx convex dev` running? Set CONVEX_URL to your Convex HTTP URL (e.g. http://localhost:3210).';
    throw new Error(detail);
    
  } catch (error) {
    console.error('Backend: Error syncing user to Convex:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to sync user to Convex',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
};
