import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

// Uses getServerUser which requires cookies - never statically generate
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminListingsPage() {
  const admin = await getServerUser();
  if (!admin || !["admin", "owner"].includes(admin.userType)) {
    redirect("/login");
  }

  const [officeSpaces, products] = await Promise.all([
    db.select().from(schema.officeSpaces).orderBy(schema.officeSpaces.createdAt).execute(),
    db.select().from(schema.products).orderBy(schema.products.createdAt).execute(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Listings Moderation</h1>
        <p className="text-muted-foreground">Approve or remove spaces and product listings.</p>
      </div>

      {/* Office Spaces */}
      <Card>
        <CardHeader>
          <CardTitle>Office Spaces</CardTitle>
          <CardDescription>{officeSpaces.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Owner</th>
                  <th className="text-left py-2">City</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {officeSpaces.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2 max-w-xs truncate">{s.title}</td>
                    <td className="py-2">{s.ownerId.slice(0, 8)}</td>
                    <td className="py-2">{s.city}</td>
                    <td className="py-2">
                      <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link href={`/spaces/${s.id}`} target="_blank">
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <form action={`/api/admin/listings/office-spaces/${s.id}/toggle`} method="POST">
                          <Button size="sm" variant={s.isActive ? "destructive" : "default"} type="submit">
                            {s.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>{products.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Merchant</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Price</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 max-w-xs truncate">{p.title}</td>
                    <td className="py-2">{p.merchantId.slice(0, 8)}</td>
                    <td className="py-2">{p.category}</td>
                    <td className="py-2">${Number(p.price).toFixed(2)}</td>
                    <td className="py-2">
                      <Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link href={`/products/${p.id}`} target="_blank">
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <form action={`/api/admin/listings/products/${p.id}/toggle`} method="POST">
                          <Button size="sm" variant={p.isActive ? "destructive" : "default"} type="submit">
                            {p.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </form>
                      </div>
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
