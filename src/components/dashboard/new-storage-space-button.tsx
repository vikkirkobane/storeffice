"use client";

import { useState } from "react";
import { createStorageSpace } from "@/lib/actions/storage-spaces";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const storageSpaceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default("USA"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photos: z.array(z.string()).default([]),
  storageType: z.enum(["shelf", "room", "warehouse"]),
  lengthFt: z.number().positive().optional(),
  widthFt: z.number().positive().optional(),
  heightFt: z.number().positive().optional(),
  features: z.array(z.string()).default([]),
  monthlyPrice: z.number().nonnegative(),
  annualPrice: z.number().nonnegative().optional(),
});

type StorageSpaceInput = z.infer<typeof storageSpaceSchema>;

export default function NewStorageSpaceButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StorageSpaceInput>({
    resolver: zodResolver(storageSpaceSchema),
  });

  const onSubmit = async (data: StorageSpaceInput) => {
    setLoading(true);
    setError(null);
    try {
      await createStorageSpace(data);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create storage space");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + New Storage Space
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">List New Storage Space</h2>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input {...register("title")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea {...register("description")} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input {...register("address")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input {...register("city")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input {...register("state")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input {...register("zipCode")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input {...register("country")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Type</label>
                  <select {...register("storageType")} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="shelf">Shelf</option>
                    <option value="room">Room</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Length (ft)</label>
                    <input {...register("lengthFt", { valueAsNumber: true })} type="number" min={0} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Width (ft)</label>
                    <input {...register("widthFt", { valueAsNumber: true })} type="number" min={0} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Height (ft)</label>
                    <input {...register("heightFt", { valueAsNumber: true })} type="number" min={0} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                  <input {...register("features")} type="text" placeholder="climate control, security, forklift" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  <p className="text-xs text-gray-500">Enter comma-separated values</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
                    <input {...register("monthlyPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Annual Price ($, optional)</label>
                    <input {...register("annualPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Storage Space"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
