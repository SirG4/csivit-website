// Example implementation for /app/scanner/page.jsx
// Shows how to integrate QR scanning with the attendance system

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ScannerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchEvents();
    }
  }, [status, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      const data = await response.json();
      if (data.success) {
        const activeEvents = data.data.filter((e) => e.isActive);
        setEvents(activeEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const generateQR = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        alert("Failed to generate QR");
        return;
      }

      const data = await response.json();
      setSelectedEvent(data.event);
      setQrPayload(data.payload);
    } catch (error) {
      console.error("Error generating QR:", error);
      alert("Error generating QR");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      const payload = JSON.parse(qrData);
      const { eventKey, eventId } = payload;

      if (!eventKey || !eventId) {
        setScanResult({
          success: false,
          message: "Invalid QR Code",
          description: "QR code format is invalid",
        });
        return;
      }

      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKey, eventId }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setScanResult({
          success: false,
          message: "Already Claimed",
          description: "You already marked attendance for this event",
        });
      } else if (response.ok) {
        setScanResult({
          success: true,
          message: "Attendance Marked!",
          description: `You earned ${data.data.pointsEarned} points${
            data.data.badgeEarned
              ? ` and unlocked ${data.data.badgeEarned}!`
              : ""
          }`,
        });
      } else {
        setScanResult({
          success: false,
          message: data.error || "Error",
          description: data.message || "Failed to mark attendance",
        });
      }

      // Clear result after 5 seconds
      setTimeout(() => setScanResult(null), 5000);
    } catch (error) {
      setScanResult({
        success: false,
        message: "Error",
        description: error.message || "Failed to process scan",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          🎫 Event Scanner
        </h1>

        {!selectedEvent ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-center mb-6">
              Select an event to scan QR codes
            </p>

            <div className="space-y-3">
              {events.map((event) => (
                <button
                  key={event._id}
                  onClick={() => generateQR(event._id)}
                  disabled={loading}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/60 transition-all text-left disabled:opacity-50"
                >
                  <h3 className="font-semibold">{event.eventName}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedEvent(null);
                setQrPayload(null);
                setScanResult(null);
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
            >
              ← Back
            </button>

            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {selectedEvent.eventName}
              </h2>

              {qrPayload && (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRDisplay payload={qrPayload} />
                </div>
              )}

              <p className="text-gray-400 text-sm mt-4">
                Display this QR for users to scan
              </p>
            </div>

            {/* Simulated scan result - in real app, would use QR scanner library */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                Scan Result (for testing):
              </p>
              <button
                onClick={() => handleQRScan(qrPayload)}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                📱 Simulate Scan
              </button>
            </div>

            {scanResult && (
              <div
                className={`p-4 rounded-lg border ${
                  scanResult.success
                    ? "bg-green-500/20 border-green-500/50"
                    : "bg-red-500/20 border-red-500/50"
                }`}
              >
                <h3
                  className={`font-bold ${
                    scanResult.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {scanResult.success ? "✅" : "❌"} {scanResult.message}
                </h3>
                <p
                  className={
                    scanResult.success ? "text-green-300" : "text-red-300"
                  }
                >
                  {scanResult.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// QR Code Display Component
// Requires: npm install qrcode.react
import dynamic from "next/dynamic";

const QRCode = dynamic(
  () => import("qrcode.react").then((mod) => mod.default),
  { ssr: false }
);

function QRDisplay({ payload }) {
  const qrRef = React.useRef();

  const downloadQR = () => {
    if (qrRef.current) {
      const image = qrRef.current
        .querySelector("canvas")
        .toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "event-qr.png";
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div ref={qrRef}>
        <QRCode value={payload} size={256} level="H" includeMargin={true} />
      </div>
      <button
        onClick={downloadQR}
        className="w-full px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all text-sm"
      >
        📥 Download QR
      </button>
    </div>
  );
}
