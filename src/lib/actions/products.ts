"use server";

import { db, schema } from "@/lib/db";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-core";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  city?: string; // filter by storage city
  sort?: string; // 'price_asc', 'price_desc', 'rating', 'relevance'
  page?: number;
  limit?: number;
}

export async function listProducts(filters: ProductFilters = {}) {
  let query = db.select().from(schema.products).where(eq(schema.products.isActive, true));
  
  const conditions = [];
  if (filters.category) {
    conditions.push(eq(schema.products.category, filters.category));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(schema.products.price, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(schema.products.price, filters.maxPrice));
  }
  if (filters.city) {
    // Join storage_spaces to filter by city
    query = query.innerJoin(schema.storageSpaces, eq(schema.products.storageId, schema.storageSpaces.id));
    conditions.push(ilike(schema.storageSpaces.city, `%${filters.city}%`));
  }
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      ilike(schema.products.title, searchTerm)
    );
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Sorting
  if (filters.sort === "price_asc") {
    query = query.orderBy(schema.products.price);
  } else if (filters.sort === "price_desc") {
    query = query.orderBy(desc(schema.products.price));
  } else if (filters.sort === "rating") {
    query = query.orderBy(desc(schema.products.rating));
  } else {
    query = query.orderBy(desc(schema.products.createdAt));
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    query.limit(limit).offset(offset).execute(),
    query.count().execute(),
  ]);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total: Number(total),
      pages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function getProduct(id: string) {
  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1).execute();
  return product || null;
}

export async function createProduct(data: {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  images?: string[];
  inventory?: number;
  sku?: string;
  storageId?: string;
}) {
  const [user] = await getServerUser();
  
  if (!user || (user.userType !== "merchant" && user.userType !== "admin" && user.userType !== "owner")) {
    throw new Error("Unauthorized: Only merchants can create products");
  }
  
  const [product] = await db.insert(schema.products).values({
    merchantId: user.id,
    ...data,
    isActive: true,
  }).returning();
  
  return product;
}

export async function updateProduct(id: string, data: Partial<{
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  images?: string[];
  inventory?: number;
  sku?: string;
  storageId?: string;
  isActive?: boolean;
}>) {
  const [user] = await getServerUser();
  
  const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Product not found");
  }
  if (existing[0].merchantId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only edit your own products");
  }
  
  const [updated] = await db.update(schema.products).set(data).where(eq(schema.products.id, id)).returning();
  
  return updated;
}

export async function deleteProduct(id: string) {
  const [user] = await getServerUser();
  
  const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Product not found");
  }
  if (existing[0].merchantId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only delete your own products");
  }
  
  const [deleted] = await db.update(schema.products).set({ isActive: false }).where(eq(schema.products.id, id)).returning();
  
  return deleted;
}
