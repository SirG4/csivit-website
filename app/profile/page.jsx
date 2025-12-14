"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Home/Navbar";

export default function Page() {
  const [selectedUser, setSelectedUser] = useState("comeonharyyyyy");

  return (
    <div>
        <Navbar />
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-10">
        
        {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-lg mt-20">
        {/* Left: Profile */}
        <div className="flex items-center gap-4">
          <Image
            src="/placeholder-avatar.png"
            alt="Profile Avatar"
            width={64}
            height={64}
            className="rounded-full border border-white/20"
          />
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-white/10 px-3 py-2 rounded-md focus:outline-none"
            >
              <option>comeonharyyyyy</option>
              <option>anotherUser123</option>
            </select>
            <button className="ml-3 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-lg text-sm">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right: CP Username + Report */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-sm opacity-70">CP Username</p>
            <p className="text-sm font-semibold">—</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <p className="text-sm opacity-70">CP Report</p>
            <p className="text-sm font-semibold">—</p>
          </div>
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
                    src="/placeholder-event.png"
                    alt="Upcoming Event"
                    width={80}
                    height={80}
                    className="rounded-lg"
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
                    src="/placeholder-event.png"
                    alt="Past Event"
                    width={80}
                    height={80}
                    className="rounded-lg"
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
                src="/placeholder-badge.png"
                alt="Badge 1"
                width={64}
                height={64}
                className="rounded-lg"
              />
              <Image
                src="/placeholder-badge.png"
                alt="Badge 2"
                width={64}
                height={64}
                className="rounded-lg"
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
