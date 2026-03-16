'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

export async function createOfficeSpace(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const required = ["title", "address", "city", "state", "zipCode", "capacity"];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  const [space] = await db.insert(schema.officeSpaces).values({
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
    amenities: data.amenities || [],
    capacity: data.capacity,
    hourlyPrice: data.hourlyPrice || null,
    dailyPrice: data.dailyPrice || null,
    weeklyPrice: data.weeklyPrice || null,
    monthlyPrice: data.monthlyPrice || null,
    isActive: true,
  }).returning();

  return space;
}

export async function getOfficeSpace(id: string) {
  const space = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1);
  return space[0] || null;
}

export async function updateOfficeSpace(id: string, data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1);
  if (!existing[0]) throw new Error("Office space not found");
  if (existing[0].ownerId !== payload.userId) throw new Error("Not authorized");

  const [updated] = await db.update(schema.officeSpaces).set({
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
    amenities: data.amenities ?? existing[0].amenities,
    capacity: data.capacity ?? existing[0].capacity,
    hourlyPrice: data.hourlyPrice ?? existing[0].hourlyPrice,
    dailyPrice: data.dailyPrice ?? existing[0].dailyPrice,
    weeklyPrice: data.weeklyPrice ?? existing[0].weeklyPrice,
    monthlyPrice: data.monthlyPrice ?? existing[0].monthlyPrice,
    isActive: data.isActive ?? existing[0].isActive,
  }).where(eq(schema.officeSpaces.id, id)).returning();

  return updated[0];
}

export async function deleteOfficeSpace(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Authentication required");

  const payload = await verifyAccessToken(token);
  if (!payload) throw new Error("Invalid token");

  const existing = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1);
  if (!existing[0]) throw new Error("Office space not found");
  if (existing[0].ownerId !== payload.userId) throw new Error("Not authorized");

  await db.delete(schema.officeSpaces).where(eq(schema.officeSpaces.id, id));
  return { success: true };
}

export async function listOfficeSpaces(params: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  page: number;
  limit: number;
}) {
  // Simplified: return all active spaces
  let query = db.select().from(schema.officeSpaces).where(sql`is_active = true`);

  if (params.city) {
    query = query.where(sql`lower(city) = lower(${params.city})`);
  }
  // Additional filters can be added similarly

  const spaces = await query.limit(params.limit).execute();
  const total = await db.select({ count: sql`count(*)` }).from(schema.officeSpaces).where(sql`is_active = true`).execute();

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
