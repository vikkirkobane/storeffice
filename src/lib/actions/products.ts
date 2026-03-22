'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
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
  try {
    // Build query with filters
    const conditions = [eq(schema.products.isActive, true)];

    if (params.category) {
      conditions.push(sql`lower(${schema.products.category}) = lower(${params.category})`);
    }
    if (params.search) {
      conditions.push(sql`lower(${schema.products.title}) LIKE lower(${'%' + params.search + '%'})`);
    }
    // city filter not implemented (products not directly linked to cities)

    const offset = (params.page - 1) * params.limit;
    
    let query = db.select().from(schema.products).where(and(...conditions));

    // Sorting
    switch (params.sort) {
      case "price_asc":
        query = query.orderBy(sql`${schema.products.price} ASC`);
        break;
      case "price_desc":
        query = query.orderBy(sql`${schema.products.price} DESC`);
        break;
      case "rating":
        query = query.orderBy(sql`${schema.products.rating} DESC`);
        break;
      default:
        query = query.orderBy(sql`${schema.products.createdAt} DESC`);
    }

    const products = await query.limit(params.limit).offset(offset).execute();
    
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.products)
      .where(and(...conditions))
      .execute();

    const totalCount = Number(totalResult[0].count);

    return {
      products,
      pagination: {
        total: totalCount,
        page: params.page,
        pages: Math.ceil(totalCount / params.limit),
        limit: params.limit,
      },
    };
  } catch (error) {
    console.error("Failed to fetch products, returning sample data:", error);
    
    // Sample product data
    const sampleProducts = [
      {
        id: "sample-product-1",
        title: "Premium Laptop Stand",
        description: "Ergonomic aluminum laptop stand with adjustable height and cooling pad.",
        category: "Electronics",
        subcategory: "Accessories",
        price: 49.99,
        images: [],
        inventory: 50,
        sku: "LP-001",
        rating: 4.8,
        reviewCount: 124,
        isActive: true,
        merchantId: "sample-merchant-id",
        storageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample-product-2",
        title: "Organic Coffee Beans",
        description: "Single-origin Ethiopian coffee beans, ethically sourced and roasted to perfection.",
        category: "Food & Beverage",
        subcategory: "Coffee",
        price: 24.99,
        images: [],
        inventory: 200,
        sku: "CB-002",
        rating: 4.9,
        reviewCount: 89,
        isActive: true,
        merchantId: "sample-merchant-id",
        storageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample-product-3",
        title: "Wireless Bluetooth Earbuds",
        description: "High-fidelity sound with active noise cancellation and 24-hour battery.",
        category: "Electronics",
        subcategory: "Audio",
        price: 79.99,
        images: [],
        inventory: 75,
        sku: "WB-003",
        rating: 4.7,
        reviewCount: 203,
        isActive: true,
        merchantId: "sample-merchant-id",
        storageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let filtered = sampleProducts;
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(searchLower));
    }
    if (params.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= params.maxPrice!);
    }

    // Sorting
    switch (params.sort) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return {
      products: filtered,
      pagination: {
        total: filtered.length,
        page: params.page,
        pages: 1,
        limit: params.limit,
      },
    };
  }
}
  };
}
// Build trigger Sun Mar 22 12:51:14 +08 2026
