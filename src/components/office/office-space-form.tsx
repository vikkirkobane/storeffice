"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface OfficeSpaceFormProps {
  spaceId?: string;
  initialData?: any;
}

export default function OfficeSpaceForm({ spaceId, initialData }: OfficeSpaceFormProps) {
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
    capacity: initialData?.capacity?.toString() || "",
    hourlyPrice: initialData?.hourlyPrice?.toString() || "",
    dailyPrice: initialData?.dailyPrice?.toString() || "",
    weeklyPrice: initialData?.weeklyPrice?.toString() || "",
    monthlyPrice: initialData?.monthlyPrice?.toString() || "",
    photos: initialData?.photos?.join(", ") || "",
    amenities: initialData?.amenities?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        hourlyPrice: formData.hourlyPrice ? Number(formData.hourlyPrice) : undefined,
        dailyPrice: formData.dailyPrice ? Number(formData.dailyPrice) : undefined,
        weeklyPrice: formData.weeklyPrice ? Number(formData.weeklyPrice) : undefined,
        monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : undefined,
        photos: formData.photos ? formData.photos.split(",").map((s) => s.trim()).filter(Boolean) : [],
        amenities: formData.amenities ? formData.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      const url = spaceId ? `/api/office-spaces/${spaceId}` : "/api/office-spaces";
      const method = spaceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save office space");
      }

      toast.success(spaceId ? "Office space updated!" : "Office space created!");
      router.push("/dashboard/office-spaces");
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
        <CardTitle>{spaceId ? "Edit Office Space" : "Add New Office Space"}</CardTitle>
        <CardDescription>
          {spaceId ? "Update the details of your office space." : "Fill in the details to list your office space."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (people) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pricing (per day or hour)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyPrice">Hourly (USD)</Label>
                <Input
                  id="hourlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyPrice}
                  onChange={(e) => handleChange("hourlyPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyPrice">Daily (USD)</Label>
                <Input
                  id="dailyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dailyPrice}
                  onChange={(e) => handleChange("dailyPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyPrice">Weekly (USD)</Label>
                <Input
                  id="weeklyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weeklyPrice}
                  onChange={(e) => handleChange("weeklyPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly (USD)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleChange("monthlyPrice", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos">Photo URLs (comma separated)</Label>
            <Textarea
              id="photos"
              value={formData.photos}
              onChange={(e) => handleChange("photos", e.target.value)}
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              rows={2}
            />
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma separated)</Label>
            <Textarea
              id="amenities"
              value={formData.amenities}
              onChange={(e) => handleChange("amenities", e.target.value)}
              placeholder="wifi, parking, coffee, air conditioning"
              rows={2}
            />
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
