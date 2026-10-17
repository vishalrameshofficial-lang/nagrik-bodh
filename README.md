# Nagrik Bodh (नागरिक बोध / குடிமக்கள் போதம்)

> **Civic Awareness Platform for India** — Simplifying government notifications, schemes, regulations, public services, and compliance deadlines into clear, actionable explanations supported by verified official sources. Available in English and Tamil.

---

## 1. Overview & Core Mission

India’s official regulatory and administrative landscape is comprehensive but fragmented across gazette notifications, departmental circulars, and portal announcements that are difficult for ordinary citizens to interpret. **Nagrik Bodh** bridges this gap:

- **Bilingual by Design**: Full first-class support for English and Tamil.
- **Strict Verification Standards**: Every published notice must link to a primary official authority (gazette, ministry circular, official portal).
- **Separation of Concerns**: Authoritative official text is clearly distinguished from platform explanations.
- **Rigorous Editorial Workflow**: `draft` → `in_review` → `approved` → `scheduled` / `published`. Authors cannot self-approve their own drafts without an independent reviewer.
- **Deadline Integrity**: Clear distinction between confirmed, unconfirmed, extended, and unknown deadlines.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS + Custom Design System tokens (Inter & Noto Sans Tamil fonts)
- **Database**: Supabase PostgreSQL with 13 relational tables, triggers, and Row Level Security (RLS)
- **Authentication**: Supabase Auth (Email/Password session handling with automatic profile & preference triggers)
- **Validation**: Zod (strict client and server-side request validation)
- **Icons**: Lucide React
- **Testing**: Node.js Native Test Runner (`node:test`, 14 automated unit & integration tests)

---

## 3. Directory Layout

```
d:/NAGRIK BODH (UM)/
├── src/
│   ├── app/                      # App Router pages and route handlers
│   │   ├── (public pages)        # /, /updates, /updates/[slug], /schemes, /deadlines, /sources,
│   │   │                         # /about, /corrections, /privacy, /terms, /login, /register
│   │   ├── dashboard/            # Citizen dashboard: /dashboard/saved, /dashboard/reminders
│   │   ├── admin/                # Admin suite: /admin, /admin/updates, /admin/review,
│   │   │                         # /admin/sources, /admin/deadlines, /admin/scheduled,
│   │   │                         # /admin/audit, /admin/settings
│   │   └── api/                  # Route handlers: /api/updates, /api/saved, /api/reminders,
│   │                             # /api/admin/updates/[id]/review, /api/user/delete, /api/cron/...
│   ├── components/               # Accessible UI components & admin managers
│   ├── i18n/                     # Bilingual dictionary (en.json, ta.json) & React context
│   ├── lib/
│   │   ├── supabase/             # Client, Server, and Admin Service-Role clients
│   │   ├── validations/          # Zod validation schemas
│   │   └── utils/                # Utility helpers (cn, date formatting)
│   ├── types/                    # Core TypeScript interfaces & enums
│   └── middleware.ts             # Auth session refresh & routing proxy
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # 13 tables, enums, triggers, RLS policies, indexes
│   ├── seed.sql                  # Demonstration seed data (categories, depts, updates)
│   └── bootstrap-admin.sql       # Script to promote registered user to Admin
├── tests/
│   └── platform.test.mjs         # Automated test suite
└── .env.example                  # Environment configuration template
```

---

## 4. Database Setup & Migrations

### A. Run Initial Schema Migration
In your Supabase project dashboard (SQL Editor) or via the Supabase CLI, run:
```bash
# Apply schema migration (13 tables, types, triggers, RLS policies)
psql $SUPABASE_DB_URL -f supabase/migrations/001_initial_schema.sql
```

### B. Bootstrap Your Administrator Account
1. Start the application (`npm run dev`) and register an account at `/register` (e.g. `admin@nagrikbodh.in`).
2. Run the bootstrap script in the Supabase SQL editor:
```sql
-- See supabase/bootstrap-admin.sql
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@nagrikbodh.in';
```
3. Your account now has full access to the `/admin` portal.

### C. Seed Demonstration Data
To seed initial categories, departments, jurisdictions, and sample civic updates:
```bash
psql $SUPABASE_DB_URL -f supabase/seed.sql
```
> **Notice**: All seeded demonstration items are marked with `is_demo = TRUE` and display a prominent demo badge. Before public release, replace or delete these records.

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://xyz.supabase.co`) | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anonymous Key for client queries | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service key (server-only, for cron & admin actions) | Yes |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string for migrations | For CLI |
| `RESEND_API_KEY` | API key for transactional email reminders (Resend) | Optional |
| `EMAIL_FROM` | From email address (e.g., `noreply@nagrikbodh.in`) | Optional |
| `CRON_SECRET` | Bearer token secret for protecting `/api/cron/*` endpoints | Optional |

---

## 6. Running Tests & Production Build

### Run Unit and Integration Tests
```bash
npm test
```
Executes 14 automated test suites verifying:
- Password strength and registration validation
- URL and official source validation
- Mandatory primary sources on civic updates
- Author self-approval block (separation of duties)
- Deadline status integrity (confirmed vs unconfirmed vs unknown)
- Translation status safety disclaimers
- Citizen role escalation defense
- Mandatory withdrawal reasons and audit tracking

### Build for Production
```bash
npm run build
```
Generates an optimized Next.js build with static generation and server-side rendering across all 30 routes.

### Start Production Server
```bash
npm run start
```

---

## 7. Role-Based Access Control (RBAC)

The platform enforces 4 distinct user tiers:

1. **Guest**: Can browse verified published updates, categories, departments, official sources, and deadlines in English and Tamil.
2. **Citizen**: Can create an account, save updates (`/dashboard/saved`), set notification preferences (`/dashboard/reminders`), and request complete GDPR-compliant account deletion (`/api/user/delete`).
3. **Editor**: Can create and edit update drafts, add sources, and translate text. Cannot approve their own submissions.
4. **Reviewer / Admin**: Can review queue items, verify sources, approve/reject drafts, schedule releases, trigger immediate publication, or issue official corrections and withdrawals.

---

## 8. Scheduled Content & Cron Automation

Scheduled civic updates (`status = 'scheduled'`) are automatically released when their scheduled release timestamp arrives.
Configure your background runner (Vercel Cron, GitHub Actions, or Supabase `pg_cron`) to trigger:
```http
GET /api/cron/publish-scheduled
Authorization: Bearer <CRON_SECRET>
```

---

## 9. Disclosure of External Integrations

To ensure transparency:
- **Email Delivery**: Integrates with Resend. If `RESEND_API_KEY` is not provided, reminder tasks are safely queued in `notification_jobs` for deferred dispatch.
- **Government Portals**: All official links point directly to public domain `.gov.in` and `.nic.in` domains. Nagrik Bodh does not claim government affiliation.
