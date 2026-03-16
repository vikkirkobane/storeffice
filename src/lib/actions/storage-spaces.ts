'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

export async function createStorageSpace(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const required = ["title", "address", "city", "state", "zipCode", "storageType", "monthlyPrice"];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  const [space] = await db.insert(schema.storageSpaces).values({
    ownerId: payload.userId,
    title: data.title,
    description: data.description || null,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country || "USA",
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    photos: data.photos || [],
    storageType: data.storageType,
    lengthFt: data.lengthFt || null,
    widthFt: data.widthFt || null,
    heightFt: data.heightFt || null,
    features: data.features || [],
    monthlyPrice: data.monthlyPrice,
    annualPrice: data.annualPrice || null,
    isAvailable: true,
    isActive: true,
  }).returning();

  return space;
}

export async function getStorageSpace(id: string) {
  const space = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1);
  return space[0] || null;
}

export async function updateStorageSpace(id: string, data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1);
  if (!existing[0]) throw new Error("Storage space not found");
  if (existing[0].ownerId !== payload.userId) throw new Error("Not authorized");

  const [updated] = await db.update(schema.storageSpaces).set({
    title: data.title ?? existing[0].title,
    description: data.description ?? existing[0].description,
    address: data.address ?? existing[0].address,
    city: data.city ?? existing[0].city,
    state: data.state ?? existing[0].state,
    zipCode: data.zipCode ?? existing[0].zipCode,
    country: data.country ?? existing[0].country,
    latitude: data.latitude ?? existing[0].latitude,
    longitude: data.longitude ?? existing[0].longitude,
    photos: data.photos ?? existing[0].photos,
    storageType: data.storageType ?? existing[0].storageType,
    lengthFt: data.lengthFt ?? existing[0].lengthFt,
    widthFt: data.widthFt ?? existing[0].widthFt,
    heightFt: data.heightFt ?? existing[0].heightFt,
    features: data.features ?? existing[0].features,
    monthlyPrice: data.monthlyPrice ?? existing[0].monthlyPrice,
    annualPrice: data.annualPrice ?? existing[0].annualPrice,
    isAvailable: data.isAvailable ?? existing[0].isAvailable,
    isActive: data.isActive ?? existing[0].isActive,
  }).where(eq(schema.storageSpaces.id, id)).returning();

  return updated[0];
}

export async function deleteStorageSpace(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1);
  if (!existing[0]) throw new Error("Storage space not found");
  if (existing[0].ownerId !== payload.userId) throw new Error("Not authorized");

  await db.delete(schema.storageSpaces).where(eq(schema.storageSpaces.id, id));
  return { success: true };
}

export async function listStorageSpaces(params: {
  city?: string;
  storageType?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}) {
  let query = db.select().from(schema.storageSpaces).where(sql`is_active = true`);

  if (params.city) {
    query = query.where(sql`lower(city) = lower(${params.city})`);
  }
  if (params.storageType) {
    query = query.where(sql`storage_type = ${params.storageType}`);
  }
  if (params.minPrice !== undefined) {
    query = query.where(sql`monthly_price >= ${params.minPrice}`);
  }
  if (params.maxPrice !== undefined) {
    query = query.where(sql`monthly_price <= ${params.maxPrice}`);
  }

  const spaces = await query.limit(params.limit).execute();
  const total = await db.select({ count: sql`count(*)` }).from(schema.storageSpaces).where(sql`is_active = true`).execute();

  return {
    spaces,
    pagination: {
      total: Number(total[0].count),
      page: params.page,
      pages: Math.ceil(Number(total[0].count) / params.limit),
      limit: params.limit,
    },
  };
}
