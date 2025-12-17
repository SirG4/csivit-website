"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Home/Navbar";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.name) {
      setSelectedUser(session.user.name);
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-lg mt-20">
          {/* Left: Profile */}
          <div className="flex items-center gap-4">
            <Image
              src={
                session?.user?.image ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23667eea' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E"
              }
              alt="Profile Avatar"
              width={64}
              height={64}
              className="rounded-full border border-white/20"
              unoptimized
            />
            <div>
              <div className="text-lg font-semibold text-white">
                {session?.user?.name}
              </div>
              <div className="text-sm text-gray-300">
                {session?.user?.email}
              </div>
              <button className="ml-0 mt-2 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-lg text-sm">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right: CP Username + Report + Logout */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-sm opacity-70">CP Username</p>
              <p className="text-sm font-semibold">—</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-sm opacity-70">CP Report</p>
              <p className="text-sm font-semibold">—</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-3 rounded-lg text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column */}
          <section className="space-y-6">
            <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">Events Status</h2>

              {/* Upcoming Events */}
              <div className="mb-5">
                <h3 className="font-medium mb-2">Upcoming Events</h3>
                <div className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%2310b981' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='32' fill='white' text-anchor='middle' dy='.3em'%3EEvent%3C/text%3E%3C/svg%3E"
                      alt="Upcoming Event"
                      width={80}
                      height={80}
                      className="rounded-lg"
                      unoptimized
                    />
                    <div>
                      <h4 className="text-lg font-bold">
                        COMPETITIVE PROGRAMMING
                      </h4>
                      <p className="text-sm mt-1">DAY : COMING SATURDAY</p>
                      <button className="text-indigo-400 text-sm mt-2 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Events */}
              <div>
                <h3 className="font-medium mb-2">Past Events</h3>
                <div className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%237c3aed' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='white' text-anchor='middle' dy='.3em'%3EPast%3C/text%3E%3C/svg%3E"
                      alt="Past Event"
                      width={80}
                      height={80}
                      className="rounded-lg"
                      unoptimized
                    />
                    <div>
                      <h4 className="text-lg font-bold">
                        CYBERFRAT (Cybersecurity Symposium)
                      </h4>
                      <p className="text-sm mt-1">DATE : 27 / 09 / 2025</p>
                      <button className="text-indigo-400 text-sm mt-2 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="bg-white/10 rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>

            {/* Badges */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Badges</h3>
              <div className="flex gap-4 overflow-x-auto">
                <Image
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f59e0b' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em'%3E⭐%3C/text%3E%3C/svg%3E"
                  alt="Badge 1"
                  width={64}
                  height={64}
                  className="rounded-lg"
                  unoptimized
                />
                <Image
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23ec4899' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em'%3E⭐%3C/text%3E%3C/svg%3E"
                  alt="Badge 2"
                  width={64}
                  height={64}
                  className="rounded-lg"
                  unoptimized
                />
              </div>
            </div>

            {/* Links / Accordions */}
            <div className="space-y-3">
              {["CSI REWIND", "FLASHBACKS", "HIGHLIGHTS"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg hover:bg-white/20 transition cursor-pointer"
                >
                  <span>{item}</span>
                  <ChevronDown className="w-5 h-5 opacity-70" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
