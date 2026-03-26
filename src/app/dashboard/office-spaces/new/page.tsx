import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import OfficeSpaceForm from "@/components/office/office-space-form";

export default async function NewOfficeSpacePage() {
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  // Only owners and admins can create office spaces
  if (user.userType !== "owner" && user.userType !== "admin") {
    redirect("/dashboard/office-spaces");
  }

  return <OfficeSpaceForm />;
}
