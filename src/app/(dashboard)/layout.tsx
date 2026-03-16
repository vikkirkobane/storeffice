import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import Sidebar from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav user={session.user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
