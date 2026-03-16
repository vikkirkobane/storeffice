"use server";

import { db, schema } from "@/lib/db";
import { eq, and, gte, lte, ilike, inArray, desc } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-core";

export interface OfficeSpaceFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export async function listOfficeSpaces(filters: OfficeSpaceFilters = {}) {
  const [user] = await getServerUser();
  
  // Build query
  let query = db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.isActive, true));
  
  // Apply filters
  const conditions = [];
  if (filters.city) {
    conditions.push(eq(schema.officeSpaces.city, filters.city));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(schema.officeSpaces.hourlyPrice || 0, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(schema.officeSpaces.hourlyPrice || 999999, filters.maxPrice));
  }
  if (filters.capacity) {
    conditions.push(gte(schema.officeSpaces.capacity, filters.capacity));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;
  
  const [spaces, total] = await Promise.all([
    query.orderBy(desc(schema.officeSpaces.createdAt)).limit(limit).offset(offset).execute(),
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

export async function getOfficeSpace(id: string) {
  const [user] = await getServerUser();
  
  const spaces = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1).execute();
  return spaces[0] || null;
}

export async function createOfficeSpace(data: {
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
  amenities?: string[];
  capacity: number;
  hourlyPrice?: number;
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
}) {
  const [user] = await getServerUser();
  
  if (!user || (user.userType !== "owner" && user.userType !== "admin")) {
    throw new Error("Unauthorized: Only owners can create office spaces");
  }
  
  const [space] = await db.insert(schema.officeSpaces).values({
    ownerId: user.id,
    ...data,
    isActive: true,
  }).returning();
  
  return space;
}

export async function updateOfficeSpace(id: string, data: Partial<{
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
  amenities?: string[];
  capacity: number;
  hourlyPrice?: number;
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  isActive?: boolean;
}>) {
  const [user] = await getServerUser();
  
  // Check ownership
  const existing = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Office space not found");
  }
  if (existing[0].ownerId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only edit your own spaces");
  }
  
  const [updated] = await db.update(schema.officeSpaces).set(data).where(eq(schema.officeSpaces.id, id)).returning();
  
  return updated;
}

export async function deleteOfficeSpace(id: string) {
  const [user] = await getServerUser();
  
  // Check ownership
  const existing = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1).execute();
  if (!existing.length) {
    throw new Error("Office space not found");
  }
  if (existing[0].ownerId !== user.id && user.userType !== "admin") {
    throw new Error("Unauthorized: You can only delete your own spaces");
  }
  
  // Soft delete: set is_active = false
  const [deleted] = await db.update(schema.officeSpaces).set({ isActive: false }).where(eq(schema.officeSpaces.id, id)).returning();
  
  return deleted;
}
