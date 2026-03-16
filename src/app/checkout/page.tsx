"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle } from "lucide-react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = "address" | "payment" | "processing" | "complete";

function CheckoutForm({ items, total, onSuccess }: { items: any[]; total: number; onSuccess: (orderId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState({
    fullName: "", address: "", city: "", state: "", zipCode: "", country: "USA"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const addressComplete = address.fullName && address.address && address.city && address.state && address.zipCode;

  const goToPayment = () => {
    if (!addressComplete) return;
    setStep("payment");
    setError(null);
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create order + payment intent
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      setOrderId(data.orderId);

      // 2. Confirm payment with Stripe
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not found");

      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Success
      setStep("complete");
      onSuccess(data.orderId);
    } catch (e: any) {
      setError(e.message);
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  if (step === "complete" && orderId) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <p className="text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
        <p className="text-sm">Thank you. A confirmation email will be sent shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === "address" && (
        <>
          <div>
            <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  required
                  className="w-full border rounded p-2"
                  value={address.fullName}
                  onChange={(e) => setAddress(a => ({ ...a, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address (search)</label>
                <AddressAutocomplete
                  value={address.address}
                  onChange={(addr) => setAddress(a => ({ ...a, address: addr }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    required
                    className="w-full border rounded p-2"
                    value={address.city}
                    onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    required
                    className="w-full border rounded p-2"
                    value={address.state}
                    onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    required
                    className="w-full border rounded p-2"
                    value={address.zipCode}
                    onChange={(e) => setAddress(a => ({ ...a, zipCode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    required
                    className="w-full border rounded p-2"
                    value={address.country}
                    onChange={(e) => setAddress(a => ({ ...a, country: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={goToPayment} disabled={!addressComplete}>Continue to Payment</Button>
          </div>
        </>
      )}

      {step === "payment" && (
        <>
          <div>
            <h3 className="text-lg font-medium mb-4">Payment</h3>
            <CardElement className="p-3 border rounded" options={{ style: { base: { fontSize: "16px" } } }} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("address")}>Back</Button>
            <Button onClick={handlePayment} disabled={loading || !stripe}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay ${total.toFixed(2)}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    items={items}
                    total={total}
                    onSuccess={(orderId) => {
                      clearCart();
                      setOrderComplete(true);
                      // Optionally redirect after delay
                    }}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Order Summary</h3>
                <Separator />
                <div className="space-y-2 text-sm">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between">
                      <span>{item.title} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
