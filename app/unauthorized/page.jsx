"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="text-7xl mb-4">🚫</div>
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
            Access Denied
          </h1>
          <p className="text-xl text-gray-400 mb-2">Unauthorized Access</p>
          <p className="text-gray-500">
            Only admin users can access the admin panel.
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
          <p className="text-gray-300">
            If you believe this is a mistake, please contact the administrator.
          </p>
        </div>

        <div className="flex gap-4 flex-col">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Back to Home
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
