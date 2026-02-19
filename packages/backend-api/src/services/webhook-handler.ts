export class WebhookHandler {
  static async handleWebhookEvent(
    eventType: string,
    event: unknown,
  ): Promise<void> {
    switch (eventType) {
      case "checkout.created":
      case "checkout.updated":
      case "subscription.created":
      case "subscription.updated":
      case "subscription.canceled":
      case "order.paid":
      case "order.refunded":
        console.log(`[WebhookHandler] Processed event: ${eventType}`);
        break;
      default:
        console.log(`[WebhookHandler] Ignored event type: ${eventType}`);
    }

    if (process.env.NODE_ENV !== "production") {
      console.debug("[WebhookHandler] Event payload:", event);
    }
  }
}

export default WebhookHandler;
