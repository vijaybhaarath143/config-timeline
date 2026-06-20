# Config Timeline

A super-colourful, public **day-by-day timeline** for Figma Config (SF, June 19–26).
Anyone can browse. Sign in with Google to post photos + a thought with a timestamp,
and drop quick comments. You (the admin) approve newcomers and moderate content.

Built with **Next.js 15 (App Router)**, **Postgres + Prisma**, **Auth.js (Google)**,
and **Vercel Blob** for image uploads. Deploys free on Vercel.

---

## What it does

- **Timeline 19 → 26 June.** Each day is a colourful section with a `+` to add a post.
  After the 26th the whole thing goes **read-only** (set in `lib/event.ts`).
- **Posts** = photos + a thought + the **time it happened** (sorted morning → night).
- **Gallery.** Tap any photo for a full-screen, swipeable lightbox.
- **Comments.** Quick, editable, deletable.
- **Auth.** Public read; Google sign-in to contribute.
- **Approval gate.** A new person's posts are **held for review** until you approve them once.
- **Admin panel** (`/admin`): approve / ban / delete people, hide individual posts.

---

## 1. Install

```bash
cd config-timeline
npm install
cp .env.example .env        # then fill in the values below
```

## 2. Postgres

Use any Postgres. Easiest free options:

- **Neon** (neon.tech) — create a project, copy the pooled connection string.
- **Vercel Postgres** — add it from the Vercel dashboard; it injects `DATABASE_URL`.

Put the connection string in `.env` as `DATABASE_URL`, then create the tables:

```bash
npm run db:push     # pushes the Prisma schema to your database
```

## 3. Google sign-in

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. **Create credentials → OAuth client ID → Web application**.
3. Authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod:  `https://YOUR-APP.vercel.app/api/auth/callback/google`
4. Copy the Client ID / Secret into `.env` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
5. Generate an auth secret: `npx auth secret` (or `openssl rand -base64 32`) → `AUTH_SECRET`.
6. Set `ADMIN_EMAIL` to your Google account email — it's auto-promoted to admin on first sign-in.

## 4. Image uploads (Vercel Blob)

- On Vercel: add a **Blob store** (Storage tab) — `BLOB_READ_WRITE_TOKEN` is injected automatically.
- Locally: copy that token into `.env` to test uploads from your machine.

## 5. Run

```bash
npm run dev          # http://localhost:3000
```

Sign in with your `ADMIN_EMAIL` account first → you'll be admin + approved instantly.

---

## Deploy to Vercel (free)

1. Push this folder to a Git repo and **Import** it in Vercel.
2. Add env vars in **Project → Settings → Environment Variables**:
   `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAIL`
   (`BLOB_READ_WRITE_TOKEN` is added automatically when you create the Blob store).
3. Add your real Vercel URL to the Google OAuth **Authorized redirect URIs**.
4. Deploy. The build runs `prisma generate` automatically; run `npm run db:push` once against
   your production database (locally with prod `DATABASE_URL`, or via a one-off).

---

## Tuning

- **Event window / lock date:** `lib/event.ts` (`EVENT.startDay`, `endDay`, `closesAt`).
- **Day colours:** the rainbow in `lib/event.ts` + `tailwind.config.ts`.
- **House rules copy:** the `Guidelines` block in `app/page.tsx`.
- **Per-image size cap (15 MB) / count (10):** `app/api/upload/route.ts` and `app/actions/posts.ts`.

## How moderation works

- **Approve** → releases the person's held posts and lets future posts go live instantly.
- **Ban** → blocks posting/commenting and hides their content (kept in the DB).
- **Delete** → removes the person and cascade-deletes all their posts, images, comments.
- **Hide a post** → pulls a single post without touching the author's account.
