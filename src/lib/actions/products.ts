'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

export async function createProduct(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const required = ["title", "category", "price"];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  const [product] = await db.insert(schema.products).values({
    merchantId: payload.userId,
    storageId: data.storageId || null,
    title: data.title,
    description: data.description || null,
    category: data.category,
    subcategory: data.subcategory || null,
    price: data.price,
    images: data.images || [],
    inventory: data.inventory || 0,
    sku: data.sku || null,
    isActive: true,
  }).returning();

  return product;
}

export async function getProduct(id: string) {
  const product = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  return product[0] || null;
}

export async function updateProduct(id: string, data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!existing[0]) throw new Error("Product not found");
  if (existing[0].merchantId !== payload.userId) throw new Error("Not authorized");

  const [updated] = await db.update(schema.products).set({
    title: data.title ?? existing[0].title,
    description: data.description ?? existing[0].description,
    category: data.category ?? existing[0].category,
    subcategory: data.subcategory ?? existing[0].subcategory,
    price: data.price ?? existing[0].price,
    images: data.images ?? existing[0].images,
    inventory: data.inventory ?? existing[0].inventory,
    sku: data.sku ?? existing[0].sku,
    storageId: data.storageId ?? existing[0].storageId,
    isActive: data.isActive ?? existing[0].isActive,
  }).where(eq(schema.products.id, id)).returning();

  return updated[0];
}

export async function deleteProduct(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!existing[0]) throw new Error("Product not found");
  if (existing[0].merchantId !== payload.userId) throw new Error("Not authorized");

  await db.delete(schema.products).where(eq(schema.products.id, id));
  return { success: true };
}

export async function listProducts(params: {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page: number;
  limit: number;
}) {
  // Build query with filters
  let query = db.select().from(schema.products).where(sql`is_active = true`);

  if (params.category) {
    query = query.where(sql`lower(category) = lower(${params.category})`);
  }
  // Additional filters (search by title, price range) can be added

  // Sorting
  switch (params.sort) {
    case "price_asc":
      query = query.orderBy(sql`price ASC`);
      break;
    case "price_desc":
      query = query.orderBy(sql`price DESC`);
      break;
    case "rating":
      query = query.orderBy(sql`rating DESC`);
      break;
    default:
      query = query.orderBy(sql`created_at DESC`);
  }

  const products = await query.limit(params.limit).execute();
  const total = await db.select({ count: sql`count(*)` }).from(schema.products).where(sql`is_active = true`).execute();

  return {
    products,
    pagination: {
      total: Number(total[0].count),
      page: params.page,
      pages: Math.ceil(Number(total[0].count) / params.limit),
      limit: params.limit,
    },
  };
}
