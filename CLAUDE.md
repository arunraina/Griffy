# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

| Layer | Technology |
|---|---|
| API | NestJS 10 (REST), port 3001 |
| Web | Next.js 14 (App Router), port 3000 |
| Mobile | React Native + Expo 51 (Expo Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Supabase Auth (JWT verified server-side) |
| Storage | AWS S3 (pre-signed URL uploads) |
| Payments | Razorpay |
| Monorepo | npm workspaces + Turborepo |

## Commands

```bash
# Root
npm install          # install all workspaces
npm run dev          # start api + web concurrently via Turbo
npm run build        # build all apps
npm run lint         # lint all apps

# API — run from repo root or apps/api
npm run start:dev -w @griffy/api
npm run test -w @griffy/api
npm run test:e2e -w @griffy/api

# Database (must cd into apps/api or use -w)
npm run db:generate -w @griffy/api   # after schema changes
npm run db:migrate -w @griffy/api    # run pending migrations
npm run db:push -w @griffy/api       # push schema without migration (dev only)
npm run db:studio -w @griffy/api     # open Prisma Studio

# Mobile
npm run start -w @griffy/mobile      # starts Expo dev server
```

## Architecture

### Auth flow
Supabase issues JWTs to clients. Every protected API route uses `AuthGuard` (`apps/api/src/auth/auth.guard.ts`), which calls `supabase.auth.getUser(token)` with the service-role key. The guard attaches the Supabase user to `request.supabaseUser`.

On first login, call `UsersService.upsertFromSupabase()` to create the local `User` row. The `@CurrentUser()` decorator (`auth/current-user.decorator.ts`) reads `request.dbUser` — you must populate this (e.g., in a middleware or interceptor) before using the decorator.

### Payment flow
1. Client calls `POST /api/v1/payments/create-order` with `entityType` (`order`|`booking`) and `entityId`.
2. API creates a Razorpay order and returns `razorpayOrderId`.
3. Client completes payment in Razorpay SDK.
4. Client calls `POST /api/v1/payments/verify` to confirm signature client-side.
5. Razorpay calls `POST /api/v1/payments/webhook` — API verifies HMAC and updates entity status to `CONFIRMED`.

### S3 uploads
Client requests a pre-signed URL via `POST /api/v1/storage/presigned-url` with `{ folder, contentType }`. Client PUTs the file directly to S3 using the returned URL, then stores `publicUrl` in the API.

### Shared types
`packages/shared` exports TypeScript interfaces and string-literal union types that mirror the Prisma schema. Import as `@griffy/shared`. These are source-only (no build step) — both `api` and `web` resolve directly to `packages/shared/src` via `tsconfig paths`.

### Module structure (NestJS)
Each domain (users, service-providers, materials, orders, bookings, reviews) follows the pattern: `*.module.ts` → `*.controller.ts` → `*.service.ts`. `PrismaModule` is global — inject `PrismaService` anywhere without re-importing.

## Prisma schema key decisions
- All tables use `uuid()` PKs, snake_case column names via `@map`, and `@@map` for table names.
- `Review` uses a polymorphic-like pattern: `targetType` enum + nullable `serviceProviderId` / `materialId`. Exactly one must be set.
- `rating` and `reviewCount` on `ServiceProvider` and `Material` are denormalized aggregates updated in `ReviewsService.create()`.

## Environment variables
Copy `.env.example` → `.env` in each app. The API needs `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, AWS credentials, and Razorpay keys. Web and mobile only need the public Supabase keys and the API URL.
