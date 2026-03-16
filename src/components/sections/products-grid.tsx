"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

interface Category {
  name: string;
  count: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

const categories: Category[] = [
  { name: "All Creatives", count: 189 },
  { name: "Mobile App", count: 50 },
  { name: "SaaS", count: 42 },
  { name: "Branding", count: 24 },
  { name: "Illustration", count: 29 },
];

const products: Product[] = [
  {
    id: 1,
    title: "Habit Tracker...",
    price: 69,
    category: "Tech & Design Fusion",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/m5dNIt912hxKgo5KpJfhi3O94-7.png",
  },
  {
    id: 2,
    title: "Advaz Buy & Sell...",
    price: 79,
    category: "Innovative Branding",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/kIgbiN5NKUbAv3VfelD0eBSWA-8.png",
  },
  {
    id: 3,
    title: "Watch Store ECo...",
    price: 59,
    category: "Tech & Design Fusion",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/HP3cxtyPE61nFTzLwQFxDPwQRi8-9.png",
  },
  {
    id: 4,
    title: "Split Bill Mobile...",
    price: 69,
    category: "Tech & Design Fusion",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/q20l8q2kFCcjoo0wWo6uIXhyO0-10.png",
  },
  {
    id: 5,
    title: "Real Estate Mobile....",
    price: 69,
    category: "Tech & Design Fusion",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/scXYK2Tg7EtX5EvCurM8Q7zjEOk-11.png",
  },
  {
    id: 6,
    title: "WPStar Testimonial...",
    price: 79,
    category: "Innovative Branding",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/kEfwZyqh7Pj4BuBKGcxJDpUygs-12.png",
  },
  {
    id: 7,
    title: "Personal Portfolio...",
    price: 59,
    category: "Modern Digital Identity",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/uEaR4fSDvsXqbGYOALio2Sdjpm0-13.png",
  },
  {
    id: 8,
    title: "Energ - EV Charging...",
    price: 69,
    category: "Innovative Branding",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/oGB794TPNV6yTGfneRd9GDGUME-14.png",
  },
];

const ProductsGrid = () => {
  const [activeCategory, setActiveCategory] = useState("All Creatives");

  return (
    <section className="w-full bg-white py-20 font-inter lg:py-[120px]">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 md:px-10 lg:px-20">
        <div className="flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <p className="text-base font-semibold text-primary">Products</p>
          </div>
          <h2 className="text-center text-4xl font-bold leading-[1.2] tracking-[-0.01em] text-dark-navy lg:text-5xl">
            Explore Unique
            <br />
            Digital Creations Built For You
          </h2>
        </div>
        
        <div className="mt-[62px] flex flex-wrap justify-center gap-4">
          {categories.map((category) => {
            const isActive = category.name === activeCategory;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-[#F7F7F7] text-dark-navy hover:bg-gray-200"
                }`}
              >
                {category.name}
                <span
                  className={`flex h-6 items-center justify-center rounded-full px-2 text-[13px] font-semibold ${
                    isActive
                      ? "bg-white text-primary"
                      : "bg-[#E8EDF5] text-dark-navy"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <a href="#" key={product.id} className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(26,31,58,0.08)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(26,31,58,0.12)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute right-4 top-4 rounded-md bg-primary px-3 py-1.5 text-base font-semibold text-white">
                  ${product.price}
                </div>
              </div>
              <div className="flex flex-col gap-2 px-6 pb-6">
                <h3 className="text-2xl font-semibold text-dark-navy">{product.title}</h3>
                <p className="text-[13px] font-medium text-medium-gray">{product.category}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;