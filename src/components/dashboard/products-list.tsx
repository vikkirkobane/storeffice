"use client";

import { useEffect, useState } from "react";
import { deleteProduct } from "@/lib/actions/products";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  inventory: number;
  sku?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (products.length === 0) return <div className="text-gray-500">No products yet. Add one!</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
          {product.images[0] && (
            <img src={product.images[0]} alt={product.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-bold text-gray-900">{product.title}</h3>
            <p className="text-sm text-gray-600">{product.category} {product.subcategory && `• ${product.subcategory}`}</p>
            <p className="text-lg font-semibold text-indigo-600 mt-2">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Inventory: {product.inventory}</p>
            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
            <div className="mt-3 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {product.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
