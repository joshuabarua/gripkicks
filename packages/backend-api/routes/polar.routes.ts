import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PolarService } from '../services/polar';

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
    
    // Create or get customer
    let customer;
    try {
      customer = await PolarService.createCustomer(email, name);
    } catch (error) {
      console.error('Error creating customer:', error);
      return c.json({ error: 'Failed to create customer' }, 500);
    }
    
    // Create checkout session
    const checkout = await PolarService.createCheckout(productId, customer.id, email);
    
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

export default polarRoutes;

// Helper: update subscription in Convex via HTTP
async function updateSubscriptionInConvex(data: {
  betterAuthId: string;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  polarCustomerId?: string;
  polarSubscriptionId?: string;
  subscriptionExpiresAt?: number;
}) {
  const convexUrl = getConvexUrl();
  const response = await fetchWithTimeout(`${convexUrl}/api/subscriptions/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Polar] Failed to update subscription in Convex:', errorText);
    throw new Error(`Convex subscription update failed: ${errorText}`);
  }

  return response.json();
}

// Helper: grant founder status in Convex
async function grantFounderInConvex(betterAuthId: string) {
  const convexUrl = getConvexUrl();
  const response = await fetchWithTimeout(`${convexUrl}/api/subscriptions/grantFounder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ betterAuthId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Polar] Failed to grant founder status:', errorText);
    throw new Error(`Convex founder grant failed: ${errorText}`);
  }

  return response.json();
}

// Helper: find user by email in Convex
async function findUserByEmail(email: string) {
  const convexUrl = getConvexUrl();
  const response = await fetchWithTimeout(`${convexUrl}/api/users/findByEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) return null;

  const result = await response.json();
  if (!result.success || !result.data) return null;
  return result.data;
}

// Helper: get user count from Convex
async function getUserCount(): Promise<number> {
  const convexUrl = getConvexUrl();
  const response = await fetchWithTimeout(`${convexUrl}/api/subscriptions/userCount`);

  if (!response.ok) return Infinity; // Fail safe: don't grant founder if we can't check

  const result = await response.json();
  return result.data?.count ?? Infinity;
}

// Helper: determine subscription tier from Polar recurring interval
function getTierFromInterval(recurringInterval: string): 'monthly' | 'yearly' | 'lifetime' {
  switch (recurringInterval) {
    case 'year': return 'yearly';
    case 'month': return 'monthly';
    default: return 'monthly';
  }
}

// POST /checkout/:slug - Create a Polar checkout session
PolarRoutes.post('/checkout/:slug', protect, async (c) => {
  const slug = c.req.param('slug');
  const productId = PRODUCT_SLUGS[slug];

  if (!productId) {
    return c.json({ success: false, error: `Unknown plan: ${slug}` }, 400);
  }

  const user = c.get('user') as { email?: string; id?: string };
  if (!user?.email) {
    return c.json({ success: false, error: 'User email not found' }, 400);
  }

  try {
    const checkout = await polarClient.checkouts.create({
      products: [productId],
      customerEmail: user.email,
      successUrl: `${FRONTEND_URL}/pricing/success?checkout_id={CHECKOUT_ID}`,
    });

    return c.json({ url: checkout.url });
  } catch (err) {
    console.error('[Polar] Checkout creation failed:', err);
    return c.json({ success: false, error: 'Failed to create checkout' }, 500);
  }
});

// GET /portal - Redirect to Polar customer portal
PolarRoutes.get('/portal', protect, async (c) => {
  const user = c.get('user') as { email?: string };
  if (!user?.email) {
    return c.json({ success: false, error: 'User email not found' }, 400);
  }

  try {
    const customers = await polarClient.customers.list({ email: user.email });
    const customer = customers.result.items[0];

    if (!customer) {
      return c.json({ success: false, error: 'No Polar customer found for this account' }, 404);
    }

    const portalSession = await polarClient.customerSessions.create({
      customerId: customer.id,
    });

    return c.json({ url: portalSession.customerPortalUrl });
  } catch (err) {
    console.error('[Polar] Portal session failed:', err);
    return c.json({ success: false, error: 'Failed to create portal session' }, 500);
  }
});

// GET /subscription - Get current user's subscription status
PolarRoutes.get('/subscription', protect, async (c) => {
  const user = c.get('user') as { id?: string };
  if (!user?.id) {
    return c.json({ success: false, error: 'User not found' }, 400);
  }

  try {
    const convexUser = await findUserByBetterAuthId(user.id);
    if (!convexUser.success || !convexUser.data) {
      return c.json({ success: false, error: 'User not found in database' }, 404);
    }

    const { subscriptionStatus, subscriptionTier, polarCustomerId, polarSubscriptionId, subscriptionExpiresAt } = convexUser.data;
    const isPremium = subscriptionStatus === 'active' || subscriptionStatus === 'founder';
    const isFounder = subscriptionStatus === 'founder';

    return c.json({
      success: true,
      data: {
        subscriptionStatus: subscriptionStatus ?? null,
        subscriptionTier: subscriptionTier ?? null,
        polarCustomerId: polarCustomerId ?? null,
        polarSubscriptionId: polarSubscriptionId ?? null,
        subscriptionExpiresAt: subscriptionExpiresAt ?? null,
        isPremium,
        isFounder,
      },
    });
  } catch (err) {
    console.error('[Polar] Failed to get subscription status:', err);
    return c.json({ success: false, error: 'Failed to get subscription status' }, 500);
  }
});

// GET /check-founder - Check if the current user qualifies for founder status
PolarRoutes.get('/check-founder', protect, async (c) => {
  const user = c.get('user') as { id?: string };
  if (!user?.id) {
    return c.json({ success: false, error: 'User not found' }, 400);
  }

  try {
    // Check if user already has a subscription
    const convexUser = await findUserByBetterAuthId(user.id);
    if (!convexUser.success || !convexUser.data) {
      return c.json({ success: false, error: 'User not found in database' }, 404);
    }

    // Already a founder or premium
    if (convexUser.data.subscriptionStatus === 'founder') {
      return c.json({ success: true, data: { isFounder: true, alreadyGranted: true } });
    }

    if (convexUser.data.subscriptionStatus === 'active') {
      return c.json({ success: true, data: { isFounder: false, alreadyPremium: true } });
    }

    // Check user count
    const userCount = await getUserCount();

    if (userCount < FOUNDER_LIMIT) {
      // Grant founder status
      await grantFounderInConvex(user.id);
      return c.json({ success: true, data: { isFounder: true, alreadyGranted: false, spotsRemaining: FOUNDER_LIMIT - userCount } });
    }

    return c.json({ success: true, data: { isFounder: false, spotsRemaining: 0 } });
  } catch (err) {
    console.error('[Polar] Failed to check founder status:', err);
    return c.json({ success: false, error: 'Failed to check founder status' }, 500);
  }
});

// POST /webhooks - Polar webhook handler
PolarRoutes.post(
  '/webhooks',
  Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
      console.log('[Polar Webhook]', payload.type);
    },
    onSubscriptionActive: async (payload) => {
      console.log('[Polar Webhook] subscription.active', payload.data.id);
      const email = payload.data.customer.email;
      const user = await findUserByEmail(email);
      if (!user) {
        console.error('[Polar Webhook] No user found for email:', email);
        return;
      }

      const tier = getTierFromInterval(payload.data.recurringInterval);
      const expiresAt = payload.data.currentPeriodEnd
        ? new Date(payload.data.currentPeriodEnd).getTime()
        : undefined;

      await updateSubscriptionInConvex({
        betterAuthId: user.betterAuthId,
        subscriptionStatus: 'active',
        subscriptionTier: tier,
        polarCustomerId: payload.data.customer.id,
        polarSubscriptionId: payload.data.id,
        subscriptionExpiresAt: expiresAt,
      });
    },
    onSubscriptionCreated: async (payload) => {
      console.log('[Polar Webhook] subscription.created', payload.data.id);
      const email = payload.data.customer.email;
      const user = await findUserByEmail(email);
      if (!user) {
        console.error('[Polar Webhook] No user found for email:', email);
        return;
      }

      const tier = getTierFromInterval(payload.data.recurringInterval);

      await updateSubscriptionInConvex({
        betterAuthId: user.betterAuthId,
        subscriptionStatus: 'active',
        subscriptionTier: tier,
        polarCustomerId: payload.data.customer.id,
        polarSubscriptionId: payload.data.id,
      });
    },
    onSubscriptionCanceled: async (payload) => {
      console.log('[Polar Webhook] subscription.canceled', payload.data.id);
      const email = payload.data.customer.email;
      const user = await findUserByEmail(email);
      if (!user) {
        console.error('[Polar Webhook] No user found for email:', email);
        return;
      }

      await updateSubscriptionInConvex({
        betterAuthId: user.betterAuthId,
        subscriptionStatus: 'canceled',
      });
    },
    onSubscriptionRevoked: async (payload) => {
      console.log('[Polar Webhook] subscription.revoked', payload.data.id);
      const email = payload.data.customer.email;
      const user = await findUserByEmail(email);
      if (!user) {
        console.error('[Polar Webhook] No user found for email:', email);
        return;
      }

      await updateSubscriptionInConvex({
        betterAuthId: user.betterAuthId,
        subscriptionStatus: 'canceled',
        polarSubscriptionId: '',
        subscriptionExpiresAt: 0,
      });
    },
    onOrderPaid: async (payload) => {
      console.log('[Polar Webhook] order.paid', payload.data.id);
      // Handle lifetime purchases (one-time orders)
      const email = payload.data.customer.email;
      const user = await findUserByEmail(email);
      if (!user) {
        console.error('[Polar Webhook] No user found for email:', email);
        return;
      }

      // Check if this is a lifetime product by comparing product ID
      const lifetimeProductId = PRODUCT_SLUGS.lifetime;
      if (lifetimeProductId && payload.data.productId === lifetimeProductId) {
        await updateSubscriptionInConvex({
          betterAuthId: user.betterAuthId,
          subscriptionStatus: 'active',
          subscriptionTier: 'lifetime',
          polarCustomerId: payload.data.customer.id,
        });
      }
    },
  })
);

export default PolarRoutes;
