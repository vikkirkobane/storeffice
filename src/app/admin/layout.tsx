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
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Storeffice Admin</h1>
          <span className="text-sm text-muted-foreground">Logged in as <span className="text-emerald-400 font-medium">{user.fullName}</span> ({user.userType})</span>
        </div>
      </header>
      <div className="flex">
        <AdminNav />
        <main className="flex-1 p-8 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
