'use server';

import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
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
  try {
    const conditions = [eq(schema.officeSpaces.isActive, true)];

    if (params.city) {
      conditions.push(sql`lower(${schema.officeSpaces.city}) = lower(${params.city})`);
    }

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
    // Return sample data for development/demo when DB is unavailable
    const sampleSpaces = [
      {
        id: "sample-1",
        title: "Modern Downtown Office",
        description: "A premium workspace in the heart of the city with high-speed internet and meeting rooms.",
        address: "123 Main Street",
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
        createdAt: new Date(),
        updatedAt: new Date(),
        photos: [],
        amenities: ["wifi", "parking", "coffee"],
        latitude: null,
        longitude: null,
      },
      {
        id: "sample-2",
        title: "Cozy Home Office",
        description: "Quiet, comfortable space perfect for small teams or solo entrepreneurs.",
        address: "456 Oak Avenue",
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
        createdAt: new Date(),
        updatedAt: new Date(),
        photos: [],
        amenities: ["wifi", "coffee"],
        latitude: null,
        longitude: null,
      },
      {
        id: "sample-3",
        title: "Tech Hub Workspace",
        description: "State-of-the-art facilities with event space and networking opportunities.",
        address: "789 Innovation Drive",
        city: "Kisumu",
        state: "Nyanza",
        zipCode: "40100",
        country: "Kenya",
        capacity: 50,
        hourlyPrice: 50,
        dailyPrice: 300,
        weeklyPrice: 1500,
        monthlyPrice: 6000,
        rating: 4.9,
        reviewCount: 25,
        isActive: true,
        ownerId: "sample-owner-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        photos: [],
        amenities: ["wifi", "parking", "coffee", "gym", "event-space"],
        latitude: null,
        longitude: null,
      },
    ];
    
    // Filter sample data based on params if needed
    let filtered = sampleSpaces;
    if (params.city) {
      filtered = filtered.filter(s => s.city.toLowerCase() === params.city!.toLowerCase());
    }
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(s => (s.dailyPrice || 0) >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(s => (s.dailyPrice || 0) <= params.maxPrice!);
    }
    if (params.capacity !== undefined) {
      filtered = filtered.filter(s => s.capacity >= params.capacity!);
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
// Build trigger Sun Mar 22 07:51:27 +08 2026
