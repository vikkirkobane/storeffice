// Support both default and named exports from @paystack/paystack-sdk
import * as PaystackModule from "@paystack/paystack-sdk";

// Some bundlers export the class as default, others as named export
const Paystack = (PaystackModule as any).Paystack || (PaystackModule as any).default;

if (!Paystack) {
  throw new Error("@paystack/paystack-sdk did not export a Paystack constructor. Check SDK version.");
}

let paystackInstance: any = null;

if (process.env.PAYSTACK_SECRET_KEY) {
  paystackInstance = new Paystack(process.env.PAYSTACK_SECRET_KEY);
}

export const paystack = paystackInstance;

/**
 * Initialize a Paystack transaction.
 * amount: in the smallest currency unit (e.g., cents for USD)
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
  const amountInSmallest = Math.round(amount * 100);
  const response = await paystack.transaction.initialize({
    email,
    amount: amountInSmallest,
    currency: currency as any,
    metadata,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
  });
  return response.data;
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyPaystackTransaction(reference: string) {
  if (!paystack) throw new Error("Paystack not configured");
  const response = await paystack.transaction.verify(reference);
  return response.data;
}

/**
 * Refund a transaction.
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
