# CSI-VIT Website — Complete Backend Documentation

> **Framework**: Next.js 14+ App Router (server-side route handlers)
> **Database**: MongoDB via Mongoose (hosted on MongoDB Atlas)
> **Auth**: NextAuth.js v4 (JWT strategy)
> **File Storage**: Azure Blob Storage
> **Language**: JavaScript (ESM)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Tree](#2-directory-tree)
3. [Environment Variables](#3-environment-variables)
4. [Database Connection — lib/db.js](#4-database-connection--libdbjs)
5. [Mongoose Models](#5-mongoose-models)
6. [Library / Utility Files](#6-library--utility-files)
7. [API Routes — Full Reference](#7-api-routes--full-reference)
8. [Auth & Session Flow](#8-auth--session-flow)
9. [Team & Registration Flow](#9-team--registration-flow)
10. [Attendance & QR Flow](#10-attendance--qr-flow)
11. [Gamification System](#11-gamification-system)
12. [Admin Privilege System](#12-admin-privilege-system)
13. [What is NOT Implemented / Known Gaps](#13-what-is-not-implemented--known-gaps)
14. [HTTP Status Code Reference](#14-http-status-code-reference)

---

## 1. Architecture Overview

The backend is built entirely inside a **Next.js App Router** project. There is no separate Express/Fastify server. All HTTP endpoints live under `app/api/` as `route.js` files. Each file exports named async functions matching HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

```
Browser / Mobile Client
        |
        v
 Next.js Edge / Node.js Runtime
        |
        |-- NextAuth (session management)
        |         └─ JWT stored in cookie (30-day expiry)
        |-- API Route Handlers (app/api/**/route.js)
        |         └─ Mongoose ODM
        |                  └─ MongoDB Atlas
        └── Azure Blob Storage (event poster images)
```

Key design decisions:
- **No REST versioning** — all routes are flat under `/api/`.
- **Session-gated routes** use `getServerSession(authOptions)` server-side so JWTs are never exposed to client JS.
- **Admin routes** throw an exception from `requireAdmin()` which propagates and is caught by each route's top-level `try/catch`.
- **Mongoose connection** is singleton-cached on `global.mongoose` to survive hot-reloads and serverless cold-starts.

---

## 2. Directory Tree

```
app/api/
├── admin/
│   ├── attendance/
│   │   └── [eventId]/
│   │       └── route.js          <- GET attendance dashboard for one event
│   ├── events/
│   │   ├── route.js              <- GET all events | POST create event
│   │   ├── [id]/
│   │   │   └── route.js          <- PUT update event | DELETE hard-delete event
│   │   ├── poster-upload/
│   │   │   └── route.js          <- POST upload poster via multipart form
│   │   └── winners/
│   │       └── route.js          <- POST award prize badge | DELETE revoke prize badge
│   └── registrations/
│       └── [registrationId]/
│           └── route.js          <- DELETE remove a registration (admin-force)
├── attendance/
│   ├── mark/
│   │   └── route.js              <- POST self-mark attendance (user scans QR)
│   └── scan/
│       └── route.js              <- POST admin scans user entry-pass QR
├── auth/
│   ├── [...nextauth]/
│   │   └── route.js              <- GET|POST — NextAuth handler (login/logout/OAuth)
│   └── signup/
│       └── route.js              <- POST create account with email+password
├── events/
│   ├── route.js                  <- GET public event listing
│   ├── register/
│   │   └── route.js              <- POST register for event | PATCH edit registration
│   └── team/
│       ├── cancel/
│       │   └── route.js          <- DELETE disband entire team (leader only)
│       └── kick/
│           └── route.js          <- DELETE remove one member from team (leader only)
├── qr/
│   └── generate/
│       └── route.js              <- POST generate QR payload for an event
└── user/
    ├── badges/
    │   └── route.js              <- GET current user's badge collection
    └── registrations/
        └── route.js              <- GET current user's registrations with team info

lib/
├── db.js                         <- Mongoose singleton connection with retry
├── adminAuth.js                  <- requireAdmin() / checkAdminAccess() helpers
├── azureBlob.js                  <- Azure Blob Storage upload helpers
├── avatarGenerator.js            <- DiceBear avatar URL generator
├── gamification.js               <- Badge/points tier logic (NOT used in live routes)
├── qrIntegration.js              <- Client-side QR fetch helper + payload parser
├── apiResponses.js               <- Shared response constants
├── eventConfig.js                <- Static event key registry (legacy)
└── devTools.js                   <- Development utilities

models/
├── User.js
├── Event.js
├── Registration.js
└── Attendance.js
```

---

## 3. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Yes | Signs/verifies JWT tokens |
| `NEXTAUTH_URL` | Yes | Base URL of the app (e.g. `https://csivit.com`) |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth2 app client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google OAuth2 app client secret |
| `GITHUB_CLIENT_ID` | OAuth | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth | GitHub OAuth app client secret |
| `AZURE_STORAGE_CONNECTION_STRING` | Poster uploads | Full Azure connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | Poster uploads | Name of the blob container |

> WARNING: If `MONGO_URI` is missing the app will throw at module load time — it will not start.
> Azure variables are optional; if absent, any poster upload attempt throws a descriptive error.

---

## 4. Database Connection — lib/db.js

### How it works

```
dbConnect() called
     |
     |-- Is cached.conn alive AND mongoose.readyState === 1?
     |        └─ YES → return cached.conn immediately (zero overhead)
     |
     |-- Is cached.promise in-flight AND readyState === 2 (connecting)?
     |        └─ YES → await the in-flight promise (avoids duplicate connections)
     |
     └── Otherwise → create new mongoose.connect() promise
              └─ Retry up to 2 times on failure, with 1-second delay between
              └─ Each attempt times out after 20 seconds
```

### Connection pool options

| Option | Value | Reason |
|---|---|---|
| `maxPoolSize` | 20 | Handle concurrent serverless invocations |
| `minPoolSize` | 2 | Keep warm connections |
| `maxIdleTimeMS` | 30 000 | Free idle connections after 30s |
| `socketTimeoutMS` | 45 000 | Atlas round-trip safety net |
| `connectTimeoutMS` | 15 000 | Fail fast on bad network |
| `serverSelectionTimeoutMS` | 15 000 | Ditto |
| `heartbeatFrequencyMS` | 10 000 | Detect broken connections |
| `retryWrites` | true | Atlas recommended |
| `retryReads` | true | Atlas recommended |
| `family` | 4 | Force IPv4 to avoid DNS issues |
| `bufferCommands` | false | Throw immediately if not connected |

### resetDbConnection()

Exported separately. Clears `cached.conn` and `cached.promise`, then calls `mongoose.disconnect()`. Used by the registration route's `withMongoRetry` wrapper when a transient network error is detected — the connection is reset and the operation is attempted one more time.

---

## 5. Mongoose Models

### 5.1 User Model

**File**: `models/User.js`

```
User {
  name         String   required
  email        String   required, unique, lowercase, validated with regex
  password     String   NOT selected by default (select: false) — bcrypt hash
  provider     String   enum: ["credentials", "google", "github"]  default: "credentials"
  providerId   String   OAuth provider account ID
  image        String   URL to avatar image
  badges       [Badge]  see sub-schema below
  role         String   enum: ["user", "admin"]  default: "user"
  createdAt    Date     auto (timestamps: true)
  updatedAt    Date     auto (timestamps: true)
}

Badge (embedded subdocument) {
  eventKey     String   required — which event this badge belongs to
  badgeName    String   required — human-readable badge title
  badgeIcon    String   URL or base64 of the badge image
  earnedAt     Date     default: Date.now
}
```

**Notes:**
- `password` field uses `select: false` — you must explicitly `.select('+password')` to retrieve it. This prevents accidental password exposure in any query.
- `mongoose.models.User` is deleted before re-registering the model to avoid "Cannot overwrite model once compiled" errors during hot-reload in development.
- Badges are an embedded array, not a separate collection — every badge query is O(1) (single document fetch). The tradeoff is that a user with many badges has a larger document.

---

### 5.2 Event Model

**File**: `models/Event.js`

```
Event {
  eventName           String   required, trimmed
  eventDate           Date     required
  eventKey            String   unique, lowercase, sparse (auto-generated on save)
  isOver              Boolean  default: false
  pointsPerAttendance Number   default: 10
  description         String   default: ""
  poster              String   URL, default: "/Events/Icons/event1.png"
  minMembers          Number   default: 1
  maxMembers          Number   default: 1
  badgeIcon           String   URL/base64 — participation badge image
  winnerBadge1        String   URL/base64 — 1st place badge image
  winnerBadge2        String   URL/base64 — 2nd place badge image
  winnerBadge3        String   URL/base64 — 3rd place badge image
  isRegistrationLive  Boolean  default: false
  isHidden            Boolean  default: false
  createdAt           Date     default: Date.now (also in timestamps)
  updatedAt           Date     auto (timestamps: true)
}
```

**Indexes:**

| Index | Fields | Purpose |
|---|---|---|
| Compound | `isHidden, eventDate` | Main public listing query |
| Compound | `isOver, eventDate` | Past/upcoming filter |
| Compound | `isHidden, isOver, eventDate` | Profile upcoming-events query |
| Single | `eventName` | Event lookups by name |
| Single | `isHidden` | Admin hidden-filter |

**eventKey auto-generation (pre-save hook):**
Before a new Event document is saved, if `eventKey` is missing, the hook generates a random 16-character hex string (`crypto.randomBytes(8).toString('hex')`), checks uniqueness against the database, and retries up to 10 times. The key is only set if a unique value is found.

**Business rule enforced by PUT route (not model):**
If `isOver` is set to `true`, `isRegistrationLive` is automatically forced to `false`.

---

### 5.3 Registration Model

**File**: `models/Registration.js`

```
Registration {
  userId        ObjectId   ref: "User"   required
  eventId       ObjectId   ref: "Event"  required
  name          String     required, trimmed — user's display name at registration time
  phone         String     required, trimmed
  teamCode      String     required, trimmed — 6-char alphanumeric code shared by team
  isTeamLeader  Boolean    default: false
  createdAt     Date       auto
  updatedAt     Date       auto
}
```

**Indexes:**

| Index | Fields | Unique | Purpose |
|---|---|---|---|
| Compound | `userId, eventId` | YES | Prevent duplicate registrations |
| Single | `userId` | No | Fetch user's registrations |
| Single | `eventId` | No | Fetch event's registrations |
| Compound | `eventId, teamCode` | No | Fetch team members |
| Single | `teamCode` | No | Team lookups |

**Key design note:** The unique index on `(userId, eventId)` enforces at the database level that one user can only register once per event. The application also checks this before inserting, but the DB index is the final safety net (returns error code `11000` on duplicate).

---

### 5.4 Attendance Model

**File**: `models/Attendance.js`

```
Attendance {
  userId              ObjectId   ref: "User"   required
  eventId             ObjectId   ref: "Event"  required
  eventKey            String     required — denormalized for faster lookups
  scannedAt           Date       default: Date.now
  badgeEarned         String     legacy/general badge reference (null if none)
  participationBadge  String     event's badgeIcon URL (the base attendance reward)
  milestoneBadge      String     gamification tier name (Rookie, Maze Runner, etc.)
  prizeBadge          String     winner badge URL (set later by admin)
  prizeName           String     prize rank title ("1st Prize: EventName")
  pointsEarned        Number     default: 0
  createdAt           Date       auto
  updatedAt           Date       auto
}
```

**Indexes:**

| Index | Fields | Unique | Purpose |
|---|---|---|---|
| Compound | `userId, eventId` | YES | One attendance record per user per event |
| Compound | `userId, eventKey` | YES | Same constraint via eventKey |
| Single | `userId` | No | Fetch user's attendance history |

**Badge architecture (three distinct badge types):**
- `participationBadge` — awarded automatically when attendance is first marked.
- `milestoneBadge` — tier-based (e.g., "Rookie", "Legend") — field exists in schema but is NOT populated by current routes. See Known Gaps.
- `prizeBadge` + `prizeName` — awarded post-event by an admin via `/api/admin/events/winners`.

---

## 6. Library / Utility Files

### 6.1 lib/adminAuth.js

Provides two exported functions:

#### requireAdmin()
```
async function requireAdmin() → session
```
- Calls `getServerSession(authOptions)` to read the current JWT session server-side.
- If no session → throws `Error("Unauthorized")`
- If session role is not `"admin"` → throws `Error("Forbidden")`
- If valid admin → returns the session object.

**All admin routes call `await requireAdmin()` as their first statement.** Because it throws, any non-admin request is caught by the surrounding `try/catch` and returns the appropriate error response.

#### checkAdminAccess()
A softer variant that catches the error from `requireAdmin()` and returns a `NextResponse.json(...)` instead of rethrowing. Not currently used by any route file.

---

### 6.2 lib/azureBlob.js

Handles uploading event poster images to Azure Blob Storage.

#### Internal helpers (not exported):

| Function | Purpose |
|---|---|
| `assertAzureConfigured()` | Throws if env vars are missing |
| `getContainerClient()` | Creates `BlobServiceClient` from connection string |
| `ensureContainer()` | Creates container if it doesn't exist |
| `parseConnectionString()` | Extracts `AccountName` and `AccountKey` |
| `buildReadableBlobUrl()` | Generates a SAS URL with 10-year expiry, read-only permissions |
| `sanitizeFileName()` | Replaces non-alphanumeric chars with `-` |
| `buildBlobName()` | Creates path: `events/posters/{timestamp}-{uuid}.{ext}` |

#### Exported functions:

**`uploadEventPosterBuffer({ buffer, contentType, originalName })`**
- Uploads a raw `Buffer` to Azure.
- Returns a SAS URL to the uploaded blob.

**`uploadEventPosterFromFile(file)`**
- Accepts a `File` object (from `formData.get('poster')`).
- Converts it to a buffer, then calls `uploadEventPosterBuffer`.

**`uploadEventPosterFromDataUrl(dataUrl)`**
- Accepts a base64 data URL string (e.g., `data:image/png;base64,...`).
- Parses the MIME type and base64 data, then calls `uploadEventPosterBuffer`.

**SAS URL expiry:** 10 years from upload time. The `startsOn` is set 5 minutes in the past to handle clock skew.

---

### 6.3 lib/avatarGenerator.js

```
generateAvatarUrl(seed: string) → string
```

Randomly selects one of three DiceBear v7 styles (`avataaars`, `pixel-art`, `lorelei`) and returns a URL:
```
https://api.dicebear.com/7.x/{style}/svg?seed={encodedSeed}&scale=80
```

Called during email/password signup to give new users an avatar automatically. The seed is the user's email, ensuring the same email always has the same avatar across runs (but the style is random each call).

---

### 6.4 lib/gamification.js

Defines a **points-to-tier** system. These functions are defined but NOT called by any current API route. They exist as utility helpers for potential future use.

| Tier | Points Required | Display |
|---|---|---|
| Rookie | 0+ | Rookie |
| Maze Runner | 5+ | Maze Runner |
| Legend | 15+ | Legend |

#### Exported functions:

- **`calculateBadge(totalPoints)`** — Returns tier name string for the given points.
- **`getBadgeName(badge)`** — Returns emoji + text for a tier string.
- **`getBadgesInfo()`** — Returns the full `BADGES` and `BADGE_REQUIREMENTS` config objects.
- **`getNextBadgeMilestone(currentPoints)`** — Returns next tier info with `pointsNeeded` and `progress` (0-100%).

---

### 6.5 lib/qrIntegration.js

**Client-side utility** (not a server route). Used by frontend components.

#### markAttendance(eventKey, eventId)
Makes a `fetch` POST to `/api/attendance/mark`. Returns a standardized result object:
```
{
  success: boolean,
  status: number,
  message: string,
  description: string,
  data?: object  // on success
}
```

#### parseQRPayload(qrData)
Parses raw QR code data. Supports two formats:
1. **JSON object**: `{ "eventKey": "...", "eventId": "..." }` — primary format.
2. **Colon-delimited string**: `"eventKey:eventId"` — legacy fallback format.

Returns `{ valid: true, eventKey, eventId }` or `{ valid: false, message }`.

---

### 6.6 lib/apiResponses.js

Defines shared response constants (not currently used by any route — routes all inline their own responses):

```
ADMIN_RESPONSES = {
  UNAUTHORIZED    → { status: 401 }
  FORBIDDEN       → { status: 403 }
  NOT_FOUND       → { status: 404 }
  CONFLICT        → { status: 409 }
  ALREADY_CLAIMED → { status: 409, "Already Claimed" }
  INACTIVE_EVENT  → { status: 400 }
}
```

Also exports `createResponse(status, data)` — a thin wrapper that returns `{ status, body: data }`.

---

### 6.7 lib/eventConfig.js

A static registry of hardcoded event keys, kept for legacy purposes:

```js
EVENTS = {
  CSI_ORIENTATION_2025: {
    eventKey: "CSI_ORIENTATION_2025",
    eventName: "CSI Orientation 2025",
    badgeName: "Orientation Explorer",
    isActive: true,
  }
}
CURRENT_EVENT = first active event from EVENTS
```

**Not used by any current route handler.** The system now stores events dynamically in MongoDB.

---

### 6.8 lib/devTools.js

Development-only utilities (6.7 KB). Contains seeding/testing helpers. Not part of production backend logic.

---

## 7. API Routes — Full Reference

### 7.1 Auth Module

#### 7.1.1 POST /api/auth/signup

**File**: `app/api/auth/signup/route.js`
**Auth required**: No
**Purpose**: Create a new user account with email + password.

**Request body (JSON):**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Logic (step by step):**
1. Connects to MongoDB via `dbConnect()`.
2. Validates that `name`, `email`, and `password` are all present.
3. Checks if a User document with the same `email` already exists.
4. Generates a bcrypt salt (10 rounds) and hashes the password.
5. Calls `generateAvatarUrl(email)` to generate a random DiceBear avatar.
6. Creates a new User document with `provider: "credentials"`.
7. Returns `{ message: "User created successfully", userId }`.

**Responses:**

| Status | When |
|---|---|
| `201` | User created successfully |
| `400` | Missing fields |
| `400` | Email already taken ("User already exists") |
| `500` | Unexpected server error |

**What is NOT done here:**
- No email verification.
- No password strength validation.
- No rate limiting.

---

#### 7.1.2 GET|POST /api/auth/[...nextauth]

**File**: `app/api/auth/[...nextauth]/route.js`
**Auth required**: No (this IS the auth endpoint)
**Purpose**: Catch-all NextAuth handler for login, logout, session fetching, and OAuth callbacks.

**Providers configured:**

| Provider | Env vars needed |
|---|---|
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Credentials (email/password) | None — uses DB |

**Credentials provider logic:**
1. Finds user by email using `.select('+password')` to retrieve the hidden field.
2. Compares submitted password against stored bcrypt hash via `bcryptjs.compare()`.
3. On success returns `{ id, name, email, image, role }`.
4. On failure throws `"Invalid email or password"` — both wrong email and wrong password show the same message (prevents email enumeration).

**OAuth signIn callback (Google/GitHub):**
1. Lowercases the provider email.
2. If email is missing (e.g., private GitHub email) → redirects to `/login?error=OAuthEmailMissing`.
3. Looks up user by email:
   - **Not found** → creates new User document.
   - **Found** → links provider/providerId if not already set; updates image and name if missing.
4. Stores the MongoDB `_id` on the `user.id` field so NextAuth's `jwt` callback can save it.

**JWT callback:**
- On initial sign-in: copies `user.id` and `user.role` into the JWT token.

**Session callback:**
- On every session check: fetches the User document from MongoDB by `token.id`.
- Refreshes `session.user` with live DB values for `name`, `email`, `image`, and `role`.
- This means role changes take effect on the next session read without requiring logout.

**Session strategy:** `jwt` (stored in httpOnly cookie, not server-side).
**Token/session max age:** 30 days.

**Custom pages:**
- `signIn` → `/login`
- `error` → `/login`

---

### 7.2 Events Module (Public)

#### 7.2.1 GET /api/events

**File**: `app/api/events/route.js`
**Auth required**: No
**Purpose**: Public listing of all non-hidden events.

**Caching (in-memory):**
A `global.eventsApiCache` object with `{ data, timestamp }` is maintained per server process. TTL is **5 minutes** (`EVENTS_CACHE_TTL_MS = 5 * 60 * 1000`).

**Logic:**
1. Connects to DB with an **8-second timeout** on the connection itself.
2. Queries: `Event.find({ isHidden: false })` sorted by `eventDate: 1`, selecting only: `eventName, eventDate, description, poster, minMembers, maxMembers, isRegistrationLive, isOver`.
3. Uses a **15-second timeout** on the query (`.maxTimeMS(10000)` on Mongoose + 15s `Promise.race` wrapper).
4. On success: stores result in cache, sets `Cache-Control: public, s-maxage=120, stale-while-revalidate=300` header.
5. **On failure**: if cache has data less than 5 minutes old → serves stale data with `degraded: true` flag and a shorter `s-maxage=60`.

**Response body:**
```json
{
  "success": true,
  "data": ["...events"],
  "degraded": true
}
```
(The `degraded` flag only appears when serving stale cache data.)

**What is explicitly excluded from response:** `badgeIcon`, `winnerBadge1/2/3`, `eventKey` — only safe public fields.

---

#### 7.2.2 POST /api/events/register

**File**: `app/api/events/register/route.js`
**Auth required**: Yes (any logged-in user)
**Purpose**: Register the current user for an event.

**Request body (JSON):**
```json
{
  "eventId": "MongoDB ObjectId (required)",
  "name": "string (required unless simplified=true)",
  "phone": "string (required unless simplified=true)",
  "teamCode": "string (required if not generating)",
  "generateTeamCode": "boolean — create a new team",
  "simplified": "boolean — skip name/phone, auto-generate team"
}
```

**Logic:**
1. **Auth**: Reads session. Falls back to DB lookup by email if `session.user.id` is missing.
2. **Simplified mode** (when `simplified: true`):
   - Uses `session.user.name` as the registration name.
   - Sets phone to `"Not Provided (Simplified)"`.
   - Forces `generateTeamCode: true` (every simplified registration creates its own solo team).
3. **Normal mode**: Requires `eventId`, `name`, `phone`.
4. Connects to DB using `withMongoRetry()` wrapper (auto-retries on transient network errors by calling `resetDbConnection()` then `dbConnect()` once).
5. Fetches the Event by `eventId`.
6. **Static event fallback**: If the event is not found and the ID matches one of two hardcoded IDs (`6b2f1a2b3c4d5e6f7a8b9c01` for "CSIVIT Orientation" or `6b2f1a2b3c4d5e6f7a8b9c02` for "Code2Create"), it creates the event on-the-fly. This is a legacy mechanism.
7. Checks `isRegistrationLive` and `isOver` (skipped in simplified mode).
8. Checks for duplicate registration via `Registration.findOne({ userId, eventId })`.
9. **Team code handling**:
   - `generateTeamCode: true` → generates random 6-character uppercase alphanumeric code, sets `isTeamLeader: true`.
   - `generateTeamCode: false` + `teamCode` provided → validates team code exists in this event, that a team leader exists, and that team is not full (`count < maxMembers`).
10. Creates `Registration` document.

**Responses:**

| Status | When |
|---|---|
| `201` | Registered successfully |
| `400` | Missing fields / registration not live / event over / already registered / team full / invalid team code |
| `401` | Not authenticated |
| `404` | Event not found |
| `500` | Server/DB error (user-friendly message for connection issues) |

---

#### 7.2.3 PATCH /api/events/register

**File**: `app/api/events/register/route.js` (same file, different HTTP method)
**Auth required**: Yes
**Purpose**: Edit an existing registration (name, phone, or team code).

**Request body (JSON):**
```json
{
  "registrationId": "string (required)",
  "name": "string (required)",
  "phone": "string (required)",
  "teamCode": "string (optional — join different team)",
  "generateTeamCode": "boolean (optional — become leader of a new team)"
}
```

**Logic:**
1. Finds the Registration by `_id` AND `userId` (ownership check — cannot edit someone else's).
2. Checks event is not over.
3. Updates `name` and `phone`.
4. If `generateTeamCode: true` → new random team code, `isTeamLeader: true`.
5. If new `teamCode` provided and different from current → validates team exists + not full → sets `isTeamLeader: false` (joining an existing team).
6. Saves and returns the updated registration.

---

#### 7.2.4 DELETE /api/events/team/cancel

**File**: `app/api/events/team/cancel/route.js`
**Auth required**: Yes (must be the team leader)
**Purpose**: Disband an entire team — removes ALL members' registrations.

**Request body (JSON):**
```json
{ "leaderRegistrationId": "string (required)" }
```

**Logic:**
1. Finds the leader's Registration document.
2. Verifies the requester is the owner of that registration AND `isTeamLeader: true`.
3. Checks the event is not over.
4. Checks no team member has already marked attendance — if any have, cancellation is blocked.
5. Deletes ALL Registration documents for that event + team code.

**Guard conditions:**
- Non-leaders cannot cancel.
- Cannot cancel after attendance has been marked.
- Cannot cancel for a completed event.

---

#### 7.2.5 DELETE /api/events/team/kick

**File**: `app/api/events/team/kick/route.js`
**Auth required**: Yes (must be the team leader)
**Purpose**: Remove a single member from the team.

**Request body (JSON):**
```json
{ "targetRegistrationId": "string (required)" }
```

**Logic:**
1. Finds the target Registration.
2. Verifies the requester is a team leader for the **same event and team code** as the target.
3. Prevents leader from kicking themselves.
4. Deletes the target Registration document.

**Note:** No attendance or badge cleanup is done when kicking. If the kicked user already marked attendance, that record remains.

---

### 7.3 Attendance Module

#### 7.3.1 POST /api/attendance/mark

**File**: `app/api/attendance/mark/route.js`
**Auth required**: Yes (any user)
**Purpose**: User marks their own attendance by entering an event key (from QR code or display).

**Request body (JSON):**
```json
{
  "eventKey": "string (required)",
  "eventId": "string (required)"
}
```

**Logic (step by step):**
1. Validates session exists (`session.user.id`).
2. Validates `eventKey` and `eventId` are present.
3. Fetches Event → validates it is not `isOver`.
4. Validates `event.eventKey === eventKey` (prevents using a key for the wrong event).
5. Checks user has a Registration for this event (403 if not).
6. Checks for existing Attendance record → returns `409 "Already Claimed"` if found.
7. Counts user's total previous attendance records (stored but currently unused — was intended for milestone badges).
8. Creates Attendance document: `pointsEarned = event.pointsPerAttendance`, `participationBadge = event.badgeIcon`.
9. Fetches User document → if event has `badgeIcon` and user doesn't already have a badge for this `eventKey` + `eventName` combo → pushes new badge into `user.badges`.
10. Saves user, returns success with attendance details.

**Duplicate handling:** Both the explicit pre-check (step 6) and the MongoDB unique index catch duplicates — the `catch` block handles `error.code === 11000` identically.

---

#### 7.3.2 POST /api/attendance/scan

**File**: `app/api/attendance/scan/route.js`
**Auth required**: Yes (user or admin)
**Purpose**: Process a QR code scan. Can mark attendance for the scanner themselves OR for another user (admin-only).

**Request body (JSON):**
```json
{
  "eventId": "string (required)",
  "eventKey": "string (optional)",
  "timestamp": "number (optional, parsed but not validated)",
  "userId": "string (optional — admin scanning a user's entry pass)"
}
```

**Dual-mode operation:**

| Scenario | Who scans | userId in body | Result |
|---|---|---|---|
| User self-scan | Any logged-in user | Absent | Marks attendance for `session.user.id` |
| Admin scan of user entry pass | Admin | Present | Marks attendance for the specified `userId` |

**Logic:**
1. Validates session.
2. Parses JSON body (handles both object and legacy raw string formats for `eventId`).
3. If `userId` is in the body → verifies `session.user.role === "admin"` (403 if not).
4. Fetches Event → validates it is not `isOver`.
5. If `eventKey` is provided in body → validates it matches the event's key.
6. Checks target user's Registration exists — if not, returns 403 with the user's name in the error message.
7. Checks for duplicate Attendance → 409 if exists.
8. Creates Attendance document (same logic as `/mark` endpoint).
9. Pushes participation badge to `targetUser.badges` if applicable.
10. Returns success with `eventName` and `userName` for admin feedback UI.

**QR expiry note:** The file defines `const QR_EXPIRY_SECONDS = 300` but this value is **never used** — QR payloads are not validated for freshness. This is a known gap.

---

### 7.4 QR Module

#### 7.4.1 POST /api/qr/generate

**File**: `app/api/qr/generate/route.js`
**Auth required**: Yes (any logged-in user)
**Purpose**: Generate the QR payload data that the user will display as a QR code for an admin to scan.

**Request body (JSON):**
```json
{ "eventId": "string (required)" }
```

**Logic:**
1. Validates session (`session.user.id`).
2. Validates `eventId` is present.
3. Fetches Event → validates it is not `isOver`.
4. Checks user has a Registration for this event.
5. Constructs payload: `{ eventId: string, userId: string }`.
6. Returns the payload as a **JSON string** (pre-serialized) so it can be directly encoded into a QR image by the client.

**Response:**
```json
{
  "success": true,
  "message": "QR payload generated",
  "payload": "{\"eventId\":\"...\",\"userId\":\"...\"}",
  "event": {
    "_id": "...",
    "eventName": "...",
    "eventKey": "...",
    "eventDate": "..."
  }
}
```

**Security note:** The payload includes `userId` so an admin can scan it and know which user to mark attendance for. There is **no signature or HMAC** on the payload — a user could theoretically craft a QR code with someone else's `userId`. The admin scan route (`/api/attendance/scan`) trusts the `userId` in the QR payload body without cryptographic verification.

---

### 7.5 User Module

#### 7.5.1 GET /api/user/badges

**File**: `app/api/user/badges/route.js`
**Auth required**: Yes
**Purpose**: Return the current user's badge collection.

**Logic:**
1. Validates session by checking `session.user.email`.
2. Fetches User by `session.user.id`.
3. Returns `user.badges` array (or `[]` if empty).

**Response:**
```json
{
  "badges": [
    { "eventKey": "...", "badgeName": "...", "badgeIcon": "...", "earnedAt": "..." }
  ]
}
```

---

#### 7.5.2 GET /api/user/registrations

**File**: `app/api/user/registrations/route.js`
**Auth required**: Yes
**Purpose**: Return all registrations for the current user, enriched with team member info and attendance status.

**Logic:**
1. Fetches all Registrations for `userId`, populating the linked Event document with key fields.
2. Filters out registrations where the event document is missing (orphaned records).
3. Collects unique `eventIds` and `teamCodes`.
4. In parallel:
   - Fetches all Registration records matching those `eventIds` + `teamCodes` (to get full team member lists with user `name, email, image`).
   - Fetches all Attendance records for the user (to know which events they attended).
5. Builds a `teamMemberMap` keyed by `"eventId::teamCode"`.
6. Merges: each registration gets `teamMembers: [userId objects]` and `hasAttended: boolean`.

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "eventId": { "_id": "...", "eventName": "...", "eventDate": "..." },
      "name": "...",
      "phone": "...",
      "teamCode": "...",
      "isTeamLeader": true,
      "teamMembers": ["...user objects"],
      "hasAttended": false
    }
  ]
}
```

**Cache-Control:** `private, max-age=60` — cached per-user in browser for 60 seconds.

---

### 7.6 Admin Module

> All admin routes call `await requireAdmin()` first. This throws if the user is not authenticated or not an admin. The `catch` block converts the error into an error response.

#### 7.6.1 GET /api/admin/events

**Auth required**: Admin only
**Purpose**: List all events (including hidden ones) for the admin dashboard.

**Logic:**
- `Event.find()` — no filter, all events.
- **Excludes**: `poster, badgeIcon, winnerBadge1, winnerBadge2, winnerBadge3` (large blobs not needed in list view).
- Sorted by `createdAt: -1` (newest first).

**Response:** `{ success: true, data: [...events] }`

---

#### 7.6.2 POST /api/admin/events

**Auth required**: Admin only
**Purpose**: Create a new event.

**Request body (JSON):**
```json
{
  "eventName": "string (required)",
  "eventDate": "ISO date string (required)",
  "description": "string",
  "pointsPerAttendance": "number (default 10)",
  "poster": "data URL string or URL string",
  "minMembers": "number (default 1)",
  "maxMembers": "number (default 1)",
  "badgeIcon": "string URL",
  "winnerBadge1": "string URL",
  "winnerBadge2": "string URL",
  "winnerBadge3": "string URL",
  "isRegistrationLive": "boolean (default false)",
  "isHidden": "boolean (default false)",
  "isOver": "boolean (default false)"
}
```

**Poster handling:** If `poster` is a `data:image/...` base64 string → uploads to Azure Blob Storage and stores the SAS URL. Otherwise stores the string as-is (can be a relative path like `/Events/Icons/event1.png`).

**Duplicate guard:** Catches MongoDB error code `11000` → returns `409 "Event already exists"`.

---

#### 7.6.3 PUT /api/admin/events/[id]

**Auth required**: Admin only
**Purpose**: Update an existing event's fields.

**Path param:** `id` — the event's MongoDB `_id`.

**Request body:** Same fields as POST, all optional. Only provided fields are updated.

**Business logic enforcement:**
- If `body.isActive` is provided (old client compat) → maps to `isOver = !isActive`.
- If event is now `isOver: true` → `isRegistrationLive` is forced to `false` server-side, regardless of what was sent.
- Poster update: same data URL → Azure Blob logic as in POST.

---

#### 7.6.4 DELETE /api/admin/events/[id]

**Auth required**: Admin only
**Purpose**: Permanently delete an event and ALL associated data (cascade hard delete).

**Path param:** `id` — the event's MongoDB `_id`.

**Cascade delete (operations run):**
1. `Registration.deleteMany({ eventId })` — removes all registrations.
2. `Attendance.deleteMany({ eventId })` — removes all attendance records.
3. `User.updateMany({ "badges.eventKey": eventKey }, { $pull: { badges: { eventKey } } })` — removes this event's badge from every user who earned it.
4. `Event.findByIdAndDelete(id)` — removes the event itself.

> WARNING: This is a **hard delete** — no soft delete or recycle bin. There is no undo.

---

#### 7.6.5 POST /api/admin/events/poster-upload

**Auth required**: Admin only
**Purpose**: Upload an event poster via `multipart/form-data`.

**Request:** `Content-Type: multipart/form-data` with field `poster` (file).

**Validations:**
- File must exist (not a string).
- `file.type` must start with `"image/"`.
- File size must be <= **5 MB** (`MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024`).

**Response:** `{ success: true, posterUrl: "https://..." }`

---

#### 7.6.6 POST /api/admin/events/winners

**Auth required**: Admin only
**Purpose**: Award a prize badge to an individual user or an entire team.

**Request body (JSON):**
```json
{
  "eventId": "string (required)",
  "rank": "1 or 2 or 3 (required)",
  "targetUserId": "string (required if not using teamCode)",
  "teamCode": "string (required if not using targetUserId)"
}
```

**Logic:**
1. Validates required fields — at least one of `targetUserId` or `teamCode` is required.
2. Fetches Event → checks the badge icon for the given rank (`winnerBadge1/2/3`). Returns 400 if that badge is not defined.
3. Constructs badge name: e.g., `"1st Prize: EventName"`.
4. Resolves `userIds`:
   - If `targetUserId` → `[targetUserId]`.
   - If `teamCode` → fetches all Registrations with that teamCode for this event, collects their `userId`s.
5. For each user:
   - Removes any existing prize badge for this event (prevents duplicate prize badges on re-award).
   - Pushes new badge into `user.badges`.
   - Saves the user.
   - If an Attendance record exists for the user → updates `prizeBadge` and `prizeName` fields on it.

**Response:** `{ success: true, message: "Awarded to: Alice, Bob" }`

---

#### 7.6.7 DELETE /api/admin/events/winners

**Auth required**: Admin only
**Purpose**: Revoke a prize badge from a specific user.

**Request body (JSON):**
```json
{
  "eventId": "string",
  "rank": "1 or 2 or 3",
  "targetUserId": "string"
}
```

**Logic:**
1. Fetches Event and User.
2. Filters out from `user.badges` any badge where `eventKey === event.eventKey` AND `badgeName` includes the rank's prize title.
3. Saves the user.
4. Clears `prizeBadge` and `prizeName` on the Attendance record if it exists.

---

#### 7.6.8 GET /api/admin/attendance/[eventId]

**Auth required**: Admin only
**Purpose**: Full attendance dashboard for a single event — all registrations merged with attendance status, grouped by team.

**Path param:** `eventId` — the event's MongoDB `_id`.

**Logic:**
1. Fetches in parallel (using `Promise.all`):
   - **Event** (excluding large blob fields: poster, badgeIcon, winnerBadge1/2/3).
   - **All Registrations** for the event, sorted newest first, with user `name, email, image` populated.
   - **All Attendance records** for the event, sorted by `scannedAt: -1`, with user `_id` populated.
2. Builds `attendanceMap`: `{ userId.toString(): attendanceRecord }`.
3. Merges each registration with its attendance record:
   ```
   hasAttended: boolean
   scannedAt: Date or null
   badgeEarned: string or null
   pointsEarned: number (0 if not attended)
   participationBadge: string or null
   milestoneBadge: string or null
   prizeBadge: string or null
   prizeName: string or null
   ```
4. Computes `totalAttendees` (count of attendance records) and `totalRegistrations`.
5. Groups registrations by `teamCode` into a `teams` object.

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {},
    "totalAttendees": 42,
    "totalRegistrations": 80,
    "registrations": ["...mergedRegistrations"],
    "teams": { "ABCD12": ["...members"] },
    "eventKey": "abc123..."
  }
}
```

---

#### 7.6.9 DELETE /api/admin/registrations/[registrationId]

**Auth required**: Admin only
**Purpose**: Force-delete a specific user's registration and clean up all related data.

**Path param:** `registrationId` — the Registration's MongoDB `_id`.

**Logic (parallel operations where possible):**
1. Fetches `{ userId, eventId }` from the registration.
2. In parallel:
   - Fetches the Event's `eventKey`.
   - Deletes the Registration document.
   - Deletes the Attendance record for this `{ userId, eventId }` if it exists.
3. Removes any badges associated with this event from the User's `badges` array using `$pull`.

---

## 8. Auth & Session Flow

```
User visits /login
      |
      |-- Email/Password ──────────────────────────────────────────────────────┐
      |    POST /api/auth/callback/credentials                                 |
      |    NextAuth finds user by email, bcrypt.compare(password, hash)        |
      |    Success → JWT token minted                                           |
      |                                                                         |
      └── Google / GitHub OAuth ───────────────────────────────────────────────┤
           GET /api/auth/signin/google (redirect to provider)                  |
           Callback: GET /api/auth/callback/google                             |
           signIn() callback runs → upsert User in DB                          |
           JWT token minted                                                     |
                                                                                |
           JWT stored in httpOnly cookie (30-day max age) <────────────────────┘
                    |
                    v
      Every protected API call: getServerSession(authOptions)
                    |
                    |-- Reads cookie → verifies JWT signature with NEXTAUTH_SECRET
                    |-- Calls session callback → DB lookup → populates role from DB
                    └── Returns session object or null
```

---

## 9. Team & Registration Flow

```
Event has maxMembers = 4

Person A creates a team:
  POST /api/events/register { eventId, name, phone, generateTeamCode: true }
  → Creates Registration: { teamCode: "XYZABC", isTeamLeader: true }

Persons B, C, D join the team:
  POST /api/events/register { eventId, name, phone, teamCode: "XYZABC" }
  → Validates: team exists, team leader exists, current count < maxMembers
  → Creates Registration: { teamCode: "XYZABC", isTeamLeader: false }

Person E tries to join:
  → count (4) >= maxMembers (4) → 400 "Team is full"

Person A kicks Person D:
  DELETE /api/events/team/kick { targetRegistrationId: D's registrationId }
  → Verifies A is isTeamLeader for same event+teamCode → deletes D's registration

Person A disbands the whole team:
  DELETE /api/events/team/cancel { leaderRegistrationId: A's registrationId }
  → Checks: no attendance marked for any member → deletes ALL registrations for the team

Admin force-removes Person B:
  DELETE /api/admin/registrations/:registrationId
  → Deletes registration + attendance record + removes event badges from user
```

---

## 10. Attendance & QR Flow

### Flow A: User manually enters event key
```
User is registered for Event E
User gets the eventKey from the organizer or event screen
User submits in the app:
  POST /api/attendance/mark { eventKey: "abc123", eventId: "..." }
  → validates key matches event
  → checks registration exists
  → creates Attendance record, awards participation badge
  → returns { pointsEarned, badgeEarned }
```

### Flow B: Admin scans user's personal QR code
```
User navigates to their event registration page in the app
  POST /api/qr/generate { eventId: "..." }
  → validates user is registered
  → returns payload string: '{"eventId":"...","userId":"..."}'
Frontend renders the payload as a QR image using qrcode library

Admin opens scanner page, camera scans the user's QR
  POST /api/attendance/scan { eventId: "...", userId: "..." }
  → verifies scanner has role "admin"
  → marks attendance for the userId from the QR
  → returns { userName, eventName, pointsEarned } for admin confirmation UI
```

---

## 11. Gamification System

### Points
Each event has a `pointsPerAttendance` field (default: 10). When attendance is marked, that many points are stored in `Attendance.pointsEarned`.

**Current state**: Points are stored per-attendance but **not aggregated** anywhere. There is no API endpoint that sums a user's total points across events. The `gamification.js` utility file has the tier calculation logic defined but it is not wired to any route.

### Badges — Three Types

| Badge Type | Stored in Attendance | Stored in User.badges | When awarded |
|---|---|---|---|
| Participation | `participationBadge` | YES (pushed automatically) | Automatically when attendance is marked |
| Milestone/Tier | `milestoneBadge` | NO (not implemented) | NOT implemented in any route |
| Prize | `prizeBadge` + `prizeName` | YES (pushed by admin) | Admin POST to `/api/admin/events/winners` |

---

## 12. Admin Privilege System

Admins are identified by `user.role === "admin"` stored in MongoDB. The role is re-read from the database on every session callback, so role changes take effect immediately without requiring a logout.

**How to make someone an admin** (no UI — DB operation only):
```js
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })
```

**Access control chain:**
```
Browser request to /api/admin/**
  → requireAdmin() called
    → getServerSession() reads JWT cookie
    → session callback fetches live role from DB
    → if role !== "admin" → throws Error("Forbidden")
  → catch(error) in route handler → returns 500 with message "Forbidden"
```

> NOTE: When `requireAdmin()` throws "Forbidden", the surrounding catch block returns **HTTP 500** with the error message `"Forbidden"`, not HTTP 403. The message is correct but the HTTP status code is misleading — this is a minor bug in the current implementation.

---

## 13. What is NOT Implemented / Known Gaps

| Feature | Status | Details |
|---|---|---|
| QR timestamp validation | NOT used | `QR_EXPIRY_SECONDS = 300` is defined in scan route but the timestamp is never checked |
| QR payload signing | MISSING | No HMAC or signature — a user could craft a QR with a different userId |
| Milestone/tier badges | NOT wired | `gamification.js` tier logic exists but no route writes `milestoneBadge` |
| Points aggregation API | MISSING | No endpoint to sum a user's total points across all events |
| Email verification | MISSING | Users created by signup are immediately active with no email confirmation |
| Password reset | MISSING | No forgot-password or reset-password flow |
| Rate limiting | MISSING | No rate limiting on any endpoint — signup, attendance, and login are all unprotected |
| Soft delete for events | MISSING | DELETE is always a hard cascade delete |
| Audit log | MISSING | No record of admin actions (who deleted what, when) |
| milestoneBadge population | MISSING | Field exists in Attendance schema but is never written by any route |
| apiResponses.js usage | UNUSED | All routes inline their own response objects rather than using this file |
| eventConfig.js usage | UNUSED | Static event registry not referenced by any route handler |
| checkAdminAccess() usage | UNUSED | Defined in adminAuth.js but never imported by any route |
| Admin 403 vs 500 status | BUG | requireAdmin() throwing "Forbidden" causes catch block to return 500, not 403 |
| Team cancel after kick | GAP | After a member is kicked, they could rejoin if teamCode is known |

---

## 14. HTTP Status Code Reference

| Code | Meaning | Used when |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (registration, signup, attendance mark) |
| `400` | Bad Request | Missing fields, event over, registration not live, team full, invalid key |
| `401` | Unauthorized | No valid session / not logged in |
| `403` | Forbidden | Logged in but insufficient permissions (not admin, not team leader) |
| `404` | Not Found | Event, user, or registration not found by ID |
| `409` | Conflict | Duplicate registration or duplicate attendance ("Already Claimed") |
| `500` | Server Error | Unhandled exceptions, DB errors — also incorrectly returned for admin 403 |
