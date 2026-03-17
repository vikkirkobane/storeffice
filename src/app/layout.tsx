import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storeffice - Office Spaces & Marketplace",
  description: "Book office spaces, rent storage, and shop products in one unified platform.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="flex-shrink-0 flex items-center">
                    <img src="/storeffice-logo.png" alt="Storeffice" className="h-8 w-auto mr-2" />
                    <span className="font-bold text-xl text-green-600">Storeffice</span>
                  </a>
                  <div className="hidden md:ml-6 md:flex md:space-x-4">
                    <a href="/spaces" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Spaces</a>
                    <a href="/storage" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Storage</a>
                    <a href="/products" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Products</a>
                    <a href="/about" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">About</a>
                    <a href="/contact" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Contact</a>
                  </div>
                </div>
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <a href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Sign in</a>
                  <a href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Get started</a>
                </div>
                <div className="md:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  {/* Mobile menu button */}
                  <button className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 p-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>
          {children}
          <footer className="bg-white dark:bg-gray-900 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Storeffice. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
