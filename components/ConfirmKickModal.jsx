"use client";

export default function ConfirmKickModal({ isOpen, onClose, onConfirm, memberName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Maze background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #FF0055 0px, #FF0055 1px, transparent 1px, transparent 20px),
                           repeating-linear-gradient(0deg, #FF0055 0px, #FF0055 1px, transparent 1px, transparent 20px)`,
          }}
        />
      </div>

      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse" />

        {/* Main container */}
        <div className="relative bg-black rounded-2xl p-6 border-2 border-red-500 shadow-2xl shadow-red-500/50 max-w-sm w-full">
          {/* Inner glow effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
                KICK MEMBER
              </h2>
              <div className="text-xs text-red-400 font-mono mt-1">
                █ WARNING: ACTION IRREVERSIBLE █
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-white transition text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            <p className="text-gray-300 text-sm">
              Are you sure you want to remove <span className="text-white font-bold">{memberName}</span> from your team? They will no longer have access to this team code.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-white border-2 border-gray-600 hover:border-gray-400 hover:bg-gray-800 transition duration-300"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 relative overflow-hidden rounded-lg font-bold uppercase tracking-wider text-white transition duration-300"
                style={{
                  background: "linear-gradient(135deg, #FF0055, #990033)",
                  boxShadow: "0 0 15px rgba(255, 0, 85, 0.5)",
                  border: "2px solid #FF0055",
                  padding: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 0 25px rgba(255, 0, 85, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 0 15px rgba(255, 0, 85, 0.5)";
                }}
              >
                KICK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
