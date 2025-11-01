"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConfirmOrder from "@/components/confirm-order";
import type { CartItem } from "@/lib/types";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ detect Dining or Takeaway
  const tableNumber = searchParams.get("table");
  const guestId = searchParams.get("guest");

  const cartKey = tableNumber
    ? `cartItems_table_${tableNumber}`
    : `cartItems_guest_${guestId}`;

  const backupKey = tableNumber
    ? `currentOrder_table_${tableNumber}`
    : `currentOrder_guest_${guestId}`;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ✅ Load Cart
  useEffect(() => {
    const saved = localStorage.getItem(cartKey);
    if (saved) setCartItems(JSON.parse(saved));
  }, [cartKey]);

  const handleUpdateQuantity = (id: string, q: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((p) => (p.id === id ? { ...p, quantity: q } : p))
        .filter((p) => p.quantity > 0);

      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleOrderComplete = (orderId: number) => {
    const orderObj = {
      id: orderId,
      tableNumber,
      guestId,
      items: cartItems,
      timestamp: Date.now(),
    };

    // ✅ save order backup
    localStorage.setItem(backupKey, JSON.stringify(orderObj));
    localStorage.removeItem(cartKey);

    // ✅ redirect
    if (tableNumber) {
      router.push(`/order/progress?table=${tableNumber}`);
    } else {
      router.push(`/order/progress?guest=${guestId}`);
    }
  };

  const goBack = () => {
    if (tableNumber) router.push(`/order?table=${tableNumber}`);
    else router.push(`/order?guest=${guestId}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <ConfirmOrder
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemove}
        onBack={goBack}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}
