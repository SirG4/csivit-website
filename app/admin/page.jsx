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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
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
        setAttendees(data.data.attendees);
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
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
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
                onBack={() => {
                  setSelectedEvent(null);
                  setAttendees([]);
                }}
                loading={loading}
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
  });
  const [submitting, setSubmitting] = useState(false);

  const posterOptions = [
    "/Events/Icons/event1.png",
    "/Events/Icons/event2.png",
    "/Events/Icons/event3.png",
    "/Home/Hero/hero.png",
  ];

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
        });
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

function EventsList({ events, onSelectEvent, onDeleteEvent, loading }) {
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
                <p>
                  Status:{" "}
                  <span
                    className={
                      event.isActive ? "text-green-400" : "text-red-400"
                    }
                  >
                    {event.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
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

function AttendanceViewer({ event, attendees, onBack, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendees = attendees.filter(
    (a) =>
      a.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-gray-400 text-sm">Total Attendees</p>
            <p className="text-3xl font-bold text-purple-400">
              {filteredAttendees.length}
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
        ) : filteredAttendees.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No attendees found</p>
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
                    Badge
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Scanned At
                  </th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-all"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {record.userId.image && (
                          <img
                            src={record.userId.image}
                            alt={record.userId.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-semibold">
                          {record.userId.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {record.userId.email}
                    </td>
                    <td className="px-4 py-3">
                      {record.badgeEarned ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold border border-yellow-500/50">
                          🏆 {record.badgeEarned}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(record.scannedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                        +{record.pointsEarned}
                      </span>
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
