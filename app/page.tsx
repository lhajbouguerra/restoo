"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Menu from "@/components/menu";
import type { MenuItem, CartItem } from "@/lib/types";
import OrderStartPage from "@/components/order-start-page";
import  Link from "next/link";

export default function mainpage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showStart, setShowStart] = useState(true);
  // لو تحب تحمل السلة من localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // حفظ السلة في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <Link href="/order" className="text-blue-500 underline mb-4 inline-block">order</Link>
    </main>
  );
}
