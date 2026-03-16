import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Package, Pencil } from "lucide-react";

export default async function DashboardProductsPage() {
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  const myProducts = ["merchant", "owner", "admin"].includes(user.userType)
    ? await db.select().from(schema.products).where(eq(schema.products.merchantId, user.id)).execute()
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        {["merchant", "owner", "admin"].includes(user.userType) && (
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        )}
      </div>

      {!["merchant", "owner", "admin"].includes(user.userType) ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Not Authorized</h3>
            <p className="text-muted-foreground mt-2">Only merchants can manage products.</p>
          </CardContent>
        </Card>
      ) : myProducts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
            <p className="text-muted-foreground mt-2">Add your first product to start selling.</p>
            <Link href="/dashboard/products/new" className="mt-4 inline-block">
              <Button>Add Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Price: ${product.price.toFixed(2)}</p>
                  <p>Inventory: {product.inventory || 0}</p>
                  {product.sku && <p>SKU: {product.sku}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Link href={`/products/${product.id}`} target="_blank">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
