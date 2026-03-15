"use client";

import { useState } from "react";

export default function RegisterModal({ isOpen, onClose, eventName, eventId, onRegistrationSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [generateTeamCode, setGenerateTeamCode] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || (!generateTeamCode && !teamCode)) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/events/register", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, name, phone, teamCode, generateTeamCode })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      onRegistrationSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setTeamCode("");
    setGenerateTeamCode(false);
    setError("");
    onClose();
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
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-500 rounded-2xl blur-lg opacity-75 animate-pulse" />

          {/* Main container */}
          <div className="relative bg-black rounded-2xl p-6 border-2 border-yellow-400 shadow-2xl shadow-yellow-400/50">
            {/* Inner glow effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-20" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-300 to-purple-400">
                  Register for {eventName}
                </h2>
                <div className="text-xs text-cyan-300 font-mono mt-1">
                  █ REGISTRATION MODE ACTIVE █
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-yellow-400 hover:text-cyan-300 transition text-3xl font-bold hover:drop-shadow-lg hover:shadow-cyan-400/50"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-4">
              {error && (
                <div className="bg-red-900/60 border-2 border-red-500 rounded-lg p-3 text-red-200 text-sm font-mono">
                  <span className="text-red-400">▼ ERROR ▼</span>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-cyan-300 text-sm font-mono mb-1">NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border-2 border-cyan-800 text-white rounded p-2 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-cyan-300 text-sm font-mono mb-1">PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black border-2 border-cyan-800 text-white rounded p-2 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="border-t border-purple-800 pt-4 mt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="generateTeamCode"
                      checked={generateTeamCode}
                      onChange={(e) => {
                          setGenerateTeamCode(e.target.checked);
                          if (e.target.checked) setTeamCode("");
                      }}
                      className="w-4 h-4 text-cyan-400 bg-black border-cyan-800 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <label htmlFor="generateTeamCode" className="text-yellow-300 text-sm font-mono cursor-pointer">
                      GENERATE NEW TEAM CODE
                    </label>
                  </div>

                  {!generateTeamCode && (
                    <div>
                      <label className="block text-cyan-300 text-sm font-mono mb-1">TEAM CODE TO JOIN</label>
                      <input
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        className="w-full bg-black border-2 border-cyan-800 text-white rounded p-2 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition uppercase"
                        placeholder="ENTER EXISTING TEAM CODE"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-lg font-bold uppercase tracking-wider text-black transition duration-300 mt-6"
                  style={{
                    background: loading
                      ? "#666"
                      : "linear-gradient(135deg, #00C9FF, #92FE9D)",
                    boxShadow: loading
                      ? "none"
                      : "0 0 15px rgba(0, 201, 255, 0.5)",
                    border: "2px solid #00C9FF",
                    padding: "0.75rem",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow =
                        "0 0 25px rgba(0, 201, 255, 0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow =
                        "0 0 15px rgba(0, 201, 255, 0.5)";
                    }
                  }}
                >
                  {loading ? "⏳ PROCESSING..." : "► COMPLETE REGISTRATION"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
