import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Uses getServerUser which requires cookies - never statically generate
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminReviewsPage() {
  const admin = await getServerUser();
  if (!admin || !["admin", "owner"].includes(admin.userType)) {
    redirect("/login");
  }

  // Fetch all reviews with user info (join profiles)
  let reviews: any[] = [];
  try {
    const result = await db.select({
      id: schema.reviews.id,
      userId: schema.reviews.userId,
      targetId: schema.reviews.targetId,
      targetType: schema.reviews.targetType,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      createdAt: schema.reviews.createdAt,
      userFullName: schema.profiles.fullName,
    }).from(schema.reviews)
      .innerJoin(schema.profiles, eq(schema.reviews.userId, schema.profiles.id))
      .orderBy(schema.reviews.createdAt)
      .limit(50)
      .execute();
    reviews = result;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    // Keep empty array on error
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews Moderation</h1>
        <p className="text-muted-foreground">Moderate user reviews and responses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>{reviews.length} total reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Rating</th>
                  <th className="text-left py-2">Comment</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.userFullName || r.userId.slice(0, 8)}</td>
                    <td className="py-2">{r.targetId.slice(0, 8)}</td>
                    <td className="py-2">{r.targetType}</td>
                    <td className="py-2">{r.rating}/5</td>
                    <td className="py-2 max-w-md truncate">{r.comment || "-"}</td>
                    <td className="py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <form action={`/api/admin/reviews/${r.id}/delete`} method="POST">
                        <Button size="sm" variant="destructive" type="submit">Delete</Button>
                      </form>
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
