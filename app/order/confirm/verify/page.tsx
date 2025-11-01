"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter, useParams } from "next/navigation";

const API_BASE = "http://192.168.1.22:8000";

export default function SMSAuthPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const router = useRouter();
  const params = useParams();
  const tableId = params?.tableId as string;
  const tableNumber = Number(tableId);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/confirm-order/sendcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "OTP sent successfully!" });
        setStep("code");
      } else {
        setMessage({ type: "error", text: data.detail || "Failed to send OTP" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/confirm-order/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        localStorage.setItem(`verified_table_${tableNumber}`, "true");
        router.push(`/order/table/${tableNumber}/confirm-order`);
      } else {
        setMessage({ type: "error", text: data.detail || "Verification failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SMS Authentication</CardTitle>
          <CardDescription>Secure verification for Tunisian phone numbers</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription className={message.type === "error" ? "text-destructive" : "text-green-600"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Input placeholder="+216XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="tel" required  />
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Input placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.slice(0,6))} type="number" required />
              <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</Button>
              <Button type="button" variant="outline" onClick={() => { setStep("phone"); setVerificationCode(""); }}>Back</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
