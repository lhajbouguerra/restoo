"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const initCamera = async () => {
    try {
      setCameraError(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      await videoRef.current?.play();
      setScanning(true);
    } catch (err) {
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setScanning(false);
  };

  useEffect(() => {
    initCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code?.data) {
        setScanResult(code.data);
        stopCamera();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [scanning]);

  const handleRetry = () => {
    initCamera();
    setScanResult(null);
  };


  useEffect(() => {
    if (!scanResult) return;

    const match = scanResult.match(/table=(\d+)/);
    setTableNumber(match ? Number(match[1]) : null);
  }, [scanResult]);
  const handleContinue = () => {
    if (scanResult) {
      // redirect to menu with table number from QR code
      router.replace(`${scanResult}`);
    }
  };
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 w-full max-w-sm text-center">
        {!scanResult ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Scan Table QR
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Point your camera at the table QR code
            </p>

            {cameraError ? (
              <div className="flex flex-col gap-3 " >
                <p className="text-red-600">Camera access denied.</p>
                <Button onClick={handleRetry}>Retry Camera Access</Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full max-w-sm rounded-lg"
                autoPlay
                muted
                playsInline
              />
            )}

            <canvas ref={canvasRef} className="hidden" />
            <Button onClick={() => router.replace("/order")} variant="outline" className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  ">
              {t("button.cancel")}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-semibold text-green-600">
              QR Code detected!
            </p>
            <p className="text-sm text-muted-foreground">
              Table: <span className="font-mono">{tableNumber}</span>
            </p>
            <Button onClick={handleContinue} className="
    flex items-center gap-2 text-sm font-medium text-white border-none shadow-md
    bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
    dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
    transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
  ">
              Continue
            </Button>
            <Button onClick={handleRetry} variant="outline" >
              Scan Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
