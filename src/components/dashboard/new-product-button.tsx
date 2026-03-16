"use client";

import { useState } from "react";
import { createProduct } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  price: z.number().positive(),
  inventory: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  images: z.array(z.string()).default([]),
  storageId: z.string().uuid().optional(),
});

type ProductInput = z.infer<typeof productSchema>;

export default function NewProductButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductInput) => {
    setLoading(true);
    setError(null);
    try {
      await createProduct(data);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
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
        + New Product
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Product</h2>
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
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input {...register("category")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subcategory (optional)</label>
                    <input {...register("subcategory")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inventory (qty)</label>
                    <input {...register("inventory", { valueAsNumber: true })} type="number" min={0} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU (optional)</label>
                  <input {...register("sku")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URLs (one per line)</label>
                  <textarea
                    {...register("images")}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                  <p className="text-xs text-gray-500">Enter one image URL per line</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Location (optional)</label>
                  <input {...register("storageId")} type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  <p className="text-xs text-gray-500">UUID of storage space where product is kept</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Product"}
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
