import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, storageSpaces } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  inventory: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  images: z.array(z.string()).default([]),
  storageId: z.string().uuid().optional(), // link to storage space where product is kept
});

type ProductInput = z.infer<typeof productSchema>;

export async function createProduct(data: ProductInput) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = productSchema.parse(data);

  const [product] = await db
    .insert(products)
    .values({
      ...validated,
      merchantId: session.user.id,
      isActive: true,
    })
    .returning();

  revalidatePath("/dashboard/products");
  revalidatePath("/");
  return product;
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.select().from(products).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].merchantId !== session.user.id) {
    throw new Error("Not authorized");
  }

  const [product] = await db
    .update(products)
    .set(data)
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath("/dashboard/products");
  revalidatePath("/");
  return product;
}

export async function deleteProduct(id: string) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.select().from(products).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].merchantId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await db.delete(products).where(sql`id = ${id}`).execute();
  revalidatePath("/dashboard/products");
  revalidatePath("/");
  return { success: true };
}

export async function getProducts() {
  const session = await auth.getSession();
  const userId = session?.user?.id;

  const query = db.select().from(products).orderBy(sql`created_at DESC`);
  if (userId) {
    return query.where(sql`merchant_id = ${userId}`).limit(100);
  } else {
    return query.where(sql`is_active = true`).limit(100);
  }
}

export async function getPublicProducts() {
  // For homepage/product listing pages
  return db.select().from(products).where(sql`is_active = true`).orderBy(sql`created_at DESC`).limit(50);
}
