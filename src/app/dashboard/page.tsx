"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Package,
  Calendar,
  TrendingUp,
  Plus,
  List,
  ShoppingCart,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type UserType = "owner" | "merchant" | "customer" | string;

interface Stats {
  userType: UserType;
  spaces?: number;
  bookings?: number;
  revenue?: number;
  products?: number;
  orders?: number;
  sales?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => {
        if (r.status === 401) {
          // Not authenticated, redirect to login
          window.location.href = `/login?redirect_to=${encodeURIComponent('/dashboard')}`;
          return null;
        }
        return r;
      })
      .then(r => r?.json())
      .then(data => {
        if (data && data.error) {
          throw new Error(data.error);
        }
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard stats", err);
        setError(err.message || "Failed to load dashboard data");
        toast.error("Could not load dashboard data. Please log in again.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-destructive">Failed to load dashboard. Please log in again.</div>;
  }

  const userType = stats.userType as UserType;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {userType === "owner" && "Manage your office spaces and bookings"}
          {userType === "merchant" && "Manage your products and orders"}
          {userType === "customer" && "View your bookings and orders"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userType === "owner" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.spaces || 0}</div>
                <p className="text-xs text-muted-foreground">Office spaces</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bookings || 0}</div>
                <p className="text-xs text-muted-foreground">Total received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Number(stats.revenue || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Confirmed bookings</p>
              </CardContent>
            </Card>
          </>
        )}

        {userType === "merchant" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products || 0}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders || 0}</div>
                <p className="text-xs text-muted-foreground">Total received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Number(stats.sales || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Processing orders</p>
              </CardContent>
            </Card>
          </>
        )}

        {userType === "customer" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bookings || 0}</div>
                <p className="text-xs text-muted-foreground">Upcoming & past</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders || 0}</div>
                <p className="text-xs text-muted-foreground">Total placed</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Pending responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for {userType}s</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {userType === "owner" && (
              <>
                <Link href="/dashboard/office-spaces/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" /> List New Office Space
                  </Button>
                </Link>
                <Link href="/dashboard/office-spaces">
                  <Button variant="outline" className="w-full justify-start">
                    <List className="mr-2 h-4 w-4" /> Manage Listings
                  </Button>
                </Link>
                <Link href="/dashboard/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" /> View Bookings
                  </Button>
                </Link>
              </>
            )}
            {userType === "merchant" && (
              <>
                <Link href="/dashboard/products/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </Link>
                <Link href="/dashboard/products">
                  <Button variant="outline" className="w-full justify-start">
                    <List className="mr-2 h-4 w-4" /> Manage Products
                  </Button>
                </Link>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" /> View Orders
                  </Button>
                </Link>
              </>
            )}
            {userType === "customer" && (
              <>
                <Link href="/spaces">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" /> Browse Spaces
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" /> Browse Products
                  </Button>
                </Link>
                <Link href="/dashboard/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" /> My Bookings
                  </Button>
                </Link>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" /> My Orders
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete these steps to set up your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Create your account</p>
            <p>○ Verify your email</p>
            <p>○ Complete your profile</p>
            <p>○ Add your first listing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Helpful documentation and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="#" className="text-sm text-primary hover:underline">User Guide</a>
            <a href="#" className="text-sm text-primary hover:underline">API Documentation</a>
            <a href="#" className="text-sm text-primary hover:underline">Contact Support</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}