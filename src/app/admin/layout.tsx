import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user || !["admin", "owner", "merchant"].includes(user.userType)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Storeffice Admin</h1>
          <span className="text-sm text-gray-600">Logged in as {user.fullName} ({user.userType})</span>
        </div>
      </header>
      <div className="flex">
        <AdminNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
