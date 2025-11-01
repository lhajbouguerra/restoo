"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Menu from "@/components/menu";
import type { MenuItem, CartItem } from "@/lib/types";
import OrderStartPage from "@/components/order-start-page";

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showStart, setShowStart] = useState(true);

  // ✅ tableNumber موجود فقط لو Dining-In
  const tableNumber = Number(searchParams.get("table"));
  const [guestId, setGuestId] = useState<string | null>(null);

  // ✅ Load guestId من localStorage عند mount
  useEffect(() => {
    const id = localStorage.getItem("guestId");
    if (id) setGuestId(id);
  }, []);

  // ✅ إظهار overlay فقط إذا ما فماش table أو guestId
  useEffect(() => {
    if (tableNumber || guestId) {
      setShowStart(false);
      router.push(tableNumber ? `/order?table=${tableNumber}` : `/order?guest=${guestId}`);
    } else {
      setShowStart(true);
    }
  }, [tableNumber, guestId]);

  // ✅ cartKey مختلف حسب النوع
  const cartKey = tableNumber
    ? `cartItems_table_${tableNumber}`
    : guestId
      ? `cartItems_guest_${guestId}`
      : null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ✅ Load Cart
  useEffect(() => {
    if (!cartKey) return;
    const saved = localStorage.getItem(cartKey);
    if (saved) setCartItems(JSON.parse(saved));
  }, [cartKey]);

  // ✅ Add to Cart
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

  // ✅ Save to localStorage
  useEffect(() => {
    if (!cartKey) return;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, cartKey]);

  // ✅ Go To Confirm Page
  const goToConfirm = () => {
    if (tableNumber) {
      router.push(`/order/confirm?table=${tableNumber}`);
    } else if (guestId) {
      router.push(`/order/confirm?guest=${guestId}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="mx-auto max-w-7xl">
        <Menu
          onAddToCart={handleAddToCart}
          cartCount={cartItems.length}
          onGoToCart={goToConfirm}
        />

        {showStart && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <OrderStartPage
              onDineIn={() => {
                setShowStart(false);
                // توجيه لصفحة scan
                window.location.href = "/order/scan";
              }}
              onTakeaway={() => {
                setShowStart(false);
                // توليد guestId إذا ما موجودش
                let id = localStorage.getItem("guestId");
                if (!id) {
                  id = Math.floor(1000 + Math.random() * 9000).toString(); // 4 أرقام
                  localStorage.setItem("guestId", id);
                }
                setGuestId(id);
                router.push(`/order?guest=${id}`);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
