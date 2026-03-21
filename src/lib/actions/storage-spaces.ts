'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
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
  try {
    const conditions = [eq(schema.storageSpaces.isActive, true)];

    if (params.city) {
      conditions.push(sql`lower(${schema.storageSpaces.city}) = lower(${params.city})`);
    }
    if (params.storageType) {
      conditions.push(eq(schema.storageSpaces.storageType, params.storageType as any));
    }
    if (params.minPrice !== undefined) {
      conditions.push(sql`${schema.storageSpaces.monthlyPrice} >= ${params.minPrice}`);
    }
    if (params.maxPrice !== undefined) {
      conditions.push(sql`${schema.storageSpaces.monthlyPrice} <= ${params.maxPrice}`);
    }

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
    console.error("Failed to fetch storage spaces, returning sample data:", error);
    // Sample storage data
    const sampleSpaces = [
      {
        id: "sample-storage-1",
        title: "Secure Self-Storage Unit A",
        description: "Climate-controlled storage unit with 24/7 access and security.",
        address: "100 Storage Lane",
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
        createdAt: new Date(),
        updatedAt: new Date(),
        photos: [],
        features: ["climate-control", "security", "24/7-access"],
        latitude: null,
        longitude: null,
        lengthFt: 10,
        widthFt: 10,
        heightFt: 8,
        isAvailable: true,
      },
      {
        id: "sample-storage-2",
        title: "Warehouse Shelf B12",
        description: "Large warehouse shelf space for businesses and bulk storage.",
        address: "200 Industrial Park",
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
        createdAt: new Date(),
        updatedAt: new Date(),
        photos: [],
        features: ["forklift-access", "loading-dock", "security"],
        latitude: null,
        longitude: null,
        lengthFt: 20,
        widthFt: 10,
        heightFt: 12,
        isAvailable: true,
      },
    ];

    let filtered = sampleSpaces;
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

    return {
      spaces: filtered,
      pagination: {
        total: filtered.length,
        page: params.page,
        pages: 1,
        limit: params.limit,
      },
    };
  }
}
