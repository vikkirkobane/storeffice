"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

type CheckoutStep = "address" | "processing" | "complete" | "error";

function CheckoutForm({ onSuccess }: { onSuccess: (orderId: string) => void }) {
  const { items, total } = useCart();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState({
    fullName: "", address: "", city: "", state: "", zipCode: "", country: "USA"
  });
  const [error, setError] = useState<string | null>(null);

  const addressComplete = address.fullName && address.address && address.city && address.state && address.zipCode;

  const startPayment = async () => {
    if (!addressComplete) return;
    setStep("processing");
    setError(null);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      // Redirect to Paystack
      window.location.href = data.authorizationUrl;
    } catch (e: any) {
      setError(e.message);
      setStep("error");
    }
  };

  if (step === "complete") {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <p className="text-muted-foreground">Thank you for your purchase.</p>
        <p className="text-sm text-muted-foreground">A confirmation email will be sent shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === "address" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Shipping Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input className="w-full border rounded p-2" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} />
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
                <input className="w-full border rounded p-2" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input className="w-full border rounded p-2" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP</label>
                <input className="w-full border rounded p-2" value={address.zipCode} onChange={e => setAddress(a => ({ ...a, zipCode: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input className="w-full border rounded p-2" value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setStep("address")}>Try again</Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={startPayment} disabled={!addressComplete || step === "processing"}>
          {step === "processing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay ${total.toFixed(2)} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CartPageClient() {
  const { items, total, clearCart, removeItem } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background py-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item.productId}>
                <CardContent className="p-4 flex items-center gap-4">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="h-16 w-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => { /* update quantity */ }}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => removeItem(item.productId)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId, true)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardFooter>
                <CheckoutForm onSuccess={(orderId) => { clearCart(); }} />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
