"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Order, CartItem } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, XCircle, ArrowLeft, CheckCircle, LoaderPinwheel } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Props {
  tableNumber?: number; // موجود كان لل-DineIn
  guestId?: string;     // موجود كان لل-Takeaway
  onBackToMenu: () => void;
}
const API_BASE = "https://resto.qzz.io";

export default function OrderProgress({ tableNumber: tableNumberProp, onBackToMenu }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  // Prefer query param, fallback to prop
  const tableParam = searchParams?.get("table");
  const guestParam = searchParams?.get("guest");
  const tableNumber = tableParam ? Number(tableParam) : tableNumberProp ?? undefined;
  const guestId = guestParam ?? (tableNumberProp ? undefined : undefined);
  const identifier = tableNumber ?? guestId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const buildOrderUrl = () => {
    let url = `${API_BASE}/order`;
    if (tableNumber) url += `?table=${encodeURIComponent(tableNumber)}`;
    else if (guestId) url += `?guest=${encodeURIComponent(guestId)}`;
    return url;
  };

  const fetchOrder = async (opts?: { initial?: boolean }) => {
    if (opts?.initial) setLoading(true);
    try {
      setError(null);
      const url = buildOrderUrl();
      if (!url.includes("?")) {
        if (mountedRef.current) {
          setOrder(null);
          onBackToMenu();
        }
        return;
      }

      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 404) {
        // لو الطلب مش موجود خلي order null، بدون redirect
        if (mountedRef.current) setOrder(null);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const mapped: Order = {
        id: data.order_number ?? data.id ?? null,
        tableNumber: data.table_number ?? (tableNumber ?? null),
        timestamp: Number(data.timestamp ?? Date.now()),
        status: data.status ?? "pending",
        items: (data.items || []).map((i: any, idx: number) => ({
          id: (i.name + (i.qty ?? i.quantity ?? idx)).replace(/\s+/g, "_"),
          name: i.name,
          price: i.price ?? 0,
          quantity: i.qty ?? i.quantity ?? 1,
          prepTime: i.prepTime ?? 10,
          description: i.description ?? "",
        })),
      };

      if (!mountedRef.current) return;
      setOrder(mapped);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error(err);
      setError("Failed to fetch order");
    } finally {
      if (opts?.initial && mountedRef.current) setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrder({ initial: true });

    // poll for updates every 3s while component mounted (optional)
    const interval = setInterval(() => {
      if (mountedRef.current) fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParam, guestParam, tableNumber]);

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);

    try {
      // POST /order/cancel?table=5  or ?guest=abc123
      let url = `${API_BASE}/order/cancel`;
      if (tableParam) url += `?table=${encodeURIComponent(tableParam)}`;
      else if (guestParam) url += `?guest=${encodeURIComponent(guestParam)}`;
      else if (typeof tableNumber === "number") url += `?table=${encodeURIComponent(String(tableNumber))}`;

      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        // try to read message
        const body = await res.text().catch(() => null);
        console.error("Cancel failed:", res.status, body);
        return;
      }

      // Clear local copy and navigate back
      setOrder(null);
      if (typeof tableNumber === "number") {
        localStorage.removeItem(`currentOrder_table_${tableNumber}`);
      } else if (guestParam) {
        localStorage.removeItem(`currentOrder_guest_${guestParam}`);
      }
      // fire back to menu callback
      setTimeout(onBackToMenu, 0);
    } catch (err) {
      console.error("Cancel error", err);
    } finally {
      if (mountedRef.current) setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => {
        // redirect to order landing (cart/menu)
        if (tableParam || typeof tableNumber === "number") {
          const tId = tableParam ?? String(tableNumber);
          router.push(`/order/?table=${encodeURIComponent(tId)}`);
        } else if (guestParam) {
          router.push(`/order?guest=${encodeURIComponent(guestParam)}`);
        } else {
          router.push(`/order`);
        }
      }, 700);
      return () => clearTimeout(t);
    }
  }, [error, tableParam, guestParam, tableNumber, router]);

  const getTotalPrepTime = () => {
    if (!order) return 0;
    return order.items.reduce((sum, it) => sum + (it.prepTime ?? 10) * it.quantity, 0);
  };

  const getOrderTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  };

  const prepTime = getTotalPrepTime();
  const orderTotal = getOrderTotal();

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-center mt-10 ml-3 text-lg font-medium">Loading order...</p>
      </div>
    );

  if (error) {
    return (
      <div className="text-center mt-10 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg max-w-md mx-auto">
        <XCircle className="mx-auto mb-2" size={24} />
        <p className="font-semibold">Network Error</p>
        <p className="text-sm">Please refresh or try again later.</p>
      </div>
    );
  }

  if (!order)
    return (
      <p className="text-center mt-10 text-lg font-medium">
        No active order{typeof tableNumber === "number" ? ` for table ${tableNumber}` : guestParam ? ` for ${guestParam}` : ""}.
      </p>
    );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Order Ticket</h1>
        <Button variant="outline" onClick={onBackToMenu} className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  ">
          <ArrowLeft size={16} /> Menu
        </Button>
      </div>
      
      <Card className="p-6 sm:p-8 mb-6 border-2 shadow-xl bg-card/80">
        <div className="flex items-center justify-between border-b pb-4 mb-4 ">
          <div className="flex items-center gap-3 font-semibold text-2xl">
            {order.status === "ready" ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : order.status === "preparing" ? (
              <LoaderPinwheel size={24} className="text-yellow-500 animate-spin" />
            ) : (
              <Clock size={24} className="text-orange-500" />
            )}
            <span
              className={
                order.status === "ready"
                  ? "text-green-600 capitalize"
                  : order.status === "preparing"
                    ? "text-yellow-500 capitalize"
                    : "text-orange-500 capitalize"
              }
            >
              {order.status}
            </span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            <span className="font-bold text-foreground">
              {typeof order.tableNumber === "number" ? `Table` : guestParam ? `Guest` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex flex-col items-center justify-center ">
            <span className="font-bold text-foreground">
              {typeof order.tableNumber === "number" ? `Table` : guestParam ? `Guest` : ""}
            </span>
            <div className="text-4xl font-extrabold text-primary"># {typeof order.tableNumber === "number" ? `${order.tableNumber}` : guestParam ? `${guestParam}` : ""}</div>
          </div>
        </div>
      </Card>

      <Card className="w-full p-4 sm:p-6 mb-8 border shadow-md">
        <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2">{t("order.items_ordered")}</h3>
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
          {order.items.map((it: CartItem) => (
            <div key={it.id} className="flex justify-between items-start pb-2 border-b border-dashed border-border/50 last:border-b-0 last:pb-0">
              <div className="flex-1 pr-4">
                <div className="font-semibold text-base text-foreground">{it.name}</div>
                {it.description && <div className="text-xs text-muted-foreground line-clamp-1">{it.description}</div>}
              </div>
              <div className="text-right shrink-0">
                <div className="font-medium text-sm text-foreground">DT {(it.price * it.quantity).toFixed(2)}</div>
                <div className="text-xs font-medium text-primary">x{it.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="w-full flex flex-col gap-3">
        {/* Close Order Button */}
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={isCancelling}
          className="w-full h-12 text-lg font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? (
            <>
              <Loader2 className="animate-spin" />
              {t("order.closing_order")}
            </>
          ) : (
            <>
              <XCircle />
              {t("button.close_order")}
            </>
          )}
        </Button>

        {/* Back Button */}
        <Button
          onClick={onBackToMenu}
          variant="secondary"
          className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  "
        >
          {t("button.back_to_menu")}
        </Button>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setConfirmOpen(false)}
          >
            <Card
              className="p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">{t("order.confirm_close")}</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {t("order.confirm_close_message")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  ">
                  {t("button.cancel")}
                </Button>
                <Button
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => {
                    handleCancel();
                    setConfirmOpen(false);
                    localStorage.removeItem("guestId")
                  }}
                >
                  {t("button.close_order")}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
