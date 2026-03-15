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
                Event Registration
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {error && (
              <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm font-medium mb-1">Error</p>
                <p className="text-red-300/70 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-white/40 text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white/40 text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Team */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGenerateTeamCode(!generateTeamCode);
                      if (!generateTeamCode) setTeamCode("");
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                      generateTeamCode
                        ? "bg-white border-white"
                        : "bg-transparent border-white/20 hover:border-white/40"
                    }`}
                  >
                    {generateTeamCode && (
                      <svg className="w-2.5 h-2.5 text-[#111118]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <label
                    className="text-white/50 text-xs cursor-pointer select-none"
                    onClick={() => {
                      setGenerateTeamCode(!generateTeamCode);
                      if (!generateTeamCode) setTeamCode("");
                    }}
                  >
                    Generate new team code
                  </label>
                </div>

                {!generateTeamCode && (
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Team Code to Join
                    </label>
                    <input
                      type="text"
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-200 uppercase tracking-widest"
                      placeholder="ENTER TEAM CODE"
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white text-[#0a0a0f] text-sm font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
