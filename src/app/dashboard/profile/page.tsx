import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <div className="mt-1 text-gray-900">{user.fullName}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 text-gray-900">{user.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User Type</label>
          <div className="mt-1 text-gray-900 capitalize">{user.userType}</div>
        </div>
        <div className="pt-4">
          <Button asChild>
            <Link href="/dashboard/settings">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
