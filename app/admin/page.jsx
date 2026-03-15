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
      router.push("/unauthorized");
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  const handleToggleStatus = async (eventId, field, currentValue) => {
    try {
      const updateData = { [field]: !currentValue };
      
      // LOGIC: if admin checked event over, close registration automatically
      if (field === "isOver" && !currentValue === true) {
        updateData.isRegistrationLive = false;
      }

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-white/60"></div>
          <p className="text-white/40 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Admin Panel
          </h1>
          <p className="text-white/30 text-sm mt-1">Welcome, {session.user.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {["dashboard", "events", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                  ? "bg-white text-[#0a0a0f]"
                  : "text-white/40 hover:text-white/70"
                }`}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "events"
                  ? "Events"
                  : "Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <DashboardStat
              title="Total Events"
              value={events.length}
            />
            <DashboardStat
              title="Total Attendees"
              value={attendees.length}
            />
            <DashboardStat
              title="Active Events"
              value={events.filter((e) => !e.isOver).length}
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
                <h2 className="text-xl font-semibold mb-4 text-white">Select Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => fetchAttendees(event._id)}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-200 text-left group"
                    >
                      <h3 className="text-base font-medium text-white group-hover:text-white/90">
                        {event.eventName}
                      </h3>
                      <p className="text-white/30 text-sm mt-1">
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

function DashboardStat({ title, value }) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
      <p className="text-white/30 text-sm mb-2">{title}</p>
      <p className="text-3xl font-semibold text-white">
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
    isOver: false,
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
          isOver: false,
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-0 transition-all";
  const labelClass = "block text-sm font-medium mb-1.5 text-white/50";
  const fileInputClass = "w-full text-sm text-white/40 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.06] file:border file:border-white/[0.08] file:px-3 file:py-1.5 file:text-sm file:text-white/60 file:font-medium hover:file:bg-white/[0.1] file:transition-all file:cursor-pointer cursor-pointer";

  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <h2 className="text-xl font-semibold mb-6 text-white">
        Create New Event
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className={labelClass}>Event Date</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Points Per Attendance</label>
            <input
              type="number"
              name="pointsPerAttendance"
              value={formData.pointsPerAttendance}
              onChange={handleChange}
              min="1"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Event Poster</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              className={fileInputClass}
            />
            {posterError && (
              <p className="text-red-400 text-xs mt-1.5">{posterError}</p>
            )}
            {formData.poster && (
              <img
                src={formData.poster}
                alt="Poster preview"
                className="mt-2 w-20 h-20 object-cover rounded-lg border border-white/[0.08]"
              />
            )}
          </div>

          <div>
            <label className={labelClass}>Badge Icon</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBadgeChange}
              className={fileInputClass}
            />
            {badgeError && (
              <p className="text-red-400 text-xs mt-1.5">{badgeError}</p>
            )}
            {formData.badgeIcon && (
              <img
                src={formData.badgeIcon}
                alt="Badge preview"
                className="mt-2 w-20 h-20 object-cover rounded-lg border border-white/[0.08]"
              />
            )}
          </div>

          <div>
            <label className={labelClass}>1st Prize Badge</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 1)}
              className={fileInputClass}
            />
            {prizeError[1] && <p className="text-red-400 text-xs mt-1">{prizeError[1]}</p>}
            {formData.winnerBadge1 && (
              <img src={formData.winnerBadge1} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded-lg border border-white/[0.08]" />
            )}
          </div>

          <div>
            <label className={labelClass}>2nd Prize Badge</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 2)}
              className={fileInputClass}
            />
            {prizeError[2] && <p className="text-red-400 text-xs mt-1">{prizeError[2]}</p>}
            {formData.winnerBadge2 && (
              <img src={formData.winnerBadge2} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded-lg border border-white/[0.08]" />
            )}
          </div>

          <div>
            <label className={labelClass}>3rd Prize Badge</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePrizeBadgeChange(e, 3)}
              className={fileInputClass}
            />
            {prizeError[3] && <p className="text-red-400 text-xs mt-1">{prizeError[3]}</p>}
            {formData.winnerBadge3 && (
              <img src={formData.winnerBadge3} alt="Preview" className="mt-2 w-12 h-12 object-cover rounded-lg border border-white/[0.08]" />
            )}
          </div>

          <div>
            <label className={labelClass}>Min Members</label>
            <input
              type="number"
              name="minMembers"
              value={formData.minMembers}
              onChange={handleChange}
              min="1"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Max Members</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="1"
              className={inputClass}
            />
          </div>

          {/* Status toggles */}
          <div className="md:col-span-2 flex items-center gap-6 flex-wrap py-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isRegistrationLive"
                  checked={formData.isRegistrationLive}
                  disabled={formData.isOver}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRegistrationLive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/[0.06] border border-white/[0.1] rounded-full peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/40 transition-all"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white/20 rounded-full peer-checked:translate-x-4 peer-checked:bg-emerald-400 transition-all"></div>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Registration Live</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isOver"
                  checked={formData.isOver}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({ 
                      ...prev, 
                      isOver: checked,
                      isRegistrationLive: checked ? false : prev.isRegistrationLive 
                    }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/[0.06] border border-white/[0.1] rounded-full peer-checked:bg-amber-500/20 peer-checked:border-amber-500/40 transition-all"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white/20 rounded-full peer-checked:translate-x-4 peer-checked:bg-amber-400 transition-all"></div>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Event Over</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isHidden"
                  checked={formData.isHidden}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHidden: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/[0.06] border border-white/[0.1] rounded-full peer-checked:bg-red-500/20 peer-checked:border-red-500/40 transition-all"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white/20 rounded-full peer-checked:translate-x-4 peer-checked:bg-red-400 transition-all"></div>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Hidden from Users</span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={inputClass + " resize-none"}
            placeholder="Event description"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-white text-[#0a0a0f] text-sm font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

function EventsList({ events, onSelectEvent, onDeleteEvent, onToggleStatus, loading }) {
  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <h2 className="text-xl font-semibold mb-6 text-white">
        Events
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white/60"></div>
        </div>
      ) : events.length === 0 ? (
        <p className="text-white/30 text-center py-8 text-sm">No events found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
            >
              <h3 className="text-base font-medium mb-3 text-white">{event.eventName}</h3>

              <div className="space-y-1 text-sm text-white/30 mb-4">
                <p>{new Date(event.eventDate).toLocaleDateString()}</p>
                <p className="font-mono text-xs text-white/20">Key: {event.eventKey}</p>
                <p>Points: {event.pointsPerAttendance}</p>
                <p>Team: {event.minMembers || 1}–{event.maxMembers || 1} members</p>
              </div>

              {/* Status toggles */}
              <div className="flex flex-col gap-2 mb-4">
                <StatusToggle
                  label="Event Over"
                  checked={event.isOver}
                  onChange={() => onToggleStatus(event._id, "isOver", event.isOver)}
                  color="amber"
                />
                <StatusToggle
                  label="Registration Live"
                  checked={event.isRegistrationLive}
                  onChange={() => onToggleStatus(event._id, "isRegistrationLive", event.isRegistrationLive)}
                  color="emerald"
                />
                <StatusToggle
                  label="Hidden"
                  checked={event.isHidden}
                  onChange={() => onToggleStatus(event._id, "isHidden", event.isHidden)}
                  color="red"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectEvent(event._id)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200"
                >
                  View Attendance
                </button>

                <button
                  onClick={() => onDeleteEvent(event._id)}
                  className="px-3 py-2 rounded-lg bg-red-500/[0.06] border border-red-500/10 text-red-400/60 text-sm hover:bg-red-500/[0.12] hover:text-red-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusToggle({ label, checked, onChange, color }) {
  const colors = {
    amber: { bg: "bg-amber-500/20", border: "border-amber-500/40", dot: "bg-amber-400", text: "text-amber-400" },
    emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/40", dot: "bg-emerald-400", text: "text-emerald-400" },
    red: { bg: "bg-red-500/20", border: "border-red-500/40", dot: "bg-red-400", text: "text-red-400" },
  };
  const c = colors[color];

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className={`w-8 h-[18px] bg-white/[0.06] border border-white/[0.08] rounded-full peer-checked:${c.bg} peer-checked:${c.border} transition-all`}></div>
        <div className={`absolute top-[3px] left-[3px] w-3 h-3 bg-white/20 rounded-full peer-checked:translate-x-[14px] peer-checked:${c.dot} transition-all`}></div>
      </div>
      <span className={`text-xs ${checked ? c.text : "text-white/30"} transition-colors`}>
        {label}
      </span>
    </label>
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
        className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.08] hover:text-white/70 transition-all duration-200"
      >
        ← Back
      </button>

      <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <h2 className="text-xl font-semibold mb-5 text-white">
          {event.eventName}
        </h2>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/30 text-xs mb-1">Registrations</p>
            <p className="text-2xl font-semibold text-white">
              {filteredRegistrations.length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/30 text-xs mb-1">Scanned</p>
            <p className="text-2xl font-semibold text-white">
              {attendees?.length || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/30 text-xs mb-1">Date</p>
            <p className="text-sm font-medium text-white/70">
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/30 text-xs mb-1">Key</p>
            <p className="text-sm font-mono font-medium text-white/50 truncate">
              {event.eventKey}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/30 text-xs mb-1">Points</p>
            <p className="text-2xl font-semibold text-white">
              {event.pointsPerAttendance}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name, email, or team code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white/60"></div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <p className="text-white/30 text-center py-8 text-sm">No registrations found</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Attended
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Milestone
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Prize
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Scanned At
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-white/30 text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((record) => (
                  <tr
                    key={record._id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-all ${!record.hasAttended ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {record.userId?.image && (
                          <img
                            src={record.userId.image}
                            alt={record.userId.name}
                            className="w-7 h-7 rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium text-white/80">
                          {record.userId?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {record.userId?.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-white/[0.04] text-white/40 rounded text-xs font-mono">
                        {record.teamCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.hasAttended ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                            YES
                          </span>
                          {record.participationBadge && (
                            <img src={record.participationBadge} alt="P" className="w-5 h-5 rounded-full object-cover border border-white/[0.08]" />
                          )}
                        </div>
                      ) : (
                        <span className="text-white/20 text-xs">NO</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {record.milestoneBadge ? (
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                          {record.milestoneBadge}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {(record.prizeName || record.prizeBadge) ? (
                        <div className="flex flex-col items-center gap-1">
                          {record.prizeBadge && (
                            <div className="relative group">
                              <img src={record.prizeBadge} alt="Prize" className="w-7 h-7 rounded-full border border-amber-500/30 object-cover" />
                              <button
                                onClick={() => handleRemovePrize(record, record.prizeName?.includes("1st") ? 1 : record.prizeName?.includes("2nd") ? 2 : 3)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] hover:bg-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          <span className="text-[9px] font-medium text-amber-400/70 uppercase tracking-tight truncate max-w-[60px]">
                            {record.prizeName?.split(":")[0] || "Prize"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/20 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {record.scannedAt ? new Date(record.scannedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 text-xs font-medium">
                        +{record.pointsEarned || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAwardPrize(record, 1, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded-md bg-amber-500/[0.08] text-amber-400/60 text-[10px] font-medium border border-amber-500/10 hover:bg-amber-500/[0.15] hover:text-amber-400 transition-all"
                          title="Award 1st Prize"
                        >
                          1st
                        </button>
                        <button
                          onClick={() => handleAwardPrize(record, 2, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded-md bg-white/[0.04] text-white/30 text-[10px] font-medium border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/50 transition-all"
                          title="Award 2nd Prize"
                        >
                          2nd
                        </button>
                        <button
                          onClick={() => handleAwardPrize(record, 3, "individual")}
                          disabled={awardingPrize}
                          className="px-2 py-1 rounded-md bg-orange-500/[0.08] text-orange-400/60 text-[10px] font-medium border border-orange-500/10 hover:bg-orange-500/[0.15] hover:text-orange-400 transition-all"
                          title="Award 3rd Prize"
                        >
                          3rd
                        </button>
                        {record.teamCode !== "SOLO" && (
                          <button
                            onClick={() => handleAwardPrize(record, 1, "team")}
                            disabled={awardingPrize}
                            className="ml-1 px-2 py-1 rounded-md bg-violet-500/[0.08] text-violet-400/60 text-[10px] font-medium border border-violet-500/10 hover:bg-violet-500/[0.15] hover:text-violet-400 transition-all"
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
