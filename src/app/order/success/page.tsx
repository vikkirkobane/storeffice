import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle>Order Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you! Your order <strong>#{searchParams.orderId?.slice(0, 8)}</strong> has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email will be sent to you shortly.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/orders">View Orders</Link>
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
