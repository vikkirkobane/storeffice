import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import ProductForm from "@/components/products/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1).execute();
  
  if (!product) {
    redirect("/dashboard/products");
  }

  if (product.merchantId !== user.id && user.userType !== "admin") {
    redirect("/dashboard/products");
  }

  return <ProductForm productId={id} initialData={product} />;
}
