"use server";

import { db, schema } from "@/lib/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-core";

export interface StorageSpaceFilters {
  city?: string;
  storageType?: "shelf" | "room" | "warehouse";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function listStorageSpaces(filters: StorageSpaceFilters = {}) {
  const [user] = await getServerUser();
  
  let query = db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.isActive, true));
  
  const conditions = [];
  if (filters.city) {
    conditions.push(eq(schema.storageSpaces.city, filters.city));
  }
  if (filters.storageType) {
    conditions.push(eq(schema.storageSpaces.storageType, filters.storageType));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(schema.storageSpaces.monthlyPrice, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(schema.storageSpaces.monthlyPrice, filters.maxPrice));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;
  
  const [spaces, total] = await Promise.all([
    query.orderBy(desc(schema.storageSpaces.createdAt)).limit(limit).offset(offset).execute(),
    query.count().execute(),
  ]);
  
  return {
    spaces,
    pagination: {
      page,
      limit,
      total: Number(total),
      pages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function getStorageSpace(id: string) {
  const spaces = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1).execute();
  return spaces[0] || null;
}

export async function createStorageSpace(data: {
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  storageType: "shelf" | "room" | "warehouse";
  lengthFt?: number;
  widthFt?: number;
  heightFt?: number;
  features?: string[];
  monthlyPrice: number;
  annualPrice?: number;
}) {
  const [user] = await getServerUser();
  
  if (!user || (user.userType !== "owner" && user.userType !== "merchant" && user.userType !== "admin")) {
    throw new Error("Unauthorized: Only owners/merchants can create storage spaces");
  }
  
  const [space] = await db.insert(schema.storageSpaces).values({
    ownerId: user.id,
    ...data,
    isActive: true,
    isAvailable: true,
  }).returning();
  
  return space;
}

export async function updateStorageSpace(id: string, data: Partial<{
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  storageType?: "shelf" | "room" | "warehouse";
  lengthFt?: number;
  widthFt?: number;
  heightFt?: number;
  features?: string[];
  monthlyPrice?: number;
  annualPrice?: number;
  isActive?: boolean;
  isAvailable?: boolean;
}>) {
  const [user] = await getServerUser();
  
  const existing = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Storage space not found");
  }
  if (existing[0].ownerId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only edit your own spaces");
  }
  
  const [updated] = await db.update(schema.storageSpaces).set(data).where(eq(schema.storageSpaces.id, id)).returning();
  
  return updated;
}

export async function deleteStorageSpace(id: string) {
  const [user] = await getServerUser();
  
  const existing = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Storage space not found");
  }
  if (existing[0].ownerId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only delete your own spaces");
  }
  
  const [deleted] = await db.update(schema.storageSpaces).set({ isActive: false }).where(eq(schema.storageSpaces.id, id)).returning();
  
  return deleted;
}
