# Silks & Stayers

A UK & Ireland horse racing tips website — daily racecards, confidence-rated
tipster selections and tipster leaderboard, built with Next.js, Tailwind CSS
and Prisma.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** for styling
- **Prisma 7** ORM with SQLite (via `@prisma/adapter-better-sqlite3`), easy to
  swap for Postgres later by changing the datasource and adapter

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit http://localhost:3000.

## Project structure

- `app/` — routes: home, `/racecards`, `/racecards/[raceId]`, `/tips`,
  `/tipsters`, `/tipsters/[slug]`, `/about`, `/contact`,
  `/responsible-gambling`, `/terms`
- `components/` — shared UI (header, footer, tip cards, badges, etc.)
- `lib/` — Prisma client singleton and data-access helpers
- `prisma/schema.prisma` — data model (courses, meetings, races, runners,
  tipsters, tips)
- `prisma/seed.ts` — seeds the database with illustrative demo data

## Demo data notice

Course names are real UK & Ireland venues, but meetings, races, runners,
odds, form figures and tipster commentary are placeholder demo content used
to showcase the site ahead of a live racing data integration. See
`/terms` for the full disclaimer.
