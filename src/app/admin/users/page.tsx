import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserX, Mail } from "lucide-react";

// Uses getServerUser which requires cookies - never statically generate
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminUsersPage() {
  const admin = await getServerUser();
  if (!admin || !["admin", "owner"].includes(admin.userType)) {
    redirect("/login");
  }

  let users: any[] = [];
  try {
    users = await db.select().from(schema.profiles).orderBy(schema.profiles.createdAt).execute();
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Verify, suspend, or manage user accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} total accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.fullName || "-"}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2 capitalize">{u.userType}</td>
                    <td className="py-2">
                      {u.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Suspended</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        {!u.emailVerified && (
                          <form action={`/api/admin/users/${u.id}/verify`} method="POST">
                            <Button size="sm" variant="outline" type="submit" title="Verify email">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </form>
                        )}
                        <form action={`/api/admin/users/${u.id}/toggle-suspend`} method="POST">
                          <Button size="sm" variant={u.isActive ? "destructive" : "default"} type="submit">
                            {u.isActive ? <UserX className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </form>
                        {/* TODO: Impersonate, Delete */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
