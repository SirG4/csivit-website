# 🚀 Quick Start Guide - Admin Panel

## Installation & Setup (5 minutes)

### 1. Install QR Library

```bash
npm install qrcode.react
```

### 2. Verify Files

Run the verification script to ensure all files exist:

```bash
bash verify-installation.sh
# Or manually check the files listed in IMPLEMENTATION_SUMMARY.md
```

### 3. Configure Environment

Update `.env.local`:

```
NEXTAUTH_SECRET=your_32_char_random_string
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### 4. Test Admin Access

- Go to `http://localhost:3000/login`
- Login with: `maitrey.bharambe24@gmail.com`
- Navigate to `http://localhost:3000/admin`
- You should see the admin dashboard

---

## Feature Breakdown

### 📊 Admin Dashboard (`/admin`)

**Access:** `maitrey.bharambe24@gmail.com` only

**Three Tabs:**

1. **Dashboard** - Quick stats (Events, Attendees, Active)
2. **Events** - CRUD operations for events
3. **Analytics** - Attendance viewer with search

**Example Flow:**

```
1. Go to Events tab
2. Fill "Create New Event" form
3. Click "🚀 Create Event"
4. Event appears in the list below
5. Click "👁️ View Attendance" to see attendees
```

### 🎟️ Event Creation

**Required Fields:**

- Event Name (text)
- Event Date (datetime)
- Poster (select from dropdown)
- Optional: Description, Points

**Auto-Generated:**

- eventKey (unique, 16-char hex)
- createdAt timestamp

### 👥 Attendance Tracking

**Mark Attendance:**

1. User generates QR via `/api/qr/generate`
2. QR contains: `eventKey`, `eventId`, `timestamp`
3. User scans QR (or simulates with `/api/attendance/mark`)
4. System:
   - Validates event exists & is active
   - Checks for duplicates (409 error if already marked)
   - Calculates badge based on attendance count
   - Awards points
   - Saves to database

**Admin View:**

- See all attendees per event
- View badges earned
- View points per attendance
- Search by name/email
- Export-ready table format

### 🏆 Gamification

**Badges:**

- 🗺️ **Rookie Explorer** → 1 event
- 🏃 **Maze Runner** → 3 events
- 👑 **Legend of CSI** → 5+ events

**Points:**

- Default: 10 per event
- Configurable per event
- Stored in Attendance record
- Accumulates per user

---

## API Quick Reference

### For Developers Using These APIs

#### Create Event (Admin Only)

```javascript
const response = await fetch("/api/admin/events", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventName: "Tech Workshop",
    eventDate: "2024-12-25T10:00:00Z",
    poster: "/Events/Icons/event1.png",
    pointsPerAttendance: 15,
  }),
});
```

#### Generate QR Payload

```javascript
const response = await fetch("/api/qr/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ eventId: "event_id_here" }),
});
const { payload } = await response.json();
// payload = JSON string with eventKey, eventId, timestamp
```

#### Mark Attendance

```javascript
const response = await fetch("/api/attendance/mark", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventKey: "a1b2c3d4",
    eventId: "507f1f77bcf86cd799439011",
  }),
});

if (response.status === 409) {
  // User already marked attendance
  console.log("Already Claimed");
} else if (response.ok) {
  const data = await response.json();
  console.log(`Earned ${data.data.pointsEarned} points`);
  if (data.data.badgeEarned) {
    console.log(`Unlocked: ${data.data.badgeEarned}`);
  }
}
```

#### Get Attendees (Admin Only)

```javascript
const response = await fetch("/api/admin/attendance/event_id_here");
const { data } = await response.json();
console.log(data.attendees); // Array of attendees with badges
```

---

## Folder Structure Reference

```
app/
├── admin/
│   └── page.jsx ........................ Main dashboard (admin only)
├── unauthorized/
│   └── page.jsx ........................ 403 error page
├── api/
│   ├── admin/
│   │   ├── events/
│   │   │   ├── route.js ............... GET/POST events
│   │   │   └── [id]/route.js ......... PUT/DELETE event
│   │   └── attendance/
│   │       └── [eventId]/route.js .... GET attendees
│   ├── attendance/
│   │   ├── mark/route.js ............. POST mark attendance
│   │   └── scan/route.js ............. POST scan QR (updated)
│   └── qr/
│       └── generate/route.js ......... POST generate QR
├── auth/
│   └── [...nextauth]/route.js ......... Auth config (existing)
│
models/
├── Event.js ............................ Event model (new)
├── Attendance.js ...................... Updated with new fields
└── User.js ............................ Existing, has badges array
│
lib/
├── adminAuth.js ....................... Admin verification
├── gamification.js .................... Badge & points logic
├── apiResponses.js .................... Response formats
├── qrIntegration.js ................... QR helpers
├── db.js ............................. Existing connection
└── ... (other existing files)
│
├── ADMIN_PANEL_GUIDE.md ............... Full documentation
├── IMPLEMENTATION_SUMMARY.md .......... Overview & checklist
├── SCANNER_INTEGRATION_EXAMPLE.jsx ... Example scanner page
└── verify-installation.sh ............. Verification script
```

---

## Common Tasks

### Create Test Event

```javascript
// POST /api/admin/events
{
  "eventName": "Dev Workshop",
  "eventDate": "2024-12-30T14:00:00Z",
  "poster": "/Events/Icons/event1.png",
  "pointsPerAttendance": 10,
  "description": "A technical workshop"
}
```

### View All Events

```javascript
// GET /api/admin/events
// Response: { success: true, data: [events] }
```

### Delete Event (Soft)

```javascript
// DELETE /api/admin/events/event_id
// Sets isActive = false (doesn't delete data)
```

### View Event Attendees

```javascript
// GET /api/admin/attendance/event_id
// Response: { attendees: [], totalAttendees: 0, event: {} }
```

---

## Debugging Tips

**Event not appearing in dashboard?**

- Check if event.isActive = true
- Check MongoDB for duplicate eventKey
- Check user has admin email

**QR generation fails?**

- Verify user is logged in
- Verify eventId is valid ObjectId
- Verify event.isActive = true

**Attendance mark returns 409?**

- User already marked attendance for this event
- This is correct behavior!
- Show user: "Already Claimed" message

**Admin panel redirects to /unauthorized?**

- Check user email matches exactly: `maitrey.bharambe24@gmail.com`
- Check session is valid (not expired)
- Clear cookies and re-login

**Database errors?**

- Check MONGO_URI in .env.local
- Verify MongoDB is running
- Check network connectivity to MongoDB Atlas

---

## Performance Optimization

**Database:**

- Compound unique index on Attendance (userId + eventId)
- Indexed queries for fast lookups

**Frontend:**

- Event list cached in state
- Lazy load attendee data on demand
- Use Next.js Image optimization for posters

**API:**

- Stateless API routes
- Session-based auth (no database queries for every request)
- Efficient population of user data

---

## Security Checklist

- [x] Admin email hardcoded (not settable)
- [x] All admin routes validate email
- [x] NextAuth session validation
- [x] No client-side authorization (API checks)
- [x] Soft delete (no data loss)
- [x] Compound unique index (prevents duplicates)
- [x] User can't edit another user's attendance
- [x] Event key auto-generated (no user input)
- [x] QR payload includes timestamp (optional expiry)

---

## Testing Checklist

- [ ] Admin dashboard loads
- [ ] Create event works
- [ ] Event appears in list
- [ ] Delete event soft deletes
- [ ] Can view attendees for event
- [ ] QR generation works
- [ ] Mark attendance works
- [ ] Can't mark attendance twice (409)
- [ ] Badge appears after 3 attendances
- [ ] Non-admin sees /unauthorized
- [ ] Unauthenticated user sees /login

---

## Next Features to Build

1. **Leaderboard** - Top users by points
2. **Badge Display** - Show badges on profile
3. **Export** - Download attendance as CSV
4. **Charts** - Attendance stats per event
5. **Notifications** - New event alerts
6. **Batch Import** - Add events in bulk

---

## Support

**Documentation:**

- [ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md) - Complete API reference
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - All files & schemas
- [SCANNER_INTEGRATION_EXAMPLE.jsx](./SCANNER_INTEGRATION_EXAMPLE.jsx) - Example code

**Troubleshooting:**

1. Check ADMIN_PANEL_GUIDE.md "Troubleshooting" section
2. Review API response formats
3. Check console for errors
4. Verify MongoDB connection

---

**Ready to go!** 🚀

```bash
# Start development
npm run dev

# Open admin panel (after login with admin email)
http://localhost:3000/admin
```
