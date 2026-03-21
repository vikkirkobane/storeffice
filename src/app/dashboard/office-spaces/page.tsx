import { getServerUser } from "@/lib/auth-core";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Pencil, Trash2, Plus, Building2 } from "lucide-react";

// Requires auth and DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardOfficeSpacesPage() {
  const [user] = await getServerUser();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Please log in.</p>
      </div>
    );
  }

  let mySpaces: any[] = [];
  if (user.userType === "owner" || user.userType === "admin") {
    try {
      mySpaces = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.ownerId, user.id)).execute();
    } catch (error) {
      console.error("Failed to fetch office spaces:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Office Spaces</h1>
          <p className="text-muted-foreground">
            Manage your office space listings
          </p>
        </div>
        {(user.userType === "owner" || user.userType === "admin") && (
          <Link href="/dashboard/office-spaces/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Space
            </Button>
          </Link>
        )}
      </div>

      {user.userType !== "owner" && user.userType !== "admin" ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Not an Owner</h3>
            <p className="text-muted-foreground mt-2">
              Only owners can manage office space listings. Upgrade your account to list spaces.
            </p>
          </CardContent>
        </Card>
      ) : mySpaces.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No spaces yet</h3>
            <p className="text-muted-foreground mt-2">
              Get started by adding your first office space.
            </p>
            <Link href="/dashboard/office-spaces/new" className="mt-4 inline-block">
              <Button>Add Space</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySpaces.map((space) => (
            <Card key={space.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{space.title}</CardTitle>
                  <Badge variant={space.isActive ? "default" : "secondary"}>
                    {space.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {space.address}, {space.city}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Capacity: {space.capacity} people</p>
                  {space.hourlyPrice && <p>Hourly: ${space.hourlyPrice}</p>}
                  {space.dailyPrice && <p>Daily: ${space.dailyPrice}</p>}
                  {space.monthlyPrice && <p>Monthly: ${space.monthlyPrice}</p>}
                  {space.photos && space.photos.length > 0 && (
                    <p>{space.photos.length} photo(s)</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Link href={`/spaces/${space.id}`} target="_blank">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <div className="flex gap-2">
                  <Link href={`/dashboard/office-spaces/${space.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  {/* TODO: Delete button with confirmation */}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
