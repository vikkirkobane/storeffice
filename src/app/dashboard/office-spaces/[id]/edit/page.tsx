import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import OfficeSpaceForm from "@/components/office/office-space-form";

export default async function EditOfficeSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch the office space data
  const { db, schema } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");
  
  const [space] = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1).execute();
  
  if (!space) {
    redirect("/dashboard/office-spaces");
  }

  // Authorization: only owner or admin can edit
  if (space.ownerId !== user.id && user.userType !== "admin") {
    redirect("/dashboard/office-spaces");
  }

  return <OfficeSpaceForm spaceId={id} initialData={space} />;
}
