# Next.js Habits

A modern Next.js 16 monolith template for building SaaS applications fast. Batteries included — authentication, database, file storage, and UI components, all running locally with Docker.

This is not a toy. Every pattern here was battle-tested in production applications with real users, on-call rotations, and the scars that come with both. The architecture choices, the local dev workflow, the documentation — they exist because I made the mistakes so you don't have to.

**Prioritizing local development and documentation isn't overhead — it's leverage.** When every developer on the team can go from `git clone` to a fully running environment in one command, and every decision is documented with its rationale, onboarding new engineers takes hours instead of weeks, and debugging doesn't require digging through Slack history.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript |
| Database | PostgreSQL 17 via Drizzle ORM |
| Auth | Better Auth (email/password, sessions, roles) |
| File Storage | MinIO (S3-compatible) |
| UI | shadcn/ui (Radix + Tailwind v4) |
| Styling | Tailwind CSS v4 |
| Validation | Zod v4 |
| Icons | Lucide React |
| Containerization | Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Setup

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Generate a secret for Better Auth
#    (edit .env and replace BETTER_AUTH_SECRET)
openssl rand -hex 32

# 3. Start everything
pnpm dev
```

This single command spins up Postgres + MinIO + Drizzle Gateway, generates and runs migrations, and starts the dev server on `http://localhost:3000`.

### Services

| Service | Port | Purpose |
|---|---|---|
| Next.js | `3000` | App server |
| PostgreSQL | `5432` | Database |
| MinIO API | `9000` | File storage (S3-compatible) |
| MinIO Console | `9001` | File storage admin UI |
| Drizzle Gateway | `4983` | Database studio/management |

## Project Structure

```
src/
├── _database/        # Drizzle schema, migrations, db client
│   ├── schema/       # Table definitions + relations
│   └── migrations/   # Generated migration files
├── _features/        # Feature modules (auth, etc.)
│   └── auth/
│       ├── auth.validation.ts   # Zod schemas
│       └── server/actions.ts    # Server actions
├── app/api/          # API routes (Better Auth handler)
├── components/ui/    # shadcn components
├── lib/              # Utilities (S3 client, auth client, cn)
└── utils/            # Auth helpers, guards, API result types
```

## Key Decisions

### Why a monolith?

I built and shipped two products to production with real users — both with separate frontend and backend codebases, both with their own CI/CD pipelines, their own deployment targets, their own monitoring. When they didn't find PMF, I had twice the infrastructure to shut down. For early-stage products, a monolith removes CORS issues, type duplication, CI/CD complexity, and deployment overhead. You can always split later when the product justifies the cost and the team size.

### Why not push migrations in production?

`drizzle-kit push` applies schema changes directly without SQL generation without audit trails. Always use `drizzle-kit generate` + `drizzle-kit migrate` in CI/CD to maintain a `_migrations` table as version control.

### Why MinIO?

S3-compatible storage that runs locally in Docker with the same SDK (`@aws-sdk/client-s3`) you'd use for AWS S3 in production. Swap the endpoint and credentials.

## Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Full dev workflow: infra → generate → migrate → app |
| `pnpm infra:up` | Start Docker services (Postgres, MinIO, Drizzle Gateway) |
| `pnpm db:generate` | Generate Drizzle migrations from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm dev:app` | Start Next.js dev server only |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm auth:generate` | Regenerate Better Auth schema types |

## Routes

| Route | Description |
|---|---|
| `/login` | Sign in |
| `/register` | Create account |
| `/app/profile` | Profile settings (avatar, name, password, logout) |