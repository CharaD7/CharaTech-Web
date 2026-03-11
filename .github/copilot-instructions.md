# CharaTech Web — Copilot Instructions

## Project Overview

**CharaTech** is an AI-powered software requirements gathering platform. Clients submit project requirements through industry-specific forms and an AI chatbot (Dialogflow). Admins manage submissions via a dashboard with analytics, messaging, invoicing, and GitHub-linked project timelines.

---

## Commands

```bash
pnpm dev                # Start dev server
pnpm build              # prisma generate && nuxi build
pnpm preview            # Preview production build

pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to DB (no migration)
pnpm db:migrate         # Create + apply migration (dev)
pnpm db:migrate:prod    # Apply migrations (production)
pnpm db:studio          # Open Prisma Studio
pnpm db:seed            # Seed database (prisma/seed.ts)
```

There are no test or lint commands in the root package.json. The `functions/` sub-package has its own ESLint setup.

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | Nuxt 4 + Vue 3, SSR enabled |
| Backend | Nuxt Nitro (server/api/) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Firebase Auth (client) + Supabase JWT (server) |
| UI | Nuxt UI 4 + Tailwind CSS 4 |
| State | Pinia |
| AI/Chatbot | Google Dialogflow |
| Notifications | Nodemailer (email) + Twilio (SMS) |
| Hosting | Netlify |
| Optional | Firebase Cloud Functions (functions/) with Genkit AI |

### Dual Auth System

Authentication uses **two separate systems in tandem**:
- **Firebase Auth** — handles client-side login/register UI and issues Firebase tokens
- **Supabase Auth** — used server-side for JWT verification; `supabaseUid` is stored on the `User` model

When a user registers via `/api/auth/register`, both their `firebaseUid` and `supabaseUid` are stored in the database. Middleware in `app/middleware/` uses the Supabase token for route protection (`auth.ts`, `admin.ts`, `guest.ts`).

### Data Model (Prisma)

Core models in `prisma/schema.prisma`:
- **User** — roles: `CLIENT` | `ADMIN`; links Firebase and Supabase UIDs
- **Submission** — stores `requirements` and `aiConversation` as JSON; has `projectType[]` (array), `industry`, `complexity`, `budget`, and a 7-state `status` enum
- **Invoice** — one-to-one with Submission; stores `items` as JSON
- **ProjectTimeline** + **ProjectMilestone** — GitHub-integrated project tracking with `githubRepo` and `githubMilestoneId`
- **Notification** — multi-channel (`EMAIL`, `SMS`, `IN_APP`) with `channel[]` array
- **Message** — supports client↔admin chat and AI bot messages (`isBot: Boolean`)
- **Attachment** — files linked to a Submission

---

## Key Conventions

### API Routes (`server/api/`)

File-based Nitro routing. Naming pattern: `[name].[http-method].ts`

```
server/api/
  auth/register.post.ts
  submissions/index.post.ts
  admin/submissions.get.ts
  admin/invoices/generate.post.ts
  dialogflow/chat.post.ts
```

Use `useRuntimeConfig()` for environment variables inside server handlers. Never access `process.env` directly.

### Frontend (`app/`)

```
app/
  pages/         # File-based routing; admin pages under pages/admin/
  components/    # Vue SFCs
  layouts/       # default.vue, auth.vue, admin.vue
  middleware/    # auth.ts, admin.ts, guest.ts
  stores/        # Pinia stores (e.g., useUserStore)
  composables/   # useAuth.ts, useSupabase.ts, useRealtimeMessages.ts
  types/         # Shared TypeScript enums/types (index.ts)
```

Dynamic route example: `pages/submissions/[id].vue`

### Styling

- **Tailwind CSS 4** via PostCSS (`@tailwindcss/postcss`)
- **Nuxt UI 4** components for most UI elements
- **Dark mode by default**: `colorMode.preference = 'dark'`, `classSuffix: ''`
- Global CSS: `assets/css/main.css`

### TypeScript

- Full strict TypeScript throughout (Nuxt enables it by default)
- Shared enums and types live in `app/types/index.ts`
- Prisma client types are auto-generated; run `pnpm db:generate` after schema changes

### Environment Variables

Copy `.env.example` → `.env` for local development. Required groups:
- **Database**: `DATABASE_URL`
- **Supabase**: `SUPABASE_PROJECT_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- **Firebase**: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`, `FIREBASE_ADMIN_CREDENTIALS_JSON`
- **Dialogflow**: `DIALOGFLOW_PROJECT_ID`, `DIALOGFLOW_CLIENT_EMAIL`, `DIALOGFLOW_CREDENTIALS_JSON`
- **Notifications**: SMTP config for Nodemailer, Twilio credentials
- **GitHub** (optional, for timeline feature): `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_WEBHOOK_SECRET`

Public runtime config (exposed to client) uses `NUXT_PUBLIC_*` prefix.

### Database Workflow

After editing `prisma/schema.prisma`:
1. `pnpm db:migrate` — creates migration file and applies it (dev)
2. `pnpm db:generate` — regenerates Prisma Client types
3. `pnpm db:migrate:prod` — applies pending migrations in production (no DDL generation)

### `functions/` Sub-package

Independent Firebase Cloud Functions project (Node 24, Express, Genkit). Has its own `package.json` and ESLint config. Run commands from within `functions/` or use `pnpm --filter functions <cmd>`. Not required for the main Nuxt app to function.

### `dataconnect/` Directory

Firebase Data Connect configuration — not actively used by the main Nuxt application. The generated client code lives in `src/dataconnect-generated/`.
