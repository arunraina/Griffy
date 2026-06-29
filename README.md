# Griffy

A platform connecting customers with construction service providers and material suppliers.

## Apps

| App | Path | Port |
|---|---|---|
| API (NestJS) | `apps/api` | 3001 |
| Web (Next.js) | `apps/web` | 3000 |
| Mobile (Expo) | `apps/mobile` | — |

## Getting Started

```bash
npm install
npm run dev          # starts api + web in parallel via Turbo
```

## Database

```bash
cd apps/api
npm run db:migrate   # run pending migrations
npm run db:studio    # open Prisma Studio
npm run db:generate  # regenerate Prisma client after schema changes
```
