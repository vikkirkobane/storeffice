"use client";

import { useState } from "react";
import { createOfficeSpace } from "@/lib/actions/office-spaces";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const officeSpaceSchema = z.object({
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
  amenities: z.array(z.string()).default([]),
  capacity: z.number().int().positive(),
  hourlyPrice: z.number().nonnegative().optional(),
  dailyPrice: z.number().nonnegative().optional(),
  weeklyPrice: z.number().nonnegative().optional(),
  monthlyPrice: z.number().nonnegative().optional(),
});

type OfficeSpaceInput = z.infer<typeof officeSpaceSchema>;

export default function NewOfficeSpaceButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfficeSpaceInput>({
    resolver: zodResolver(officeSpaceSchema),
  });

  const onSubmit = async (data: OfficeSpaceInput) => {
    setLoading(true);
    setError(null);

    try {
      await createOfficeSpace(data);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create space");
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
        + New Office Space
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">List New Office Space</h2>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity (people)</label>
                    <input {...register("capacity", { valueAsNumber: true })} type="number" min={1} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Price ($)</label>
                    <input {...register("hourlyPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Price ($)</label>
                    <input {...register("dailyPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weekly Price ($)</label>
                    <input {...register("weeklyPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
                    <input {...register("monthlyPrice", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Space"}
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
