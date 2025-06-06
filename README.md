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

## Start docker compose

```bash
docker compose up -d
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

- Builder UI: [http://localhost:3000](http://localhost:3000)
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

- Stop Supabase:

```bash
supabase stop
```

- Clear node_modules:

```bash
pnpm install --force
```

---

## Contributing

See the [Contributing guide](https://docs.typebot.io/contribute) for how to submit changes or suggest improvements.
