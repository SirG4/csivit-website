"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "events") {
      fetchEvents();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/attendance/${eventId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedEvent(data.data.event);
        setAttendees(data.data.attendees || []);
        setRegistrations(data.data.registrations || []);
        setTeams(data.data.teams || null);
      }
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEvents();
        alert("Event deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  const handleToggleStatus = async (eventId, field, currentValue) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (response.ok) {
        fetchEvents();
      } else {
        alert("Failed to update event status");
      }
    } catch (error) {
      console.error("Failed to update event status:", error);
      alert("Failed to update event status");
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-pink-500"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
            🎮 CSI Admin Panel
          </h1>
          <p className="text-gray-400">Welcome, {session.user.name}</p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          {["dashboard", "events", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === tab
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              {tab === "dashboard"
                ? "📊 Dashboard"
                : tab === "events"
                  ? "🎪 Events"
                  : "📈 Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DashboardStat
              icon="🎉"
              title="Total Events"
              value={events.filter((e) => e.isActive).length}
            />
            <DashboardStat
              icon="👥"
              title="Total Attendees"
              value={attendees.length}
            />
            <DashboardStat
              icon="🏆"
              title="Active Events"
              value={events.filter((e) => e.isActive).length}
            />
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-8">
            <EventForm onEventCreated={fetchEvents} />
            <EventsList
              events={events}
              onSelectEvent={fetchAttendees}
              onDeleteEvent={handleDeleteEvent}
              onToggleStatus={handleToggleStatus}
              loading={loading}
            />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {selectedEvent ? (
              <AttendanceViewer
                event={selectedEvent}
                attendees={attendees}
                registrations={registrations}
                teams={teams}
                onBack={() => {
                  setSelectedEvent(null);
                  setAttendees([]);
                  setRegistrations([]);
                  setTeams(null);
                }}
                loading={loading}
                fetchAttendees={fetchAttendees}
              />
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Select Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => fetchAttendees(event._id)}
                      className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      <h3 className="text-xl font-semibold">
                        {event.eventName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardStat({ icon, title, value }) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 hover:border-purple-500/60 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-gray-400 text-sm font-semibold">{title}</h3>
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        {value}
      </p>
    </div>
  );
}

function EventForm({ onEventCreated }) {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    description: "",
    pointsPerAttendance: 10,
    poster: "",
    minMembers: 1,
    maxMembers: 1,
    badgeIcon: "",
    winnerBadge1: "",
    winnerBadge2: "",
    winnerBadge3: "",
    isRegistrationLive: false,
    isHidden: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [posterError, setPosterError] = useState("");
  const [badgeError, setBadgeError] = useState("");
  const [prizeError, setPrizeError] = useState({ 1: "", 2: "", 3: "" });

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPosterError("Please select an image file.");
      return;
    }

    // Keep payload size manageable for API + Mongo document size.
    if (file.size > 2 * 1024 * 1024) {
      setPosterError("Image must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPosterError("");
      setFormData((prev) => ({ ...prev, poster: String(reader.result || "") }));
    };
    reader.onerror = () => {
      setPosterError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleBadgeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBadgeError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setBadgeError("Image must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBadgeError("");
      setFormData((prev) => ({ ...prev, badgeIcon: String(reader.result || "") }));
    };
    reader.onerror = () => {
      setBadgeError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handlePrizeBadgeChange = (e, rank) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPrizeError(prev => ({ ...prev, [rank]: "Please select an image file." }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPrizeError(prev => ({ ...prev, [rank]: "Image must be 2MB or smaller." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPrizeError(prev => ({ ...prev, [rank]: "" }));
      setFormData((prev) => ({ ...prev, [`winnerBadge${rank}`]: String(reader.result || "") }));
    };
    reader.onerror = () => {
      setPrizeError(prev => ({ ...prev, [rank]: "Failed to read image file." }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          eventName: "",
          eventDate: "",
          description: "",
          pointsPerAttendance: 10,
          poster: "",
          minMembers: 1,
          maxMembers: 1,
          badgeIcon: "",
          winnerBadge1: "",
          winnerBadge2: "",
          winnerBadge3: "",
          isRegistrationLive: false,
          isHidden: false,
        });
        setPosterError("");
        setBadgeError("");
        setPrizeError({ 1: "", 2: "", 3: "" });
        onEventCreated();
        alert("Event created successfully!");
      } else {
        alert("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        ➕ Create New Event
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Event Date
            </label>
            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Points Per Attendance
            </label>
            <input
              type="number"
              name="pointsPerAttendance"
              value={formData.pointsPerAttendance}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Event Poster
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all file:mr-3 file:rounded file:border-0 file:bg-purple-600 file:px-3 file:py-1 file:text-white hover:file:bg-purple-500"
            />
            {posterError && (
              <p className="text-red-400 text-xs mt-2">{posterError}</p>
            )}
            {formData.poster && (
              <img
                src={formData.poster}
                alt="Poster preview"
                className="mt-3 w-24 h-24 object-cover rounded border border-gray-600"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Badge Icon
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBadgeChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all file:mr-3 file:rounded file:border-0 file:bg-purple-600 file:px-3 file:py-1 file:text-white hover:file:bg-purple-500"
            />
            {badgeError && (
              <p className="text-red-400 text-xs mt-2">{badgeError}</p>
            )}
            {formData.badgeIcon && (
              <img
                src={formData.badgeIcon}
                alt="Badge preview"
                className="mt-3 w-24 h-24 object-cover rounded border border-gray-600"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              1st Prize Badge
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 1)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs file:mr-3 file:rounded file:border-0 file:bg-yellow-600 file:px-2 file:py-1 file:text-white"
            />
            {prizeError[1] && <p className="text-red-400 text-[10px] mt-1">{prizeError[1]}</p>}
            {formData.winnerBadge1 && (
              <img src={formData.winnerBadge1} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded border border-yellow-500" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              2nd Prize Badge
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 2)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs file:mr-3 file:rounded file:border-0 file:bg-gray-400 file:px-2 file:py-1 file:text-white"
            />
            {prizeError[2] && <p className="text-red-400 text-[10px] mt-1">{prizeError[2]}</p>}
            {formData.winnerBadge2 && (
              <img src={formData.winnerBadge2} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded border border-gray-400" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              3rd Prize Badge
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 3)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs file:mr-3 file:rounded file:border-0 file:bg-orange-600 file:px-2 file:py-1 file:text-white"
            />
            {prizeError[3] && <p className="text-red-400 text-[10px] mt-1">{prizeError[3]}</p>}
            {formData.winnerBadge3 && (
              <img src={formData.winnerBadge3} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded border border-orange-600" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Minimum Members
            </label>
            <input
              type="number"
              name="minMembers"
              value={formData.minMembers}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Maximum Members
            </label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isRegistrationLive"
                checked={formData.isRegistrationLive}
                onChange={(e) => setFormData(prev => ({ ...prev, isRegistrationLive: e.target.checked }))}
                className="rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm font-semibold text-gray-300">Registration Live</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isHidden"
                checked={formData.isHidden}
                onChange={(e) => setFormData(prev => ({ ...prev, isHidden: e.target.checked }))}
                className="rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm font-semibold text-gray-300">Hidden from Users</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
            placeholder="Event description"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "🚀 Create Event"}
        </button>
      </form>
    </div>
  );
}

function EventsList({ events, onSelectEvent, onDeleteEvent, onToggleStatus, loading }) {
  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        📋 Events List
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-pink-500"></div>
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No events found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all"
            >
              <h3 className="text-xl font-bold mb-2">{event.eventName}</h3>

              <div className="space-y-1 text-sm text-gray-400 mb-4">
                <p>📅 {new Date(event.eventDate).toLocaleDateString()}</p>
                <p>🔑 Key: {event.eventKey}</p>
                <p>💎 Points: {event.pointsPerAttendance}</p>
                <p>👥 Min: {event.minMembers || 1} | Max: {event.maxMembers || 1}</p>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event.isActive}
                    onChange={() => onToggleStatus(event._id, "isActive", event.isActive)}
                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                  />
                  <span className={event.isActive ? "text-green-400" : "text-gray-400"}>
                    Event Active
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event.isRegistrationLive}
                    onChange={() => onToggleStatus(event._id, "isRegistrationLive", event.isRegistrationLive)}
                    className="rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                  />
                  <span className={event.isRegistrationLive ? "text-green-400" : "text-gray-400"}>
                    Registration Live
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event.isHidden}
                    onChange={() => onToggleStatus(event._id, "isHidden", event.isHidden)}
                    className="rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500 focus:ring-offset-gray-800"
                  />
                  <span className={event.isHidden ? "text-red-400" : "text-gray-400"}>
                    Hidden from Users
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectEvent(event._id)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm"
                >
                  👁️ View Attendance
                </button>

                <button
                  onClick={() => onDeleteEvent(event._id)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/40 transition-all text-sm border border-red-500/50"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceViewer({ event, attendees, registrations, teams, onBack, loading, fetchAttendees }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [awardingPrize, setAwardingPrize] = useState(false);

  const handleAwardPrize = async (record, rank, type = "individual") => {
    if (!confirm(`Award ${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'} Prize to this ${type}?`)) return;

    try {
      setAwardingPrize(true);
      const payload = {
        eventId: event._id,
        rank,
      };

      if (type === "individual") {
        payload.targetUserId = record.userId?._id;
      } else {
        payload.teamCode = record.teamCode;
      }

      const response = await fetch("/api/admin/events/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        alert("Prize awarded successfully!");
        fetchAttendees(event._id); // Refresh data
      } else {
        alert(data.error || "Failed to award prize");
      }
    } catch (error) {
      console.error("Error awarding prize:", error);
      alert("Error awarding prize");
    } finally {
      setAwardingPrize(false);
    }
  };

  const handleRemovePrize = async (record, rank) => {
    if (!confirm(`Remove ${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'} Prize from this user?`)) return;

    try {
      setAwardingPrize(true);
      const response = await fetch("/api/admin/events/winners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          rank,
          targetUserId: record.userId?._id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Prize removed successfully!");
        fetchAttendees(event._id); // Refresh data
      } else {
        alert(data.error || "Failed to remove prize");
      }
    } catch (error) {
      console.error("Error removing prize:", error);
      alert("Error removing prize");
    } finally {
      setAwardingPrize(false);
    }
  };

  const filteredRegistrations = (registrations || []).filter(
    (r) =>
      r.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.teamCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all"
      >
        ← Back
      </button>

      <div className="p-8 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {event.eventName}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 text-sm">Registrations</p>
            <p className="text-3xl font-bold text-purple-400">
              {filteredRegistrations.length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 text-sm">Attendees Scanned</p>
            <p className="text-3xl font-bold text-blue-400">
              {attendees?.length || 0}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 text-sm">Event Date</p>
            <p className="text-lg font-bold text-pink-400">
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 text-sm">Event Key</p>
            <p className="text-lg font-bold text-yellow-400 truncate">
              {event.eventKey}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 text-sm">Points</p>
            <p className="text-3xl font-bold text-green-400">
              {event.pointsPerAttendance}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-pink-500"></div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No registrations found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Team Code
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">
                    Milestone
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">
                    Prize
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">
                    Scanned At
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((record) => (
                  <tr
                    key={record._id}
                    className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-all ${!record.hasAttended ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {record.userId?.image && (
                          <img
                            src={record.userId.image}
                            alt={record.userId.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-semibold">
                          {record.userId?.name || "Unknown User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {record.userId?.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">
                        {record.teamCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.hasAttended ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                            YES
                          </span>
                          {record.participationBadge && (
                            <img src={record.participationBadge} alt="P" className="w-6 h-6 rounded-full object-cover border border-blue-500/30" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">NO</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {record.milestoneBadge ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30">
                          {record.milestoneBadge}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {(record.prizeName || record.prizeBadge) ? (
                        <div className="flex flex-col items-center gap-1">
                          {record.prizeBadge && (
                            <div className="relative group">
                              <img src={record.prizeBadge} alt="Prize" className="w-8 h-8 rounded-full border border-yellow-500/50 object-cover" />
                              <button
                                onClick={() => handleRemovePrize(record, record.prizeName?.includes("1st") ? 1 : record.prizeName?.includes("2nd") ? 2 : 3)}
                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] hover:bg-red-500 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-tighter truncate max-w-[60px]">
                            {record.prizeName?.split(":")[0] || "Prize"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {record.scannedAt ? new Date(record.scannedAt).toLocaleString() : "Not Scanned"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                        +{record.pointsEarned || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAwardPrize(record, 1, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30 hover:bg-yellow-500/40 transition-all"
                          title="Award 1st Prize"
                        >
                          1st
                        </button>
                        <button
                          onClick={() => handleAwardPrize(record, 2, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded bg-gray-400/20 text-gray-300 text-[10px] font-bold border border-gray-400/30 hover:bg-gray-400/40 transition-all"
                          title="Award 2nd Prize"
                        >
                          2nd
                        </button>
                        <button
                          onClick={() => handleAwardPrize(record, 3, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded bg-orange-600/20 text-orange-400 text-[10px] font-bold border border-orange-600/30 hover:bg-orange-600/40 transition-all"
                          title="Award 3rd Prize"
                        >
                          3rd
                        </button>
                        {record.teamCode !== "SOLO" && (
                          <button
                            onClick={() => handleAwardPrize(record, 1, "team")}
                            disabled={awardingPrize}
                            className="ml-2 px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30 hover:bg-purple-500/40 transition-all"
                            title="Award 1st Prize to Team"
                          >
                            Team 1st
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
