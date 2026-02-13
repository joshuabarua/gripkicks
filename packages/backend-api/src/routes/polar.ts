import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PolarService } from '../services/polar';
import { WebhookHandler } from '../services/webhook-handler';

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
      // Try to get existing customer by email (you'd need to implement this in PolarService)
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
 * Handle Polar webhooks
 * POST /api/polar/webhook
 */
polarRoutes.post('/webhook', async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('Polar-Signature');
    
    if (!signature) {
      console.error('Webhook missing signature');
      return c.text('Webhook signature missing', 400);
    }
    
    // Verify webhook signature
    const isValid = PolarService.verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return c.text('Invalid signature', 401);
    }
    
    // Parse webhook event
    const event = JSON.parse(body);
    const eventType = event.type;
    
    // Handle the event
    await WebhookHandler.handleWebhookEvent(eventType, event);
    
    console.log(`Successfully processed webhook: ${eventType}`);
    return c.text('OK');
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.text('Webhook processing failed', 500);
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
