import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage({ searchParams }: { searchParams: { orderId?: string; error?: string } }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle>Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {searchParams.error ? "An error occurred during payment processing." : "Your payment could not be completed."}
          </p>
          {searchParams.orderId && (
            <p className="text-sm text-muted-foreground">
              Order <strong>#{searchParams.orderId.slice(0, 8)}</strong> has been cancelled.
            </p>
          )}
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/cart">Return to Cart</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
