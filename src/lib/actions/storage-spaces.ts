import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageSpaces } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";

const storageSpaceSchema = z.object({
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
  storageType: z.enum(["shelf", "room", "warehouse"]),
  lengthFt: z.number().positive().optional(),
  widthFt: z.number().positive().optional(),
  heightFt: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  monthlyPrice: z.number().nonnegative(),
  annualPrice: z.number().nonnegative().optional(),
});

type StorageSpaceInput = z.infer<typeof storageSpaceSchema>;

export async function createStorageSpace(data: StorageSpaceInput) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = storageSpaceSchema.parse(data);

  const [space] = await db
    .insert(storageSpaces)
    .values({
      ...validated,
      ownerId: session.user.id,
    })
    .returning();

  revalidatePath("/dashboard/storage");
  revalidatePath("/");
  return space;
}

export async function updateStorageSpace(id: string, data: Partial<StorageSpaceInput>) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.select().from(storageSpaces).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].ownerId !== session.user.id) {
    throw new Error("Not authorized");
  }

  const [space] = await db
    .update(storageSpaces)
    .set(data)
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath("/dashboard/storage");
  revalidatePath("/");
  return space;
}

export async function deleteStorageSpace(id: string) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.select().from(storageSpaces).where(sql`id = ${id}`).limit(1);
  if (!existing || existing[0].ownerId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await db.delete(storageSpaces).where(sql`id = ${id}`).execute();
  revalidatePath("/dashboard/storage");
  revalidatePath("/");
  return { success: true };
}

export async function getStorageSpaces() {
  const session = await auth.getSession();
  const userId = session?.user?.id;

  const query = db.select().from(storageSpaces).orderBy(sql`created_at DESC`);
  if (userId) {
    return query.where(sql`owner_id = ${userId}`).limit(100);
  } else {
    return query.where(sql`is_active = true`).limit(100);
  }
}
