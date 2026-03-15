"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton/BackButton";
import QRModal from "@/components/QRModal";
import RegisterModal from "@/components/RegisterModal";
import ConfirmKickModal from "@/components/ConfirmKickModal";

const STATIC_EVENTS = [
//   {
//     _id: "6b2f1a2b3c4d5e6f7a8b9c01",
//     eventName: "CSIVIT Orientation",
//     eventDate: "2026-03-20T10:00:00.000Z",
//     description: "Welcome to CSIVIT! Join us for an introductory session.",
//     poster: "/Profile/steam_poster.jpg", // Using default poster
//     badgeIcon: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation", // participation badge
//     winnerBadge1: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w1",
//     winnerBadge2: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w2",
//     winnerBadge3: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w3",
//     isRegistrationLive: true,
//     isOver: false,
//     minMembers: 1,
//     maxMembers: 1,
//     isStatic: true,
//     unstopUrl: "https://unstop.com/o/csivit-orientation"
//   },
//   {
//     _id: "6b2f1a2b3c4d5e6f7a8b9c02",
//     eventName: "Code2Create",
//     eventDate: "2026-03-25T09:00:00.000Z",
//     description: "CSI-VIT's flagship hackathon. Innovation at its best.",
//     poster: "/Profile/steam_poster.jpg", // Using default poster
//     badgeIcon: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c", // participation badge
//     winnerBadge1: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w1",
//     winnerBadge2: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w2",
//     winnerBadge3: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w3",
//     isRegistrationLive: true,
//     isOver: false,
//     minMembers: 1,
//     maxMembers: 1,
//     isStatic: true,
//     unstopUrl: "https://unstop.com/o/code2create"
//   }
];

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrEventName, setQrEventName] = useState("");
  const [qrEventId, setQrEventId] = useState("");
  const [userBadges, setUserBadges] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Registration related states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerEventName, setRegisterEventName] = useState("");
  const [registerEventId, setRegisterEventId] = useState("");
  const [userRegistrations, setUserRegistrations] = useState([]);

  // Kick modal state
  const [kickModalOpen, setKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.name) {
      setSelectedUser(session.user.name);
      // Fetch user badges
      fetchUserData();
      // Fetch events
      fetchEvents();
      // Fetch registrations
      fetchUserRegistrations();
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/badges");
      if (response.ok) {
        const data = await response.json();
        setUserBadges(data.badges || []);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const response = await fetch("/api/user/registrations");
      if (response.ok) {
        const data = await response.json();
        setUserRegistrations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          const dbEvents = data.data || [];

          // Identify and mark static events, merge them with DB events
          const processedDbEvents = dbEvents.map(dbEvent => {
            const dbId = dbEvent._id?.toString();
            const staticMatch = STATIC_EVENTS.find(s => 
              s._id.toString() === dbId || s.eventName === dbEvent.eventName
            );
            if (staticMatch) {
              // Ensure static properties (like isStatic, unstopUrl) are preserved/added
              return { ...dbEvent, ...staticMatch };
            }
            return dbEvent;
          });

          // Add static events that aren't in the DB yet
          const missingStaticEvents = STATIC_EVENTS.filter(staticEvent => {
            const staticId = staticEvent._id.toString();
            return !dbEvents.some(dbEvent => 
              (dbEvent._id?.toString() === staticId) || (dbEvent.eventName === staticEvent.eventName)
            );
          });

          const mergedEvents = [...processedDbEvents, ...missingStaticEvents];

          // Split events into upcoming and past based on current date
          const now = new Date();
          const upcoming = mergedEvents.filter(
            (event) => !event.isOver,
          );
          const past = mergedEvents.filter((event) => event.isOver);

          setUpcomingEvents(upcoming);
          setPastEvents(past);
        }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleQRClick = (eventName, eventId) => {
    setQrEventName(eventName);
    setQrEventId(eventId);
    setQrModalOpen(true);
  };

  const handleQRClose = () => {
    setQrModalOpen(false);
    fetchUserRegistrations(); // Refresh registrations when closing QR in case user was scanned
    fetchUserData(); // Refresh badges too
  };

  const handleRegisterClick = (eventName, eventId) => {
    setRegisterEventName(eventName);
    setRegisterEventId(eventId);
    setRegisterModalOpen(true);
  };

  const handleSimplifiedRegister = async (event) => {
    try {
      setLoadingEvents(true);
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          simplified: true
        }),
      });

      if (response.ok) {
        // Instant redirect to Unstop
        if (event.unstopUrl) {
          window.open(event.unstopUrl, "_blank", "noopener,noreferrer");
        }
        fetchUserRegistrations();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Simplified registration error:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleKickClick = (registrationId, memberName) => {
    setKickTarget({ registrationId, memberName });
    setKickModalOpen(true);
  };

  const executeKick = async () => {
    if (!kickTarget) return;
    try {
      const response = await fetch("/api/events/team/kick", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRegistrationId: kickTarget.registrationId }),
      });
      if (response.ok) {
        fetchUserRegistrations();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to kick member");
      }
    } catch (error) {
      console.error("Error kicking:", error);
    } finally {
      setKickTarget(null);
    }
  };

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
          blur-sm
          "
        style={{ filter: "blur(8px)" }}
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

          {/* Level and Online Status */}
          <div className="flex flex-col md:flex-col gap-4">
            <div className=" pr-4 py-3">
              <div className="flex flex-row gap-2">
                <p className="text-2xl opacity-70">Level</p>
                <div
                  className="w-9 h-9 flex items-center justify-center 
                      rounded-full border-1 border-green-500"
                >
                  <p className="text-lg font-semibold">67</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex items-center bg-black/25 gap-2 transition px-4 py-2 text-xs font-medium">
                {/* Glowing green dot */}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Currently Online
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mt-6 items-start">
          {/* Left Column */}
          <section className="space-y-6 order-2 lg:order-1">
            <div className="bg-black/25 backdrop-blur-sm shadow-lg order-1 lg:order-2 h-fit self-start">
              <div className="text-xl bg-white/10 p-3 font-semibold ">
                Events Status
              </div>

              {/* Upcoming Events */}
              <div className="">
                <div className="font-medium bg-black/30 p-3">
                  Upcoming Events
                </div>
                {loadingEvents ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading events...
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No upcoming events
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-black/50 m-3 p-4 hover:bg-white/20 transition"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={event.poster || "/Profile/steam_poster.jpg"}
                          alt={event.eventName}
                          width={100}
                          height={100}
                          unoptimized
                        />
                        <div>
                          <div className="text-lg font-bold">
                            {event.eventName}
                          </div>
                          <p className="text-sm mt-1">
                            {new Date(event.eventDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {event.description}
                            </p>
                          )}
                          {(() => {
                            const reg = userRegistrations.find((r) => {
                              const regEventId = r.eventId?._id?.toString() || r.eventId?.toString();
                              return regEventId === event._id?.toString();
                            });
                            if (reg) {
                              if (reg.teamMembers?.length < event.minMembers) {
                                return (
                                  <button
                                    disabled
                                    className="bg-orange-600/50 text-orange-300 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded cursor-not-allowed border border-orange-500/30"
                                  >
                                    Team Incomplete
                                  </button>
                                );
                              }
                              if (reg.hasAttended) {
                                return (
                                  <button
                                    disabled
                                    className="bg-gray-600/50 text-gray-300 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded cursor-not-allowed border border-gray-500/30"
                                  >
                                    Attended ✓
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={() => handleQRClick(event.eventName, event._id)}
                                  className="bg-indigo-700 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded hover:bg-indigo-600 transition"
                                >
                                  QR for Entry
                                </button>
                              );
                            }
                            if (event.isRegistrationLive && !event.isOver) {
                              if (event.isStatic) {
                                return (
                                  <button
                                    onClick={() => handleSimplifiedRegister(event)}
                                    className="bg-green-700 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded hover:bg-green-600 transition"
                                  >
                                    Register
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={() => handleRegisterClick(event.eventName, event._id)}
                                  className="bg-green-700 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded hover:bg-green-600 transition"
                                >
                                  Register
                                </button>
                              );
                            }
                            return (
                              <button
                                disabled
                                className="bg-gray-700/50 text-gray-400 text-xs lg:text-sm mt-2 px-3 py-1.5 rounded cursor-not-allowed border border-gray-600/30"
                              >
                                {event.isOver ? "Event Over" : "Registration Closed"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Past Events */}
              <div>
                <h3 className="font-medium bg-black/30 p-3">Past Events</h3>
                {loadingEvents ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading events...
                  </div>
                ) : pastEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No past events
                  </div>
                ) : (
                  pastEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-black/50 m-3 p-4 hover:bg-white/20 transition"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={event.poster || "/Profile/steam_poster.jpg"}
                          alt={event.eventName}
                          width={100}
                          height={100}
                          unoptimized
                        />
                        <div>
                          <h4 className="text-lg font-bold">
                            {event.eventName}
                          </h4>
                          <p className="text-sm mt-1">
                            DATE:{" "}
                            {new Date(event.eventDate).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Registered Events */}
              <div className="mt-6">
                <h3 className="font-medium bg-black/30 p-3">Registered Events & Teams</h3>
                {userRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No registered events yet
                  </div>
                ) : (
                  userRegistrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="bg-black/50 m-3 p-4 hover:bg-white/20 transition border-l-4 border-cyan-500"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-cyan-300">
                              {reg.eventId?.eventName || "Unknown Event"}
                            </h4>
                            <p className="text-sm font-mono mt-1 text-gray-300">
                              TEAM CODE: <span className="text-yellow-400 select-all">{reg.teamCode}</span>
                            </p>
                          </div>
                          <div className="flex gap-2 items-center flex-wrap justify-end">
                            {reg.isTeamLeader && (
                              <span className="bg-yellow-500/20 text-yellow-300 text-xs border border-yellow-500/50 px-2 py-1 rounded">
                                Team Leader
                              </span>
                            )}
                            {reg.teamMembers?.length < reg.eventId?.minMembers && (
                              <span className="bg-orange-500/20 text-orange-300 text-xs border border-orange-500/50 px-2 py-1 rounded">
                                Team Incomplete
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 bg-black/30 p-3 rounded">
                          <h5 className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Team Members ({reg.teamMembers?.length || 0}/{reg.eventId?.maxMembers || "?"})</h5>
                          <div className="space-y-2">
                            {reg.teamMembers?.map((memberReg) => (
                              <div key={memberReg._id} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={memberReg.userId?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23667eea' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E"}
                                    alt="member avatar"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                  <span className="text-sm">{memberReg.userId?.name} {memberReg.isTeamLeader && "👑"}</span>
                                </div>
                                {reg.isTeamLeader && memberReg.userId?._id !== session?.user?.id && (
                                  <button
                                    onClick={() => handleKickClick(memberReg._id, memberReg.userId?.name)}
                                    className="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 px-2 py-1 rounded transition"
                                  >
                                    Kick
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="bg-black/25 backdrop-blur-sm shadow-lg order-1 lg:order-2">
            <div className="text-xl bg-white/10 p-3 font-semibold mb-3">
              Overview
            </div>

            {/* Badges */}
            <div className="px-3 mb-6">
              <div className="font-small mb-2">Badges</div>
              {userBadges.length === 0 ? (
                <p className="text-sm text-white/60">
                  No badges earned yet. Get a QR code to attend events!
                </p>
              ) : (
                <div className="flex gap-4 overflow-x-auto scrollbar-x pb-2 scroll-smooth snap-x">
                  {userBadges.filter(b => b.badgeIcon).map((badge, index) => (
                    <Image
                      key={`${badge.eventKey}-${index}`}
                      src={badge.badgeIcon}
                      alt={badge.badgeName}
                      width={64}
                      height={64}
                      unoptimized
                      className="snap-start object-contain"
                      title={badge.badgeName}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* QR Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={handleQRClose}
        eventName={qrEventName}
        eventId={qrEventId}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        eventName={registerEventName}
        eventId={registerEventId}
        onRegistrationSuccess={() => {
          setRegisterModalOpen(false);
          fetchUserRegistrations(); // Refresh registrations after successful register
        }}
      />

      {/* Confirm Kick Modal */}
      <ConfirmKickModal
        isOpen={kickModalOpen}
        onClose={() => {
          setKickModalOpen(false);
          setKickTarget(null);
        }}
        onConfirm={executeKick}
        memberName={kickTarget?.memberName || "this member"}
      />
    </div>
  );
}
