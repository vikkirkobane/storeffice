"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity?: number;
  children?: React.ReactNode;
}

export default function AddToCartButton({ productId, title, price, image, quantity = 1, children }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ productId, title, price, image, quantity });
    setAdded(true);
    toast.success("Added to cart!");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button onClick={handleAdd} disabled={added} size="lg">
      {added ? <Check className="mr-2 h-5 w-5" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
      {children || (added ? "Added!" : "Add to Cart")}
    </Button>
  );
}
