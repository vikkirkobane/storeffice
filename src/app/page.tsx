import type { Metadata } from "next";
import HomePageClient from "./page-client";

export const metadata: Metadata = {
  title: "Storeffice — Office Spaces, Storage & Marketplace",
  description: "Discover, book, and manage office spaces, storage, and products in one unified platform. Trusted by businesses across Africa and beyond.",
};

export default function HomePage() {
  return <HomePageClient />;
}
