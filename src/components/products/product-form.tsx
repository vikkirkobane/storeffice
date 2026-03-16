"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  productId?: string;
  initialData?: any;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    subcategory: initialData?.subcategory || "",
    price: initialData?.price?.toString() || "",
    inventory: initialData?.inventory?.toString() || "",
    sku: initialData?.sku || "",
    images: initialData?.images?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        inventory: formData.inventory ? Number(formData.inventory) : 0,
        images: formData.images ? formData.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(productId ? "Product updated!" : "Product created!");
      router.push("/dashboard/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{productId ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {productId ? "Update product details." : "Add a product to sell in the marketplace."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input id="sku" value={formData.sku} onChange={(e) => handleChange("sku", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input id="category" value={formData.category} onChange={(e) => handleChange("category", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input id="subcategory" value={formData.subcategory} onChange={(e) => handleChange("subcategory", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventory">Inventory Quantity</Label>
            <Input id="inventory" type="number" min="0" value={formData.inventory} onChange={(e) => handleChange("inventory", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Image URLs (comma separated)</Label>
            <Textarea id="images" value={formData.images} onChange={(e) => handleChange("images", e.target.value)} rows={2} placeholder="https://example.com/1.jpg, https://example.com/2.jpg" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update" : "Create"} Product
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
