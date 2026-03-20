"use client";

export default function ConfirmCancelTeamModal({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  teamCode,
  memberCount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full bg-black border border-red-500/60 rounded-xl p-5 shadow-2xl">
        <h2 className="text-xl font-bold text-red-300">Cancel Team</h2>
        <p className="text-xs text-red-400 mt-1">
          This action cannot be undone.
        </p>

        <div className="mt-4 text-sm text-gray-300 space-y-2">
          <p>
            Event: <span className="text-white font-semibold">{eventName}</span>
          </p>
          <p>
            Team Code:{" "}
            <span className="text-yellow-300 font-mono">{teamCode}</span>
          </p>
          <p>
            Members Affected:{" "}
            <span className="text-white font-semibold">{memberCount}</span>
          </p>
          <p className="text-gray-400">
            Cancelling will remove the complete team registration for all
            members.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
          >
            Keep Team
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white transition"
          >
            Cancel Team
          </button>
        </div>
      </div>
    </div>
  );
}
