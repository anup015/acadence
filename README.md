# Acadence (AcadConnect)

Acadence is a campus academic management platform (AcadConnect app) that centralizes resources, queries, study groups, and timetables for students and faculty.

## Highlights

- Academic resources hub for notes, materials, and PYQs
- Query desk with status tracking and faculty responses
- Study groups and discussion spaces
- Timetable and announcement workflows
- Role-based access for students, faculty, reps, and admins

## Tech Stack

- Next.js (App Router), React, TypeScript
- NextAuth (Auth.js) with Prisma adapter
- Prisma ORM with PostgreSQL
- Tailwind CSS + Radix UI

## Prerequisites

- Node.js 18+ (recommended)
- PostgreSQL database

## Local Setup

1) Install dependencies

```bash
npm install
```

2) Create your environment file

```bash
cp .env.example .env
```

3) Update values in `.env` (see Environment Variables section)

4) Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

5) Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Use .env.example as a template.

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Base URL (http://localhost:3000 in dev)
- `NEXTAUTH_SECRET` - Run `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Optional OAuth login
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` - UploadThing integration
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_BUCKET_NAME` - Optional S3 storage
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` - Optional Supabase storage

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Lint

## Project Structure

- `src/app` - Routes, layouts, and pages
- `src/app/api` - API routes (auth, announcements, courses, materials, queries)
- `src/components` - UI and layout components
- `prisma/schema.prisma` - Database schema

## Database

Prisma models cover users, faculty profiles, courses, enrollments, materials, PYQs, queries, notifications, discussion groups, and study groups.

## Deployment

### Vercel

1. Import the repository into Vercel.
2. Set the production environment variables in the Vercel project settings.
3. Use the default Next.js build settings.
4. Deploy.

Required variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if Google login is enabled
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` if uploads are enabled
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_BUCKET_NAME` if S3 storage is enabled
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` if Supabase storage is enabled

For local verification, run `npm run build` before deploying.

## License

Add your license here.