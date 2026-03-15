"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRModal({ isOpen, onClose, eventName, eventId }) {
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate QR on mount
  useEffect(() => {
    if (isOpen && eventId) {
      generateQR();
    }
  }, [isOpen, eventId]);

  const generateQR = async () => {
    if (!eventId) {
      setError("Event ID is missing. Please close and try again.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/qr/generate", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId })
      });

      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR");
      }

      setQrPayload(data.payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative max-w-sm w-full">
        {/* Main container */}
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/[0.08] shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {eventName}
              </h2>
              <p className="text-white/30 text-xs mt-0.5">
                Entry Pass
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-medium mb-1">Error</p>
              <p className="text-red-300/70 text-xs">{error}</p>
            </div>
          ) : qrPayload ? (
            <div className="space-y-5">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeCanvas
                    value={qrPayload}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-1.5">
                <p className="text-white/50 text-sm">
                  Present this at the registration desk
                </p>
                <p className="text-white/25 text-xs">
                  This QR code is unique to you and the event
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white text-[#0a0a0f] text-sm font-medium hover:bg-white/90 transition-all duration-200"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white/60"></div>
              <p className="text-white/30 text-sm mt-3">
                {loading ? "Generating QR code..." : "Loading..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
