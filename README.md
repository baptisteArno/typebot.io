```markdown
# Typebot – Local Installation Guide

This guide helps you run Typebot locally in a development environment.  
If you’re looking to self-host Typebot in production, follow the [Self-hosting guide](https://docs.typebot.io/self-host).

## Requirements

You need to have the following tools installed on your machine:

- [pnpm](https://pnpm.io/installation) (v8 or higher)
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)
- [Docker](https://www.docker.com/products/docker-desktop) + [Docker Compose](https://docs.docker.com/compose/install/)
- [Redis](https://redis.io/docs/getting-started/installation/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)

> ✅ Recommended: use Linux or WSL on Windows for better compatibility.
```

---

## Clone the repository

```bash
git clone https://github.com/baptisteArno/typebot.git
cd typebot
```

---

## Install dependencies

```bash
nvm install 18 && nvm use 18
npm --global install pnpm@8
pnpm install
```

---

## Create a `.env` file

Duplicate the `.env.dev.example` file and name it `.env`:

```bash
cp .env.dev.example .env
```

---

## Start the app

Start the development server:

```bash
pnpm dev
```

This will start all the necessary packages (admin, builder, embed, etc.).

---

## Access the app

Once started, access the following:

- Builder UI: [http://localhost:3002](http://localhost:3002)
- Admin UI: [http://localhost:4000](http://localhost:4000)
- Embed UI: [http://localhost:5000](http://localhost:5000)

---

## Troubleshooting

- **Supabase errors?** Ensure Docker is running.
- **Ports already in use?** Check if previous instances are still running.
- **Redis connection issues?** Confirm Redis is running and URL is correct in `.env`.

---

## Useful scripts

- Run Supabase migrations:

```bash
supabase db push
```

- Run Prisma migrations (local Postgres):

```bash
# Ensure Postgres is running (e.g., docker-compose.dev.yml)
# and your `.env` contains a valid `DATABASE_URL`.

# From repo root (uses packages/prisma script)
pnpm db:migrate

# Alternatively, call the workspace package directly
pnpm --filter @typebot.io/prisma run migrate:deploy
```

- Stop Supabase:

```bash
supabase stop
```

- Clear node_modules:

```bash
pnpm install --force
```

- Build app

```bash
pnpm install --force && pnpm build:apps
```

---

## Run with Docker Compose

You can run Typebot entirely with Docker Compose. There are three compose files serving different purposes:

| File                       | Purpose                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `docker-compose.yml`       | Uses pre-built public images (fast start)                                           |
| `docker-compose.build.yml` | Builds local images from current source (for code changes)                          |
| `docker-compose.dev.yml`   | Starts only dependencies (Postgres + MinIO) for local `pnpm dev` outside containers |

### 1. Prepare environment

Create `.env` (if not already):

```bash
cp .env.dev.example .env
```

Adjust any secrets (e.g. `ADMIN_EMAIL`) before production use.

### 2. Using published images (recommended quick start)

```bash
docker compose up -d
```

Access:

- Builder: http://localhost:3002
- Viewer: http://localhost:3003

Basic maintenance:

```bash
# Logs
docker compose logs -f typebot-builder
docker compose logs -f typebot-viewer

# Update images
docker compose pull
docker compose up -d --force-recreate

# Stop
docker compose down

# Stop and remove volume data (CAUTION: deletes database)
docker compose down -v
```

If you need the database port on host, add under `typebot-db`:

```yaml
ports:
	- "5433:5432"
```

### 3. Build local images

Use this when you changed code and want to test containerized build.

```bash
docker compose -f docker-compose.build.yml build
docker compose -f docker-compose.build.yml up -d
```

Rebuild after code changes:

```bash
docker compose -f docker-compose.build.yml build --no-cache
docker compose -f docker-compose.build.yml up -d --force-recreate
```

Logs:

```bash
docker compose -f docker-compose.build.yml logs -f typebot-builder
docker compose -f docker-compose.build.yml logs -f typebot-viewer
```

Stop:

```bash
docker compose -f docker-compose.build.yml down
```

### 4. Dependencies only (local dev outside containers)

Start Postgres (port 5433) + MinIO (ports 9000/9001) and bucket provisioning:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Then run the app with the host Node runtime:

```bash
pnpm dev
```

Stop dependencies:

```bash
docker compose -f docker-compose.dev.yml down
```

### 5. Troubleshooting quick reference

| Issue                    | Cause                                   | Fix                                                    |
| ------------------------ | --------------------------------------- | ------------------------------------------------------ |
| Builder 404              | Wrong `NEXTAUTH_URL` / viewer URL       | Check `.env` matches exposed ports                     |
| DB connect errors        | Port not exposed / wrong `DATABASE_URL` | Add port mapping or adjust URL                         |
| S3 errors                | MinIO not running or wrong env          | Ensure dev compose up / check `S3_ENDPOINT`, `S3_PORT` |
| Code changes not visible | Container uses old image                | Rebuild with `--no-cache` and recreate                 |
| Large disk usage         | Old images/volumes retained             | `docker system prune` (careful), remove unused volumes |

### 6. Useful extra commands

```bash
# Health check endpoints
curl -I http://localhost:3002
curl -I http://localhost:3003

# List containers
docker compose ps

# Prune builder cache (safe)
docker builder prune -f
```

---

## Contributing

See the [Contributing guide](https://docs.typebot.io/contribute) for how to submit changes or suggest improvements.
