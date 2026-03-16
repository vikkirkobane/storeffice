import Stripe from "stripe";

/**
 * Stripe client initialized with secret key.
 * Used for server-side operations: PaymentIntents, Refunds, Webhook validation.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Latest stable as of 2025
  typescript: true,
});

/**
 * Helper: Create a PaymentIntent for a given amount and currency.
 * Attaches metadata to link with our booking/order.
 */
export async function createPaymentIntent(amount: number, currency = "usd", metadata: Record<string, string>) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects cents
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
  return intent;
}

/**
 * Helper: Retrieve a PaymentIntent by ID.
 */
export async function getPaymentIntent(intentId: string) {
  return await stripe.paymentIntents.retrieve(intentId);
}

/**
 * Helper: Refund a PaymentIntent (or a Charge).
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  // Refund the underlying charge
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const chargeId = intent.charges.data[0]?.id;
  if (!chargeId) throw new Error("No charge associated with this payment");

  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
  return refund;
}

/**
 * Construct Stripe webhook secret from environment.
 */
export const getWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  return secret;
};
