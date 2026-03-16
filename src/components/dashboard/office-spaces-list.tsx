"use client";

import { useEffect, useState } from "react";
import { deleteOfficeSpace } from "@/lib/actions/office-spaces";
import { useRouter } from "next/navigation";

interface OfficeSpace {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  hourlyPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  isActive: boolean;
  createdAt: string;
}

export default function OfficeSpacesList() {
  const [spaces, setSpaces] = useState<OfficeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/spaces")
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this space?")) return;
    try {
      await deleteOfficeSpace(id);
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete space");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (spaces.length === 0) return <div className="text-gray-500">No office spaces yet. Create one!</div>;

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
                    {space.address}, {space.city}, {space.state} • Capacity: {space.capacity}
                  </p>
                  <div className="mt-1 flex gap-2 text-sm text-gray-600">
                    {space.hourlyPrice && <span>${space.hourlyPrice}/hr</span>}
                    {space.dailyPrice && <span>${space.dailyPrice}/day</span>}
                    {space.monthlyPrice && <span>${space.monthlyPrice}/mo</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${space.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {space.isActive ? "Active" : "Inactive"}
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
