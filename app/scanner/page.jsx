"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton/BackButton";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
    } else if (status === "authenticated") {
      setLoading(false);
      startScanner();
    }
  }, [status, session, router]);

  const startScanner = async () => {
    try {
      setError("");
      setScanning(true);

      // Request camera permission first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported on this device");
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const codeReader = new BrowserMultiFormatReader();

      const listener = (result, err) => {
        if (result) {
          handleScan(result.getText());
        }
      };

      // Decode from video element
      await codeReader.decodeFromVideoElement(videoRef.current, listener);
    } catch (err) {
      setError(
        `Camera error: ${err.message || "Could not access camera. Please check permissions."
        }`
      );
      console.error("Scanner error:", err);
      setScanning(false);
    }
  };

  const handleScan = async (qrData) => {
    try {
      setScanning(false);
      setError("");

      const payload = JSON.parse(qrData);

      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(data.error || "Attendance already marked for this event");
        } else {
          // Display the specific error from the server if available
          setError(data.error || "Failed to process QR");
        }
      } else {
        const badgeName = data.badge?.badgeName || data.data?.badgeEarned;
        setSuccessMessage(badgeName ? `🎉 Badge earned: ${badgeName}` : "✅ Attendance marked!");
        setResult(data);
        setTimeout(() => {
          setSuccessMessage("");
          setResult(null);
          startScanner();
        }, 3000);
      }
    } catch (err) {
      setError("Invalid QR code format");
      setTimeout(() => startScanner(), 2000);
    }

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white/80"></div>
          <p className="text-white/50 mt-4 text-sm tracking-wide">Loading scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <BackButton />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-10">
        <div className="w-full max-w-xl">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">
              QR Scanner
            </h1>
            <p className="text-white/40 text-sm">
              Point your camera at a QR code to scan attendance
            </p>
          </div>

          {/* Scanner Container */}
          <div className="relative mb-6">
            <div className="relative bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.08]">
              <div className="aspect-video bg-[#0a0a0f] relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ display: scanning ? "block" : "none" }}
                />
                {!scanning && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                      </div>
                      <p className="text-white/40 mb-4 text-sm">
                        Camera inactive
                      </p>
                      <button
                        onClick={startScanner}
                        className="px-6 py-2.5 rounded-xl bg-white text-[#0a0a0f] text-sm font-medium hover:bg-white/90 transition-all duration-200"
                      >
                        Start Scanner
                      </button>
                    </div>
                  </div>
                )}

                {/* Scanning overlay */}
                {scanning && (
                  <>
                    {/* Corner markers */}
                    <div className="absolute inset-8 pointer-events-none">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-sm"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-sm"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-sm"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-sm"></div>
                    </div>
                    {/* Scanning line */}
                    <div className="absolute left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-scan-line"></div>
                  </>
                )}
              </div>

              {/* Status indicator */}
              {scanning && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#0a0a0f]/80 backdrop-blur-sm border border-white/[0.08] rounded-full px-3 py-1.5 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/60">Scanning</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Section */}
          <div className="space-y-3">
            {error && (
              <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-0.5">Error</p>
                    <p className="text-red-300/70 text-xs">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-emerald-400 text-sm font-medium mb-0.5">Success</p>
                    <p className="text-emerald-300/70 text-xs">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                    {result.badge ? "Badge Acquired" : "Attendance Verified"}
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {result.badge?.badgeName || result.data?.userName || "Success"}
                  </p>
                  {result.badge && result.data?.userName && (
                    <p className="text-white/30 text-xs mt-1">
                      Awarded to {result.data.userName}
                    </p>
                  )}
                  <p className="text-white/20 text-xs mt-3">
                    Refreshing in 3 seconds...
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-white/20 text-xs">
              Point camera at QR code to mark attendance
            </p>
          </div>
        </div>
      </main>

      {/* Scanning animation keyframe */}
      <style jsx>{`
        @keyframes scan-line-move {
          0% { top: 2rem; }
          100% { top: calc(100% - 2rem); }
        }
        .animate-scan-line {
          animation: scan-line-move 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
