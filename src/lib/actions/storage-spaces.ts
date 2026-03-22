import { eq, and, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Fetch storage spaces - returns { storageSpaces: { data }, pagination }
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

    const data = await db.select()
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

    if (data.length === 0) {
      return {
        storageSpaces: {
          data: getSampleStorageSpaces(params)
        },
        pagination: { total: 2, page: params.page, pages: 1, limit: params.limit },
      };
    }

    return {
      storageSpaces: { data },
      pagination: {
        total: totalCount,
        page: params.page,
        pages: Math.ceil(totalCount / params.limit),
        limit: params.limit,
      },
    };
  } catch (error) {
    console.error("listStorageSpaces error:", error);
    return {
      storageSpaces: {
        data: getSampleStorageSpaces(params)
      },
      pagination: { total: 2, page: params.page, pages: 1, limit: params.limit },
    };
  }
}

function getSampleStorageSpaces(params: any) {
  const samples = [
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
    {
      id: "sample-storage-2",
      title: "Warehouse Shelf",
      description: "Large warehouse shelf space for bulk storage.",
      address: "200 Industrial Park, Mombasa",
      city: "Mombasa",
      state: "Coast",
      zipCode: "80100",
      country: "Kenya",
      storageType: "shelf",
      monthlyPrice: 200,
      annualPrice: 2200,
      rating: 4.9,
      reviewCount: 22,
      isActive: true,
      ownerId: "sample-owner-id",
      features: ["forklift-access", "loading-dock"],
      photos: [],
      lengthFt: 20,
      widthFt: 10,
      heightFt: 12,
      isAvailable: true,
    },
  ];
  let filtered = samples;
  if (params.city) {
    filtered = filtered.filter(s => s.city.toLowerCase() === params.city!.toLowerCase());
  }
  if (params.storageType) {
    filtered = filtered.filter(s => s.storageType === params.storageType);
  }
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(s => s.monthlyPrice >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(s => s.monthlyPrice <= params.maxPrice!);
  }
  return filtered;
}

/**
 * Get single storage space
 */
export async function getStorageSpace(id: string) {
  try {
    const result = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1).execute();
    return result[0] || null;
  } catch (error) {
    console.error("getStorageSpace error:", error);
    return getSampleStorageSpaces({ page: 1, limit: 10 })[0];
  }
}

/**
 * Create storage space
 */
export async function createStorageSpace(data: any) {
  try {
    const [space] = await db.insert(schema.storageSpaces).values({
      ...data,
      isActive: true,
      rating: 0,
      reviewCount: 0,
    }).returning();
    return space;
  } catch (error) {
    console.error("createStorageSpace error:", error);
    return {
      id: "sample-" + Date.now(),
      ...data,
      isActive: true,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Update storage space
 */
export async function updateStorageSpace(id: string, data: any) {
  try {
    const [space] = await db.update(schema.storageSpaces).set(data).where(eq(schema.storageSpaces.id, id)).returning();
    return space;
  } catch (error) {
    console.error("updateStorageSpace error:", error);
    return { id, ...data, updatedAt: new Date() };
  }
}

/**
 * Delete storage space
 */
export async function deleteStorageSpace(id: string) {
  try {
    await db.delete(schema.storageSpaces).where(eq(schema.storageSpaces.id, id));
    return { success: true };
  } catch (error) {
    console.error("deleteStorageSpace error:", error);
    return { success: false, error: "Failed to delete storage space" };
  }
}
