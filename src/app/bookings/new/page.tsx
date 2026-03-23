import { getOfficeSpace } from "@/lib/actions/office-spaces";
import NewBookingClient from "./new-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewBookingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const spaceId = params.spaceId as string | undefined;

  if (!spaceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Missing Space ID</h1>
          <p className="text-muted-foreground">Please select a space to book.</p>
        </div>
      </div>
    );
  }

  const space = await getOfficeSpace(spaceId);

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Space Not Found</h1>
          <p className="text-muted-foreground">The office space you're trying to book doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <NewBookingClient space={space} />;
}
