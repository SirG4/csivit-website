"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Home/Navbar";
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
    } else if (status === "authenticated") {
      setLoading(false);
      startScanner();
    }
  }, [status, router]);

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
        `Camera error: ${
          err.message || "Could not access camera. Please check permissions."
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
          setError(data.error || "Badge already earned for this event");
        } else {
          setError(data.error || "Failed to process QR");
        }
      } else {
        setSuccessMessage(`🎉 Badge earned: ${data.badge.badgeName}`);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">◐</div>
          <p className="text-cyan-300 font-mono text-lg">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Maze background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #FFFF00 0px, #FFFF00 1px, transparent 1px, transparent 20px),
                           repeating-linear-gradient(0deg, #FFFF00 0px, #FFFF00 1px, transparent 1px, transparent 20px)`,
          }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-10">
        {/* Tomb of the Mask Theme Container */}
        <div className="w-full max-w-2xl">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-300 to-purple-400 uppercase tracking-widest">
              ▶ BADGE SCANNER ◀
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-mono text-sm">
              <span>█</span>
              <span>SCAN MODE ACTIVE</span>
              <span>█</span>
            </div>
            <p className="text-yellow-300 text-xs mt-3 uppercase font-bold tracking-wider">
              One Scan · One Badge
            </p>
          </div>

          {/* Scanner Container with Glow */}
          <div className="relative mb-8">
            {/* Outer glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-500 rounded-2xl blur-xl opacity-60 animate-pulse" />

            {/* Inner glow effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-cyan-400 rounded-full blur-3xl opacity-30" />

            {/* Main video container */}
            <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-400/70">
              <div className="aspect-video bg-black relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ display: scanning ? "block" : "none" }}
                />
                {!scanning && (
                  <div className="flex items-center justify-center h-full bg-gradient-to-b from-purple-900/20 to-cyan-900/20">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">📷</div>
                      <p className="text-yellow-400 mb-4 font-bold text-lg uppercase">
                        Camera Inactive
                      </p>
                      <button
                        onClick={startScanner}
                        className="relative overflow-hidden rounded-lg font-bold uppercase tracking-wider text-black transition duration-300 px-6 py-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFFF00, #00FFFF)",
                          boxShadow:
                            "0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(0, 255, 255, 0.4)",
                          border: "2px solid #FFFF00",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow =
                            "0 0 30px rgba(255, 255, 0, 0.9), 0 0 60px rgba(0, 255, 255, 0.7)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow =
                            "0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(0, 255, 255, 0.4)";
                        }}
                      >
                        ▶ Start Scanner ◀
                      </button>
                    </div>
                  </div>
                )}

                {/* Scanning Border Animation */}
                {scanning && (
                  <>
                    <div className="absolute inset-0 border-2 border-cyan-400 pointer-events-none animate-pulse" />
                    <div
                      className="absolute inset-0 border-4 border-transparent border-t-yellow-400 border-r-purple-400 pointer-events-none animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  </>
                )}
              </div>

              {/* Status indicator */}
              {scanning && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/80 border-2 border-cyan-400 rounded-full px-4 py-2 font-mono text-xs">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-cyan-300">SCANNING...</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Section */}
          <div className="space-y-4">
            {error && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-lg blur opacity-60 animate-pulse" />
                <div className="relative bg-black border-2 border-red-500 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">❌</span>
                    <div>
                      <p className="text-red-300 font-bold uppercase text-sm mb-1">
                        ERROR STATUS
                      </p>
                      <p className="text-red-200 font-mono text-xs">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-cyan-400 rounded-lg blur opacity-60 animate-pulse" />
                <div className="relative bg-black border-2 border-green-400 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">✨</span>
                    <div>
                      <p className="text-green-300 font-bold uppercase text-sm mb-1">
                        SUCCESS!
                      </p>
                      <p className="text-green-200 font-mono text-xs">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-60 animate-pulse" />
                <div className="relative bg-black border-2 border-purple-400 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-purple-300 font-mono uppercase text-xs mb-2">
                      █ BADGE ACQUIRED █
                    </p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">
                      {result.badge.badgeName}
                    </p>
                    <p className="text-purple-200 text-xs font-mono mt-2">
                      → REFRESH IN 3 SECONDS ←
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-4">
              ═══════════════════════════════════
            </div>
            <p className="text-yellow-300/70 text-xs font-mono mb-2">
              POINT CAMERA AT QR CODE
            </p>
            <p className="text-purple-300/70 text-xs font-mono">
              AWAITING INPUT
            </p>
            <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mt-4">
              ═══════════════════════════════════
            </div>
          </div>
        </div>
      </main>

      {/* Global styles */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
