"use client";

import { useSearchParams, useRouter } from "next/navigation";
import OrderProgress from "@/components/order-progress";
import { useEffect, useState } from "react";

export default function OrderProgressPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tableParam = searchParams.get("table");
  const guestParam = searchParams.get("guest");

  const tableNumber = tableParam ? parseInt(tableParam) : null;
  const guestId = guestParam ?? null;

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    // إذا ما فماش لا table ولا guest → redirect
    if ((!tableNumber || isNaN(tableNumber)) && !guestId) {
      router.replace("/order");
    } else {
      setValidated(true);
    }
  }, [tableNumber, guestId, router]);

  if (!validated) return null;

  return (
    <OrderProgress
      tableNumber={tableNumber ?? undefined}
      onBackToMenu={() => router.push("/order")}
      guestId={guestId ?? undefined} // تمرير guestId إذا موجود
    />
  );
}
