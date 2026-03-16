import Stripe from "stripe";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  });
}

/**
 * Create a PaymentIntent for a given amount and currency.
 */
export async function createPaymentIntent(amount: number, currency = "usd", metadata: Record<string, string>) {
  if (!stripe) throw new Error("Stripe not configured. Set STRIPE_SECRET_KEY.");
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects cents
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
  return intent;
}

/**
 * Retrieve a PaymentIntent by ID.
 */
export async function getPaymentIntent(intentId: string) {
  if (!stripe) throw new Error("Stripe not configured");
  return await stripe.paymentIntents.retrieve(intentId);
}

/**
 * Refund a PaymentIntent (or a Charge).
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  if (!stripe) throw new Error("Stripe not configured");
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

// Legacy export (avoid using directly; use the functions above)
export { stripe as _stripe };
