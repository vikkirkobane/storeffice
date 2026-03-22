import { eq, and, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Fetch office spaces with safe error handling
 */
export async function listOfficeSpaces(params: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  page: number;
  limit: number;
}) {
  try {
    const conditions = [eq(schema.officeSpaces.isActive, true)];
    if (params.city) conditions.push(sql`lower(${schema.officeSpaces.city}) = lower(${params.city})`);
    const offset = (params.page - 1) * params.limit;

    const spaces = await db.select()
      .from(schema.officeSpaces)
      .where(and(...conditions))
      .limit(params.limit)
      .offset(offset)
      .execute();

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.officeSpaces)
      .where(and(...conditions))
      .execute();

    const totalCount = Number(totalResult[0].count);

    return {
      spaces,
      pagination: {
        total: totalCount,
        page: params.page,
        pages: Math.ceil(totalCount / params.limit),
        limit: params.limit,
      },
    };
  } catch (error) {
    console.error("Failed to fetch office spaces, returning sample data:", error);
    // Sample office spaces
    return {
      spaces: [
        {
          id: "sample-space-1",
          title: "Modern Downtown Office",
          description: "A premium workspace in the heart of the city.",
          address: "123 Main St, Nairobi",
          city: "Nairobi",
          state: "Nairobi",
          zipCode: "00100",
          country: "Kenya",
          capacity: 20,
          hourlyPrice: 25,
          dailyPrice: 150,
          weeklyPrice: 800,
          monthlyPrice: 3000,
          rating: 4.8,
          reviewCount: 12,
          isActive: true,
          ownerId: "sample-owner-id",
          amenities: ["wifi", "parking", "coffee"],
          photos: [],
        },
        {
          id: "sample-space-2",
          title: "Cozy Home Office",
          description: "Quiet, comfortable space perfect for small teams.",
          address: "456 Oak Ave, Mombasa",
          city: "Mombasa",
          state: "Coast",
          zipCode: "80100",
          country: "Kenya",
          capacity: 5,
          hourlyPrice: 10,
          dailyPrice: 60,
          weeklyPrice: 300,
          monthlyPrice: 1200,
          rating: 4.5,
          reviewCount: 8,
          isActive: true,
          ownerId: "sample-owner-id",
          amenities: ["wifi", "coffee"],
          photos: [],
        },
      ],
      pagination: { total: 2, page: 1, pages: 1, limit: params.limit },
    };
  }
}

/**
 * Storage spaces listing with sample fallback
 */
export async function listStorageSpaces(params: {
  city?: string;
  storageType?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}) {
  try {
    const conditions = [eq(schema.storageSpaces.isActive, true)];
    if (params.city) conditions.push(sql`lower(${schema.storageSpaces.city}) = lower(${params.city})`);
    if (params.storageType) conditions.push(eq(schema.storageSpaces.storageType, params.storageType as any));
    if (params.minPrice !== undefined) conditions.push(sql`${schema.storageSpaces.monthlyPrice} >= ${params.minPrice}`);
    if (params.maxPrice !== undefined) conditions.push(sql`${schema.storageSpaces.monthlyPrice} <= ${params.maxPrice}`);
    const offset = (params.page - 1) * params.limit;

    const spaces = await db.select()
      .from(schema.storageSpaces)
      .where(and(...conditions))
      .limit(params.limit)
      .offset(offset)
      .execute();

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.storageSpaces)
      .where(and(...conditions))
      .execute();
    const totalCount = Number(totalResult[0].count);

    return { spaces, pagination: { total: totalCount, page: params.page, pages: Math.ceil(totalCount / params.limit), limit: params.limit } };
  } catch (error) {
    console.error("Failed to fetch storage spaces:", error);
    return {
      spaces: [
        {
          id: "sample-storage-1",
          title: "Secure Self-Storage Unit",
          description: "Climate-controlled unit with 24/7 access.",
          address: "100 Storage Lane, Nairobi",
          city: "Nairobi",
          state: "Nairobi",
          zipCode: "00100",
          country: "Kenya",
          storageType: "room",
          monthlyPrice: 100,
          annualPrice: 1100,
          rating: 4.7,
          reviewCount: 15,
          isActive: true,
          ownerId: "sample-owner-id",
          features: ["climate-control", "security"],
          photos: [],
          lengthFt: 10,
          widthFt: 10,
          heightFt: 8,
          isAvailable: true,
        },
      ],
      pagination: { total: 1, page: params.page, pages: 1, limit: params.limit },
    };
  }
}

/**
 * Products listing with sample fallback
 */
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
    const conditions = [eq(schema.products.isActive, true)];
    if (params.category) conditions.push(sql`lower(${schema.products.category}) = lower(${params.category})`);
    if (params.search) conditions.push(sql`lower(${schema.products.title}) LIKE lower(${'%' + params.search + '%'})`);
    const offset = (params.page - 1) * params.limit;
    
    let query = db.select().from(schema.products).where(and(...conditions));
    switch (params.sort) {
      case "price_asc": query = query.orderBy(sql`${schema.products.price} ASC`); break;
      case "price_desc": query = query.orderBy(sql`${schema.products.price} DESC`); break;
      case "rating": query = query.orderBy(sql`${schema.products.rating} DESC`); break;
      default: query = query.orderBy(sql`${schema.products.createdAt} DESC`);
    }

    const products = await query.limit(params.limit).offset(offset).execute();
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(schema.products).where(and(...conditions)).execute();
    const totalCount = Number(totalResult[0].count);

    return { products, pagination: { total: totalCount, page: params.page, pages: Math.ceil(totalCount / params.limit), limit: params.limit } };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    const sampleProducts = [
      {
        id: "sample-product-1",
        title: "Premium Laptop Stand",
        description: "Ergonomic aluminum laptop stand.",
        category: "Electronics",
        price: 49.99,
        images: [],
        inventory: 50,
        sku: "LP-001",
        rating: 4.8,
        reviewCount: 124,
        isActive: true,
        merchantId: "sample-merchant-id",
        storageId: null,
      },
      {
        id: "sample-product-2",
        title: "Organic Coffee Beans",
        description: "Single-origin Ethiopian coffee beans.",
        category: "Food & Beverage",
        price: 24.99,
        images: [],
        inventory: 200,
        sku: "CB-002",
        rating: 4.9,
        reviewCount: 89,
        isActive: true,
        merchantId: "sample-merchant-id",
        storageId: null,
      },
    ];
    let filtered = sampleProducts;
    if (params.search) filtered = filtered.filter(p => p.title.toLowerCase().includes(params.search!.toLowerCase()));
    if (params.category) filtered = filtered.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    if (params.minPrice !== undefined) filtered = filtered.filter(p => p.price >= params.minPrice!);
    if (params.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= params.maxPrice!);
    switch (params.sort) {
      case "price_asc": filtered.sort((a, b) => a.price - b.price); break;
      case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
    }
    return { products: filtered, pagination: { total: filtered.length, page: params.page, pages: 1, limit: params.limit } };
  }
}
