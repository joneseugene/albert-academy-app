# Albert Academy Admin

Admin console for the Albert Academy Secondary School website. Next.js 16 (App Router, Cache Components) · React 19 · Tailwind v4 · shadcn/ui · React Hook Form + Zod · Supabase (database + image storage).

Layout and architecture mirror `trustpin-admin`. Theme: burgundy, grey and white; flat — hairline borders, no shadows.

## Setup

1. `pnpm install`
2. Fill `.env.local` (see `.env.example`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (`AUTH_SECRET` is already generated).
3. Run `supabase/migrations/20261113000000_init.sql` (Supabase SQL editor, or `supabase db push`). It creates the tables, the `media` storage bucket, the **Super Admin** and **School Admin** roles and the school-info row.
4. Create the first Super Admin:
   ```bash
   SEED_EMAIL=you@example.com SEED_PASSWORD='…' SEED_FIRST_NAME=… SEED_LAST_NAME=… pnpm seed:admin
   ```
   (PowerShell: `$env:SEED_EMAIL="…"; …; pnpm seed:admin`)
5. `pnpm dev` → website at http://localhost:3000, admin console at http://localhost:3000/admin
6. Apply every file in `supabase/migrations` in order (init → namesake & facts → school song).

## Public website

`src/app/(site)`: home, `/about` (about, vision, mission, values, history, namesake, leadership, administration, Did you know?), `/news` + detail, `/activities` + detail, `/alumni` + detail, `/gallery` (full-size viewer), `/resources`, `/song`.

- Only **published** content is shown (draft news and hidden facts never are). Queries live in `src/features/site/server/queries.ts`.
- Pages are static and cached (`"use cache"`, tag `public-content`, revalidated hourly). Every admin save calls `updateTag("public-content")`, so changes appear on the next page load.
- Sections with no content are hidden, so a new site never shows empty blocks.

## School song

Admin → **School Song**: upload the recording (MP3/M4A/AAC/OGG/WAV, ≤ 30 MB — sent straight from the browser to the `audio` storage bucket with a one-time signed URL), title, credits and lyrics: **verses** (add as many as needed, in order) and **one chorus**, sung after every verse or once after the last verse. The lyrics are stored in `song_lyrics` in the order they are sung, with `[Verse 1]` / `[Chorus]` headers (`src/lib/lyrics.ts`).

**Sync lyrics** (optional): play the recording and tap (or press Space) as each sung line starts, repeated choruses included; lines get `[mm:ss.xx]` stamps. Adding or removing lines afterwards discards the timings (sync again). The website player then scrolls the lyrics exactly in time; without stamps it estimates each line's timing from the song length.

| Script            | What it does                  |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Dev server                    |
| `pnpm build`      | Production build              |
| `pnpm typecheck`  | Route types + `tsc --noEmit`  |
| `pnpm lint`       | ESLint                        |
| `pnpm seed:admin` | Create / ensure an admin user |

## Modules

| Module             | Fields                                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| School Song        | Title, credits, recording, verses, one chorus (after every verse or once), optional lyric timings                                                                                                                                      |
| School Info        | Name, motto, founded, logo, vision, mission, core values, about, history, namesake (name, photo, born, died, about), contacts (list), social media (list)                                                                              |
| Did You Know?      | Short fact (≤ 280 chars), shown/hidden on the website, display order                                                                                                                                                                   |
| Leadership         | Name, title, photo, from–to year (empty "to" = current), summary · filter current/past                                                                                                                                                 |
| Administration     | Name, position, photo, display order                                                                                                                                                                                                   |
| Notable Alumni     | Photo, name, nickname, class (e.g. 2009/2010), position, summary, detail, order                                                                                                                                                        |
| News               | Title, cover photo, summary, content, draft/published (publish date stamped)                                                                                                                                                           |
| Activities         | Title, category, photo, description, from–to date · filter by category                                                                                                                                                                 |
| Enquiries          | Inbox for the website contact form (name, email, phone, topic, message) · new/read/replied · reply by email · office notified by email when set up                                                                                     |
| Live Streams       | Title, YouTube/Facebook link (embed built automatically), status (upcoming/live now/ended), start–end time, home-page banner, keep as replay, player settings (autoplay, muted, controls, live chat, privacy mode), description, cover |
| Gallery            | Photo, title, description                                                                                                                                                                                                              |
| Academic Resources | Title, photo, description, URL                                                                                                                                                                                                         |
| Users              | Name, email, phone, photo, role, status (active/blocked), password                                                                                                                                                                     |

**Rich text:** every long text field (vision, mission, about, history, namesake, news, alumni, leadership, activities, gallery and resource descriptions) uses a WYSIWYG editor (`RichTextField`, Tiptap) and is stored as HTML; summaries get a compact toolbar. Limits count visible characters, not markup. The public queries sanitize it (`src/server/core/sanitize.ts`) before the website renders it; text saved before the editor existed is converted on the fly. Song lyrics and "Did you know?" facts stay plain text.

Every delete is a **soft delete** (`deleted_at`); deleted rows disappear from every list and lookup but stay in the database.

## Crest & icons

`assets/crest-source.jpg` is the school's own logo. `pnpm icons` cleans it (two exact colours, transparent background, subtle sheen) and writes `public/brand/crest.png`, the favicon, app icons and the iOS icon. Replace the source with a better scan and re-run to update them all.

## Auth

The app's own auth (`src/server/auth/native`), not Supabase Auth:

- scrypt password hashes; 5 wrong passwords → 15-minute lockout; per-IP sign-in rate limit.
- 15-minute JWT access token (`aa_at`) + opaque **refresh token** (`aa_rt`), both httpOnly cookies. Refresh tokens are stored hashed, **rotated on every use**, and reuse of an old one revokes the session.
- `src/proxy.ts` refreshes transparently when the access token expires. "Keep me signed in" = 30-day sliding session; otherwise a browser session (max 12 h).
- Every request re-checks the session and user status, so blocking/deleting a user or changing a password takes effect at once.
- A Super Admin sets a user's first password and can reset it from the user's edit page.
- **Forgot password** (`/forgot-password`): emails a 6-digit code (15 minutes, 5 tries, newest code only, stored as an HMAC). Entering it with a new password resets the password, clears any lockout and signs the user out everywhere. The response is identical whether or not the account exists; requests are rate-limited per network and per address.
- **Email** for the codes: set `SMTP_*` (any SMTP account, e.g. Gmail with an App password) or `RESEND_API_KEY`, plus `EMAIL_FROM` — see `.env.example`. Without either, development prints the email in the `pnpm dev` terminal; production shows "not set up yet".

## Roles & permissions

Code checks **permissions**, never role names (`src/config/permissions.ts`, `<module>.read|create|update|delete`). Roles are rows in `roles` holding permission lists:

- **Super Admin** — `*` (everything).
- **School Admin** — all content permissions, no user management. Ready to use: give a user this role.

Only someone holding `*` can grant the Super Admin role or edit a Super Admin. Nobody can delete themselves or change their own role/status.

## Structure

```
src/
  app/                 routes only (thin pages: guard → load → render)
  components/ui/       shadcn primitives (shadows removed)
  components/shared/   DataView (table on md+, cards on mobile), form fields (RHF-bound:
                       Text, Textarea, Number, Date, Select, Image, Password…), ListField
                       (repeatable rows), ImagePicker, ConfirmDialog, crud/* helpers
  components/layout/   sidebar, header, page header, skeletons
  config/              navigation, routes, permissions
  features/<module>/   schemas.ts (zod) · actions.ts (server actions) ·
                       server/service.ts (permission-checked) · components/
  server/              core (defineAction, resources, CRUD), auth, Supabase adapter
supabase/migrations/   SQL
```

### Adding a module

1. `features/x/schemas.ts` — entity + form schema.
2. `features/x/server/service.ts` — `defineResource({ …, softDelete: true })` + `createContentService(resource, "x")`.
3. `features/x/actions.ts` — create / update / delete with `defineAction`.
4. `features/x/components` — a `DataView` list (with `useCrudActions`) and a form using the shared fields.
5. Pages under `src/app/(admin)/x`, a nav entry in `config/navigation.ts`, permissions in `config/permissions.ts`, and a table in a new migration.
