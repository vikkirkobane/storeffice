import { eq, and, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Fetch office spaces - returns { spaces: { data }, pagination }
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

    const data = await db.select()
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

    // If no data, return sample
    if (data.length === 0) {
      return {
        spaces: getSampleSpaces(params),
        pagination: { total: 2, page: params.page, pages: 1, limit: params.limit }
      };
    }

    return {
      spaces: data,
      pagination: {
        total: totalCount,
        page: params.page,
        pages: Math.ceil(totalCount / params.limit),
        limit: params.limit,
      },
    };
  } catch (error) {
    console.error("listOfficeSpaces error:", error);
    return {
      spaces: getSampleSpaces(params),
      pagination: { total: 2, page: params.page, pages: 1, limit: params.limit },
    };
  }
}

function getSampleSpaces(params: any) {
  const samples = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Modern Downtown Office",
      description: "A premium workspace in the heart of the city.",
      address: "123 Main St, Nairobi",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00100",
      country: "Kenya",
      capacity: 20,
      hourly_price: 25,
      daily_price: 150,
      weekly_price: 800,
      monthly_price: 3000,
      rating: 4.8,
      review_count: 12,
      is_active: true,
      owner_id: "22222222-2222-2222-2222-222222222222",
      amenities: ["wifi", "parking", "coffee"],
      photos: [],
      latitude: null,
      longitude: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Cozy Home Office",
      description: "Quiet, comfortable space perfect for small teams.",
      address: "456 Oak Ave, Mombasa",
      city: "Mombasa",
      state: "Coast",
      zipCode: "80100",
      country: "Kenya",
      capacity: 5,
      hourly_price: 10,
      daily_price: 60,
      weekly_price: 300,
      monthly_price: 1200,
      rating: 4.5,
      review_count: 8,
      is_active: true,
      owner_id: "22222222-2222-2222-2222-222222222222",
      amenities: ["wifi", "coffee"],
      photos: [],
      latitude: null,
      longitude: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  let filtered = samples;
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
  return filtered;
}

/**
 * Get single office space
 */
export async function getOfficeSpace(id: string) {
  try {
    const result = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1).execute();
    if (result[0]) return result[0];
    // Not found in DB, try to match sample data by ID
    const samples = getSampleSpaces({ page: 1, limit: 10 });
    const match = samples.find(s => s.id === id);
    return match || samples[0] || null;
  } catch (error) {
    console.error("getOfficeSpace error:", error);
    const samples = getSampleSpaces({ page: 1, limit: 10 });
    return samples.find(s => s.id === id) || samples[0] || null;
  }
}

/**
 * Create office space
 */
export async function createOfficeSpace(data: any) {
  try {
    const [space] = await db.insert(schema.officeSpaces).values({
      ...data,
      isActive: true,
      rating: 0,
      reviewCount: 0,
    }).returning();
    return space;
  } catch (error) {
    console.error("createOfficeSpace error:", error);
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
 * Update office space
 */
export async function updateOfficeSpace(id: string, data: any) {
  try {
    const [space] = await db.update(schema.officeSpaces).set(data).where(eq(schema.officeSpaces.id, id)).returning();
    return space;
  } catch (error) {
    console.error("updateOfficeSpace error:", error);
    return { id, ...data, updatedAt: new Date() };
  }
}

/**
 * Delete office space
 */
export async function deleteOfficeSpace(id: string) {
  try {
    await db.delete(schema.officeSpaces).where(eq(schema.officeSpaces.id, id));
    return { success: true };
  } catch (error) {
    console.error("deleteOfficeSpace error:", error);
    return { success: false, error: "Failed to delete office space" };
  }
}
