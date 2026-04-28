import { Polar } from "@polar-sh/sdk";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

export class PolarService {
  /**
   * Create a checkout session for a product
   */
  static async createCheckout(
    productId: string,
    customerId?: string,
    email?: string,
  ) {
    try {
      const checkout = await polarClient.checkouts.create({
        products: [productId],
        ...(customerId && { customerId }),
        successUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/pricing/success?checkout_id={CHECKOUT_ID}`,
        customerEmail: email,
        metadata: {
          source: "gripkicks-web",
        },
      });

      return checkout;
    } catch (error) {
      console.error("Error creating Polar checkout:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Get customer information
   */
  static async getCustomer(customerId: string) {
    try {
      const customer = await polarClient.customers.get({
        id: customerId,
      } as never);
      return customer;
    } catch (error) {
      console.error("Error fetching Polar customer:", error);
      throw new Error("Failed to fetch customer");
    }
  }

  static async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await polarClient.subscriptions.list({
        customerId,
        limit: 10,
      });

      return subscriptions;
    } catch (error) {
      console.error("Error fetching customer subscriptions:", error);
      throw new Error("Failed to fetch subscriptions");
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscriptions = await polarClient.subscriptions.list({
        customerId: subscriptionId,
      }) as unknown as {
        update: (input: {
          id: string;
          cancelAtPeriodEnd: boolean;
        }) => Promise<unknown>;
      };
      const cancelled = await subscriptions.update({
        id: subscriptionId,
        cancelAtPeriodEnd: true,
      });
      return cancelled;
    } catch (error) {
      console.error("Error cancelling Polar subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }
}
