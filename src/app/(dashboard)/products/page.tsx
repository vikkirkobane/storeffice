import { Suspense } from "react";
import { getProducts } from "@/lib/actions/products";
import ProductsList from "@/components/dashboard/products-list";
import NewProductButton from "@/components/dashboard/new-product-button";

export default async function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <NewProductButton />
      </div>

      <Suspense fallback={<div className="text-gray-500">Loading products...</div>}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
