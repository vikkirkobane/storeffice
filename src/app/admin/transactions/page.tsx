import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Uses getServerUser which requires cookies - never statically generate
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminTransactionsPage() {
  const admin = await getServerUser();
  if (!admin || !["admin", "owner"].includes(admin.userType)) {
    redirect("/login");
  }

  // Fetch recent bookings and orders
  let bookings: any[] = [];
  let orders: any[] = [];

  try {
    const [bookingsResult, ordersResult] = await Promise.all([
      db.select().from(schema.bookings).orderBy(schema.bookings.createdAt).limit(50).execute(),
      db.select().from(schema.orders).orderBy(schema.orders.createdAt).limit(50).execute(),
    ]);
    bookings = bookingsResult;
    orders = ordersResult;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    // Keep empty arrays on error
  }

  // Also fetch payment intents to see if they exist
  // We'll display a simple table with IDs, totals, status, and refund action for those with Stripe PI

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View bookings and orders; issue refunds.</p>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Recent office space bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Space</th>
                  <th className="text-left py-2">Dates</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2">{b.id.slice(0, 8)}</td>
                    <td className="py-2">{b.customerId.slice(0, 8)}</td>
                    <td className="py-2">{b.spaceId.slice(0, 8)}</td>
                    <td className="py-2">
                      {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-2">${Number(b.totalPrice).toFixed(2)}</td>
                    <td className="py-2">
                      <Badge variant={
                        b.status === "confirmed" ? "default" :
                        b.status === "pending" ? "outline" :
                        b.status === "cancelled" ? "destructive" : "secondary"
                      }>{b.status}</Badge>
                    </td>
                    <td className="py-2">
                      {/* Refund action via Stripe if paymentId present */}
                      {b.paymentId ? (
                        <form action={`/api/admin/transactions/refund?type=booking&id=${b.id}`} method="POST">
                          <Button size="sm" variant="outline">Refund</Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">No payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent product orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="py-2">{o.id.slice(0, 8)}</td>
                    <td className="py-2">{o.customerId.slice(0, 8)}</td>
                    <td className="py-2">${Number(o.totalAmount).toFixed(2)}</td>
                    <td className="py-2">
                      <Badge variant={
                        o.status === "processing" || o.status === "shipped" ? "default" :
                        o.status === "pending" ? "outline" :
                        o.status === "cancelled" ? "destructive" : "secondary"
                      }>{o.status}</Badge>
                    </td>
                    <td className="py-2">
                      {o.paymentId ? (
                        <form action={`/api/admin/transactions/refund?type=order&id=${o.id}`} method="POST">
                          <Button size="sm" variant="outline">Refund</Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">No payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
