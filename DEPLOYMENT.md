# Vayana MVP — Deployment Guide

Vayana is a full-stack web application built on the Manus platform. This document covers how to publish, configure, and maintain the deployment.

---

## Quick Deploy (Manus Platform)

The fastest path to production is through the Manus built-in hosting:

1. **Save a checkpoint** — click the checkpoint button in the Manus Management UI, or use the `webdev_save_checkpoint` tool.
2. **Click Publish** — the Publish button appears in the top-right of the Management UI after a checkpoint is saved.
3. **Configure your domain** — in Settings → Domains, either use the auto-generated `*.manus.space` subdomain or bind a custom domain.

That's it. Manus handles SSL, CDN, cold-start management, and zero-downtime deployments automatically.

---

## Environment Variables

All secrets are injected automatically by the Manus platform. No `.env` file is needed. The following variables are pre-configured:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend) |
| `BUILT_IN_FORGE_API_URL` | Manus built-in APIs (LLM, storage, etc.) |
| `BUILT_IN_FORGE_API_KEY` | Bearer token for server-side API calls |
| `VITE_FRONTEND_FORGE_API_KEY` | Bearer token for frontend API calls |

To add custom secrets (e.g., a custom OpenAI key), use Settings → Secrets in the Management UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Express 4, tRPC 11 (end-to-end type safety) |
| Database | MySQL / TiDB via Drizzle ORM |
| AI | Manus built-in LLM (GPT-4o compatible) |
| Auth | Manus OAuth 2.0 |
| Storage | S3-compatible object storage |
| Hosting | Manus Cloud Run (Node.js, 1 vCPU, 512 MiB) |

---

## Database Schema

Ten tables power the platform:

| Table | Purpose |
|---|---|
| `users` | Auth, profile, language preference |
| `books` | Book catalog (title, author, cover, language) |
| `bookshelf` | Per-user reading list with status, progress, rating, review |
| `clubs` | Reading clubs (public/private) |
| `club_members` | Club membership with admin/member roles |
| `club_books` | Books assigned to a club's reading list |
| `events` | Discussion events with location + meeting link |
| `event_rsvps` | Per-user RSVP status (going/maybe/not_going) |
| `ai_chats` | Vayana Ashan conversation sessions |
| `ai_messages` | Individual messages within a chat session |

### Running Migrations

Migrations are managed with Drizzle Kit. To apply pending schema changes:

```bash
# Generate migration SQL from schema changes
pnpm drizzle-kit generate

# Apply via Manus SQL executor (recommended)
# Use the webdev_execute_sql tool or the Database panel in the Management UI

# Or apply directly (requires DATABASE_URL in environment)
pnpm drizzle-kit migrate
```

---

## Project Structure

```
vayana-mvp/
├── client/
│   ├── index.html              # Entry HTML with Google Fonts
│   └── src/
│       ├── App.tsx             # Routes + layout + auth guards
│       ├── index.css           # Design tokens + global styles
│       ├── components/
│       │   ├── Navbar.tsx      # Global navigation + language switcher
│       │   └── ui/             # shadcn/ui component library
│       ├── contexts/
│       │   └── LanguageContext.tsx  # ML/EN language state + profile sync
│       ├── pages/
│       │   ├── Home.tsx        # Public landing page
│       │   ├── Dashboard.tsx   # Authenticated home feed
│       │   ├── Profile.tsx     # User profile editor
│       │   ├── Bookshelf.tsx   # Personal reading list
│       │   ├── Books.tsx       # Book catalog + search
│       │   ├── Clubs.tsx       # Reading clubs listing
│       │   ├── ClubDetail.tsx  # Club page + members + events
│       │   ├── CreateClub.tsx  # Create a new reading club
│       │   ├── Events.tsx      # Events listing
│       │   ├── EventDetail.tsx # Event page + RSVP
│       │   ├── CreateEvent.tsx # Create a new event
│       │   ├── AiCoach.tsx     # Vayana Ashan chat list
│       │   └── AiChat.tsx      # Vayana Ashan chat session
│       └── lib/
│           └── trpc.ts         # tRPC client binding
├── server/
│   ├── routers.ts              # All tRPC procedures (7 routers)
│   ├── db.ts                   # Drizzle query helpers
│   ├── storage.ts              # S3 file storage helpers
│   ├── vayana.test.ts          # Feature tests (23 tests)
│   └── _core/                  # Framework plumbing (OAuth, LLM, etc.)
├── drizzle/
│   ├── schema.ts               # Database table definitions
│   └── migrations/             # SQL migration files
└── shared/
    ├── i18n.ts                 # Malayalam + English translations
    └── const.ts                # Shared constants
```

---

## API Routes

All API calls go through tRPC at `/api/trpc`. The available procedures are:

### `auth`
- `auth.me` — get current user (public)
- `auth.logout` — clear session cookie (public)

### `users`
- `users.getProfile` — get authenticated user's full profile (protected)
- `users.updateProfile` — update name, bio, avatar, language preference (protected)

### `books`
- `books.list` — list/search books with pagination (public)
- `books.getById` — get a single book (public)
- `books.create` — add a book to the catalog (protected)

### `bookshelf`
- `bookshelf.list` — get user's bookshelf (protected)
- `bookshelf.upsert` — add/update a book entry with status, progress, rating, review (protected)
- `bookshelf.remove` — remove a book from the shelf (protected)

### `clubs`
- `clubs.list` — browse public clubs (public)
- `clubs.getById` — get club details (public)
- `clubs.getMembers` — list club members (public)
- `clubs.myClubs` — get clubs the user belongs to (protected)
- `clubs.create` — create a new club (protected)
- `clubs.join` — join a public club (protected)
- `clubs.leave` — leave a club (protected)
- `clubs.setCurrentBook` — set club's active book (admin only)
- `clubs.getMembership` — check if user is a member (protected)

### `events`
- `events.list` — list events, optionally filtered by club (public)
- `events.getById` — get event details (public)
- `events.getRsvps` — get all RSVPs for an event (public)
- `events.getMyRsvp` — get user's RSVP status (protected)
- `events.create` — create a new event (protected)
- `events.rsvp` — set RSVP status: going / maybe / not_going (protected)

### `aiCoach`
- `aiCoach.listChats` — list user's chat sessions (protected)
- `aiCoach.getChat` — get chat with message history (protected)
- `aiCoach.createChat` — start a new chat session (protected)
- `aiCoach.sendMessage` — send a message and get AI reply (protected)

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/oommensy/vayana-mvp.git
cd vayana-mvp

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

> **Note:** The development server requires the Manus platform environment variables to be injected. Run `pnpm dev` from within the Manus sandbox environment for full functionality.

---

## Running Tests

```bash
pnpm test
```

23 tests across two test files:
- `server/auth.logout.test.ts` — auth flow tests
- `server/vayana.test.ts` — feature router, i18n, and validation tests

---

## Custom Domain Setup

1. Go to Settings → Domains in the Manus Management UI.
2. Either modify the auto-generated `*.manus.space` subdomain prefix, or click "Add Domain" to bind a custom domain.
3. Follow the DNS verification steps shown in the UI.
4. SSL is provisioned automatically.

---

## Scaling Considerations

The current deployment runs on Manus Cloud Run with:
- **1 vCPU, 512 MiB RAM** — suitable for early-stage traffic
- **Min instances: 0** — cold starts possible on low traffic
- **180s request timeout** — sufficient for AI responses

For production scale:
- Upgrade to a higher Manus tier for more compute
- Consider adding Redis for session caching
- The database (TiDB) scales horizontally by default
