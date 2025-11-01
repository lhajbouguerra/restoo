"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { CartItem } from "@/lib/types";

const API_BASE = "https://resto.qzz.io";

export default function ConfirmOrder({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onBack,
  onOrderComplete,
}: {
  items: CartItem[];
  onUpdateQuantity: (id: string, q: number) => void;
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onOrderComplete: (orderId: number) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // read query params (supports ?table=5  OR ?guest=abc123)
  const tableParam = searchParams.get("table");
  const guestId = searchParams.get("guest");
  const tableNumber = tableParam ? Number(tableParam) : undefined;

  const cartKey = tableParam ? `cartItems_table_${tableParam}` : `cartItems_guest_${guestId}`;
  const backupKey = tableParam ? `currentOrder_table_${tableParam}` : `currentOrder_guest_${guestId}`;

  const [message, setMessage] = useState<{ type: "success" | "error" | "loading"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  useEffect(() => {
    if (tableParam) {
      const verified = localStorage.getItem(`verified_table_${tableParam}`) === "true";
      setIsVerified(verified);
    } else {
      setIsVerified(false);
    }
  }, [tableParam]);

  const handleConfirmOrder = async () => {
    // Validate presence of either table or guest
    if (!tableParam && !guestId) {
      setMessage({ type: "error", text: "Missing table or guest identifier in URL" });
      return;
    }

    if (items.length === 0) {
      setMessage({ type: "error", text: "Cart is empty" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "loading", text: "Processing order..." });

    try {
      // Optionally check verification for table orders
      if (tableParam) {
        const verified = localStorage.getItem(`verified_table_${tableParam}`) === "true";
        if (!verified) {
          // If you have a verify flow, redirect there. Otherwise skip.
          // router.push(`/order/confirm?table=${tableParam}&verify=true`);
          // setIsLoading(false);
          // return;
        }
      }

      // Build payload
      const orderId = Math.floor(1000 + Math.random() * 9000).toString();
      const payload: any = {
        order_number: orderId,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          qty: i.quantity,
          price: i.price,
          prepTime: i.prepTime ?? 10,
          description: i.description ?? "",
          modifiers: i.modifiers ?? null,
        })),
        total,
        timestamp: Date.now()
      };

      if (tableParam) payload.table = Number(tableParam);
      if (guestId) payload.guest = guestId;

      // Build POST URL with query param style: /order/confirm?table=5  OR /order/confirm?guest=abc123
      let url = `${API_BASE}/order/confirm`;
      url += tableParam ? `?table=${encodeURIComponent(tableParam)}` : `?guest=${encodeURIComponent(guestId as string)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to confirm order" });
        setIsLoading(false);
        return;
      }

      // prefer backend order id if returned, otherwise fallback to generated id
      const returnedOrderId = (data && (data.orderId || data.order_id || data.id)) ?? orderId;

      // Save order locally and clear cart (key depends on table/guest)
      const currentOrderObj = {
        id: returnedOrderId,
        tableNumber: tableParam ? Number(tableParam) : null,
        guestId: guestId ?? null,
        items,
        total,
        timestamp: Date.now(),
      };

      localStorage.setItem(backupKey, JSON.stringify(currentOrderObj));
      localStorage.removeItem(cartKey);

      setMessage({ type: "success", text: "Order confirmed successfully!" });

      // call optional callback
      onOrderComplete(returnedOrderId);

      // Redirect to progress page after tiny delay to let user see the success toast
      setTimeout(() => {
        if (tableParam) {
          router.push(`/order/progress?table=${encodeURIComponent(tableParam)}`);
        } else {
          router.push(`/order/progress?guest=${encodeURIComponent(guestId as string)}`);
        }
      }, 600);

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !message) {
    return (
      <div className="p-4 pt-12 text-center">
        <Card className="p-8 max-w-md mx-auto">
          <ShoppingCart size={48} className="mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">{t("order.cart_empty")}</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            {t("order.cart_empty_message")}
          </p>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  "
          >
            <ArrowLeft size={16} /> {t('button.menu')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    // Padding-bottom to prevent sticky footer overlap
    <div className="p-4 sm:p-6 max-w-2xl mx-auto ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {tableParam
            ? t("order.table_order").replace("{0}", tableNumber!.toString())
            : t("order.takeaway_order") + (guestId ? ` • ${guestId}` : "")}
        </h2>

        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  "
        >
          <ArrowLeft size={16} /> {t('button.menu')}
        </Button>
      </div>

      {/* Alert Box */}
      {message && (
        <div
          className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg text-xs sm:text-sm mb-4 sm:mb-6 transition-all ${message.type === "success"
            ? "bg-green-500/10 text-green-600 border border-green-500/20"
            : message.type === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-primary/10 text-primary border border-primary/20"
            }`}
        >
          {message.type === "success" && <CheckCircle size={18} />}
          {message.type === "error" && <AlertCircle size={18} />}
          {message.type === "loading" && <Loader2 size={18} className="animate-spin" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Item List */}
      <div className="space-y-3 sm:space-y-4 max-h-96">
        {items.map((item) => (
          <Card key={item.id} className="p-3 sm:p-4 bg-card border border-border">
            <div className="flex gap-3 sm:gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full"
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 64px, 80px"
                />
              </div>

              {/* Details & Controls */}
              <div className="flex-1 flex flex-col justify-between gap-2">
                {/* Top Row: Name & Total Price */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      DT {item.price.toFixed(2)} each
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-foreground text-right min-w-[70px]">
                    DT {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Bottom Row: Controls & Remove */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      size="icon"
                      variant="outline"
                      disabled={isLoading || item.quantity <= 1}
                      className="
    h-7 w-7 sm:h-8 sm:w-8 text-white border-none rounded-md shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
  "
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-6 text-center font-semibold text-foreground text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <Button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      size="icon"
                      variant="outline"
                      disabled={isLoading}
                      className="
    h-7 w-7 sm:h-8 sm:w-8 text-white border-none rounded-md shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
  "
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <Button
                    onClick={() => onRemoveItem(item.id)}
                    size="icon"
                    variant="outline"
                    disabled={isLoading}
                    className="
    h-7 w-7 sm:h-8 sm:w-8 text-white border-none rounded-md shadow-md
    bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
    transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
  "
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sticky Footer for Total & Confirmation */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-card border-t border-border shadow-2xl z-20">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-foreground">{t("order.total")}</span>
            <span className="text-2xl font-bold text-foreground">DT {total.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleConfirmOrder}
            disabled={isLoading || items.length === 0 || message?.type === 'success'}
            className="
    w-full h-12 text-lg font-semibold text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  "
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin mr-2" />
            ) : message?.type === 'success' ? (
              <>
                <CheckCircle size={24} className="mr-2" /> {t('order.order_sent')}
              </>
            ) : (
              t('button.confirm_send')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
