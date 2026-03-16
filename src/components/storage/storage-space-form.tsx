"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StorageSpaceFormProps {
  spaceId?: string;
  initialData?: any;
}

export default function StorageSpaceForm({ spaceId, initialData }: StorageSpaceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "USA",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    storageType: initialData?.storageType || "room",
    lengthFt: initialData?.lengthFt?.toString() || "",
    widthFt: initialData?.widthFt?.toString() || "",
    heightFt: initialData?.heightFt?.toString() || "",
    features: initialData?.features?.join(", ") || "",
    monthlyPrice: initialData?.monthlyPrice?.toString() || "",
    annualPrice: initialData?.annualPrice?.toString() || "",
    photos: initialData?.photos?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        storageType: formData.storageType as "shelf" | "room" | "warehouse",
        lengthFt: formData.lengthFt ? Number(formData.lengthFt) : undefined,
        widthFt: formData.widthFt ? Number(formData.widthFt) : undefined,
        heightFt: formData.heightFt ? Number(formData.heightFt) : undefined,
        monthlyPrice: Number(formData.monthlyPrice),
        annualPrice: formData.annualPrice ? Number(formData.annualPrice) : undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        features: formData.features ? formData.features.split(",").map((s) => s.trim()).filter(Boolean) : [],
        photos: formData.photos ? formData.photos.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      const url = spaceId ? `/api/storage-spaces/${spaceId}` : "/api/storage-spaces";
      const method = spaceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save storage space");
      }

      toast.success(spaceId ? "Storage space updated!" : "Storage space created!");
      router.push("/dashboard/storage");
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
        <CardTitle>{spaceId ? "Edit Storage Space" : "Add New Storage Space"}</CardTitle>
        <CardDescription>
          {spaceId ? "Update storage space details." : "List your storage space for rent."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageType">Type *</Label>
              <Select value={formData.storageType} onValueChange={(v) => handleChange("storageType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shelf">Shelf</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} />
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input id="state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                <Input id="zipCode" value={formData.zipCode} onChange={(e) => handleChange("zipCode", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dimensions (feet)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lengthFt">Length</Label>
                <Input id="lengthFt" type="number" step="0.1" value={formData.lengthFt} onChange={(e) => handleChange("lengthFt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widthFt">Width</Label>
                <Input id="widthFt" type="number" step="0.1" value={formData.widthFt} onChange={(e) => handleChange("widthFt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightFt">Height</Label>
                <Input id="heightFt" type="number" step="0.1" value={formData.heightFt} onChange={(e) => handleChange("heightFt", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price (USD) *</Label>
                <Input id="monthlyPrice" type="number" min="0" step="0.01" value={formData.monthlyPrice} onChange={(e) => handleChange("monthlyPrice", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualPrice">Annual Price (USD, optional)</Label>
                <Input id="annualPrice" type="number" min="0" step="0.01" value={formData.annualPrice} onChange={(e) => handleChange("annualPrice", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma separated)</Label>
            <Textarea id="features" value={formData.features} onChange={(e) => handleChange("features", e.target.value)} placeholder="climate control, 24/7 access, security" rows={2} />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos">Photo URLs (comma separated)</Label>
            <Textarea id="photos" value={formData.photos} onChange={(e) => handleChange("photos", e.target.value)} placeholder="https://example.com/1.jpg, https://example.com/2.jpg" rows={2} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {spaceId ? "Update" : "Create"} Space
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
