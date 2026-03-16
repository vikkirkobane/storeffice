import { Suspense } from "react";
import { getOfficeSpaces } from "@/lib/actions/office-spaces";
import OfficeSpacesList from "@/components/dashboard/office-spaces-list";
import NewOfficeSpaceButton from "@/components/dashboard/new-office-space-button";

export default async function OfficeSpacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Office Spaces</h1>
        <NewOfficeSpaceButton />
      </div>

      <Suspense fallback={<div className="text-gray-500">Loading spaces...</div>}>
        <OfficeSpacesList />
      </Suspense>
    </div>
  );
}
