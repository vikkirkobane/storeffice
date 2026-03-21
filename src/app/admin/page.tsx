import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Users, Building2, Package, ShoppingCart } from "lucide-react";

// Admin pages require authentication and use cookies - never statically generate
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const [userCount] = await db.select({ count: sql`count(*)` }).from(schema.profiles).limit(1);
  const [spaceCount] = await db.select({ count: sql`count(*)` }).from(schema.officeSpaces).limit(1);
  const [productCount] = await db.select({ count: sql`count(*)` }).from(schema.products).limit(1);
  const [orderCount] = await db.select({ count: sql`count(*)` }).from(schema.orders).limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Office Spaces</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spaceCount.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount.count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links to sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View, verify, suspend users</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/users" className="text-primary hover:underline">Go to Users →</a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Listings Moderation</CardTitle>
            <CardDescription>Approve or reject spaces and products</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/listings" className="text-primary hover:underline">Go to Listings →</a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View bookings and orders, issue refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/transactions" className="text-primary hover:underline">Go to Transactions →</a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>Moderate reviews and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/reviews" className="text-primary hover:underline">Go to Reviews →</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}// Build trigger Sun Mar 22 07:23:36 +08 2026
// Trigger build Sun Mar 22 07:25:22 +08 2026
