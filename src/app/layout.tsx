import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storeffice - Office Spaces & Marketplace",
  description: "Book office spaces, rent storage, and shop products in one unified platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex-shrink-0 flex items-center">
                  <span className="font-bold text-xl text-indigo-600">Storeffice</span>
                </a>
                <div className="hidden md:ml-6 md:flex md:space-x-4">
                  <a href="/spaces" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Spaces</a>
                  <a href="/storage" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Storage</a>
                  <a href="/products" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Products</a>
                  <a href="/about" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">About</a>
                  <a href="/contact" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Contact</a>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-4">
                <a href="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Sign in</a>
                <a href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Get started</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Storeffice. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
