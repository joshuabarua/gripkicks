import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PolarService } from '../src/services/polar';
import { Webhooks } from '@polar-sh/hono';
import { polarClient } from '../src/services/polar';

// Mock implementations for missing functions/constants
const protect = async (c: any, next: any) => {
  // TODO: Implement proper authentication middleware
  // For now, just pass through
  await next();
};

const PRODUCT_SLUGS = {
  monthly: process.env.POLAR_PRODUCT_MONTHLY,
  yearly: process.env.POLAR_PRODUCT_YEARLY,
  lifetime: process.env.POLAR_PRODUCT_LIFETIME,
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const FOUNDER_LIMIT = 1000;

// Mock functions for Convex integration
const findUserByEmail = async (email: string) => {
  // TODO: Implement actual user lookup
  return { betterAuthId: 'mock-id', email };
};

const findUserByBetterAuthId = async (id: string) => {
  // TODO: Implement actual user lookup
  return { success: true, data: { email: 'mock@example.com' } };
};

const isUserFounder = async (id: string) => {
  // TODO: Implement actual founder check
  return false;
};

const updateSubscriptionInConvex = async (data: any) => {
  // TODO: Implement actual Convex update
  console.log('Updating subscription:', data);
};

const polarRoutes = new Hono();

// Enable CORS for frontend integration
polarRoutes.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://192.168.0.71:3000',
    'http://192.168.0.71:8000',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Create a checkout session
 * POST /api/polar/checkout
 */
polarRoutes.post('/checkout', async (c) => {
  try {
    const { productId, email, name } = await c.req.json();
    
    if (!productId || !email) {
      return c.json({ error: 'Product ID and email are required' }, 400);
    }
    
    // Validate product ID
    const validProducts = [
      process.env.POLAR_PRODUCT_MONTHLY,
      process.env.POLAR_PRODUCT_YEARLY,
      process.env.POLAR_PRODUCT_LIFETIME
    ].filter(Boolean);
    
    if (!validProducts.includes(productId)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }
    
    // Create checkout session directly (Polar will auto-create customer)
    const checkout = await PolarService.createCheckout(productId, undefined, email);
    
    return c.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id
    });
    
  } catch (error) {
    console.error('Checkout creation error:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

/**
 * Get customer information
 * GET /api/polar/customer/:customerId
 */
polarRoutes.get('/customer/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }
    
    const customer = await PolarService.getCustomer(customerId);
    
    return c.json({ customer });
    
  } catch (error) {
    console.error('Customer fetch error:', error);
    return c.json({ error: 'Failed to fetch customer' }, 500);
  }
});

/**
 * Get customer subscriptions
 * GET /api/polar/subscriptions/:customerId
 */
polarRoutes.get('/subscriptions/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }
    
    const subscriptions = await PolarService.getCustomerSubscriptions(customerId);
    
    return c.json({ subscriptions });
    
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return c.json({ error: 'Failed to fetch subscriptions' }, 500);
  }
});

/**
 * Cancel subscription
 * POST /api/polar/subscriptions/:subscriptionId/cancel
 */
polarRoutes.post('/subscriptions/:subscriptionId/cancel', async (c) => {
  try {
    const subscriptionId = c.req.param('subscriptionId');
    
    if (!subscriptionId) {
      return c.json({ error: 'Subscription ID is required' }, 400);
    }
    
    const cancelled = await PolarService.cancelSubscription(subscriptionId);
    
    return c.json({ cancelled });
    
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return c.json({ error: 'Failed to cancel subscription' }, 500);
  }
});

/**
 * Health check endpoint
 * GET /api/polar/health
 */
polarRoutes.get('/health', async (c) => {
  const polarConfigured = !!(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_WEBHOOK_SECRET);
  
  return c.json({
    status: 'ok',
    polar: {
      configured: polarConfigured,
      products: {
        monthly: !!process.env.POLAR_PRODUCT_MONTHLY,
        yearly: !!process.env.POLAR_PRODUCT_YEARLY,
        lifetime: !!process.env.POLAR_PRODUCT_LIFETIME,
      }
    }
  });
});

/**
 * Check founder status
 * GET /api/polar/check-founder
 */
polarRoutes.get('/check-founder', async (c) => {
  // Mock user for testing
  const user = { id: 'test-user-id' };
  
  try {
    // For now, return mock data - implement actual logic later
    return c.json({
      success: true,
      data: {
        isFounder: false,
        spotsRemaining: 1000
      }
    });
  } catch (err) {
    console.error('[Polar] Failed to check founder status:', err);
    return c.json({ success: false, error: 'Failed to check founder status' }, 500);
  }
});

export default polarRoutes;
