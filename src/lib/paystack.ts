import { Paystack } from "@paystack/paystack-sdk";

let paystackInstance: Paystack | null = null;

if (process.env.PAYSTACK_SECRET_KEY) {
  paystackInstance = new Paystack(process.env.PAYSTACK_SECRET_KEY);
}

export const paystack = paystackInstance;

/**
 * Initialize a Paystack transaction.
 * amount: in kobo (NGN) or cents for USD/EUR/GBP? Paystack expects amount in the smallest unit (e.g., cents for USD).
 * metadata: optional key-value pairs to attach to the transaction.
 * Returns: transaction data with authorization_url, reference, etc.
 */
export async function initializePaystackTransaction(
  email: string,
  amount: number,
  currency = "usd",
  metadata?: Record<string, string>
) {
  if (!paystack) throw new Error("Paystack not configured. Set PAYSTACK_SECRET_KEY.");
  // Paystack expects amount in the smallest currency unit (e.g., cents for USD)
  const amountInSmallest = Math.round(amount * 100);
  const response = await paystack.transaction.initialize({
    email,
    amount: amountInSmallest,
    currency: currency as any, // "usd", "ngn", "eur", "gbp"
    metadata,
    callback_url: process.env.PAYSTACK_CALLBACK_URL, // optional: route to verify after redirect
  });
  return response.data;
}

/**
 * Verify a Paystack transaction by reference.
 * Returns transaction details.
 */
export async function verifyPaystackTransaction(reference: string) {
  if (!paystack) throw new Error("Paystack not configured");
  const response = await paystack.transaction.verify(reference);
  return response.data;
}

/**
 * Refund a transaction (full or partial).
 * reference: the Paystack transaction reference
 * amount?: in the smallest currency unit (cents for USD). If omitted, full refund.
 * notes?: reason for refund
 */
export async function refundPaystackTransaction(reference: string, amount?: number, notes?: string) {
  if (!paystack) throw new Error("Paystack not configured");
  const response = await paystack.transaction.refund(reference, {
    amount,
    notes,
  });
  return response.data;
}


/**
 * Construct Paystack webhook secret from environment.
 */
export const getPaystackWebhookSecret = () => {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) throw new Error("PAYSTACK_WEBHOOK_SECRET not set");
  return secret;
};

// Legacy export (avoid using directly)
export { paystack as _paystack };
