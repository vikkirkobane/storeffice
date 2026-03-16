import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { officeSpaces, storageSpaces, products } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { z } from "zod";

const officeSpaceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("USA"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photos: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  capacity: z.number().int().positive("Capacity must be positive"),
  hourlyPrice: z.number().nonnegative().optional(),
  dailyPrice: z.number().nonnegative().optional(),
  weeklyPrice: z.number().nonnegative().optional(),
  monthlyPrice: z.number().nonnegative().optional(),
});

type OfficeSpaceInput = z.infer<typeof officeSpaceSchema>;

export async function createOfficeSpace(data: OfficeSpaceInput) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = officeSpaceSchema.parse(data);

  const [space] = await db
    .insert(officeSpaces)
    .values({
      ...validated,
      ownerId: session.user.id,
    })
    .returning();

  revalidatePath("/dashboard/spaces");
  revalidatePath("/");
  return space;
}

export async function updateOfficeSpace(id: string, data: Partial<OfficeSpaceInput>) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Check ownership
  const existing = await db.select().from(officeSpaces).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].ownerId !== session.user.id) {
    throw new Error("Not authorized");
  }

  const [space] = await db
    .update(officeSpaces)
    .set(data)
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath("/dashboard/spaces");
  revalidatePath("/");
  return space;
}

export async function deleteOfficeSpace(id: string) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.select().from(officeSpaces).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].ownerId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await db.delete(officeSpaces).where(sql`id = ${id}`).execute();
  revalidatePath("/dashboard/spaces");
  revalidatePath("/");
  return { success: true };
}

export async function getOfficeSpaces() {
  const session = await auth.getSession();
  const userId = session?.user?.id;

  // Public: show all active spaces; Owner: show own including inactive
  const query = db.select().from(officeSpaces).orderBy(sql`created_at DESC`);
  if (userId) {
    // Show user's own spaces, include inactive for owners
    return query.where(sql`owner_id = ${userId}`).limit(100);
  } else {
    // Public: only active spaces
    return query.where(sql`is_active = true`).limit(100);
  }
}
