import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Warehouse, Pencil } from "lucide-react";

export default async function DashboardStoragePage() {
  const [user] = await getServerUser();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Please log in.</p>
      </div>
    );
  }

  const mySpaces = user.userType === "merchant" || user.userType === "owner" || user.userType === "admin"
    ? await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.ownerId, user.id)).execute()
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage Spaces</h1>
          <p className="text-muted-foreground">Manage your storage unit listings</p>
        </div>
        {(user.userType === "merchant" || user.userType === "owner" || user.userType === "admin") && (
          <Link href="/dashboard/storage/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Space
            </Button>
          </Link>
        )}
      </div>

      {!["merchant", "owner", "admin"].includes(user.userType) ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Warehouse className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Not Authorized</h3>
            <p className="text-muted-foreground mt-2">
              Only merchants and owners can manage storage spaces.
            </p>
          </CardContent>
        </Card>
      ) : mySpaces.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Warehouse className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No storage spaces yet</h3>
            <p className="text-muted-foreground mt-2">
              Add a storage space to start renting to merchants.
            </p>
            <Link href="/dashboard/storage/new" className="mt-4 inline-block">
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
                  <Badge variant={space.isActive && space.isAvailable ? "default" : "secondary"}>
                    {space.isAvailable ? "Available" : "Rented"}
                  </Badge>
                </div>
                <CardDescription>
                  {space.city}, {space.state} • {space.storageType}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Size: {space.lengthFt?.toFixed(0) || 0}' × {space.widthFt?.toFixed(0) || 0}'</p>
                  <p>Monthly: ${space.monthlyPrice}</p>
                  {space.features && space.features.length > 0 && (
                    <p>{space.features.length} features</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Link href={`/storage/${space.id}`} target="_blank">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link href={`/dashboard/storage/${space.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
