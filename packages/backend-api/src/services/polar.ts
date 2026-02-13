import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

export class PolarService {
  /**
   * Create a checkout session for a product
   */
  static async createCheckout(productId: string, customerId: string, email: string) {
    try {
      const checkout = await polarClient.checkouts.create({
        productId,
        customerId,
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing/success?checkout_id={CHECKOUT_ID}`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
        customerEmail: email,
        metadata: {
          source: 'gripkicks-web'
        }
      });
      
      return checkout;
    } catch (error) {
      console.error('Error creating Polar checkout:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Get customer information
   */
  static async getCustomer(customerId: string) {
    try {
      const customer = await polarClient.customers.get(customerId);
      return customer;
    } catch (error) {
      console.error('Error fetching Polar customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer(email: string, name?: string) {
    try {
      const customer = await polarClient.customers.create({
        email,
        name,
        metadata: {
          source: 'gripkicks-web'
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating Polar customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get product information
   */
  static async getProduct(productId: string) {
    try {
      const product = await polarClient.products.get(productId);
      return product;
    } catch (error) {
      console.error('Error fetching Polar product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * List customer subscriptions
   */
  static async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await polarClient.subscriptions.list({
        customerId,
        limit: 10
      });
      
      return subscriptions;
    } catch (error) {
      console.error('Error fetching customer subscriptions:', error);
      throw new Error('Failed to fetch subscriptions');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const cancelled = await polarClient.subscriptions.cancel(subscriptionId);
      return cancelled;
    } catch (error) {
      console.error('Error cancelling Polar subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('POLAR_WEBHOOK_SECRET not configured');
      return false;
    }

    // Note: You'll need to implement proper signature verification
    // based on Polar.sh's webhook signature method
    // This is a placeholder - check Polar docs for exact implementation
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}
