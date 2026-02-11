import { Hono } from 'hono';
import { Polar } from '@polar-sh/sdk';
import { Webhooks } from '@polar-sh/hono';
import { protect } from '../middleware/auth.middlewares';

const PolarRoutes = new Hono();

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

const PRODUCT_SLUGS: Record<string, string> = {
  monthly: process.env.POLAR_PRODUCT_MONTHLY || '',
  yearly: process.env.POLAR_PRODUCT_YEARLY || '',
  lifetime: process.env.POLAR_PRODUCT_LIFETIME || '',
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// POST /checkout/:slug - Create a Polar checkout session
PolarRoutes.post('/checkout/:slug', protect, async (c) => {
  const slug = c.req.param('slug');
  const productId = PRODUCT_SLUGS[slug];

  if (!productId) {
    return c.json({ success: false, error: `Unknown plan: ${slug}` }, 400);
  }

  const user = c.get('user') as { email?: string };
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

// POST /webhooks - Polar webhook handler
PolarRoutes.post(
  '/webhooks',
  Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
      console.log('[Polar Webhook]', payload.type);
    },
  })
);

export default PolarRoutes;
