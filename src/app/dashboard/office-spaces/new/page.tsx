import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import OfficeSpaceForm from "@/components/office/office-space-form";

export const dynamic = 'force-dynamic';

export default async function NewOfficeSpacePage() {
  const userResult = await getServerUser();
  const user = userResult?.[0];
  
  if (!user) {
    redirect("/login");
  }

  // Only owners and admins can create office spaces
  if (user.userType !== "owner" && user.userType !== "admin") {
    redirect("/dashboard/office-spaces");
  }

  return <OfficeSpaceForm />;
}
