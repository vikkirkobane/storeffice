import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Uses getServerUser - must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2 text-sm italic">You can manage your account and preferences here.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
            <div className="text-lg font-medium text-foreground">{user.fullName || "Not set"}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
            <div className="text-lg font-medium text-foreground">{user.email}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Account Type</label>
            <Badge variant="secondary" className="mt-1 capitalize px-3 py-1 bg-emerald-500/10 text-emerald-400 border-none">
              {user.userType}
            </Badge>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <Button asChild className="h-11 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90">
            <Link href="/dashboard/settings">Edit Profile Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
