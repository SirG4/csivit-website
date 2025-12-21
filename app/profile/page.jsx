"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton/BackButton";

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
    <div className="relative">
      {/* Background Image Layer */}
      <div 
        className="
          fixed inset-0 z-0
          bg-[url('/Profile/steamyBg.jpg')]
          bg-cover bg-no-repeat
          bg-left md:bg-center
          md:bg-fixed
          "
      >
        {/* Overlay to darken the image */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Navbar - fixed and on top of background */}
      <div className="fixed top-0 left-0 w-full h-24 bg-gray-900 z-40 shadow-xl shadow-black/70" />
        <BackButton />
        <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-white md:tracking-wider text-3xl font-bold pointer-events-auto">
            Profile
          </div>
        </div>

      {/* Main Content - with gradient overlay on top of background image */}
      <main className="relative z-10 min-h-screen lg:mx-50 text-white p-6 md:p-10 mt-22">
        {/* Gradient overlay container */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/95 via-gray-800/90 to-gray-900/100 -z-10"></div>
        
        {/* Header Section */}
        <section className="flex flex-col  md:flex-row md:items-center md:justify-between gap-4  p-4">
          {/* Left: Profile */}
          <div className="flex items-center gap-4">
            <Image
              src={
                session?.user?.image ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23667eea' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E"
              }
              alt="Profile Avatar"
              width={95}
              height={80}
              className="border border-white/20"
              unoptimized
            />
            <div>
              <div className="text-2xl font-semibold text-white">
                {session?.user?.name}
              </div>
              <div className="text-sm text-gray-300">
                {session?.user?.email}
              </div>
            </div>
          </div>

          {/* Right: CP Username + Report + Logout */}
          <div className="flex flex-col md:flex-col gap-4">
            <div className=" pr-4 py-3">
              <div className="flex flex-row gap-2">
              <p className="text-2xl opacity-70">Level</p>
              <div className="w-9 h-9 flex items-center justify-center 
                      rounded-full border-1 border-green-500">
                 <p className="text-lg font-semibold">67</p>
               </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 bg-gray-600 transition px-3 py-2 text-xs font-medium"
            >
              {/* Glowing green dot */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>           
              Currently Online
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-800 hover:bg-red-600 transition px-3 py-2 text-xs font-medium"
            >
              Sign Out
            </button>
            </div>
          </div>
        </section>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mt-6">
          {/* Left Column */}
          <section className="space-y-6 order-2 lg:order-1">
            <div className="bg-black/25 backdrop-blur-sm shadow-lg">
              <div className="text-xl bg-white/10 p-3 font-semibold ">Events Status</div>

              {/* Upcoming Events */}
              <div className="">
                <div className="font-medium bg-black/30 p-3">Upcoming Events</div>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/Profile/steam_poster.jpg"
                      alt="Upcoming Event"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <div>
                      <div className="text-lg font-bold">
                        COMPETITIVE PROGRAMMING
                      </div>
                      <p className="text-sm mt-1">Today</p>
                      <button className=" bg-gray-600 text-xs lg:text-sm mt-2 mr-2 px-2 py-1 hover:underline">
                        View Details
                      </button>
                      <button className="bg-indigo-700 text-xs lg:text-sm mt-2 px-2 py-1 hover:underline">
                        QR for Entry
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/Profile/steam_poster.jpg"
                      alt="Upcoming Event"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <div>
                      <div className="text-lg font-bold">
                        COMPETITIVE PROGRAMMING
                      </div>
                      <p className="text-sm mt-1">Tomorrow</p>
                      <button className=" bg-gray-600 text-xs lg:text-sm mt-2 mr-2 px-2 py-1 hover:underline">
                        View Details
                      </button>
                      <button className="bg-indigo-700 text-xs lg:text-sm mt-2 px-2 py-1 hover:underline">
                        QR for Entry
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Events */}
              <div>
                <h3 className="font-medium bg-black/30 p-3">Past Events</h3>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                    src="/Profile/steam_poster.jpg"
                      alt="Past Event"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <div>
                      <h4 className="text-lg font-bold">
                        CYBERFRAT (Cybersecurity Symposium)
                      </h4>
                      <p className="text-sm mt-1">DATE : 27 / 09 / 2025</p>
                      <button className=" bg-gray-600 text-xs lg:text-sm mt-2 mr-2 px-2 py-1 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                    src="/Profile/steam_poster.jpg"
                      alt="Past Event"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <div>
                      <h4 className="text-lg font-bold">
                        CYBERFRAT (Cybersecurity Symposium)
                      </h4>
                      <p className="text-sm mt-1">DATE : 27 / 09 / 2025</p>
                      <button className=" bg-gray-600 text-xs lg:text-sm mt-2 mr-2 px-2 py-1 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition">
                  <div className="flex items-center gap-4">
                    <Image
                    src="/Profile/steam_poster.jpg"
                      alt="Past Event"
                      width={100}
                      height={100}
                      unoptimized
                    />
                    <div>
                      <h4 className="text-lg font-bold">
                        CYBERFRAT (Cybersecurity Symposium)
                      </h4>
                      <p className="text-sm mt-1">DATE : 27 / 09 / 2025</p>
                      <button className=" bg-gray-600 text-xs lg:text-sm mt-2 mr-2 px-2 py-1 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="bg-black/25 backdrop-blur-sm shadow-lg order-1 lg:order-2">
            <div className="text-xl bg-white/10 p-3 font-semibold mb-3">Overview</div>

            {/* Badges */}
            <div className="px-3 mb-6">
              <div className="font-small mb-2">Badges</div>
              <div className="flex gap-4 overflow-x-auto scrollbar-x pb-2 scroll-smooth snap-x">
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 1"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 1"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"

                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 1"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 2"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 2"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 2"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
                <Image
                  src="/Profile/badge.png"
                  alt="Badge 2"
                  width={64}
                  height={64}
                  unoptimized
                  className="snap-start"
                />
              </div>
            </div>

            {/* Links / Accordions */}
            <div className="divide-y divide-white/10">
              {["CSI REWIND", "FLASHBACKS", "HIGHLIGHTS"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between bg-white/10 px-4 py-3 hover:bg-white/20 transition cursor-pointer"
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