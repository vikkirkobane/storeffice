import { Suspense } from "react";
import { getStorageSpaces } from "@/lib/actions/storage-spaces";
import StorageSpacesList from "@/components/dashboard/storage-spaces-list";
import NewStorageSpaceButton from "@/components/dashboard/new-storage-space-button";

export default async function StorageSpacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Storage Spaces</h1>
        <NewStorageSpaceButton />
      </div>

      <Suspense fallback={<div className="text-gray-500">Loading storage spaces...</div>}>
        <StorageSpacesList />
      </Suspense>
    </div>
  );
}
