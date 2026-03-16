"use client";

import { useEffect, useState } from "react";
import { deleteStorageSpace } from "@/lib/actions/storage-spaces";
import { useRouter } from "next/navigation";

interface StorageSpace {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  storageType: string;
  lengthFt?: number;
  widthFt?: number;
  heightFt?: number;
  monthlyPrice: number;
  annualPrice?: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function StorageSpacesList() {
  const [spaces, setSpaces] = useState<StorageSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/storage")
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this storage space?")) return;
    try {
      await deleteStorageSpace(id);
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete storage space");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (spaces.length === 0) return <div className="text-gray-500">No storage spaces yet. Create one!</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {spaces.map((space) => (
          <li key={space.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{space.title}</h3>
                  <p className="text-sm text-gray-500">
                    {space.address}, {space.city}, {space.state} • {space.storageType}
                  </p>
                  <div className="mt-1 text-sm text-gray-600">
                    ${space.monthlyPrice}/mo
                    {space.annualPrice && <span> (${space.annualPrice}/yr)</span>}
                  </div>
                  {space.lengthFt && space.widthFt && (
                    <p className="text-xs text-gray-500">
                      Dimensions: {space.lengthFt}' x {space.widthFt}' x {space.heightFt || "?"}'
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${space.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {space.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${space.isAvailable ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                    {space.isAvailable ? "Available" : "Rented"}
                  </span>
                  <button
                    onClick={() => handleDelete(space.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
