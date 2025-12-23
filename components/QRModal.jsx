"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ isOpen, onClose, eventName }) {
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTimer, setRefreshTimer] = useState(30);

  // Generate QR on mount or when timer reaches 0
  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !qrPayload) return;

    const interval = setInterval(() => {
      setRefreshTimer((prev) => {
        if (prev <= 1) {
          generateQR(); // Auto-refresh when timer reaches 0
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, qrPayload]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/qr/generate", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR");
      }

      setQrPayload(data.payload);
      setRefreshTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Maze background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #FFFF00 0px, #FFFF00 1px, transparent 1px, transparent 20px),
                           repeating-linear-gradient(0deg, #FFFF00 0px, #FFFF00 1px, transparent 1px, transparent 20px)`,
          }}
        />
      </div>

      <div className="relative">
        {/* Glowing border container with neon effect */}
        <div className="relative max-w-md w-full">
          {/* Outer glow - Yellow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-500 rounded-2xl blur-lg opacity-75 animate-pulse" />

          {/* Main container */}
          <div className="relative bg-black rounded-2xl p-6 border-2 border-yellow-400 shadow-2xl shadow-yellow-400/50">
            {/* Inner glow effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-20" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-300 to-purple-400">
                  {eventName}
                </h2>
                <div className="text-xs text-cyan-300 font-mono mt-1">
                  █ SCAN MODE ACTIVE █
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-yellow-400 hover:text-cyan-300 transition text-3xl font-bold hover:drop-shadow-lg hover:shadow-cyan-400/50"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {error ? (
              <div className="relative z-10 bg-red-900/60 border-2 border-red-500 rounded-lg p-4 text-red-200 text-sm font-mono">
                <span className="text-red-400">▼ ERROR ▼</span>
                <p className="mt-2">{error}</p>
              </div>
            ) : qrPayload ? (
              <div className="relative z-10 space-y-4">
                {/* QR Code with glow */}
                <div className="flex justify-center">
                  <div className="relative p-4 bg-white rounded-lg border-2 border-cyan-400 shadow-2xl shadow-cyan-400/50">
                    {/* Pulsing glow background */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-cyan-400 rounded-lg blur opacity-30 animate-pulse -z-10" />
                    <QRCodeCanvas
                      value={qrPayload}
                      size={256}
                      level="H"
                      includeMargin={true}
                      className="relative"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center space-y-2 border-t-2 border-yellow-400 pt-4">
                  <p className="text-yellow-300 text-sm font-bold uppercase tracking-widest">
                    ► Scan to mark presence ◄
                  </p>
                  <p className="text-cyan-300 text-xs font-mono">
                    ONE SCAN · ONE BADGE
                  </p>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-2 border-purple-500 rounded-lg p-3 font-mono">
                  <span className="text-purple-300 text-sm">⏱ REFRESH IN:</span>
                  <span
                    className={`text-lg font-bold ${
                      refreshTimer <= 10
                        ? "text-red-400 animate-pulse"
                        : "text-cyan-300"
                    }`}
                  >
                    {refreshTimer}s
                  </span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-lg font-bold uppercase tracking-wider text-black transition duration-300"
                  style={{
                    background: loading
                      ? "#666"
                      : "linear-gradient(135deg, #FFFF00, #00FFFF)",
                    boxShadow: loading
                      ? "none"
                      : "0 0 20px rgba(255, 255, 0, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
                    border: "2px solid #FFFF00",
                    padding: "0.75rem",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow =
                        "0 0 30px rgba(255, 255, 0, 0.8), 0 0 60px rgba(0, 255, 255, 0.6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow =
                        "0 0 20px rgba(255, 255, 0, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)";
                    }
                  }}
                >
                  {loading ? "⏳ GENERATING..." : "🔄 REFRESH QR"}
                </button>
              </div>
            ) : (
              <div className="relative z-10 text-center py-8">
                <div className="inline-block">
                  <div className="text-cyan-300 text-4xl mb-2 animate-spin">
                    ◐
                  </div>
                  <p className="text-cyan-300 font-mono text-sm">
                    {loading ? "⟳ GENERATING QR..." : "⟳ LOADING..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx>{`
        @keyframes neon-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 0, 0.5),
              0 0 40px rgba(0, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 0, 0.8),
              0 0 60px rgba(0, 255, 255, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
