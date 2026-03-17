"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

type Step = "address" | "processing" | "complete" | "error";

function CheckoutForm({ onSuccess }: { items: any[]; total: number; onSuccess: (orderId: string) => void }) {
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState({
    fullName: "", address: "", city: "", state: "", zipCode: "", country: "USA"
  });
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const addressComplete = address.fullName && address.address && address.city && address.state && address.zipCode;

  const startPayment = async () => {
    if (!addressComplete) return;
    setStep("processing");
    setError(null);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      setOrderId(data.orderId);
      window.location.href = data.authorizationUrl;
    } catch (e: any) {
      setError(e.message);
      setStep("error");
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
            <Button onClick={startPayment} disabled={!addressComplete || step === "processing"}>
              {step === "processing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === "error" && (
        <div className="space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setStep("address")}>Try again</Button>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPageClient() {
  const { items, total, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background py-16 flex items-center justify-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <CheckoutForm
                  items={items}
                  total={total}
                  onSuccess={(orderId) => {
                    clearCart();
                    setOrderComplete(true);
                  }}
                />
              </CardContent>
            </Card>
          </div>

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
