import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq, desc, leftJoin } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { format } from "date-fns";

// Requires auth and DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardOrdersPage() {
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  let rawOrders: any[] = [];
  try {
    rawOrders = await db
      .select({
        order: schema.orders,
        items: schema.orderItems,
        product: schema.products,
      })
      .from(schema.orders)
      .leftJoin(schema.orderItems, eq(schema.orders.id, schema.orderItems.orderId))
      .leftJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .where(eq(schema.orders.customerId, user.id))
      .orderBy(desc(schema.orders.createdAt))
      .execute();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    // Keep empty array
  }

  // Group by order
  const grouped = new Map();
  for (const row of rawOrders) {
    const orderId = row.order.id;
    if (!grouped.has(orderId)) {
      grouped.set(orderId, {
        order: row.order,
        items: [],
      });
    }
    if (row.items) {
      grouped.get(orderId).items.push({
        ...row.items,
        product: row.product,
      });
    }
  }

  const orderList = Array.from(grouped.values());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your product orders</p>
      </div>

      {orderList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-2">
              Start shopping to see your orders here.
            </p>
            <Link href="/products" className="mt-4 inline-block">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orderList.map(({ order, items }) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {format(new Date(order.createdAt), "PPP p")}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt={item.product?.title || "Product"} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                          {item.product?.title || "Unknown Product"}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-base">${order.totalAmount.toFixed(2)}</span>
                </div>
                {/* TODO: Add tracking info if shipped */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// Build trigger Sun Mar 22 07:41:50 +08 2026
