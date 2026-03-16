import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import StorageSpaceForm from "@/components/storage/storage-space-form";

export default async function EditStoragePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  const { db, schema } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");
  
  const [space] = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1).execute();
  
  if (!space) {
    redirect("/dashboard/storage");
  }

  if (space.ownerId !== user.id && user.userType !== "admin") {
    redirect("/dashboard/storage");
  }

  return <StorageSpaceForm spaceId={id} initialData={space} />;
}
